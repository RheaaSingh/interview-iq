import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import resumeRoutes from './routes/resumes';
import jobDescriptionRoutes from './routes/jobDescriptions';
import interviewRoutes from './routes/interviews';
import dashboardRoutes from './routes/dashboard';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/job-descriptions', jobDescriptionRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`Interview IQ Backend running on port ${PORT}`);
  console.log(`Environment: ${env.NODE_ENV}`);
  console.log(`API: http://localhost:${PORT}/api`);
});

export default app;
