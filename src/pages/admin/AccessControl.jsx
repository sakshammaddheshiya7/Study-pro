import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, doc, updateDoc, serverTimestamp } from '../../config/firebase';
import { useDatabase } from '../../contexts/DatabaseContext';
import {
  FiShield, FiUsers, FiUser, FiLock, FiUnlock, FiSearch,
  FiFilter, FiMoreVertical, FiChevronDown, FiChevronUp,
  FiCheck, FiX, FiMail, FiCalendar, FiActivity,
  FiSliders, FiToggleLeft, FiToggleRight, FiEdit2
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const FEATURE_FLAGS = [
  { id: 'customTest', label: 'Custom Test Builder', desc: 'Allow students to create custom tests', icon: '🎯' },
  { id: 'profileAnalysis', label: 'Profile Analysis', desc: 'Show detailed performance analytics', icon: '📊' },
  { id: 'notifications', label: 'Notifications', desc: 'Receive admin notifications', icon: '🔔' },
  { id: 'testHistory', label: 'Test History', desc: 'View past test attempts', icon: '📋' },
  { id: 'leaderboard', label: 'Leaderboard', desc: 'View ranking among peers', icon: '🏆' },
  { id: 'aiSuggestions', label: 'AI Suggestions', desc: 'AI-powered study suggestions', icon: '🤖' },
  { id: 'bookmarks', label: 'Bookmarks', desc: 'Bookmark questions for later', icon: '📌' },
  { id: 'downloadResults', label: 'Download Results', desc: 'Download test results as PDF', icon: '📥' }
];

const DEFAULT_PERMISSIONS = FEATURE_FLAGS.reduce((acc, f) => ({ ...acc, [f.id]: true }), {});

export default function AccessControl() {
  const { addLog } = useDatabase();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [globalPermissions, setGlobalPermissions] = useState({ ...DEFAULT_PERMISSIONS });
  const [activeTab, setActiveTab] = useState('users');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'users'));
      const userData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(userData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'banned' ? 'active' : 'banned';
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      toast.success(`User ${newStatus === 'banned' ? 'banned' : 'unbanned'}`);
      await addLog({
        type: newStatus === 'banned' ? 'warning' : 'success',
        message: `User ${newStatus}: ${userId}`,
        details: `Access control action`
      });
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleUpdatePermissions = async (userId, permissions) => {
    try {
      setSaving(true);
      await updateDoc(doc(db, 'users', userId), {
        permissions,
        updatedAt: serverTimestamp()
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, permissions } : u));
      toast.success('Permissions updated');
      await addLog({
        type: 'success',
        message: 'User permissions updated',
        details: `User: ${userId}`
      });
    } catch (error) {
      toast.error('Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGlobalPermissions = async () => {
    try {
      setSaving(true);
      // Update all student users
      const students = users.filter(u => u.role !== 'admin');
      for (const student of students) {
        await updateDoc(doc(db, 'users', student.id), {
          permissions: globalPermissions,
          updatedAt: serverTimestamp()
        });
      }
      setUsers(prev => prev.map(u => u.role !== 'admin' ? { ...u, permissions: globalPermissions } : u));
      toast.success(`Global permissions updated for ${students.length} students`);
      await addLog({
        type: 'success',
        message: 'Global permissions updated',
        details: `Applied to ${students.length} students`
      });
      setEditMode(false);
    } catch (error) {
      toast.error('Failed to update global permissions');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(u => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const students = filteredUsers.filter(u => u.role !== 'admin');
  const activeStudents = students.filter(u => u.status !== 'banned');
  const bannedStudents = students.filter(u => u.status === 'banned');

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="page-container pt-16 md:pt-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-dark-800 flex items-center space-x-2">
          <FiShield className="text-primary-500" />
          <span>Access Control</span>
        </h1>
        <p className="text-dark-400 text-sm mt-1">Manage permissions and user access</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-4 text-center border-l-4 border-blue-500">
          <p className="text-2xl font-bold text-blue-600">{students.length}</p>
          <p className="text-xs text-dark-400">Total Students</p>
        </div>
        <div className="card p-4 text-center border-l-4 border-green-500">
          <p className="text-2xl font-bold text-green-600">{activeStudents.length}</p>
          <p className="text-xs text-dark-400">Active</p>
        </div>
        <div className="card p-4 text-center border-l-4 border-red-500">
          <p className="text-2xl font-bold text-red-600">{bannedStudents.length}</p>
          <p className="text-xs text-dark-400">Banned</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'users' ? 'bg-white text-primary-600 shadow-sm' : 'text-dark-400'
          }`}
        >
          <FiUsers size={16} />
          <span>Users</span>
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'permissions' ? 'bg-white text-primary-600 shadow-sm' : 'text-dark-400'
          }`}
        >
          <FiSliders size={16} />
          <span>Global Permissions</span>
        </button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="animate-slide-up">
          {/* Search */}
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="input-field pl-10 text-sm py-2.5"
            />
          </div>

          {/* User List */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full skeleton" />
                    <div className="flex-1">
                      <div className="w-1/3 h-4 bg-gray-100 rounded skeleton mb-1" />
                      <div className="w-1/2 h-3 bg-gray-100 rounded skeleton" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : students.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-5xl mb-4">👤</p>
              <h3 className="text-lg font-bold text-dark-700">No students found</h3>
              <p className="text-dark-400 text-sm mt-2">Students will appear here after they sign in</p>
            </div>
          ) : (
            <div className="space-y-2">
              {students.map(student => {
                const isExpanded = selectedUser === student.id;
                const isBanned = student.status === 'banned';
                const permissions = student.permissions || DEFAULT_PERMISSIONS;

                return (
                  <div key={student.id} className={`card p-0 overflow-hidden ${isBanned ? 'opacity-60 border-l-4 border-red-400' : ''}`}>
                    <button
                      onClick={() => setSelectedUser(isExpanded ? null : student.id)}
                      className="w-full flex items-center space-x-3 p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <img
                        src={student.photoURL || `https://ui-avatars.com/api/?name=${student.displayName || 'U'}&background=F97316&color=fff&size=80`}
                        alt={student.displayName}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-dark-800 text-sm truncate">
                            {student.displayName || 'Unknown'}
                          </p>
                          {isBanned && <span className="badge-danger text-[9px]">Banned</span>}
                        </div>
                        <p className="text-xs text-dark-400 truncate">{student.email}</p>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-[10px] text-dark-400 hidden sm:block">
                          {formatDate(student.lastLogin)}
                        </span>
                        {isExpanded ? <FiChevronUp size={16} className="text-dark-400" /> : <FiChevronDown size={16} className="text-dark-400" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100 animate-slide-up">
                        {/* User Info */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3">
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <p className="text-[10px] text-dark-400">Joined</p>
                            <p className="text-xs font-medium text-dark-700">{formatDate(student.createdAt)}</p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <p className="text-[10px] text-dark-400">Tests</p>
                            <p className="text-xs font-medium text-dark-700">{student.stats?.testsCompleted || 0}</p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <p className="text-[10px] text-dark-400">Accuracy</p>
                            <p className="text-xs font-medium text-dark-700">{student.stats?.averageAccuracy || 0}%</p>
                          </div>
                          <div className="p-2 bg-gray-50 rounded-lg">
                            <p className="text-[10px] text-dark-400">Last Active</p>
                            <p className="text-xs font-medium text-dark-700">{formatDate(student.lastLogin)}</p>
                          </div>
                        </div>

                        {/* Individual Permissions */}
                        <div className="mb-3">
                          <h4 className="text-xs font-semibold text-dark-500 uppercase mb-2">Feature Access</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {FEATURE_FLAGS.map(feature => {
                              const enabled = permissions[feature.id] !== false;
                              return (
                                <button
                                  key={feature.id}
                                  onClick={() => {
                                    const updated = { ...permissions, [feature.id]: !enabled };
                                    handleUpdatePermissions(student.id, updated);
                                  }}
                                  className={`flex items-center space-x-2 p-2 rounded-xl text-xs transition-all ${
                                    enabled
                                      ? 'bg-green-50 text-green-700 border border-green-200'
                                      : 'bg-red-50 text-red-700 border border-red-200'
                                  }`}
                                >
                                  <span>{feature.icon}</span>
                                  <span className="truncate flex-1 text-left">{feature.label}</span>
                                  {enabled ? <FiCheck size={12} /> : <FiX size={12} />}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Ban/Unban */}
                        <button
                          onClick={() => handleToggleUserStatus(student.id, student.status)}
                          className={`w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center space-x-2 transition-all ${
                            isBanned
                              ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                              : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                          }`}
                        >
                          {isBanned ? <FiUnlock size={16} /> : <FiLock size={16} />}
                          <span>{isBanned ? 'Unban User' : 'Ban User'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Global Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="animate-slide-up">
          <div className="card mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500">
            <div className="flex items-start space-x-3">
              <FiInfo className="text-blue-500 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <h3 className="font-bold text-blue-800 text-sm">Global Permissions</h3>
                <p className="text-xs text-blue-600 mt-1">
                  Changes here will apply to ALL students. Individual overrides can be set from the Users tab.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-dark-800">Feature Toggles</h3>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  editMode ? 'bg-primary-500 text-white' : 'bg-gray-100 text-dark-600 hover:bg-gray-200'
                }`}
              >
                <FiEdit2 size={14} />
                <span>{editMode ? 'Editing...' : 'Edit'}</span>
              </button>
            </div>

            <div className="space-y-3">
              {FEATURE_FLAGS.map(feature => {
                const enabled = globalPermissions[feature.id] !== false;
                return (
                  <div key={feature.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{feature.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-dark-700">{feature.label}</p>
                        <p className="text-[10px] text-dark-400">{feature.desc}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!editMode) { toast('Click Edit to change permissions', { icon: '🔒' }); return; }
                        setGlobalPermissions(prev => ({ ...prev, [feature.id]: !enabled }));
                      }}
                      disabled={!editMode}
                      className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
                        enabled ? 'bg-green-500' : 'bg-gray-300'
                      } ${!editMode ? 'opacity-60' : ''}`}
                    >
                      <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${
                        enabled ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                );
              })}
            </div>

            {editMode && (
              <div className="flex space-x-3 mt-5 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveGlobalPermissions}
                  disabled={saving}
                  className="flex-1 btn-primary py-3 flex items-center justify-center space-x-2"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiCheck size={16} />
                      <span>Save & Apply to All</span>
                    </>
                  )}
                </button>
                <button onClick={() => { setEditMode(false); setGlobalPermissions({ ...DEFAULT_PERMISSIONS }); }} className="btn-secondary py-3">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}