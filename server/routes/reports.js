import express from 'express';
import { supabase } from '../config/database.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get report data
router.get('/data', authenticateToken, async (req, res) => {
  try {
    const { dateRange, reportType, startDate, endDate } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Calculate date range
    let dateFilter = '';
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        dateFilter = `created_at >= '${new Date(now.setHours(0, 0, 0, 0)).toISOString()}'`;
        break;
      case 'week':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        dateFilter = `created_at >= '${weekStart.toISOString()}'`;
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = `created_at >= '${monthStart.toISOString()}'`;
        break;
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        dateFilter = `created_at >= '${quarterStart.toISOString()}'`;
        break;
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        dateFilter = `created_at >= '${yearStart.toISOString()}'`;
        break;
      case 'custom':
        if (startDate && endDate) {
          dateFilter = `created_at >= '${startDate}' AND created_at <= '${endDate}'`;
        }
        break;
    }

    let reportData = {};

    // Base statistics
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        *,
        users (name, student_id)
      `)
      .gte('created_at', dateFilter ? dateFilter.split("'")[1] : '1970-01-01');

    const { data: users } = await supabase
      .from('users')
      .select('*');

    // Calculate basic stats
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0;
    const totalUsers = users?.length || 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top selling items
    const itemCounts = {};
    orders?.forEach(order => {
      order.items.forEach(item => {
        if (itemCounts[item.name]) {
          itemCounts[item.name].orders += item.quantity;
          itemCounts[item.name].revenue += item.price * item.quantity;
        } else {
          itemCounts[item.name] = {
            name: item.name,
            orders: item.quantity,
            revenue: item.price * item.quantity
          };
        }
      });
    });

    const topItems = Object.values(itemCounts)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent orders
    const recentOrders = orders
      ?.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10)
      .map(order => ({
        id: order.token_number || order.id,
        customer: order.users?.name || 'Unknown',
        amount: order.total_amount,
        time: new Date(order.created_at).toLocaleString(),
        status: order.status
      })) || [];

    // User-specific data for students
    if (userRole === 'student') {
      const { data: userOrders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', dateFilter ? dateFilter.split("'")[1] : '1970-01-01');

      reportData = {
        totalOrders: userOrders?.length || 0,
        totalRevenue: userOrders?.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) || 0,
        avgOrderValue: userOrders?.length > 0 ? userOrders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0) / userOrders.length : 0,
        recentOrders: userOrders?.slice(0, 5).map(order => ({
          id: order.token_number || order.id,
          amount: order.total_amount,
          time: new Date(order.created_at).toLocaleString(),
          status: order.status
        })) || []
      };
    } else {
      // Admin/Staff data
      reportData = {
        totalOrders,
        totalRevenue,
        totalUsers,
        avgOrderValue,
        topItems,
        recentOrders,
        userStats: {
          activeUsers: users?.filter(u => u.wallet_balance > 0).length || 0,
          newUsers: users?.filter(u => {
            const createdDate = new Date(u.created_at);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return createdDate > thirtyDaysAgo;
          }).length || 0
        },
        categoryStats: await getCategoryStats(dateFilter)
      };
    }

    res.json(reportData);
  } catch (error) {
    console.error('Report data error:', error);
    res.status(500).json({ error: 'Failed to fetch report data' });
  }
});

// Export report
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const { dateRange, reportType, format = 'pdf' } = req.query;
    
    // Get report data (reuse the logic from /data endpoint)
    const reportData = await getReportData(req.query, req.user);

    if (format === 'pdf') {
      // Generate PDF report
      const pdfBuffer = await generatePDFReport(reportData, reportType, dateRange);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="canteen-report-${dateRange}-${Date.now()}.pdf"`);
      res.send(pdfBuffer);
    } else if (format === 'excel') {
      // Generate Excel report
      const excelBuffer = await generateExcelReport(reportData, reportType, dateRange);
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="canteen-report-${dateRange}-${Date.now()}.xlsx"`);
      res.send(excelBuffer);
    } else {
      res.status(400).json({ error: 'Unsupported export format' });
    }
  } catch (error) {
    console.error('Report export error:', error);
    res.status(500).json({ error: 'Failed to export report' });
  }
});

// Helper function to get category statistics
async function getCategoryStats(dateFilter) {
  try {
    const { data: categories } = await supabase
      .from('categories')
      .select(`
        *,
        items (
          id,
          name,
          price
        )
      `);

    return categories?.map(category => ({
      name: category.name,
      itemCount: category.items?.length || 0,
      avgPrice: category.items?.length > 0 
        ? category.items.reduce((sum, item) => sum + parseFloat(item.price), 0) / category.items.length 
        : 0
    })) || [];
  } catch (error) {
    console.error('Category stats error:', error);
    return [];
  }
}

// Helper function to get report data (extracted for reuse)
async function getReportData(query, user) {
  // This would contain the same logic as the /data endpoint
  // Extracted for reuse in export functionality
  return {};
}

// Helper function to generate PDF report
async function generatePDFReport(data, reportType, dateRange) {
  // In a real application, you would use a library like puppeteer or jsPDF
  // For demo purposes, we'll return a simple buffer
  const reportContent = `
    Smart Canteen System Report
    Report Type: ${reportType}
    Date Range: ${dateRange}
    
    Total Orders: ${data.totalOrders}
    Total Revenue: ₹${data.totalRevenue?.toFixed(2)}
    Average Order Value: ₹${data.avgOrderValue?.toFixed(2)}
    
    Generated on: ${new Date().toLocaleString()}
  `;
  
  return Buffer.from(reportContent, 'utf8');
}

// Helper function to generate Excel report
async function generateExcelReport(data, reportType, dateRange) {
  // In a real application, you would use a library like exceljs
  // For demo purposes, we'll return a simple CSV-like buffer
  const csvContent = `
Report Type,${reportType}
Date Range,${dateRange}
Total Orders,${data.totalOrders}
Total Revenue,${data.totalRevenue?.toFixed(2)}
Average Order Value,${data.avgOrderValue?.toFixed(2)}
Generated On,${new Date().toLocaleString()}
  `;
  
  return Buffer.from(csvContent, 'utf8');
}

export default router;