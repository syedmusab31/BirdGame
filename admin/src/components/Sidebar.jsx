import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Bird,
  CreditCard,
  Banknote,
  Settings,
  X,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Birds', href: '/birds', icon: Bird },
  { name: 'Deposits', href: '/deposits', icon: CreditCard },
  { name: 'Withdrawals', href: '/withdrawals', icon: Banknote },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  const renderNavItem = (item) => {
    const isActive = location.pathname === item.href;
    return (
      <Link
        key={item.name}
        to={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`${
          isActive
            ? 'bg-blue-100 text-blue-900 border-r-4 border-blue-500'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        } group flex items-center px-3 py-3 text-sm font-medium rounded-md transition`}
      >
        <item.icon
          className={`${
            isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
          } mr-3 h-5 w-5 flex-shrink-0`}
        />
        {item.name}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Sidebar */}
      <div className={`md:hidden fixed inset-0 z-40 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="relative flex flex-col w-64 max-w-xs bg-white h-full">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex-1 pt-5 pb-4 overflow-y-auto">
            <div className="px-4 text-xl font-bold text-gray-900">Admin Panel</div>
            <nav className="mt-5 px-2 space-y-1">{navigation.map(renderNavItem)}</nav>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="px-4 text-xl font-bold text-gray-900">Admin Panel</div>
            <nav className="mt-5 flex-1 px-2 space-y-1">{navigation.map(renderNavItem)}</nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;