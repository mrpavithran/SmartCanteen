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

    let user = null;
    let error = null;
    
    // Try to parse QR code as JSON first (new format)
    try {
      const qrData = JSON.parse(qrCode);
      if (qrData.type === 'canteen_login') {
        // Find user by student ID from QR data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('student_id', qrData.studentId)
          .single();
        user = userData;
        error = userError;
      }
    } catch (parseError) {
      // Handle legacy QR code format
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('qr_code', qrCode)
        .single();
      user = userData;
      error = userError;
    }

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid QR Code' });
    }

    // For demo purposes, we'll use simple PIN comparison
    // In production, you should use proper bcrypt hashing
    const pinMap = {
      'DEMO_ADMIN': '0000',
      'DEMO_STAFF': '9999',
      'DEMO_STUDENT': '1234'
    };
    
    // Check PIN based on QR code format
    let validPin = false;
    try {
      const qrData = JSON.parse(qrCode);
      if (qrData.type === 'canteen_login') {
        // For new format, validate against stored PIN hash
        validPin = await bcrypt.compare(pin, user.pin_hash);
      }
    } catch (parseError) {
      // Legacy format validation
      validPin = pinMap[qrCode] === pin;
    }
    
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
    console.error('Login error:', error);
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