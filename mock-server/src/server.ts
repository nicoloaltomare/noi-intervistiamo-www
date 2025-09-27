import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler, notFoundHandler, healthCheck } from './middleware/error.middleware';
import { rateLimit } from './middleware/validation.middleware';
import { dashboardRoutes } from './routes/dashboard.routes';
import { userRoutes } from './routes/user.routes';
import { interviewRoutes } from './routes/interview.routes';
import { authRoutes } from './routes/auth.routes';
import { candidateRoutes } from './routes/candidate.routes';
import { notificationRoutes } from './routes/notification.routes';
import { fileRoutes } from './routes/file.routes';

const app = express();
const PORT = process.env.PORT || 8080;

// Security and logging middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:4200'],
  credentials: true
}));
app.use(morgan('combined'));

// Rate limiting
app.use(rateLimit(1000, 15 * 60 * 1000)); // 1000 requests per 15 minutes

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timeout
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(408).json({
      success: false,
      error: {
        code: 'REQUEST_TIMEOUT',
        message: 'Request timeout'
      },
      timestamp: new Date()
    });
  });
  next();
});

// Routes
app.use('/noi-intervistiamo/api/auth', authRoutes);
app.use('/noi-intervistiamo/api/dashboard', dashboardRoutes);
app.use('/noi-intervistiamo/api/users', userRoutes);
app.use('/noi-intervistiamo/api/interviews', interviewRoutes);
app.use('/noi-intervistiamo/api/candidates', candidateRoutes);
app.use('/noi-intervistiamo/api/notifications', notificationRoutes);
app.use('/noi-intervistiamo/api/files', fileRoutes);

// Health check with detailed info
app.get('/noi-intervistiamo/api/health', healthCheck);

// Simple health check for load balancers
app.get('/noi-intervistiamo/api/ping', (req, res) => {
  res.status(200).send('pong');
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Noi Intervistiamo Mock Server running on http://localhost:${PORT}`);
  console.log(`🔐 Auth API: http://localhost:${PORT}/noi-intervistiamo/api/auth`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/noi-intervistiamo/api/dashboard`);
  console.log(`👥 Users API: http://localhost:${PORT}/noi-intervistiamo/api/users`);
  console.log(`💼 Interviews API: http://localhost:${PORT}/noi-intervistiamo/api/interviews`);
  console.log(`👤 Candidates API: http://localhost:${PORT}/noi-intervistiamo/api/candidates`);
  console.log(`🔔 Notifications API: http://localhost:${PORT}/noi-intervistiamo/api/notifications`);
  console.log(`📁 Files API: http://localhost:${PORT}/noi-intervistiamo/api/files`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/noi-intervistiamo/api/health`);
});