import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiHome, FiFileText, FiMail, FiUser } from 'react-icons/fi';

const navItems = [
  { id: 'home', label: 'Home', path: '/student', icon: FiHome },
  { id: 'tests', label: 'Tests', path: '/student/tests', icon: FiFileText },
  { id: 'inbox', label: 'Inbox', path: '/student/notifications', icon: FiMail },
  { id: 'profile', label: 'Profile', path: '/student/profile', icon: FiUser }
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/student') return location.pathname === '/student';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-nav md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 ${
                active ? 'text-primary-500' : 'text-dark-400'
              }`}
            >
              {active ? (
                <div className="flex items-center space-x-1.5 bg-primary-500 text-white px-4 py-1.5 rounded-full shadow-md">
                  <Icon size={16} />
                  <span className="text-xs font-semibold">{item.label}</span>
                </div>
              ) : (
                <>
                  <Icon size={20} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}