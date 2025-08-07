import express from 'express';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { supabase } from '../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, student_id, role, wallet_balance, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create new user (Admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, studentId, pin, role = 'student' } = req.body;

    if (!name || !studentId || !pin) {
      return res.status(400).json({ error: 'Name, Student ID, and PIN are required' });
    }

    // Hash PIN
    const pinHash = await bcrypt.hash(pin, 10);

    // Generate QR Code with embedded credentials
    const qrData = JSON.stringify({
      studentId: studentId,
      password: pin, // Include password in QR for enhanced scanner
      type: 'canteen_login',
      timestamp: Date.now()
    });
    
    // Generate QR code as data URL
    let qrCodeUrl;
    try {
      qrCodeUrl = await QRCode.toDataURL(qrData);
    } catch (qrError) {
      console.error('QR Code generation error:', qrError);
      qrCodeUrl = null;
    }

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        name,
        student_id: studentId,
        pin_hash: pinHash,
        qr_code: qrData,
        qr_code_url: qrCodeUrl,
        role,
        wallet_balance: 0
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      id: user.id,
      name: user.name,
      student_id: user.student_id,
      role: user.role,
      qr_code_url: user.qr_code_url
    });
  } catch (error) {
    console.error('User creation error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Student ID already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, student_id, role, wallet_balance, qr_code_url')
      .eq('id', req.user.userId)
      .single();

    if (error) throw error;

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user (Admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { name, student_id, role, wallet_balance } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (student_id !== undefined) updateData.student_id = student_id;
    if (role !== undefined) updateData.role = role;
    if (wallet_balance !== undefined) updateData.wallet_balance = parseFloat(wallet_balance);

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, name, student_id, role, wallet_balance, created_at')
      .single();

    if (error) throw error;

    res.json(user);
  } catch (error) {
    console.error('User update error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Student ID already exists' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    // Check if user has pending orders
    const { data: orders } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', id)
      .in('status', ['pending', 'preparing', 'ready'])
      .limit(1);

    if (orders && orders.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user with pending orders. Please complete or cancel orders first.' 
      });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;