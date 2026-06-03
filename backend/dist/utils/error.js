"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiErrorHandler = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
const apiErrorHandler = (error, _req, res, _next) => {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
    }
    console.error('[tg-live-backend] Unhandled error', error);
    return res.status(500).json({ error: 'Unexpected server error' });
};
exports.apiErrorHandler = apiErrorHandler;
//# sourceMappingURL=error.js.map