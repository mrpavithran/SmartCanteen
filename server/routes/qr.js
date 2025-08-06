import express from 'express';
import QRCode from 'qrcode';
import { supabase } from '../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Generate and download QR code for a user
router.get('/download/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user has permission (admin or own QR code)
    if (req.user.role !== 'admin' && req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get user data
    const { data: user, error } = await supabase
      .from('users')
      .select('name, student_id, qr_code')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate QR code as PNG buffer
    const qrCodeBuffer = await QRCode.toBuffer(user.qr_code, {
      type: 'png',
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Set headers for file download
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="QR_${user.student_id}_${user.name.replace(/\s+/g, '_')}.png"`);
    res.setHeader('Content-Length', qrCodeBuffer.length);

    // Send the QR code image
    res.send(qrCodeBuffer);
  } catch (error) {
    console.error('QR download error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Get QR code as base64 data URL
router.get('/view/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user has permission
    if (req.user.role !== 'admin' && req.user.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get user data
    const { data: user, error } = await supabase
      .from('users')
      .select('name, student_id, qr_code')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(user.qr_code, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      qrCode: qrCodeDataURL,
      userData: {
        name: user.name,
        studentId: user.student_id,
        qrData: user.qr_code
      }
    });
  } catch (error) {
    console.error('QR view error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

export default router;