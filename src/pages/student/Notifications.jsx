import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { db, doc, updateDoc } from '../../config/firebase';
import { FiArrowLeft, FiBell, FiCheck, FiCheckCircle, FiMail, FiMailOpen, FiTrash2, FiInfo, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function StudentNotifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getNotifications } = useDatabase();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const notifs = await getNotifications(user.uid);
      setNotifications(notifs);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (error) {
      console.error(error);
    }
  };

  const markAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      for (const n of unread) {
        await updateDoc(doc(db, 'notifications', n.id), { read: true });
      }
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type) => {
    switch (type) {
      case 'test': return { icon: FiCalendar, color: 'bg-blue-100 text-blue-600' };
      case 'announcement': return { icon: FiBell, color: 'bg-primary-100 text-primary-600' };
      case 'alert': return { icon: FiAlertCircle, color: 'bg-red-100 text-red-600' };
      case 'info': return { icon: FiInfo, color: 'bg-green-100 text-green-600' };
      default: return { icon: FiMail, color: 'bg-gray-100 text-gray-600' };
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="page-container pt-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <FiArrowLeft size={18} className="text-dark-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-dark-800">Inbox</h1>
            <p className="text-xs text-dark-400">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center space-x-1 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-xl text-xs font-semibold hover:bg-primary-100 transition-all"
          >
            <FiCheckCircle size={14} />
            <span>Read All</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-5">
        {[
          { id: 'all', label: 'All', count: notifications.length },
          { id: 'unread', label: 'Unread', count: unreadCount },
          { id: 'read', label: 'Read', count: notifications.length - unreadCount }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filter === f.id
                ? 'bg-primary-500 text-white shadow-md'
                : 'bg-gray-100 text-dark-500 hover:bg-gray-200'
            }`}
          >
            {f.label}
            {f.count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                filter === f.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-dark-500'
              }`}>
                {f.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl skeleton" />
                <div className="flex-1">
                  <div className="w-3/4 h-4 bg-gray-100 rounded skeleton mb-2" />
                  <div className="w-full h-3 bg-gray-100 rounded skeleton" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">{filter === 'unread' ? '✅' : '📭'}</p>
          <h3 className="text-lg font-bold text-dark-700">
            {filter === 'unread' ? 'All caught up!' : 'No notifications'}
          </h3>
          <p className="text-dark-400 text-sm mt-2">
            {filter === 'unread' ? 'You\'ve read all notifications' : 'Notifications will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notif, i) => {
            const { icon: NotifIcon, color } = getNotifIcon(notif.type);
            return (
              <button
                key={notif.id || i}
                onClick={() => !notif.read && markAsRead(notif.id)}
                className={`w-full card p-4 text-left transition-all active:scale-[0.98] ${
                  !notif.read ? 'bg-primary-50/50 border-l-4 border-primary-500' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                    <NotifIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className={`text-sm truncate ${!notif.read ? 'font-bold text-dark-800' : 'font-medium text-dark-600'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-[10px] text-dark-400 ml-2 flex-shrink-0">{formatTime(notif.createdAt)}</span>
                    </div>
                    <p className="text-xs text-dark-500 mt-1 line-clamp-2">{notif.message}</p>
                    {notif.sender && (
                      <p className="text-[10px] text-dark-400 mt-1.5">From: {notif.sender}</p>
                    )}
                  </div>
                  {!notif.read && (
                    <div className="w-2.5 h-2.5 bg-primary-500 rounded-full flex-shrink-0 mt-1" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}