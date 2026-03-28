import 'dotenv/config';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './src/app.js';
import { connectDB } from './src/config/db.config.js';
import { registerCollabHandlers } from './src/sockets/collab.socket.js';

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  // Wrap Express in HTTP server to support Socket.io
  const httpServer = createServer(app);

  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: function (origin, callback) {
        const allowedPatterns = [
          /^http:\/\/localhost:\d+$/,
          /\.onrender\.com$/,
          /^https?:\/\//
        ];
        if (!origin || allowedPatterns.some(pattern => pattern.test(origin)) || origin === process.env.FRONTEND_URL) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Register collaboration socket handlers
  registerCollabHandlers(io);

  httpServer.listen(PORT, () => {
    console.log(`🚀 Prompt2Page server running on http://localhost:${PORT}`);
    console.log(`🔗 Socket.io real-time collaboration enabled`);
  });
};

start();
