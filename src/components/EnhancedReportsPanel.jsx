import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Download, 
  Calendar,
  Filter,
  FileText,
  PieChart,
  DollarSign
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const EnhancedReportsPanel = ({ user }) => {
  const [dateRange, setDateRange] = useState('today');
  const [reportType, setReportType] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    avgOrderValue: 0,
    topItems: [],
    recentOrders: [],
    userStats: {},
    categoryStats: []
  });
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange, reportType]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        dateRange,
        reportType,
        ...(dateRange === 'custom' && customDateRange.startDate && customDateRange.endDate && {
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate
        })
      });

      const response = await fetch(`/api/reports/data?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format = 'pdf') => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        dateRange,
        reportType,
        format,
        ...(dateRange === 'custom' && customDateRange.startDate && customDateRange.endDate && {
          startDate: customDateRange.startDate,
          endDate: customDateRange.endDate
        })
      });

      const response = await fetch(`/api/reports/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `canteen-report-${dateRange}-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  const reportTypes = [
    { value: 'overview', label: 'Overview', icon: BarChart3 },
    { value: 'sales', label: 'Sales Report', icon: DollarSign },
    { value: 'inventory', label: 'Inventory Report', icon: ShoppingCart },
    { value: 'users', label: 'User Analytics', icon: Users },
    { value: 'items', label: 'Item Performance', icon: PieChart }
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Reports & Analytics</h2>
          <p className="text-gray-600">Comprehensive insights for {user?.name}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Report Type Filter */}
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {reportTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {/* Date Range Filter */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>

          {/* Export Buttons */}
          <div className="flex space-x-2">
            <button 
              onClick={() => exportReport('pdf')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <FileText className="h-4 w-4" />
              <span>PDF</span>
            </button>
            <button 
              onClick={() => exportReport('excel')}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Download className="h-4 w-4" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Range */}
      {dateRange === 'custom' && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={customDateRange.startDate}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={customDateRange.endDate}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={fetchReportData}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={ShoppingCart}
              color="blue"
              change="+12%"
            />
            <StatCard
              title="Total Revenue"
              value={`₹${stats.totalRevenue.toFixed(2)}`}
              icon={TrendingUp}
              color="green"
              change="+8%"
            />
            <StatCard
              title="Active Users"
              value={stats.totalUsers}
              icon={Users}
              color="purple"
              change="+5%"
            />
            <StatCard
              title="Avg Order Value"
              value={`₹${stats.avgOrderValue.toFixed(2)}`}
              icon={BarChart3}
              color="orange"
              change="+3%"
            />
          </div>

          {/* Report Content Based on Type */}
          {reportType === 'overview' && <OverviewReport stats={stats} />}
          {reportType === 'sales' && <SalesReport stats={stats} />}
          {reportType === 'inventory' && <InventoryReport stats={stats} />}
          {reportType === 'users' && <UserAnalyticsReport stats={stats} />}
          {reportType === 'items' && <ItemPerformanceReport stats={stats} />}
        </>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, change }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1">{change} from last period</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

const OverviewReport = ({ stats }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>
      <div className="space-y-3">
        {stats.topItems.map((item, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-600">{item.orders} orders</p>
            </div>
            <p className="font-semibold text-green-600">₹{item.revenue}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {stats.recentOrders.map((order, index) => (
          <div key={index} className="flex justify-between items-center p-3 border-b border-gray-100">
            <div>
              <p className="font-medium text-gray-900">Order #{order.id}</p>
              <p className="text-sm text-gray-600">{order.customer}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">₹{order.amount}</p>
              <p className="text-sm text-gray-500">{order.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SalesReport = ({ stats }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Performance</h3>
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">Sales chart visualization would be displayed here</p>
      </div>
    </div>
  </div>
);

const InventoryReport = ({ stats }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Status</h3>
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">Inventory analytics would be displayed here</p>
      </div>
    </div>
  </div>
);

const UserAnalyticsReport = ({ stats }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Analytics</h3>
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">User behavior analytics would be displayed here</p>
      </div>
    </div>
  </div>
);

const ItemPerformanceReport = ({ stats }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Item Performance</h3>
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">Item performance metrics would be displayed here</p>
      </div>
    </div>
  </div>
);

export default EnhancedReportsPanel;