import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import adminRouter from './modules/admin/admin.routes.js';
import ambulanceRouter from './modules/ambulance/ambulance.routes.js';
import appointmentsRouter from './modules/appointments/appointments.routes.js';
import authRouter from './modules/auth/auth.routes.js';
import chatRouter from './modules/chat/chat.routes.js';
import doctorsRouter from './modules/doctors/doctors.routes.js';
import labsRouter from './modules/labs/labs.routes.js';
import paymentsRouter from './modules/payments/payments.routes.js';
import usersRouter from './modules/users/users.routes.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:4200', credentials: true }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'wittydoctor-api', ts: new Date().toISOString() });
});

app.get('/ready', (_req, res) => {
  res.json({ status: 'ready' });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/doctors', doctorsRouter);
app.use('/api/v1/appointments', appointmentsRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/chat', chatRouter);
app.use('/api/v1/labs', labsRouter);
app.use('/api/v1/ambulance', ambulanceRouter);
app.use('/api/v1/admin', adminRouter);

app.use(errorHandler);

export default app;
