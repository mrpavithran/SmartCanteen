import express from 'express';
import { supabase } from '../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get wallet balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', req.user.userId)
      .single();

    if (error) throw error;
    res.json({ balance: user.wallet_balance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wallet balance' });
  }
});

// Recharge wallet (Admin only)
router.post('/recharge', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId, amount } = req.body;

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid user ID and amount required' });
    }

    // Get current balance
    const { data: user } = await supabase
      .from('users')
      .select('wallet_balance')
      .eq('id', userId)
      .single();

    // Update balance
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ wallet_balance: user.wallet_balance + amount })
      .eq('id', userId)
      .select('wallet_balance')
      .single();

    if (error) throw error;

    res.json({ 
      message: 'Wallet recharged successfully',
      newBalance: updatedUser.wallet_balance 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to recharge wallet' });
  }
});

// Get wallet transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const { data: transactions, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;