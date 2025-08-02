import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import LoadingSpinner from './LoadingSpinner';

const MenuItems = ({ category, onBack }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    fetchItems();
  }, [category.id]);

  const fetchItems = async () => {
    try {
      const response = await fetch(`/api/menu/items/${category.id}`);
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const getItemQuantityInCart = (itemId) => {
    const cartItem = cartItems.find(item => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
          {category.description && (
            <p className="text-gray-600">{category.description}</p>
          )}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const quantityInCart = getItemQuantityInCart(item.id);
          
          return (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Item Image */}
              <div className="h-48 bg-gray-200 relative">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Price Badge */}
                <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-md text-sm font-semibold">
                  ₹{item.price}
                </div>
              </div>

              {/* Item Details */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.name}
                </h3>
                {item.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {item.description}
                  </p>
                )}

                {/* Add to Cart Button */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-green-600">
                    ₹{item.price}
                  </div>
                  
                  {quantityInCart > 0 ? (
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-1">
                      <span className="text-sm font-medium px-2">
                        In cart: {quantityInCart}
                      </span>
                    </div>
                  ) : null}
                  
                  <button
                    onClick={() => addToCart(item)}
                    disabled={!item.is_available}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>

                {!item.is_available && (
                  <div className="mt-2 text-center">
                    <span className="text-sm text-red-600 font-medium">
                      Currently Unavailable
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Items Found</h3>
          <p className="text-gray-500">Items in this category will appear here once they are added.</p>
        </div>
      )}
    </div>
  );
};

export default MenuItems;