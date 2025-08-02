import React from 'react';
import { Clock, CheckCircle, Package, TrendingUp } from 'lucide-react';

const OrderStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Pending Orders',
      value: stats.pending,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-800',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Preparing',
      value: stats.preparing,
      icon: Package,
      color: 'bg-blue-100 text-blue-800',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Ready for Pickup',
      value: stats.ready,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Completed Today',
      value: stats.completed,
      icon: TrendingUp,
      color: 'bg-gray-100 text-gray-800',
      bgColor: 'bg-gray-50'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-200`}>
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderStats;