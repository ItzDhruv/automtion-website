import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config';
import { apiErrorHandler } from './utils/error';
import { Router } from 'express';

export const createApp = (deviceRouter?: Router) => {
  const app = express();

  app.use(
    cors({
      origin: config.allowedOrigins,
      methods: ['GET', 'POST', 'OPTIONS'],
    }),
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: false }));

  if (deviceRouter) {
    app.use('/api/devices', deviceRouter);
  }

  return app;
};

export const mountFinalHandlers = (app: Express): void => {
  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  app.use(apiErrorHandler);
};
