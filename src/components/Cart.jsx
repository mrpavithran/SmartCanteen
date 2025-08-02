import React, { useState } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, CreditCard } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import LoadingSpinner from './LoadingSpinner';

const Cart = ({ walletBalance, onOrderSuccess }) => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalAmount,
    getTotalItems,
  } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    const totalAmount = getTotalAmount();
    if (totalAmount > walletBalance) {
      setError('Insufficient wallet balance');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cartItems,
          totalAmount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      // Clear cart and show success
      clearCart();
      onOrderSuccess(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-500">Add some items from the menu to get started.</p>
      </div>
    );
  }

  const totalAmount = getTotalAmount();
  const canAfford = totalAmount <= walletBalance;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Clear Cart
        </button>
      </div>

      {/* Cart Items */}
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4"
          >
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <p className="text-sm text-gray-600">₹{item.price} each</p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Minus className="h-4 w-4" />
              </button>
              
              <span className="font-medium text-gray-900 min-w-[2rem] text-center">
                {item.quantity}
              </span>
              
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="text-right">
              <p className="font-semibold text-gray-900">
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-600 hover:text-red-700 mt-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Items ({getTotalItems()})</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-between text-sm">
          <span>Wallet Balance:</span>
          <span className={canAfford ? 'text-green-600' : 'text-red-600'}>
            ₹{walletBalance.toFixed(2)}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          onClick={handlePlaceOrder}
          disabled={loading || !canAfford}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              <span>Place Order</span>
            </>
          )}
        </button>

        {!canAfford && (
          <p className="text-sm text-red-600 text-center">
            Insufficient wallet balance. Please recharge your wallet.
          </p>
        )}
      </div>
    </div>
  );
};

export default Cart;