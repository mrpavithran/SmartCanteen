import React from 'react';
import { Clock, CheckCircle, AlertCircle, User } from 'lucide-react';

const OrderQueue = ({ orders, onUpdateStatus }) => {
  const statusConfig = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: Clock,
      label: 'Pending'
    },
    preparing: {
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: Clock,
      label: 'Preparing'
    },
    ready: {
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircle,
      label: 'Ready'
    },
    completed: {
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: CheckCircle,
      label: 'Completed'
    }
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'preparing',
      preparing: 'ready',
      ready: 'completed'
    };
    return statusFlow[currentStatus];
  };

  const getNextStatusLabel = (currentStatus) => {
    const labels = {
      pending: 'Start Preparing',
      preparing: 'Mark Ready',
      ready: 'Mark Completed'
    };
    return labels[currentStatus];
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Order Queue</h3>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders in queue</h3>
          <p className="text-gray-500">New orders will appear here as they come in.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => {
            const config = statusConfig[order.status];
            const StatusIcon = config.icon;
            const nextStatus = getNextStatus(order.status);
            const nextStatusLabel = getNextStatusLabel(order.status);

            return (
              <div
                key={order.id}
                className={`bg-white border-2 rounded-lg p-6 shadow-md ${config.color.replace('text-', 'border-').replace('bg-', 'border-')}`}
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">
                      #{order.token_number}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${config.color}`}>
                    <StatusIcon className="h-4 w-4" />
                    <span>{config.label}</span>
                  </span>
                </div>

                {/* Customer Info */}
                <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-50 rounded">
                  <User className="h-4 w-4 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.users?.name || 'Customer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      ID: {order.users?.student_id || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2 mb-4">
                  <h5 className="font-medium text-gray-900">Items:</h5>
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total:</span>
                    <span>₹{order.total_amount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Button */}
                {nextStatus && (
                  <button
                    onClick={() => onUpdateStatus(order.id, nextStatus)}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {nextStatusLabel}
                  </button>
                )}

                {order.status === 'completed' && (
                  <div className="text-center py-2 text-green-600 font-medium">
                    ✓ Order Completed
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderQueue;