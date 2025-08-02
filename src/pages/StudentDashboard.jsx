import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Wallet, 
  History, 
  LogOut, 
  Grid3X3,
  User,
  Receipt
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import MenuCategories from '../components/MenuCategories';
import Cart from '../components/Cart';
import OrderHistory from '../components/OrderHistory';
import WalletInfo from '../components/WalletInfo';
import KOTDisplay from '../components/KOTDisplay';

const StudentDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('menu');
  const [walletBalance, setWalletBalance] = useState(user.wallet_balance || 0);
  const [lastOrder, setLastOrder] = useState(null);
  const { getTotalItems } = useCart();

  const tabs = [
    { id: 'menu', label: 'Menu', icon: Grid3X3 },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: getTotalItems() },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'orders', label: 'Orders', icon: History },
  ];

  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/wallet/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setWalletBalance(data.balance);
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
    }
  };

  const handleOrderSuccess = (order) => {
    setLastOrder(order);
    setActiveTab('kot');
    fetchWalletBalance();
  };

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'menu':
        return <MenuCategories />;
      case 'cart':
        return (
          <Cart 
            walletBalance={walletBalance}
            onOrderSuccess={handleOrderSuccess}
          />
        );
      case 'wallet':
        return <WalletInfo balance={walletBalance} />;
      case 'orders':
        return <OrderHistory />;
      case 'kot':
        return <KOTDisplay order={lastOrder} onBack={() => setActiveTab('orders')} />;
      default:
        return <MenuCategories />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Welcome, {user.name}
                </h1>
                <p className="text-sm text-gray-500">ID: {user.student_id}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Wallet Balance</p>
                <p className="text-lg font-semibold text-green-600">
                  ₹{walletBalance.toFixed(2)}
                </p>
              </div>
              
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </main>
    </div>
  );
};

export default StudentDashboard;