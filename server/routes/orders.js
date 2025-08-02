import express from 'express';
import { supabase } from '../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Place order
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    const userId = req.user.userId;

    // Check wallet balance
    const { data: user } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    if (user.wallet_balance < totalAmount) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    // Generate token number
    const tokenNumber = Math.floor(1000 + Math.random() * 9000);

    // Create order
    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        items,
        total_amount: totalAmount,
        token_number: tokenNumber,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    // Deduct from wallet
    await supabase
      .from('users')
      .update({ wallet_balance: user.wallet_balance - totalAmount })
      .eq('id', userId);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get user orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get all orders (Staff/Admin)
router.get('/all', authenticateToken, async (req, res) => {
  try {
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Staff or Admin access required' });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        users (name, student_id)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Update order status (Staff/Admin)
router.patch('/:orderId/status', authenticateToken, async (req, res) => {
  try {
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Staff or Admin access required' });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;