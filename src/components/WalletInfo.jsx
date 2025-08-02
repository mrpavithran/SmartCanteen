import React from 'react';
import { Wallet, CreditCard, TrendingUp } from 'lucide-react';

const WalletInfo = ({ balance }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Wallet</h2>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Wallet className="h-8 w-8" />
          <h3 className="text-xl font-semibold">Current Balance</h3>
        </div>
        <p className="text-4xl font-bold mb-2">₹{balance.toFixed(2)}</p>
        <p className="text-green-100">Available for purchases</p>
      </div>

      {/* Recharge Options */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recharge Options</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">UPI Payment</p>
              <p className="text-sm text-gray-600">Scan QR code to recharge instantly</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Admin Recharge</p>
              <p className="text-sm text-gray-600">Contact admin for manual recharge</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Recharge</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[50, 100, 200, 500].map((amount) => (
            <button
              key={amount}
              className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold">₹{amount}</span>
            </button>
          ))}
        </div>
        
        <button className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Recharge via UPI
        </button>
      </div>
    </div>
  );
};

export default WalletInfo;