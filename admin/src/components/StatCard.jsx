import React from 'react';

const colorClasses = {
  blue: 'text-blue-600',
  yellow: 'text-yellow-600',
  red: 'text-red-600',
  green: 'text-green-600',
  indigo: 'text-indigo-600',
  purple: 'text-purple-600',
};

const StatCard = ({ title, value, icon: Icon, color = 'blue', change }) => (
  <div className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
    <div>
      <h4 className="text-sm text-gray-500">{title}</h4>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
      {change && <p className="text-green-600 text-sm">{change}</p>}
    </div>
    <Icon className={`w-6 h-6 ${colorClasses[color]}`} />
  </div>
);

export default StatCard;
