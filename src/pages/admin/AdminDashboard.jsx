import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { db, collection, getDocs, query, orderBy, limit } from '../../config/firebase';
import {
  FiDatabase, FiUpload, FiCode, FiKey, FiCpu, FiBarChart2,
  FiBell, FiList, FiShield, FiSettings, FiChevronRight,
  FiActivity, FiServer, FiCheckCircle, FiAlertCircle
} from 'react-icons/fi';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dbStats, setDbStats] = useState({
    totalQuestions: 0,
    totalTests: 0,
    totalUsers: 0,
    totalLogs: 0
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [systemStatus, setSystemStatus] = useState('online');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [qSnap, uSnap, lSnap] = await Promise.all([
        getDocs(collection(db, 'questions')),
        getDocs(collection(db, 'users')),
        getDocs(query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(10)))
      ]);

      setDbStats({
        totalQuestions: qSnap.size,
        totalUsers: uSnap.size,
        totalTests: 0,
        totalLogs: lSnap.size
      });

      setRecentLogs(lSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setSystemStatus('online');
    } catch (error) {
      console.error('Dashboard load error:', error);
      setSystemStatus('error');
    }
  };

  const quickActions = [
    { label: 'Question Manager', icon: FiDatabase, path: '/admin/questions', color: 'bg-blue-500' },
    { label: 'Bulk Upload', icon: FiUpload, path: '/admin/bulk-upload', color: 'bg-green-500' },
    { label: 'JSON Paste', icon: FiCode, path: '/admin/json-paste', color: 'bg-purple-500' },
    { label: 'API Keys', icon: FiKey, path: '/admin/api-keys', color: 'bg-amber-500' },
    { label: 'AI System', icon: FiCpu, path: '/admin/ai-system', color: 'bg-red-500' },
    { label: 'Analytics', icon: FiBarChart2, path: '/admin/analytics', color: 'bg-indigo-500' },
    { label: 'Notifications', icon: FiBell, path: '/admin/notifications', color: 'bg-pink-500' },
    { label: 'Activity Logs', icon: FiList, path: '/admin/logs', color: 'bg-teal-500' },
    { label: 'Access Control', icon: FiShield, path: '/admin/access', color: 'bg-orange-500' },
    { label: 'UI Settings', icon: FiSettings, path: '/admin/ui-settings', color: 'bg-cyan-500' },
    { label: 'Database', icon: FiServer, path: '/admin/database', color: 'bg-dark-700' }
  ];

  return (
    <div className="page-container pt-16 md:pt-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-dark-800">
            Admin Dashboard
          </h1>
          <p className="text-dark-400 text-sm mt-1">
            Welcome back, {user?.displayName || 'Admin'} • God Mode Active
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
            systemStatus === 'online'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              systemStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`} />
            <span>{systemStatus === 'online' ? 'System Online' : 'Error'}</span>
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Questions</p>
              <p className="text-2xl font-bold text-dark-800 mt-1">{dbStats.totalQuestions.toLocaleString()}</p>
            </div>
            <FiDatabase className="text-blue-500" size={24} />
          </div>
        </div>
        <div className="card p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Students</p>
              <p className="text-2xl font-bold text-dark-800 mt-1">{dbStats.totalUsers}</p>
            </div>
            <FiActivity className="text-green-500" size={24} />
          </div>
        </div>
        <div className="card p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">DB Status</p>
              <p className="text-lg font-bold text-green-600 mt-1">Connected</p>
            </div>
            <FiServer className="text-purple-500" size={24} />
          </div>
        </div>
        <div className="card p-4 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Logs</p>
              <p className="text-2xl font-bold text-dark-800 mt-1">{dbStats.totalLogs}</p>
            </div>
            <FiList className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="mb-6">
        <h2 className="section-title mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                className="card p-4 flex flex-col items-center space-y-3 hover:shadow-card-hover active:scale-95 transition-all group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                  <Icon size={22} />
                </div>
                <span className="text-sm font-medium text-dark-700 text-center">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Recent Activity</h2>
          <button
            onClick={() => navigate('/admin/logs')}
            className="text-primary-500 text-sm font-semibold flex items-center"
          >
            View All <FiChevronRight size={16} />
          </button>
        </div>
        <div className="card p-0 divide-y divide-gray-100">
          {recentLogs.length === 0 ? (
            <div className="p-8 text-center">
              <FiActivity className="mx-auto text-dark-300 mb-3" size={32} />
              <p className="text-dark-400 text-sm">No recent activity</p>
              <p className="text-dark-300 text-xs mt-1">Actions will appear here</p>
            </div>
          ) : (
            recentLogs.map((log, i) => (
              <div key={i} className="flex items-center space-x-3 p-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  log.type === 'success' ? 'bg-green-100' :
                  log.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                  {log.type === 'success' ? (
                    <FiCheckCircle className="text-green-600" size={14} />
                  ) : log.type === 'error' ? (
                    <FiAlertCircle className="text-red-600" size={14} />
                  ) : (
                    <FiActivity className="text-blue-600" size={14} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-700 truncate">{log.message}</p>
                  <p className="text-xs text-dark-400">{log.details || ''}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* System Info */}
      <div className="card p-4 mb-6">
        <h3 className="font-semibold text-dark-700 mb-3 flex items-center space-x-2">
          <FiServer size={16} />
          <span>System Information</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
            <span className="text-dark-400">Platform</span>
            <span className="font-medium text-dark-700">React + Vite</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
            <span className="text-dark-400">Database</span>
            <span className="font-medium text-green-600">Firebase Connected</span>
          </div>
          <div className="flex justify-between p-2 bg-gray-50 rounded-lg">
            <span className="text-dark-400">Capacity</span>
            <span className="font-medium text-dark-700">25,000+ Questions</span>
          </div>
        </div>
      </div>
    </div>
  );
}
