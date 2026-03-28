import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      <main className="flex-1 md:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
        <footer className="text-center py-4 text-xs text-dark-400">
          Developer: Saksham Gupta
        </footer>
      </main>
    </div>
  );
}