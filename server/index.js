import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import walletRoutes from './routes/wallet.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wallet', walletRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({ 
    status: dbConnected ? 'OK' : 'ERROR',
    message: 'Smart Canteen System API is running',
    database: dbConnected ? 'Connected' : 'Disconnected'
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('🔍 Testing database connection...');
  await testConnection();
});