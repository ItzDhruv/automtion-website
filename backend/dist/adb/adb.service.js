"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdbService = void 0;
const child_process_1 = require("child_process");
const events_1 = require("events");
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const error_1 = require("../utils/error");
const adb_utils_1 = require("../utils/adb.utils");
const logger_1 = require("../utils/logger");
class AdbService extends events_1.EventEmitter {
    constructor(adbPath = config_1.config.adbPath) {
        super();
        this.adbPath = adbPath;
        this.deviceCache = new Map();
        this.trackerBuffer = '';
    }
    startWatching() {
        if (this.trackerProcess) {
            return;
        }
        this.trackerProcess = (0, child_process_1.spawn)(this.adbPath, ['track-devices']);
        this.trackerProcess.stdout.on('data', (chunk) => this.handleTrackerData(chunk.toString()));
        this.trackerProcess.stderr.on('data', (chunk) => logger_1.log.error('ADB tracker stderr', chunk.toString()));
        this.trackerProcess.on('exit', (code, signal) => {
            logger_1.log.warn('ADB tracker exited', { code, signal });
            this.trackerProcess = undefined;
            setTimeout(() => this.startWatching(), 1500);
        });
        this.trackerProcess.on('error', (error) => {
            logger_1.log.error('Failed to start adb track-devices', error);
        });
        this.refreshDeviceCache().catch((error) => logger_1.log.error('Initial device refresh failed', error));
    }
    stopWatching() {
        if (this.trackerProcess) {
            this.trackerProcess.kill();
            this.trackerProcess = undefined;
        }
    }
    async listDevices() {
        await this.refreshDeviceCache();
        return Array.from(this.deviceCache.values());
    }
    async getDevice(deviceId) {
        const cached = this.deviceCache.get(deviceId);
        if (cached) {
            return cached;
        }
        const deviceInfo = await this.buildDeviceInfo(deviceId);
        this.deviceCache.set(deviceId, deviceInfo);
        return deviceInfo;
    }
    getCachedDevices() {
        return Array.from(this.deviceCache.values());
    }
    async captureScreenshot(deviceId) {
        return this.execAdbFile(['-s', deviceId, 'exec-out', 'screencap', '-p']);
    }
    async installApk(deviceId, apkPath) {
        return this.execAdb(['-s', deviceId, 'install', '-r', apkPath], {
            timeout: 5 * 60 * 1000,
            maxBuffer: 1024 * 1024,
        });
    }
    async runJavaTest(deviceId, localJarPath, testClass) {
        const remoteName = path_1.default.basename(localJarPath);
        const remotePath = `/data/local/tmp/${remoteName}`;
        await this.execAdb(['-s', deviceId, 'push', localJarPath, remotePath], {
            timeout: 5 * 60 * 1000,
            maxBuffer: 1024 * 1024,
        });
        await this.execAdb(['-s', deviceId, 'shell', 'chmod', '755', remotePath], {
            timeout: 2 * 60 * 1000,
            maxBuffer: 1024 * 1024,
        });
        const runnerArgs = testClass ? ` -c ${this.shellQuote(testClass)}` : '';
        const runCommand = `cd /data/local/tmp && uiautomator runtest ${this.shellQuote(remoteName)}${runnerArgs}`;
        return this.execAdb(['-s', deviceId, 'shell', runCommand], {
            timeout: 10 * 60 * 1000,
            maxBuffer: 5 * 1024 * 1024,
        });
    }
    shellQuote(value) {
        return `'${value.replace(/'/g, "'\\''")}'`;
    }
    async sendTap(deviceId, x, y) {
        await this.execAdb(['-s', deviceId, 'shell', 'input', 'tap', `${x}`, `${y}`]);
    }
    async sendSwipe(deviceId, startX, startY, endX, endY, duration = 150) {
        await this.execAdb([
            '-s',
            deviceId,
            'shell',
            'input',
            'swipe',
            `${startX}`,
            `${startY}`,
            `${endX}`,
            `${endY}`,
            `${duration}`,
        ]);
    }
    async sendText(deviceId, text) {
        const payload = (0, adb_utils_1.sanitizeTextForAdb)(text);
        await this.execAdb(['-s', deviceId, 'shell', 'input', 'text', payload]);
    }
    async sendKeyEvent(deviceId, keyEvent) {
        await this.execAdb(['-s', deviceId, 'shell', 'input', 'keyevent', keyEvent]);
    }
    async getScreenSize(deviceId) {
        const output = await this.execAdb(['-s', deviceId, 'shell', 'wm', 'size']);
        return (0, adb_utils_1.parseWmSize)(output);
    }
    async dumpUiHierarchy(deviceId) {
        await this.execAdb(['-s', deviceId, 'shell', 'uiautomator', 'dump', '/sdcard/window_dump.xml']);
        return this.execAdb(['-s', deviceId, 'shell', 'cat', '/sdcard/window_dump.xml']);
    }
    async launchApp(deviceId, appPackage, appActivity) {
        if (appActivity) {
            return this.execAdb(['-s', deviceId, 'shell', 'am', 'start', '-n', `${appPackage}/${appActivity}`], {
                timeout: 120000,
                maxBuffer: 1024 * 1024,
            });
        }
        return this.execAdb(['-s', deviceId, 'shell', 'monkey', '-p', appPackage, '-c', 'android.intent.category.LAUNCHER', '1'], {
            timeout: 120000,
            maxBuffer: 1024 * 1024,
        });
    }
    async closeApp(deviceId, appPackage) {
        return this.execAdb(['-s', deviceId, 'shell', 'am', 'force-stop', appPackage], {
            timeout: 120000,
            maxBuffer: 1024 * 1024,
        });
    }
    handleTrackerData(data) {
        this.trackerBuffer += data;
        const payloads = this.readTrackerPayloads();
        for (const payload of payloads) {
            const currentDeviceMap = this.buildDeviceMapFromTrackerPayload(payload);
            this.updateDeviceCache(currentDeviceMap).catch((error) => logger_1.log.error('Device cache update failed', error));
        }
    }
    readTrackerPayloads() {
        const payloads = [];
        while (this.trackerBuffer.length >= 4) {
            const lengthPrefix = this.trackerBuffer.slice(0, 4);
            if (!/^[\da-f]{4}$/i.test(lengthPrefix)) {
                const lastCompleteLine = this.trackerBuffer.lastIndexOf('\n');
                if (lastCompleteLine === -1) {
                    break;
                }
                payloads.push(this.trackerBuffer.slice(0, lastCompleteLine + 1));
                this.trackerBuffer = this.trackerBuffer.slice(lastCompleteLine + 1);
                continue;
            }
            const payloadLength = Number.parseInt(lengthPrefix, 16);
            const packetLength = 4 + payloadLength;
            if (this.trackerBuffer.length < packetLength) {
                break;
            }
            payloads.push(this.trackerBuffer.slice(4, packetLength));
            this.trackerBuffer = this.trackerBuffer.slice(packetLength);
        }
        return payloads;
    }
    buildDeviceMapFromTrackerPayload(payload) {
        const deviceLines = payload
            .split(/\r?\n/)
            .filter((line) => line.trim().length > 0 && !line.startsWith('List of devices'));
        const currentDeviceMap = new Map();
        for (const line of deviceLines) {
            const [id, status] = line.trim().split(/\s+/);
            if (!id) {
                continue;
            }
            currentDeviceMap.set(id, status === 'device' || status === 'offline' || status === 'unauthorized' ? status : 'unknown');
        }
        return currentDeviceMap;
    }
    async refreshDeviceCache() {
        const output = await this.execAdb(['devices']);
        const deviceEntries = (0, adb_utils_1.parseAdbDevices)(output);
        const currentDeviceMap = new Map();
        for (const entry of deviceEntries) {
            currentDeviceMap.set(entry.id, entry.status);
        }
        await this.updateDeviceCache(currentDeviceMap);
    }
    async updateDeviceCache(currentDeviceMap) {
        const previousIds = new Set(this.deviceCache.keys());
        const currentIds = new Set(currentDeviceMap.keys());
        for (const deviceId of currentIds) {
            const status = currentDeviceMap.get(deviceId) ?? 'unknown';
            if (!previousIds.has(deviceId)) {
                try {
                    const deviceInfo = status === 'device' ? await this.buildDeviceInfo(deviceId) : this.buildStubDeviceInfo(deviceId, status);
                    this.deviceCache.set(deviceId, deviceInfo);
                    this.emit('deviceConnected', deviceInfo);
                    this.emit('deviceUpdated', deviceInfo);
                }
                catch (error) {
                    logger_1.log.error('Error building new device info', { deviceId, error });
                }
            }
            else {
                const cached = this.deviceCache.get(deviceId);
                if (cached && cached.status !== status) {
                    const updated = status === 'device' ? await this.buildDeviceInfo(deviceId) : this.buildStubDeviceInfo(deviceId, status);
                    this.deviceCache.set(deviceId, updated);
                    this.emit('deviceUpdated', updated);
                }
            }
        }
        for (const deviceId of previousIds) {
            if (!currentIds.has(deviceId)) {
                this.deviceCache.delete(deviceId);
                this.emit('deviceDisconnected', deviceId);
            }
        }
    }
    async buildDeviceInfo(deviceId) {
        const [model, androidVersion, resolution, batteryLevel] = await Promise.all([
            this.fetchDeviceProperty(deviceId, 'ro.product.model'),
            this.fetchDeviceProperty(deviceId, 'ro.build.version.release'),
            this.fetchDeviceResolution(deviceId),
            this.fetchBatteryLevel(deviceId),
        ]);
        return {
            id: deviceId,
            model: model || 'Unknown',
            androidVersion: androidVersion || 'Unknown',
            resolution,
            batteryLevel,
            status: 'device',
            connectedAt: new Date().toISOString(),
        };
    }
    buildStubDeviceInfo(deviceId, status) {
        return {
            id: deviceId,
            model: 'Unknown',
            androidVersion: 'Unknown',
            resolution: { width: 0, height: 0 },
            batteryLevel: null,
            status,
            connectedAt: new Date().toISOString(),
        };
    }
    async fetchDeviceProperty(deviceId, property) {
        return this.execAdb(['-s', deviceId, 'shell', 'getprop', property]).then((value) => value.trim());
    }
    async fetchDeviceResolution(deviceId) {
        const output = await this.execAdb(['-s', deviceId, 'shell', 'wm', 'size']);
        return (0, adb_utils_1.parseWmSize)(output);
    }
    async fetchBatteryLevel(deviceId) {
        try {
            const output = await this.execAdb(['-s', deviceId, 'shell', 'dumpsys', 'battery']);
            const match = output.match(/level:\s*(\d+)/i);
            return match ? Number(match[1]) : null;
        }
        catch (error) {
            logger_1.log.warn('Unable to read battery level', { deviceId, error });
            return null;
        }
    }
    execAdb(args, options = {}) {
        return new Promise((resolve, reject) => {
            (0, child_process_1.execFile)(this.adbPath, args, { encoding: 'utf8', ...options }, (error, stdout, stderr) => {
                if (error) {
                    const message = stderr.toString() || error.message;
                    reject(new error_1.AppError(`ADB command failed: ${message}`));
                    return;
                }
                resolve(stdout.toString());
            });
        });
    }
    execAdbFile(args) {
        return new Promise((resolve, reject) => {
            (0, child_process_1.execFile)(this.adbPath, args, { encoding: 'buffer', maxBuffer: 20 * 1024 * 1024 }, (error, stdout, stderr) => {
                if (error) {
                    const message = stderr.toString() || error.message;
                    reject(new error_1.AppError(`ADB command failed: ${message}`));
                    return;
                }
                resolve(stdout);
            });
        });
    }
}
exports.AdbService = AdbService;
//# sourceMappingURL=adb.service.js.map