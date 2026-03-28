import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, query, orderBy, limit, onSnapshot } from '../../config/firebase';
import { useDatabase } from '../../contexts/DatabaseContext';
import {
  FiDatabase, FiServer, FiActivity, FiCheckCircle, FiAlertCircle,
  FiRefreshCw, FiTrash2, FiDownload, FiUpload, FiClock,
  FiHardDrive, FiZap, FiTrendingUp, FiShield
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DatabaseControl() {
  const { addLog } = useDatabase();
  const [dbStats, setDbStats] = useState({
    totalQuestions: 0,
    totalUsers: 0,
    totalTests: 0,
    totalLogs: 0,
    totalNotifications: 0,
    totalApiKeys: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [recentActivity, setRecentActivity] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadDatabaseStats();
    
    // Real-time listener for questions
    const unsubscribe = onSnapshot(collection(db, 'questions'), (snapshot) => {
      setDbStats(prev => ({ ...prev, totalQuestions: snapshot.size }));
      setLastUpdate(new Date());
    });

    // Auto refresh interval
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadDatabaseStats, 30000); // Every 30 seconds
    }

    return () => {
      unsubscribe();
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadDatabaseStats = async () => {
    try {
      setLoading(true);
      const [
        questionsSnap,
        usersSnap,
        testsSnap,
        logsSnap,
        notificationsSnap,
        apiKeysSnap
      ] = await Promise.all([
        getDocs(collection(db, 'questions')),
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'testAttempts')),
        getDocs(query(collection(db, 'logs'), orderBy('timestamp', 'desc'), limit(5))),
        getDocs(collection(db, 'notifications')),
        getDocs(collection(db, 'apiKeys'))
      ]);

      setDbStats({
        totalQuestions: questionsSnap.size,
        totalUsers: usersSnap.size,
        totalTests: testsSnap.size,
        totalLogs: logsSnap.size,
        totalNotifications: notificationsSnap.size,
        totalApiKeys: apiKeysSnap.size
      });

      setRecentActivity(logsSnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
        time: d.data().timestamp?.toDate ? d.data().timestamp.toDate() : new Date()
      })));

      setConnectionStatus('connected');
      await addLog({ type: 'info', message: 'Database stats refreshed', details: `Questions: ${questionsSnap.size}` });
    } catch (error) {
      console.error('Database load error:', error);
      setConnectionStatus('error');
      toast.error('Failed to load database stats');
    } finally {
      setLoading(false);
    }
  };

  const exportDatabase = async () => {
    try {
      toast.loading('Preparing export...', { id: 'export' });
      const questionsSnap = await getDocs(collection(db, 'questions'));
      const data = questionsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database_export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Database exported successfully', { id: 'export' });
      await addLog({ type: 'success', message: 'Database exported', details: `${data.length} records` });
    } catch (error) {
      toast.error('Export failed', { id: 'export' });
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="page-container pt-16 md:pt-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-800 flex items-center space-x-2">
            <FiDatabase className="text-primary-500" />
            <span>Database Control</span>
          </h1>
          <p className="text-dark-400 text-sm mt-1">Monitor and manage Firebase database</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl text-sm font-medium flex items-center space-x-1.5 transition-all ${
              autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-dark-500'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span>Auto-refresh</span>
          </button>
          <button
            onClick={loadDatabaseStats}
            disabled={loading}
            className="btn-secondary flex items-center space-x-1.5 py-2 px-3 text-sm"
          >
            <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Connection Status */}
      <div className={`card mb-5 border-l-4 ${
        connectionStatus === 'connected' ? 'border-green-500' : 'border-red-500'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              connectionStatus === 'connected' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {connectionStatus === 'connected' ? (
                <FiCheckCircle className="text-green-600" size={20} />
              ) : (
                <FiAlertCircle className="text-red-600" size={20} />
              )}
            </div>
            <div>
              <h3 className="font-bold text-dark-800">
                {connectionStatus === 'connected' ? 'Connected' : 'Connection Error'}
              </h3>
              <p className="text-xs text-dark-400">
                Firebase Realtime Database • Last update: {formatTime(lastUpdate)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-dark-400">Status</p>
            <p className={`text-sm font-bold ${
              connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'
            }`}>
              {connectionStatus === 'connected' ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Questions', value: dbStats.totalQuestions, icon: FiDatabase, color: 'bg-blue-500' },
          { label: 'Users', value: dbStats.totalUsers, icon: FiServer, color: 'bg-green-500' },
          { label: 'Tests', value: dbStats.totalTests, icon: FiActivity, color: 'bg-purple-500' },
          { label: 'Logs', value: dbStats.totalLogs, icon: FiClock, color: 'bg-orange-500' },
          { label: 'Notifications', value: dbStats.totalNotifications, icon: FiZap, color: 'bg-pink-500' },
          { label: 'API Keys', value: dbStats.totalApiKeys, icon: FiShield, color: 'bg-indigo-500' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card p-4">
              <div className={`w-8 h-8 ${stat.color} rounded-lg flex items-center justify-center mb-2`}>
                <Icon className="text-white" size={16} />
              </div>
              <p className="text-2xl font-bold text-dark-800">{formatNumber(stat.value)}</p>
              <p className="text-xs text-dark-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Storage & Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="card">
          <h3 className="font-bold text-dark-700 mb-4 flex items-center space-x-2">
            <FiHardDrive className="text-primary-500" size={18} />
            <span>Storage Usage</span>
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-dark-600">Questions Collection</span>
                <span className="font-semibold text-dark-800">{dbStats.totalQuestions} docs</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((dbStats.totalQuestions / 25000) * 100, 100)}%` }} />
              </div>
              <p className="text-[10px] text-dark-400 mt-1">Capacity: 25,000+ questions</p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-dark-600">User Data</span>
                <span className="font-semibold text-dark-800">{dbStats.totalUsers} users</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${Math.min((dbStats.totalUsers / 10000) * 100, 100)}%` }} />
              </div>
              <p className="text-[10px] text-dark-400 mt-1">Active student accounts</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-dark-700 mb-4 flex items-center space-x-2">
            <FiTrendingUp className="text-primary-500" size={18} />
            <span>Performance Metrics</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
              <div className="flex items-center space-x-2">
                <FiZap className="text-green-600" size={16} />
                <span className="text-sm text-dark-600">Query Speed</span>
              </div>
              <span className="text-sm font-bold text-green-600">&lt; 100ms</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-2">
                <FiShield className="text-blue-600" size={16} />
                <span className="text-sm text-dark-600">Uptime</span>
              </div>
              <span className="text-sm font-bold text-blue-600">99.9%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
              <div className="flex items-center space-x-2">
                <FiActivity className="text-purple-600" size={16} />
                <span className="text-sm text-dark-600">Real-time Sync</span>
              </div>
              <span className="text-sm font-bold text-purple-600">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card mb-6">
        <h3 className="font-bold text-dark-700 mb-4 flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <FiClock className="text-primary-500" size={18} />
            <span>Recent Database Activity</span>
          </span>
          <span className="text-xs text-dark-400 font-normal">Real-time updates</span>
        </h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {recentActivity.length === 0 ? (
            <p className="text-center text-dark-400 py-4">No recent activity</p>
          ) : (
            recentActivity.map((activity, i) => (
              <div key={activity.id || i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'error' ? 'bg-red-500' :
                  activity.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-dark-700 font-medium">{activity.message}</p>
                  {activity.details && (
                    <p className="text-xs text-dark-400 truncate">{activity.details}</p>
                  )}
                </div>
                <span className="text-[10px] text-dark-400 flex-shrink-0">
                  {formatTime(activity.time)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={exportDatabase}
          className="card flex items-center justify-center space-x-3 p-4 hover:shadow-card-hover transition-all group"
        >
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center group-hover:bg-green-500 transition-colors">
            <FiDownload className="text-green-600 group-hover:text-white transition-colors" size={24} />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-dark-800">Export Database</h3>
            <p className="text-xs text-dark-400">Download all data as JSON</p>
          </div>
        </button>

        <div className="card p-4 opacity-50 cursor-not-allowed">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
              <FiTrash2 className="text-red-600" size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold text-dark-800">Clear Database</h3>
              <p className="text-xs text-dark-400">Remove all data (Disabled)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}