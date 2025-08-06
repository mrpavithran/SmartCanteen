import React, { useState, useEffect } from 'react';
import { Coffee, Sandwich, Cookie, Zap } from 'lucide-react';
import MenuItems from './MenuItems';
import LoadingSpinner from './LoadingSpinner';

const MenuCategories = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  const categoryIcons = {
    'Drinks': Coffee,
    'Snacks': Cookie,
    'Meals': Sandwich,
    'Juices': Zap,
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (selectedCategory) {
    return (
      <MenuItems
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Menu Categories</h2>
        <p className="text-gray-600">Choose a category to browse items</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
          const IconComponent = categoryIcons[category.name] || Cookie;
          
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category)}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 border border-gray-200"
            >
              <div className="flex flex-col items-center space-y-4">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <IconComponent className="h-8 w-8 text-blue-600" />
                </div>
                
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Cookie className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Categories Found</h3>
          <p className="text-gray-500">Categories will appear here once they are added by admin.</p>
        </div>
      )}
    </div>
  );
};

export default MenuCategories;