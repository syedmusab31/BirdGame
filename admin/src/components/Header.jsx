import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ setSidebarOpen }) => {
  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <button
        type="button"
        className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" />
      </button>
      <div className="flex-1 px-4 flex justify-between items-center">
        <div className="flex-1 flex"></div>
        <div className="ml-4 flex items-center md:ml-6">
          {/* User dropdown would go here */}
        </div>
      </div>
    </div>
  );
};

export default Header;