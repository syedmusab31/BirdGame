import React, { useState, useEffect } from 'react';
import {
  Users,
  CreditCard,
  Banknote,
  Bird,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import axios from 'axios';
import { useToast } from '../contexts/ToastContext';

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  red: 'bg-red-100 text-red-600',
  green: 'bg-green-100 text-green-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  purple: 'bg-purple-100 text-purple-600',
};

const StatCard = ({ title, value, icon: Icon, color = 'blue', change }) => (
  <div className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow h-full">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${colorClasses[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-900">{value}</p>
      </div>
    </div>
    {change && (
      <div className="mt-2 flex items-center text-sm text-green-600">
        <TrendingUp className="h-4 w-4 mr-1" />
        {change}
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    totalBirds: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
  });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/admin/dashboard');
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        toast.error('Failed to load dashboard stats');
      }
    } catch (err) {
      toast.error('Error loading dashboard stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'blue' },
    { title: 'Pending Deposits', value: stats.pendingDeposits.toLocaleString(), icon: CreditCard, color: 'yellow' },
    { title: 'Pending Withdrawals', value: stats.pendingWithdrawals.toLocaleString(), icon: Banknote, color: 'red' },
    { title: 'Total Birds', value: stats.totalBirds.toLocaleString(), icon: Bird, color: 'green' },
    { title: 'Total Deposits', value: `$${stats.totalDeposits.toLocaleString()}`, icon: DollarSign, color: 'indigo' },
    { title: 'Total Withdrawals', value: `$${stats.totalWithdrawals.toLocaleString()}`, icon: DollarSign, color: 'purple' },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">Overview of admin panel statistics</p>
        </div>
        <button
          onClick={fetchDashboardStats}
          className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer transition">
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Review Deposits</p>
                <p className="text-sm text-gray-500">{stats.pendingDeposits} pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer transition">
            <div className="flex items-center">
              <Banknote className="h-6 w-6 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Review Withdrawals</p>
                <p className="text-sm text-gray-500">{stats.pendingWithdrawals} pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer transition">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-500">{stats.totalUsers} total users</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow hover:shadow-md cursor-pointer transition">
            <div className="flex items-center">
              <Bird className="h-6 w-6 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Manage Birds</p>
                <p className="text-sm text-gray-500">{stats.totalBirds} bird types</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;