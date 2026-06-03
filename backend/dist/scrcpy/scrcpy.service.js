"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrcpyService = void 0;
const child_process_1 = require("child_process");
const events_1 = require("events");
const sharp_1 = __importDefault(require("sharp"));
const config_1 = require("../config");
const error_1 = require("../utils/error");
const logger_1 = require("../utils/logger");
class ScrcpyService extends events_1.EventEmitter {
    constructor(deviceId, adbService) {
        super();
        this.deviceId = deviceId;
        this.adbService = adbService;
        this.pendingBuffer = Buffer.alloc(0);
        this.frameSize = 0;
    }
    async start() {
        const device = await this.adbService.getDevice(this.deviceId);
        if (!device || device.status !== 'device') {
            throw new error_1.AppError(`Device ${this.deviceId} is not currently connected`, 404);
        }
        this.frameSize = device.resolution.width * device.resolution.height * 4;
        this.pendingBuffer = Buffer.alloc(0);
        this.process = (0, child_process_1.spawn)(config_1.config.scrcpyPath, [
            '-s',
            this.deviceId,
            '--no-display',
            '--rawvideo',
            '-',
            '--bit-rate',
            config_1.config.bitRate,
            '--max-fps',
            String(config_1.config.maxFps),
        ]);
        this.process.stdout.on('data', (chunk) => this.handleRawFrameData(chunk, device.resolution));
        this.process.stderr.on('data', (chunk) => logger_1.log.warn('Scrcpy stderr', chunk.toString()));
        this.process.on('exit', (code, signal) => {
            logger_1.log.warn('Scrcpy process exited', { deviceId: this.deviceId, code, signal });
            this.emit('stopped', this.deviceId);
        });
        this.process.on('error', (error) => {
            logger_1.log.error('Scrcpy start error', error);
            this.emit('error', this.deviceId, error);
        });
        this.emit('started', this.deviceId);
    }
    async stop() {
        if (!this.process) {
            return;
        }
        this.process.kill();
        this.process = undefined;
        this.pendingBuffer = Buffer.alloc(0);
    }
    async handleRawFrameData(chunk, resolution) {
        this.pendingBuffer = Buffer.concat([this.pendingBuffer, chunk]);
        while (this.pendingBuffer.length >= this.frameSize) {
            const rawFrame = this.pendingBuffer.slice(0, this.frameSize);
            this.pendingBuffer = this.pendingBuffer.slice(this.frameSize);
            try {
                const jpeg = await (0, sharp_1.default)(rawFrame, {
                    raw: {
                        width: resolution.width,
                        height: resolution.height,
                        channels: 4,
                    },
                })
                    .jpeg({ quality: config_1.config.frameQuality })
                    .toBuffer();
                this.emit('frame', {
                    deviceId: this.deviceId,
                    frameBase64: `data:image/jpeg;base64,${jpeg.toString('base64')}`,
                });
            }
            catch (error) {
                this.emit('error', this.deviceId, error instanceof Error ? error : new Error('Frame conversion failed'));
            }
        }
    }
}
exports.ScrcpyService = ScrcpyService;
//# sourceMappingURL=scrcpy.service.js.map