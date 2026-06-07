"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceService = void 0;
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const error_1 = require("../utils/error");
const config_1 = require("../config");
class DeviceService {
    constructor(adbService, scrcpyManager) {
        this.adbService = adbService;
        this.scrcpyManager = scrcpyManager;
    }
    async listDevices() {
        return this.adbService.listDevices();
    }
    async getDevice(deviceId) {
        return this.adbService.getDevice(deviceId);
    }
    async startStreaming(deviceId) {
        await this.scrcpyManager.startSession(deviceId);
    }
    async stopStreaming(deviceId) {
        await this.scrcpyManager.stopSession(deviceId);
    }
    async captureScreenshot(deviceId) {
        return this.adbService.captureScreenshot(deviceId);
    }
    async installApk(deviceId, apkPath) {
        const device = await this.adbService.getDevice(deviceId);
        if (device.status !== 'device') {
            throw new error_1.AppError(`Device ${deviceId} is not currently connected`, 404);
        }
        return this.adbService.installApk(deviceId, apkPath);
    }
    async runJavaTest(deviceId, filePath, testClass, options) {
        const device = await this.adbService.getDevice(deviceId);
        if (device.status !== 'device') {
            throw new error_1.AppError(`Device ${deviceId} is not currently connected`, 404);
        }
        const extension = path_1.default.extname(filePath).toLowerCase();
        if (extension === '.java') {
            return this.runJavaTestWithAppium(deviceId, filePath, testClass, options ?? {});
        }
        const artifactPath = await this.prepareJavaArtifact(filePath);
        return this.adbService.runJavaTest(deviceId, artifactPath, testClass);
    }
    async prepareJavaArtifact(filePath) {
        const extension = path_1.default.extname(filePath).toLowerCase();
        if (extension === '.jar') {
            return filePath;
        }
        if (extension !== '.java') {
            throw new error_1.AppError('Unsupported Java test file type. Upload a .jar or .java file.', 400);
        }
        const compileDir = path_1.default.join(path_1.default.dirname(filePath), 'classes');
        await fs_1.promises.mkdir(compileDir, { recursive: true });
        const wrapperClassesDir = path_1.default.resolve(process.cwd(), '..', 'crowntest-sdk', 'target', 'classes');
        if (!(await this.exists(wrapperClassesDir))) {
            await this.execCommand('mvn', ['-q', '-f', path_1.default.resolve(process.cwd(), '..', 'crowntest-sdk', 'pom.xml'), 'test-compile'], {
                timeout: 180000,
            });
        }
        const javacArgs = ['-classpath', wrapperClassesDir, '-d', compileDir, filePath];
        const classpath = await this.getJavaClassPath();
        await this.execCommand('javac', ['-classpath', classpath, '-d', compileDir, filePath], {
            timeout: 120000,
        });
        const jarPath = path_1.default.join(path_1.default.dirname(filePath), `${path_1.default.basename(filePath, '.java')}.jar`);
        await this.execCommand('jar', ['cf', jarPath, '-C', compileDir, '.'], {
            timeout: 120000,
        });
        return jarPath;
    }
    async runJavaTestWithAppium(deviceId, filePath, testClass, options) {
        const compileDir = path_1.default.join(path_1.default.dirname(filePath), 'classes');
        await fs_1.promises.mkdir(compileDir, { recursive: true });
        const classpath = await this.getJavaClassPath();
        await this.execCommand('javac', ['-classpath', classpath, '-d', compileDir, filePath], {
            timeout: 120000,
        });
        const jarPath = path_1.default.join(path_1.default.dirname(filePath), `${path_1.default.basename(filePath, '.java')}.jar`);
        await this.execCommand('jar', ['cf', jarPath, '-C', compileDir, '.'], {
            timeout: 120000,
        });
        const fullClassName = testClass || (await this.getFullyQualifiedJavaClassName(filePath));
        if (!fullClassName) {
            throw new error_1.AppError('Unable to determine fully qualified Java class name for the uploaded test', 400);
        }
        const runnerArgs = [
            fullClassName,
            config_1.config.appiumUrl,
            deviceId,
            options?.appPackage ?? '',
            options?.appActivity ?? '',
        ];
        const runClasspath = `${jarPath}${path_1.default.delimiter}${classpath}`;
        return this.execCommand('java', ['-cp', runClasspath, 'com.crowntest.sdk.runner.JavaTestLauncher', ...runnerArgs], {
            timeout: 10 * 60 * 1000,
        });
    }
    async getJavaClassPath() {
        const projectRoot = path_1.default.resolve(process.cwd(), '..', 'crowntest-sdk');
        const classDir = path_1.default.join(projectRoot, 'target', 'classes');
        if (!(await this.exists(classDir))) {
            await this.execCommand('mvn', ['-q', '-f', path_1.default.join(projectRoot, 'pom.xml'), 'test-compile'], {
                timeout: 180000,
            });
        }
        const classpathFile = path_1.default.join(projectRoot, 'target', 'crowntest-classpath.txt');
        await this.execCommand('mvn', ['-q', '-f', path_1.default.join(projectRoot, 'pom.xml'), 'dependency:build-classpath', `-Dmdep.outputFile=${classpathFile}`], {
            timeout: 120000,
        });
        const dependencyClasspath = (await fs_1.promises.readFile(classpathFile, 'utf8')).trim();
        return dependencyClasspath ? `${classDir}${path_1.default.delimiter}${dependencyClasspath}` : classDir;
    }
    async getFullyQualifiedJavaClassName(filePath) {
        const source = await fs_1.promises.readFile(filePath, 'utf8');
        const packageMatch = source.match(/^[ \t]*package\s+([\w\.]+)\s*;/m);
        const baseName = path_1.default.basename(filePath, '.java');
        return packageMatch ? `${packageMatch[1]}.${baseName}` : baseName;
    }
    async exists(targetPath) {
        try {
            await fs_1.promises.access(targetPath);
            return true;
        }
        catch {
            return false;
        }
    }
    async execCommand(command, args, options) {
        return new Promise((resolve, reject) => {
            (0, child_process_1.execFile)(command, args, options, (error, stdout, stderr) => {
                if (error) {
                    reject(new error_1.AppError(`Command failed: ${command} ${args.join(' ')} - ${stderr.toString() || error.message}`));
                    return;
                }
                resolve(stdout.toString());
            });
        });
    }
}
exports.DeviceService = DeviceService;
//# sourceMappingURL=device.service.js.map