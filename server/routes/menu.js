import express from 'express';
import { supabase } from '../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get items by category
router.get('/items/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const { data: items, error } = await supabase
      .from('items')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_available', true)
      .order('name');

    if (error) throw error;
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Create category (Admin only)
router.post('/categories', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, description } = req.body;

    const { data: category, error } = await supabase
      .from('categories')
      .insert([{ name, description, is_active: true }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Create item (Admin only)
router.post('/items', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, description, price, categoryId, imageUrl } = req.body;

    const { data: item, error } = await supabase
      .from('items')
      .insert([{
        name,
        description,
        price,
        category_id: categoryId,
        image_url: imageUrl,
        is_available: true
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

export default router;