import React from 'react';

export default function Loading({ fullScreen = true, text = 'Loading...' }) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary-200 rounded-full animate-spin border-t-primary-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-dark-600 font-medium animate-pulse">{text}</p>
        <p className="mt-2 text-sm text-dark-400">JEE-NEET Platform</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-10 h-10 border-3 border-primary-200 rounded-full animate-spin border-t-primary-500"></div>
      <p className="mt-4 text-sm text-dark-500">{text}</p>
    </div>
  );
}
