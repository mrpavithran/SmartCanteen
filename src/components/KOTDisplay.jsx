import React from 'react';
import { Receipt, ArrowLeft, Clock, CheckCircle } from 'lucide-react';

const KOTDisplay = ({ order, onBack }) => {
  if (!order) return null;

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    preparing: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
  };

  const statusIcons = {
    pending: Clock,
    preparing: Clock,
    ready: CheckCircle,
    completed: CheckCircle,
  };

  const StatusIcon = statusIcons[order.status] || Clock;

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Kitchen Order Token</h2>
      </div>

      {/* KOT Card */}
      <div className="bg-white rounded-lg shadow-lg border-2 border-dashed border-gray-300 p-6 space-y-4">
        {/* Header */}
        <div className="text-center border-b pb-4">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Receipt className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-gray-900">SMART CANTEEN</h3>
          </div>
          <p className="text-sm text-gray-600">Kitchen Order Token</p>
        </div>

        {/* Token Number */}
        <div className="text-center bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Token Number</p>
          <p className="text-4xl font-bold text-blue-600">#{order.token_number}</p>
        </div>

        {/* Order Details */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-mono">{order.id}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Date & Time:</span>
            <span>{new Date(order.created_at).toLocaleString()}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${statusColors[order.status]}`}>
              <StatusIcon className="h-3 w-3" />
              <span className="capitalize">{order.status}</span>
            </span>
          </div>
        </div>

        {/* Items */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-3">Order Items:</h4>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.name} x{item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t mt-3 pt-3 flex justify-between font-semibold">
            <span>Total:</span>
            <span>₹{order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Instructions */}
        <div className="border-t pt-4 text-center">
          <p className="text-xs text-gray-500">
            Please present this token at the counter when your order is ready
          </p>
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center p-4 bg-blue-50 rounded-lg">
        <StatusIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
        <p className="text-sm text-blue-800 font-medium">
          {order.status === 'pending' && 'Your order is being prepared'}
          {order.status === 'preparing' && 'Your order is being prepared'}
          {order.status === 'ready' && 'Your order is ready for pickup!'}
          {order.status === 'completed' && 'Order completed. Thank you!'}
        </p>
      </div>
    </div>
  );
};

export default KOTDisplay;