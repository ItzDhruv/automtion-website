"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const parseNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
exports.config = {
    port: parseNumber(process.env.PORT, 4000),
    adbPath: process.env.ADB_PATH || 'adb',
    scrcpyPath: process.env.SCRCPY_PATH || 'scrcpy',
    appiumUrl: process.env.APPIUM_URL || 'http://127.0.0.1:4723/wd/hub',
    bitRate: process.env.BIT_RATE || '2M',
    maxFps: parseNumber(process.env.MAX_FPS, 15),
    frameQuality: parseNumber(process.env.FRAME_QUALITY, 60),
    allowedOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()) : ['*'],
};
//# sourceMappingURL=index.js.map