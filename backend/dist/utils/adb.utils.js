"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeTextForAdb = exports.parseWmSize = exports.parseAdbDevices = void 0;
const parseAdbDevices = (output) => {
    return output
        .split(/\r?\n/)
        .slice(1)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
        const [id, status] = line.split(/\s+/);
        return {
            id,
            status: (status === 'device' || status === 'offline' || status === 'unauthorized' ? status : 'unknown'),
        };
    });
};
exports.parseAdbDevices = parseAdbDevices;
const parseWmSize = (output) => {
    const match = output.match(/Physical size:\s*(\d+)x(\d+)/i);
    if (!match) {
        throw new Error('Unable to parse device screen resolution');
    }
    return {
        width: Number(match[1]),
        height: Number(match[2]),
    };
};
exports.parseWmSize = parseWmSize;
const sanitizeTextForAdb = (text) => {
    const escaped = text.replace(/(["'%\\])/g, '\\$1');
    return escaped.replace(/\s/g, '%s');
};
exports.sanitizeTextForAdb = sanitizeTextForAdb;
//# sourceMappingURL=adb.utils.js.map