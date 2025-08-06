import express from 'express';
import { supabase } from '../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all items
router.get('/', async (req, res) => {
  try {
    const { category_id, available_only } = req.query;
    
    let query = supabase
      .from('items')
      .select(`
        *,
        categories (name, description)
      `)
      .order('name');

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    if (available_only === 'true') {
      query = query.eq('is_available', true);
    }

    const { data: items, error } = await query;

    if (error) throw error;
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: item, error } = await supabase
      .from('items')
      .select(`
        *,
        categories (name, description)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Create item (Admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, description, price, category_id, image_url } = req.body;

    if (!name || !price || !category_id) {
      return res.status(400).json({ 
        error: 'Name, price, and category are required' 
      });
    }

    if (price <= 0) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }

    const { data: item, error } = await supabase
      .from('items')
      .insert([{
        name,
        description,
        price: parseFloat(price),
        category_id,
        image_url,
        is_available: true
      }])
      .select(`
        *,
        categories (name, description)
      `)
      .single();

    if (error) throw error;
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Update item (Admin only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { name, description, price, category_id, image_url, is_available } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) {
      if (price <= 0) {
        return res.status(400).json({ error: 'Price must be greater than 0' });
      }
      updateData.price = parseFloat(price);
    }
    if (category_id !== undefined) updateData.category_id = category_id;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (is_available !== undefined) updateData.is_available = is_available;

    const { data: item, error } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        categories (name, description)
      `)
      .single();

    if (error) throw error;
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete item (Admin only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Toggle item availability (Admin only)
router.patch('/:id/availability', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { is_available } = req.body;

    const { data: item, error } = await supabase
      .from('items')
      .update({ is_available })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item availability' });
  }
});

export default router;