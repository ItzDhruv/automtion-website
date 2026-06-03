"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = void 0;
const prefix = '[tg-live-backend]';
exports.log = {
    info: (message, meta) => {
        console.log(`${prefix} INFO: ${message}`, meta ?? '');
    },
    warn: (message, meta) => {
        console.warn(`${prefix} WARN: ${message}`, meta ?? '');
    },
    error: (message, meta) => {
        console.error(`${prefix} ERROR: ${message}`, meta ?? '');
    },
};
//# sourceMappingURL=logger.js.map