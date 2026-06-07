import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { AdbService } from '../adb/adb.service';
import { ScrcpyManager } from '../scrcpy/scrcpy.manager';
import { DeviceInfo } from '../types/device';
import { AppError } from '../utils/error';
import { config } from '../config';

export class DeviceService {
  constructor(private adbService: AdbService, private scrcpyManager: ScrcpyManager) {}

  public async listDevices(): Promise<DeviceInfo[]> {
    return this.adbService.listDevices();
  }

  public async getDevice(deviceId: string): Promise<DeviceInfo> {
    return this.adbService.getDevice(deviceId);
  }

  public async startStreaming(deviceId: string): Promise<void> {
    await this.scrcpyManager.startSession(deviceId);
  }

  public async stopStreaming(deviceId: string): Promise<void> {
    await this.scrcpyManager.stopSession(deviceId);
  }

  public async captureScreenshot(deviceId: string): Promise<Buffer> {
    return this.adbService.captureScreenshot(deviceId);
  }

  public async installApk(deviceId: string, apkPath: string): Promise<string> {
    const device = await this.adbService.getDevice(deviceId);
    if (device.status !== 'device') {
      throw new AppError(`Device ${deviceId} is not currently connected`, 404);
    }

    return this.adbService.installApk(deviceId, apkPath);
  }

  public async runJavaTest(deviceId: string, filePath: string, testClass?: string, options?: { appPackage?: string; appActivity?: string }): Promise<string> {
    const device = await this.adbService.getDevice(deviceId);
    if (device.status !== 'device') {
      throw new AppError(`Device ${deviceId} is not currently connected`, 404);
    }

    const extension = path.extname(filePath).toLowerCase();
    if (extension === '.java') {
      return this.runJavaTestWithAppium(deviceId, filePath, testClass, options ?? {});
    }

    const artifactPath = await this.prepareJavaArtifact(filePath);
    return this.adbService.runJavaTest(deviceId, artifactPath, testClass);
  }

  private async prepareJavaArtifact(filePath: string): Promise<string> {
    const extension = path.extname(filePath).toLowerCase();
    if (extension === '.jar') {
      return filePath;
    }

    if (extension !== '.java') {
      throw new AppError('Unsupported Java test file type. Upload a .jar or .java file.', 400);
    }

    const compileDir = path.join(path.dirname(filePath), 'classes');
    await fs.mkdir(compileDir, { recursive: true });

    const wrapperClassesDir = path.resolve(process.cwd(), '..', 'crowntest-sdk', 'target', 'classes');
    if (!(await this.exists(wrapperClassesDir))) {
      await this.execCommand('mvn', ['-q', '-f', path.resolve(process.cwd(), '..', 'crowntest-sdk', 'pom.xml'), 'test-compile'], {
        timeout: 180000,
      });
    }

    const javacArgs = ['-classpath', wrapperClassesDir, '-d', compileDir, filePath];
    const classpath = await this.getJavaClassPath();
    await this.execCommand('javac', ['-classpath', classpath, '-d', compileDir, filePath], {
      timeout: 120000,
    });

    const jarPath = path.join(path.dirname(filePath), `${path.basename(filePath, '.java')}.jar`);
    await this.execCommand('jar', ['cf', jarPath, '-C', compileDir, '.'], {
      timeout: 120000,
    });

    return jarPath;
  }

  private async runJavaTestWithAppium(deviceId: string, filePath: string, testClass?: string, options?: { appPackage?: string; appActivity?: string }): Promise<string> {
    const compileDir = path.join(path.dirname(filePath), 'classes');
    await fs.mkdir(compileDir, { recursive: true });

    const classpath = await this.getJavaClassPath();
    await this.execCommand('javac', ['-classpath', classpath, '-d', compileDir, filePath], {
      timeout: 120000,
    });

    const jarPath = path.join(path.dirname(filePath), `${path.basename(filePath, '.java')}.jar`);
    await this.execCommand('jar', ['cf', jarPath, '-C', compileDir, '.'], {
      timeout: 120000,
    });

    const fullClassName = testClass || (await this.getFullyQualifiedJavaClassName(filePath));
    if (!fullClassName) {
      throw new AppError('Unable to determine fully qualified Java class name for the uploaded test', 400);
    }

    const runnerArgs = [
      fullClassName,
      config.appiumUrl,
      deviceId,
      options?.appPackage ?? '',
      options?.appActivity ?? '',
    ];

    const runClasspath = `${jarPath}${path.delimiter}${classpath}`;
    return this.execCommand('java', ['-cp', runClasspath, 'com.crowntest.sdk.runner.JavaTestLauncher', ...runnerArgs], {
      timeout: 10 * 60 * 1000,
    });
  }

  private async getJavaClassPath(): Promise<string> {
    const projectRoot = path.resolve(process.cwd(), '..', 'crowntest-sdk');
    const classDir = path.join(projectRoot, 'target', 'classes');
    if (!(await this.exists(classDir))) {
      await this.execCommand('mvn', ['-q', '-f', path.join(projectRoot, 'pom.xml'), 'test-compile'], {
        timeout: 180000,
      });
    }

    const classpathFile = path.join(projectRoot, 'target', 'crowntest-classpath.txt');
    await this.execCommand('mvn', ['-q', '-f', path.join(projectRoot, 'pom.xml'), 'dependency:build-classpath', `-Dmdep.outputFile=${classpathFile}`], {
      timeout: 120000,
    });

    const dependencyClasspath = (await fs.readFile(classpathFile, 'utf8')).trim();
    return dependencyClasspath ? `${classDir}${path.delimiter}${dependencyClasspath}` : classDir;
  }

  private async getFullyQualifiedJavaClassName(filePath: string): Promise<string> {
    const source = await fs.readFile(filePath, 'utf8');
    const packageMatch = source.match(/^[ \t]*package\s+([\w\.]+)\s*;/m);
    const baseName = path.basename(filePath, '.java');
    return packageMatch ? `${packageMatch[1]}.${baseName}` : baseName;
  }

  private async exists(targetPath: string): Promise<boolean> {
    try {
      await fs.access(targetPath);
      return true;
    } catch {
      return false;
    }
  }

  private async execCommand(command: string, args: string[], options: { timeout: number }): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile(command, args, options, (error, stdout, stderr) => {
        if (error) {
          reject(new AppError(`Command failed: ${command} ${args.join(' ')} - ${stderr.toString() || error.message}`));
          return;
        }

        resolve(stdout.toString());
      });
    });
  }
}
