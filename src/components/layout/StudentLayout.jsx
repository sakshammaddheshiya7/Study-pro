import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <Outlet />
      </div>
      <BottomNav />
      {/* Desktop Bottom Credit */}
      <footer className="hidden md:block text-center py-4 text-xs text-dark-400">
        Developer: Saksham Gupta
      </footer>
    </div>
  );
}
