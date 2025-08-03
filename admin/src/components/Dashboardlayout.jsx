import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r transition-transform transform md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:static`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-bold">Admin Panel</h1>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100">Dashboard</a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100">Users</a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100">Birds</a>
          <a href="#" className="block px-4 py-2 rounded hover:bg-gray-100">Payments</a>
        </nav>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 bg-white shadow-md md:ml-64">
          <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu />
          </button>
          <h2 className="text-xl font-semibold">Dashboard</h2>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
