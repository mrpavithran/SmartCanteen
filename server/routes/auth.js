import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';

const router = express.Router();

// Login with QR Code and PIN
router.post('/login', async (req, res) => {
  try {
    const { qrCode, pin } = req.body;

    if (!qrCode || !pin) {
      return res.status(400).json({ error: 'QR Code and PIN are required' });
    }

    // Find user by QR code
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('qr_code', qrCode)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid QR Code' });
    }

    // Verify PIN
    const validPin = await bcrypt.compare(pin, user.pin_hash);
    if (!validPin) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'canteen-secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        student_id: user.student_id,
        wallet_balance: user.wallet_balance
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'canteen-secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

export default router;