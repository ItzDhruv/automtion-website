"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mountFinalHandlers = exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const error_1 = require("./utils/error");
const createApp = (deviceRouter) => {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({
        origin: config_1.config.allowedOrigins,
        methods: ['GET', 'POST', 'OPTIONS'],
    }));
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: false }));
    if (deviceRouter) {
        app.use('/api/devices', deviceRouter);
    }
    return app;
};
exports.createApp = createApp;
const mountFinalHandlers = (app) => {
    app.use((req, res) => {
        res.status(404).json({ error: 'Not found' });
    });
    app.use(error_1.apiErrorHandler);
};
exports.mountFinalHandlers = mountFinalHandlers;
//# sourceMappingURL=app.js.map