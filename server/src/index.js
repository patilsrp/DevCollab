// server/src/index.js
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSocket } from './socket.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);  // Important: Socket.IO needs the raw HTTP server

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Health check endpoint — useful for deployment
app.get('/health', (req, res) => res.json({ status: 'ok' }));

initSocket(httpServer);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});