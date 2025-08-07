import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database.js';

const router = express.Router();

// Enhanced login with student ID and password
router.post('/enhanced-login', async (req, res) => {
  try {
    const { studentId, password } = req.body;

    if (!studentId || !password) {
      return res.status(400).json({ error: 'Student ID and password are required' });
    }

    // Find user by student ID
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For demo purposes, we'll use simple password comparison
    // In production, you should use proper bcrypt hashing
    const demoPasswords = {
      'ADMIN001': 'admin123',
      'STAFF001': 'staff123',
      'STU001': 'student123'
    };

    // Try bcrypt comparison first, fallback to demo passwords
    let validPassword = false;
    try {
      validPassword = await bcrypt.compare(password, user.pin_hash);
    } catch (bcryptError) {
      // Fallback to demo password comparison
      validPassword = demoPasswords[studentId] === password;
    }
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'canteen-secret',
      { expiresIn: '24h' }
    );

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        student_id: user.student_id,
        wallet_balance: user.wallet_balance,
        avatar_url: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Enhanced login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Password reset request
router.post('/reset-password-request', async (req, res) => {
  try {
    const { studentId, email } = req.body;

    if (!studentId && !email) {
      return res.status(400).json({ error: 'Student ID or email is required' });
    }

    let query = supabase.from('users').select('id, name, student_id, email');
    
    if (studentId) {
      query = query.eq('student_id', studentId);
    } else {
      query = query.eq('email', email);
    }

    const { data: user, error } = await query.single();

    if (error || !user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If the account exists, a reset link will be sent.' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET || 'canteen-secret',
      { expiresIn: '1h' }
    );

    // Store reset token in database
    await supabase
      .from('password_reset_tokens')
      .insert([{
        user_id: user.id,
        token: resetToken,
        expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour
      }]);

    // In a real application, you would send an email here
    // For demo purposes, we'll just return success
    res.json({ 
      message: 'Password reset instructions sent.',
      resetToken // Remove this in production
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process reset request' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'canteen-secret');
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    // Check if token exists and is not expired
    const { data: resetRecord, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('user_id', decoded.userId)
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (tokenError || !resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await supabase
      .from('users')
      .update({ pin_hash: hashedPassword })
      .eq('id', decoded.userId);

    // Delete used reset token
    await supabase
      .from('password_reset_tokens')
      .delete()
      .eq('id', resetRecord.id);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router;