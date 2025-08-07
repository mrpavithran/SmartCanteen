import express from 'express';
import { supabase } from '../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { filter = 'all' } = req.query;
    const userId = req.user.userId;

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Apply filters
    switch (filter) {
      case 'unread':
        query = query.eq('read', false);
        break;
      case 'order':
        query = query.eq('type', 'order');
        break;
      case 'wallet':
        query = query.eq('type', 'wallet');
        break;
      case 'system':
        query = query.eq('type', 'system');
        break;
    }

    const { data: notifications, error } = await query;

    if (error) throw error;

    res.json(notifications || []);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json(notification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Get notification settings
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: settings, error } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // Return default settings if none exist
    const defaultSettings = {
      orderUpdates: true,
      walletUpdates: true,
      promotions: true,
      systemUpdates: true
    };

    res.json(settings?.settings || defaultSettings);
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ error: 'Failed to get notification settings' });
  }
});

// Update notification settings
router.put('/settings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const settings = req.body;

    const { data: updatedSettings, error } = await supabase
      .from('notification_settings')
      .upsert([{
        user_id: userId,
        settings,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    res.json(updatedSettings.settings);
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ error: 'Failed to update notification settings' });
  }
});

// Create notification (internal use)
router.post('/create', authenticateToken, async (req, res) => {
  try {
    // Only allow admin/staff to create notifications
    if (!['admin', 'staff'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { userId, type, title, message, data = {} } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        data,
        read: false
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(notification);
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

// Broadcast notification to all users (admin only)
router.post('/broadcast', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { type, title, message, data = {}, targetRole } = req.body;

    if (!type || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get target users
    let query = supabase.from('users').select('id');
    
    if (targetRole && targetRole !== 'all') {
      query = query.eq('role', targetRole);
    }

    const { data: users, error: usersError } = await query;

    if (usersError) throw usersError;

    // Create notifications for all target users
    const notifications = users.map(user => ({
      user_id: user.id,
      type,
      title,
      message,
      data,
      read: false
    }));

    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) throw insertError;

    res.json({ 
      message: `Notification sent to ${users.length} users`,
      count: users.length 
    });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({ error: 'Failed to broadcast notification' });
  }
});

export default router;