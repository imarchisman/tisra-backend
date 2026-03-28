import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env';
import { rootRouter } from './routes';
import { errorHandler } from './middlewares/error-handler';
import { ApiResponse } from './types/common.types';

const app: Application = express();

// Global Middlewares
app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', rootRouter);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  } as ApiResponse,
});

app.use('/api/', limiter);

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'Server is healthy' } as ApiResponse);
});

// Root route
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Tisra Backend API',
    version: '1.0.0',
  } as ApiResponse);
});

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${_req.method} ${_req.url} not found`,
  } as ApiResponse);
});

// Error Handler (must be last)
app.use(errorHandler);

//exporting the app

export { app };
