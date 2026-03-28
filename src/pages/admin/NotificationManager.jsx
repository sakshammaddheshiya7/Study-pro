import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { db, collection, getDocs, query, orderBy, limit, deleteDoc, doc } from '../../config/firebase';
import {
  FiBell, FiSend, FiTrash2, FiEdit2, FiUsers, FiUser,
  FiCalendar, FiAlertCircle, FiInfo, FiCheckCircle,
  FiX, FiClock, FiSearch, FiFilter, FiRefreshCw
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const NOTIFICATION_TYPES = [
  { id: 'announcement', label: 'Announcement', icon: '📢', color: 'bg-primary-500' },
  { id: 'test', label: 'Test Reminder', icon: '📝', color: 'bg-blue-500' },
  { id: 'alert', label: 'Important Alert', icon: '⚠️', color: 'bg-red-500' },
  { id: 'info', label: 'Information', icon: 'ℹ️', color: 'bg-green-500' },
  { id: 'update', label: 'Platform Update', icon: '🔄', color: 'bg-purple-500' }
];

const QUICK_TEMPLATES = [
  {
    title: 'New Test Available',
    message: 'A new practice test has been uploaded. Start practicing now!',
    type: 'test'
  },
  {
    title: 'Exam Reminder',
    message: 'Your upcoming exam is in 3 days. Make sure to complete your revision tests.',
    type: 'alert'
  },
  {
    title: 'New Questions Added',
    message: 'We have added new questions to the question bank. Check them out!',
    type: 'info'
  },
  {
    title: 'Platform Maintenance',
    message: 'The platform will undergo scheduled maintenance tonight from 12 AM to 4 AM IST.',
    type: 'update'
  },
  {
    title: 'Weekly Performance Report',
    message: 'Your weekly performance report is ready. Visit your profile to view detailed insights.',
    type: 'announcement'
  }
];

export default function NotificationManager() {
  const { sendNotification, addLog } = useDatabase();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [students, setStudents] = useState([]);

  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'announcement',
    target: 'all',
    targetUserId: '',
    priority: 'normal',
    scheduledAt: ''
  });

  useEffect(() => {
    loadNotifications();
    loadStudents();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(100));
      const snap = await getDocs(q);
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(u => u.role !== 'admin'));
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async () => {
    if (!form.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!form.message.trim()) {
      toast.error('Message is required');
      return;
    }

    try {
      setSending(true);

      const notifData = {
        title: form.title,
        message: form.message,
        type: form.type,
        target: form.target === 'specific' ? form.targetUserId : 'all',
        priority: form.priority,
        sender: user?.displayName || 'Admin',
        senderEmail: user?.email || ''
      };

      if (form.target === 'all') {
        await sendNotification(notifData);
        toast.success(`Notification sent to all students`);
      } else if (form.target === 'specific' && form.targetUserId) {
        await sendNotification(notifData);
        toast.success('Notification sent to selected student');
      } else {
        toast.error('Please select a target student');
        setSending(false);
        return;
      }

      await addLog({
        type: 'success',
        message: `Notification sent: ${form.title}`,
        details: `Target: ${form.target === 'all' ? 'All Students' : form.targetUserId}`
      });

      resetForm();
      loadNotifications();
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
      setNotifications(prev => prev.filter(n => n.id !== id));
      setDeleteConfirm(null);
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const applyTemplate = (template) => {
    setForm(prev => ({
      ...prev,
      title: template.title,
      message: template.message,
      type: template.type
    }));
    toast.success('Template applied');
  };

  const resetForm = () => {
    setForm({
      title: '',
      message: '',
      type: 'announcement',
      target: 'all',
      targetUserId: '',
      priority: 'normal',
      scheduledAt: ''
    });
    setShowForm(false);
  };

  const filteredNotifications = notifications.filter(n => {
    let match = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      match = n.title?.toLowerCase().includes(q) || n.message?.toLowerCase().includes(q);
    }
    if (filterType) {
      match = match && n.type === filterType;
    }
    return match;
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getTypeConfig = (type) => {
    return NOTIFICATION_TYPES.find(t => t.id === type) || NOTIFICATION_TYPES[0];
  };

  return (
    <div className="page-container pt-16 md:pt-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-800 flex items-center space-x-2">
            <FiBell className="text-primary-500" />
            <span>Notification Manager</span>
          </h1>
          <p className="text-dark-400 text-sm mt-1">{notifications.length} notifications sent</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className={`btn-primary flex items-center space-x-2 ${showForm ? 'bg-dark-700 hover:bg-dark-800' : ''}`}
        >
          {showForm ? <FiX size={18} /> : <FiSend size={18} />}
          <span>{showForm ? 'Close' : 'New Notification'}</span>
        </button>
      </div>

      {/* Compose Form */}
      {showForm && (
        <div className="card mb-6 border-2 border-primary-200 animate-slide-up">
          <h2 className="text-lg font-bold text-dark-800 mb-5 flex items-center space-x-2">
            <FiSend className="text-primary-500" size={18} />
            <span>Compose Notification</span>
          </h2>

          {/* Quick Templates */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-dark-500 mb-2 uppercase tracking-wide">Quick Templates</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {QUICK_TEMPLATES.map((template, i) => (
                <button
                  key={i}
                  onClick={() => applyTemplate(template)}
                  className="flex-shrink-0 px-3 py-2 bg-gray-50 hover:bg-primary-50 text-dark-600 rounded-xl text-xs font-medium transition-all border border-gray-200 hover:border-primary-300 active:scale-95"
                >
                  {getTypeConfig(template.type).icon} {template.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">Type</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {NOTIFICATION_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setForm(prev => ({ ...prev, type: type.id }))}
                    className={`p-2 rounded-xl text-center transition-all ${
                      form.type === type.id
                        ? `${type.color} text-white shadow-md`
                        : 'bg-gray-100 text-dark-500 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-lg block">{type.icon}</span>
                    <span className="text-[9px] font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target */}
            <div>
              <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">Send To</label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setForm(prev => ({ ...prev, target: 'all' }))}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all ${
                      form.target === 'all'
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-gray-100 text-dark-500'
                    }`}
                  >
                    <FiUsers size={14} />
                    <span className="text-sm font-medium">All Students</span>
                  </button>
                  <button
                    onClick={() => setForm(prev => ({ ...prev, target: 'specific' }))}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl transition-all ${
                      form.target === 'specific'
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-gray-100 text-dark-500'
                    }`}
                  >
                    <FiUser size={14} />
                    <span className="text-sm font-medium">Specific</span>
                  </button>
                </div>

                {form.target === 'specific' && (
                  <select
                    value={form.targetUserId}
                    onChange={(e) => setForm(prev => ({ ...prev, targetUserId: e.target.value }))}
                    className="input-field text-sm"
                  >
                    <option value="">Select Student</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.displayName || s.email} ({s.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Notification title..."
              className="input-field"
              maxLength={100}
            />
            <p className="text-[10px] text-dark-400 mt-1 text-right">{form.title.length}/100</p>
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Write your notification message here..."
              rows={4}
              className="input-field resize-y min-h-[100px]"
              maxLength={500}
            />
            <p className="text-[10px] text-dark-400 mt-1 text-right">{form.message.length}/500</p>
          </div>

          {/* Priority */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">Priority</label>
            <div className="flex space-x-2">
              {[
                { id: 'low', label: 'Low', color: 'bg-gray-500' },
                { id: 'normal', label: 'Normal', color: 'bg-blue-500' },
                { id: 'high', label: 'High', color: 'bg-red-500' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setForm(prev => ({ ...prev, priority: p.id }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    form.priority === p.id
                      ? `${p.color} text-white shadow-md`
                      : 'bg-gray-100 text-dark-500'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {(form.title || form.message) && (
            <div className="mb-5 p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <p className="text-xs font-semibold text-dark-400 uppercase mb-2">Preview</p>
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${getTypeConfig(form.type).color}`}>
                  {getTypeConfig(form.type).icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-dark-800 text-sm">{form.title || 'Notification Title'}</h4>
                  <p className="text-xs text-dark-500 mt-0.5">{form.message || 'Notification message...'}</p>
                  <p className="text-[10px] text-dark-400 mt-1">From: Admin • Just now</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex-1 btn-primary py-3.5 flex items-center justify-center space-x-2"
            >
              {sending ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiSend size={18} />
                  <span className="font-bold">Send Notification</span>
                </>
              )}
            </button>
            <button onClick={resetForm} className="btn-secondary py-3.5">Cancel</button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="input-field pl-10 text-sm py-2.5"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="input-field text-sm py-2.5 w-auto"
        >
          <option value="">All Types</option>
          {NOTIFICATION_TYPES.map(t => (
            <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
          ))}
        </select>
        <button
          onClick={loadNotifications}
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all"
        >
          <FiRefreshCw size={16} className={loading ? 'animate-spin text-dark-400' : 'text-dark-600'} />
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl skeleton" />
                <div className="flex-1">
                  <div className="w-1/2 h-4 bg-gray-100 rounded skeleton mb-2" />
                  <div className="w-full h-3 bg-gray-100 rounded skeleton" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">{searchQuery || filterType ? '🔍' : '📭'}</p>
          <h3 className="text-lg font-bold text-dark-700">
            {searchQuery || filterType ? 'No matching notifications' : 'No notifications sent yet'}
          </h3>
          <p className="text-dark-400 text-sm mt-2">
            {searchQuery || filterType ? 'Try different filters' : 'Click "New Notification" to send your first one'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notif) => {
            const typeConfig = getTypeConfig(notif.type);
            return (
              <div key={notif.id} className="card p-4 hover:shadow-card-hover transition-all">
                <div className="flex items-start space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${typeConfig.color} text-white`}>
                    {typeConfig.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-dark-800 text-sm truncate">{notif.title}</h4>
                      <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                        <span className="text-[10px] text-dark-400">{formatTime(notif.createdAt)}</span>
                        <button
                          onClick={() => setDeleteConfirm(notif.id)}
                          className="w-7 h-7 bg-red-50 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-dark-500 mt-1 line-clamp-2">{notif.message}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`badge text-[9px] ${
                        notif.target === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {notif.target === 'all' ? '👥 All Students' : '👤 Specific'}
                      </span>
                      <span className={`badge text-[9px] ${
                        notif.priority === 'high' ? 'bg-red-100 text-red-700' :
                        notif.priority === 'low' ? 'bg-gray-100 text-gray-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {notif.priority} priority
                      </span>
                      {notif.sender && (
                        <span className="text-[10px] text-dark-400">by {notif.sender}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiAlertCircle className="text-red-500" size={28} />
              </div>
              <h3 className="text-lg font-bold text-dark-800">Delete Notification?</h3>
              <p className="text-dark-500 text-sm mt-2">This cannot be undone.</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 btn-secondary py-3">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 btn-danger py-3">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}