import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { FiSearch, FiBell, FiChevronRight, FiClock, FiTarget, FiTrendingUp, FiBookOpen, FiAward } from 'react-icons/fi';

export default function StudentDashboard() {
  const { user, userProfile } = useAuth();
  const { getTestHistory, file:///storage/emulated/0/Deepu study pro/Src/pages/Student/Dashboard.jsx } = useDatabase();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('study');
  const [testHistory, setTestHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    if (user) {
      getTestHistory(user.uid).then(setTestHistory).catch(() => {});
      getNotifications(user.uid).then(setNotifications).catch(() => {});
    }
  }, [user]);

  const stats = userProfile?.stats || {
    testsCompleted: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    averageAccuracy: 0
  };

  const accuracy = stats.totalQuestions > 0
    ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
    : 0;

  const completedGoal = Math.min(
    Math.round((stats.testsCompleted / (userProfile?.preferences?.dailyGoal || 50)) * 100),
    100
  );

  const subjects = [
    { name: 'Physics', icon: '⚡', color: 'bg-blue-500', lightColor: 'bg-blue-50', questions: 0, time: '0 min' },
    { name: 'Chemistry', icon: '🧪', color: 'bg-green-500', lightColor: 'bg-green-50', questions: 0, time: '0 min' },
    { name: 'Mathematics', icon: '📐', color: 'bg-purple-500', lightColor: 'bg-purple-50', questions: 0, time: '0 min' },
    { name: 'Biology', icon: '🧬', color: 'bg-pink-500', lightColor: 'bg-pink-50', questions: 0, time: '0 min' }
  ];

 
  const quickActions = [
    { label: 'Quick Test', icon: '⚡', color: 'from-primary-400 to-primary-600', path: '/student/tests' },
    { label: 'Custom Test', icon: '🎯', color: 'from-blue-400 to-blue-600', path: '/student/custom-test' },
    { label: 'AI Doubt', icon: '🧠', color: 'from-purple-400 to-purple-600', path: '/student/doubt-solver' },
    { label: 'Revision', icon: '🔄', color: 'from-green-400 to-green-600', path: '/student/revision' },
  ];

// ADD this new section AFTER the Subjects section and BEFORE Recent Tests:

      {/* Premium Features */}
      <div className="mb-6">
        <h2 className="section-title mb-3 flex items-center space-x-2">
          <span className="text-primary-500">✨</span>
          <span>Premium Tools</span>
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {[
            { label: 'AI Doubt Solver', icon: '🧠', path: '/student/doubt-solver', color: 'bg-purple-50' },
            { label: 'Study Plan', icon: '📅', path: '/student/study-planner', color: 'bg-blue-50' },
            { label: 'Revision', icon: '🔄', path: '/student/revision', color: 'bg-green-50' },
            { label: 'Leaderboard', icon: '🏆', path: '/student/leaderboard', color: 'bg-amber-50' },
            { label: 'Bookmarks', icon: '📌', path: '/student/bookmarks', color: 'bg-red-50' },
            { label: 'Pomodoro', icon: '⏱️', path: '/student/pomodoro', color: 'bg-teal-50' },
            { label: 'Daily Quiz', icon: '🎲', path: '/student/daily-challenge', color: 'bg-pink-50' },
            { label: 'Formulas', icon: '📐', path: '/student/formulas', color: 'bg-indigo-50' },
            { label: 'Predictor', icon: '🔮', path: '/student/predictor', color: 'bg-orange-50' },
            { label: 'AI Chat', icon: '💬', path: '/student/ai-chat', color: 'bg-cyan-50' },
            { label: 'My Results', icon: '📊', path: '/student/profile', color: 'bg-lime-50' },
            { label: 'Inbox', icon: '📬', path: '/student/notifications', color: 'bg-violet-50' },
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => navigate(item.path)}
              className={`${item.color} rounded-2xl p-3 flex flex-col items-center space-y-1.5 hover:shadow-card-hover active:scale-95 transition-all`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-[10px] font-semibold text-dark-600 text-center leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-6 max-w-xs">
        <button
          onClick={() => setActiveTab('study')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'study'
              ? 'bg-primary-500 text-white shadow-md'
              : 'text-dark-500'
          }`}
        >
          Study
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
            activeTab === 'test'
              ? 'bg-primary-500 text-white shadow-md'
              : 'text-dark-500'
          }`}
        >
          Test Mode
        </button>
      </div>

      {/* Daily Goal Card */}
      <div className="card mb-6 bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg">Your Daily Learning Goal</h3>
            <p className="text-white/80 text-sm mt-1">
              You've completed {completedGoal}% of today's target. Keep going!
            </p>
            <button
              onClick={() => navigate('/student/tests')}
              className="mt-4 px-5 py-2 bg-white text-primary-600 font-semibold rounded-xl text-sm hover:bg-white/90 transition-all active:scale-95 inline-flex items-center space-x-1"
            >
              <span>Start Test</span>
              <span>🎯</span>
            </button>
          </div>
          <div className="ml-4">
            {/* Circular Progress */}
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - completedGoal / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold">{completedGoal}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {quickActions.map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center space-y-2 group"
          >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl shadow-md group-hover:shadow-lg group-active:scale-90 transition-all`}>
              {action.icon}
            </div>
            <span className="text-[11px] font-medium text-dark-600 text-center">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Performance Overview */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title flex items-center space-x-2">
            <FiTrendingUp className="text-primary-500" />
            <span>Performance</span>
          </h2>
          <button
            onClick={() => navigate('/student/profile')}
            className="text-primary-500 text-sm font-semibold flex items-center"
          >
            View All <FiChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FiBookOpen size={16} className="text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-dark-800">{stats.testsCompleted}</p>
            <p className="text-xs text-dark-400 mt-1">Tests Done</p>
          </div>
          <div className="card p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <FiTarget size={16} className="text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-dark-800">{accuracy}%</p>
            <p className="text-xs text-dark-400 mt-1">Accuracy</p>
          </div>
          <div className="card p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FiAward size={16} className="text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-dark-800">{stats.correctAnswers}</p>
            <p className="text-xs text-dark-400 mt-1">Correct</p>
          </div>
          <div className="card p-3">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <FiClock size={16} className="text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-dark-800">{stats.totalQuestions}</p>
            <p className="text-xs text-dark-400 mt-1">Questions</p>
          </div>
        </div>
      </div>

      {/* Subjects Section */}
      <div className="mb-6">
        <h2 className="section-title mb-3 flex items-center space-x-2">
          <FiBookOpen className="text-primary-500" />
          <span>Subjects</span>
        </h2>
        <div className="space-y-3">
          {subjects.map((subject, i) => (
            <button
              key={i}
              onClick={() => navigate(`/student/tests?subject=${subject.name}`)}
              className="card w-full p-4 flex items-center space-x-4 hover:shadow-card-hover active:scale-[0.98] transition-all"
            >
              <div className={`w-12 h-12 ${subject.lightColor} rounded-2xl flex items-center justify-center text-2xl`}>
                {subject.icon}
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-dark-800">{subject.name}</h3>
                <p className="text-xs text-dark-400">Practice and improve</p>
              </div>
              <FiChevronRight className="text-dark-300" />
            </button>
          ))}
        </div>
      </div>

      {/* Recent Tests */}
      {testHistory.length > 0 && (
        <div className="mb-6">
          <h2 className="section-title mb-3">Recent Tests</h2>
          <div className="space-y-3">
            {testHistory.slice(0, 5).map((test, i) => (
              <div key={i} className="card p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-dark-800 text-sm">{test.testName || 'Practice Test'}</h3>
                  <p className="text-xs text-dark-400 mt-1">
                    Score: {test.score || 0}/{test.totalMarks || 0}
                  </p>
                </div>
                <div className={`badge ${
                  (test.percentage || 0) >= 70 ? 'badge-success' : 
                  (test.percentage || 0) >= 40 ? 'badge-warning' : 'badge-danger'
                }`}>
                  {test.percentage || 0}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Credit */}
      <div className="md:hidden text-center py-4 text-xs text-dark-400">
        Developer: Saksham Gupta
      </div>
    </div>
  );
}