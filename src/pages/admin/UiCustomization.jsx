import React, { useState, useEffect } from 'react';
import { db, doc, setDoc, getDoc, serverTimestamp } from '../../config/firebase';
import { useDatabase } from '../../contexts/DatabaseContext';
import {
  FiSettings, FiSave, FiRefreshCw, FiEye, FiLayout,
  FiType, FiImage, FiSun, FiMoon, FiSmartphone,
  FiMonitor, FiTablet, FiGrid, FiList, FiCheckCircle,
  FiPalette, FiToggleLeft, FiToggleRight, FiMove
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const DEFAULT_UI_CONFIG = {
  theme: 'light',
  primaryColor: '#F97316',
  accentColor: '#3B82F6',
  borderRadius: '16',
  fontFamily: 'Inter',
  dashboardLayout: 'cards',
  showWelcomeCard: true,
  showDailyGoal: true,
  showQuickActions: true,
  showPerformance: true,
  showSubjects: true,
  showRecentTests: true,
  showNotificationBadge: true,
  bottomNavStyle: 'pill',
  cardShadow: 'medium',
  animationsEnabled: true,
  compactMode: false,
  developerCredit: 'Saksham Gupta'
};

const COLOR_PRESETS = [
  { name: 'Orange', value: '#F97316' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Indigo', value: '#6366F1' }
];

const FONT_OPTIONS = ['Inter', 'Poppins', 'Roboto', 'Open Sans', 'Nunito', 'Montserrat'];

const DASHBOARD_SECTIONS = [
  { id: 'showWelcomeCard', label: 'Welcome Card', desc: 'Hero card with daily goal progress', icon: '👋' },
  { id: 'showDailyGoal', label: 'Daily Goal', desc: 'Circular progress indicator', icon: '🎯' },
  { id: 'showQuickActions', label: 'Quick Actions', desc: 'Quick test, custom test buttons', icon: '⚡' },
  { id: 'showPerformance', label: 'Performance Stats', desc: 'Tests done, accuracy, etc.', icon: '📊' },
  { id: 'showSubjects', label: 'Subject List', desc: 'Subject cards with icons', icon: '📚' },
  { id: 'showRecentTests', label: 'Recent Tests', desc: 'Latest test results', icon: '📋' },
  { id: 'showNotificationBadge', label: 'Notification Badge', desc: 'Unread count on bell icon', icon: '🔔' }
];

export default function UiCustomization() {
  const { addLog } = useDatabase();
  const [config, setConfig] = useState({ ...DEFAULT_UI_CONFIG });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');
  const [previewDevice, setPreviewDevice] = useState('mobile');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, 'settings', 'uiConfig');
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setConfig({ ...DEFAULT_UI_CONFIG, ...snap.data() });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, 'settings', 'uiConfig');
      await setDoc(docRef, { ...config, updatedAt: serverTimestamp() }, { merge: true });
      setHasChanges(false);
      toast.success('UI settings saved');
      await addLog({ type: 'success', message: 'UI settings updated', details: 'Student interface modified' });
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_UI_CONFIG });
    setHasChanges(true);
    toast('Reset to defaults — save to apply', { icon: '🔄' });
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: FiPalette },
    { id: 'layout', label: 'Layout', icon: FiLayout },
    { id: 'sections', label: 'Sections', icon: FiGrid }
  ];

  return (
    <div className="page-container pt-16 md:pt-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-800 flex items-center space-x-2">
            <FiSettings className="text-primary-500" />
            <span>UI Settings</span>
          </h1>
          <p className="text-dark-400 text-sm mt-1">Customize the student interface</p>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handleReset} className="btn-secondary py-2 px-3 text-sm flex items-center space-x-1.5">
            <FiRefreshCw size={14} />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="btn-primary py-2 px-4 text-sm flex items-center space-x-1.5 disabled:opacity-40"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FiSave size={14} />
            )}
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Unsaved Changes Banner */}
      {hasChanges && (
        <div className="card mb-5 bg-amber-50 border-l-4 border-amber-500 animate-slide-up">
          <div className="flex items-center justify-between">
            <p className="text-sm text-amber-700 font-medium">You have unsaved changes</p>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 transition-all"
            >
              Save Now
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id ? 'bg-white text-primary-600 shadow-sm' : 'text-dark-400'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="space-y-5 animate-slide-up">
          {/* Theme Toggle */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4 flex items-center space-x-2">
              <FiSun size={18} className="text-primary-500" />
              <span>Theme</span>
            </h3>
            <div className="flex space-x-3">
              <button
                onClick={() => updateConfig('theme', 'light')}
                className={`flex-1 p-4 rounded-2xl border-2 text-center transition-all ${
                  config.theme === 'light' ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-gray-200'
                }`}
              >
                <FiSun className="mx-auto text-amber-500 mb-2" size={24} />
                <p className="text-sm font-semibold text-dark-700">Light</p>
              </button>
              <button
                onClick={() => updateConfig('theme', 'dark')}
                className={`flex-1 p-4 rounded-2xl border-2 text-center transition-all ${
                  config.theme === 'dark' ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-gray-200'
                }`}
              >
                <FiMoon className="mx-auto text-indigo-500 mb-2" size={24} />
                <p className="text-sm font-semibold text-dark-700">Dark</p>
              </button>
              <button
                onClick={() => updateConfig('theme', 'auto')}
                className={`flex-1 p-4 rounded-2xl border-2 text-center transition-all ${
                  config.theme === 'auto' ? 'border-primary-500 bg-primary-50 shadow-md' : 'border-gray-200'
                }`}
              >
                <FiMonitor className="mx-auto text-gray-500 mb-2" size={24} />
                <p className="text-sm font-semibold text-dark-700">Auto</p>
              </button>
            </div>
          </div>

          {/* Primary Color */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4 flex items-center space-x-2">
              <FiPalette size={18} className="text-primary-500" />
              <span>Primary Color</span>
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-4">
              {COLOR_PRESETS.map(color => (
                <button
                  key={color.value}
                  onClick={() => updateConfig('primaryColor', color.value)}
                  className={`aspect-square rounded-xl border-2 transition-all hover:scale-110 ${
                    config.primaryColor === color.value
                      ? 'border-dark-800 ring-2 ring-offset-2 ring-dark-300 scale-110'
                      : 'border-transparent'
                  }`}
                  style={{ background: color.value }}
                  title={color.name}
                >
                  {config.primaryColor === color.value && (
                    <FiCheckCircle className="mx-auto text-white" size={18} />
                  )}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-xs font-semibold text-dark-500">Custom:</label>
              <input
                type="color"
                value={config.primaryColor}
                onChange={(e) => updateConfig('primaryColor', e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
              />
              <span className="text-xs font-mono text-dark-400">{config.primaryColor}</span>
            </div>
          </div>

          {/* Font Family */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4 flex items-center space-x-2">
              <FiType size={18} className="text-primary-500" />
              <span>Font Family</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FONT_OPTIONS.map(font => (
                <button
                  key={font}
                  onClick={() => updateConfig('fontFamily', font)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    config.fontFamily === font
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ fontFamily: font }}
                >
                  <p className="text-sm font-semibold text-dark-700">{font}</p>
                  <p className="text-[10px] text-dark-400 mt-0.5" style={{ fontFamily: font }}>Aa Bb Cc 123</p>
                </button>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4">Border Radius</h3>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="24"
                value={config.borderRadius}
                onChange={(e) => updateConfig('borderRadius', e.target.value)}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div
                className="w-16 h-16 bg-primary-100 border-2 border-primary-300 flex items-center justify-center"
                style={{ borderRadius: `${config.borderRadius}px` }}
              >
                <span className="text-xs text-primary-600 font-bold">{config.borderRadius}px</span>
              </div>
            </div>
          </div>

          {/* Card Shadow */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4">Card Shadow</h3>
            <div className="flex space-x-3">
              {['none', 'light', 'medium', 'heavy'].map(shadow => (
                <button
                  key={shadow}
                  onClick={() => updateConfig('cardShadow', shadow)}
                  className={`flex-1 p-3 rounded-xl border-2 text-center capitalize transition-all ${
                    config.cardShadow === shadow
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className={`w-10 h-10 bg-white rounded-lg mx-auto mb-1 ${
                    shadow === 'none' ? '' :
                    shadow === 'light' ? 'shadow-sm' :
                    shadow === 'medium' ? 'shadow-md' : 'shadow-xl'
                  }`} />
                  <p className="text-xs text-dark-600">{shadow}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Layout Tab */}
      {activeTab === 'layout' && (
        <div className="space-y-5 animate-slide-up">
          {/* Dashboard Layout */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4">Dashboard Layout</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => updateConfig('dashboardLayout', 'cards')}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  config.dashboardLayout === 'cards' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                }`}
              >
                <FiGrid className="mx-auto text-primary-500 mb-2" size={24} />
                <p className="text-sm font-semibold text-dark-700">Cards</p>
                <p className="text-[10px] text-dark-400">Grid of cards</p>
              </button>
              <button
                onClick={() => updateConfig('dashboardLayout', 'list')}
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  config.dashboardLayout === 'list' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                }`}
              >
                <FiList className="mx-auto text-primary-500 mb-2" size={24} />
                <p className="text-sm font-semibold text-dark-700">List</p>
                <p className="text-[10px] text-dark-400">Vertical list</p>
              </button>
            </div>
          </div>

          {/* Bottom Nav Style */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4">Bottom Navigation Style</h3>
            <div className="grid grid-cols-3 gap-3">
              {['pill', 'minimal', 'rounded'].map(style => (
                <button
                  key={style}
                  onClick={() => updateConfig('bottomNavStyle', style)}
                  className={`p-3 rounded-xl border-2 text-center capitalize transition-all ${
                    config.bottomNavStyle === style ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                  }`}
                >
                  <p className="text-sm font-semibold text-dark-700">{style}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Options */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4">General</h3>
            <div className="space-y-3">
              {[
                { key: 'animationsEnabled', label: 'Animations', desc: 'Enable UI animations and transitions' },
                { key: 'compactMode', label: 'Compact Mode', desc: 'Reduce spacing and padding' }
              ].map(option => (
                <div key={option.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-dark-700">{option.label}</p>
                    <p className="text-[10px] text-dark-400">{option.desc}</p>
                  </div>
                  <button
                    onClick={() => updateConfig(option.key, !config[option.key])}
                    className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
                      config[option.key] ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${
                      config[option.key] ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Developer Credit */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-3">Developer Credit</h3>
            <input
              type="text"
              value={config.developerCredit}
              onChange={(e) => updateConfig('developerCredit', e.target.value)}
              className="input-field"
              placeholder="Developer name"
            />
            <p className="text-[10px] text-dark-400 mt-1">Displayed at the bottom of the platform</p>
          </div>
        </div>
      )}

      {/* Sections Tab */}
      {activeTab === 'sections' && (
        <div className="space-y-4 animate-slide-up">
          <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 mb-5">
            <p className="text-sm text-blue-700">
              <strong>Toggle sections</strong> visible on the student dashboard. Changes take effect in real-time.
            </p>
          </div>

          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4 flex items-center space-x-2">
              <FiLayout size={18} className="text-primary-500" />
              <span>Dashboard Sections</span>
            </h3>
            <div className="space-y-3">
              {DASHBOARD_SECTIONS.map(section => (
                <div key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{section.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-dark-700">{section.label}</p>
                      <p className="text-[10px] text-dark-400">{section.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateConfig(section.id, !config[section.id])}
                    className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
                      config[section.id] ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${
                      config[section.id] ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section Order (Visual) */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4 flex items-center space-x-2">
              <FiMove size={18} className="text-primary-500" />
              <span>Active Sections Preview</span>
            </h3>
            <div className="space-y-2">
              {DASHBOARD_SECTIONS
                .filter(s => config[s.id])
                .map((section, i) => (
                  <div key={section.id} className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <span className="text-xl">{section.icon}</span>
                    <span className="text-sm font-medium text-green-800">{section.label}</span>
                  </div>
                ))
              }
              {DASHBOARD_SECTIONS.filter(s => config[s.id]).length === 0 && (
                <p className="text-center text-dark-400 py-4 text-sm">No sections enabled</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}