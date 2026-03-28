import express from 'express';
import cors from 'cors';
import router from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,
      /\.onrender\.com$/,
      /^https?:\/\// // Fallback if FRONTEND_URL is set or testing
    ];
    if (!origin || allowedPatterns.some(pattern => pattern.test(origin)) || origin === process.env.FRONTEND_URL) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'Prompt2Page API' }));

app.use('/api', router);

app.use(errorMiddleware);

export default app;
