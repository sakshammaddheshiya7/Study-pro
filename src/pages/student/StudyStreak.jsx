import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiArrowLeft, FiAward, FiTrendingUp, FiCalendar, FiTarget, FiZap } from 'react-icons/fi';

export default function StudyStreak() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [monthData, setMonthData] = useState([]);

  useEffect(() => {
    const streak = parseInt(localStorage.getItem('studyStreak') || '0');
    const longest = parseInt(localStorage.getItem('longestStreak') || '0');
    setCurrentStreak(streak);
    setLongestStreak(Math.max(streak, longest));

    // Generate month calendar data
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const days = [];
    
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const isToday = d === now.getDate();
      const isPast = d < now.getDate();
      const active = isPast ? Math.random() > 0.3 : isToday;
      days.push({ day: d, active, isToday });
    }
    setMonthData(days);
  }, []);

  const checkIn = () => {
    const lastDate = localStorage.getItem('lastStudyDate');
    const today = new Date().toDateString();
    if (lastDate === today) return;

    const newStreak = lastDate === new Date(Date.now() - 86400000).toDateString()
      ? currentStreak + 1
      : 1;

    setCurrentStreak(newStreak);
    localStorage.setItem('studyStreak', newStreak.toString());
    localStorage.setItem('lastStudyDate', today);
    if (newStreak > longestStreak) {
      setLongestStreak(newStreak);
      localStorage.setItem('longestStreak', newStreak.toString());
    }
  };

  useEffect(() => { checkIn(); }, []);

  const MILESTONES = [
    { days: 7, reward: '🌟 Week Warrior', unlocked: longestStreak >= 7 },
    { days: 14, reward: '🔥 Fortnight Fighter', unlocked: longestStreak >= 14 },
    { days: 30, reward: '💎 Monthly Master', unlocked: longestStreak >= 30 },
    { days: 60, reward: '🏆 Consistency King', unlocked: longestStreak >= 60 },
    { days: 100, reward: '👑 Century Champion', unlocked: longestStreak >= 100 },
    { days: 365, reward: '🌈 Year Legend', unlocked: longestStreak >= 365 }
  ];

  const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="page-container pt-4 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-dark-800">Study Streak 🔥</h1>
          <p className="text-xs text-dark-400">Consistency is the key</p>
        </div>
      </div>

      {/* Streak Card */}
      <div className="card mb-5 bg-gradient-to-br from-amber-500 to-orange-500 text-white text-center py-8">
        <span className="text-6xl">🔥</span>
        <p className="text-5xl font-extrabold mt-3">{currentStreak}</p>
        <p className="text-lg text-white/80 mt-1">Day Streak</p>
        <p className="text-sm text-white/60 mt-2">Longest: {longestStreak} days</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-3 text-center">
          <FiZap className="mx-auto text-amber-500 mb-1" size={20} />
          <p className="text-xl font-bold text-dark-800">{currentStreak}</p>
          <p className="text-[10px] text-dark-400">Current</p>
        </div>
        <div className="card p-3 text-center">
          <FiAward className="mx-auto text-purple-500 mb-1" size={20} />
          <p className="text-xl font-bold text-dark-800">{longestStreak}</p>
          <p className="text-[10px] text-dark-400">Longest</p>
        </div>
        <div className="card p-3 text-center">
          <FiTarget className="mx-auto text-green-500 mb-1" size={20} />
          <p className="text-xl font-bold text-dark-800">{userProfile?.stats?.testsCompleted || 0}</p>
          <p className="text-[10px] text-dark-400">Total Tests</p>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div className="card mb-6">
        <h3 className="font-bold text-dark-700 mb-3 flex items-center space-x-2">
          <FiCalendar className="text-primary-500" size={18} />
          <span>{monthName}</span>
        </h3>
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-dark-400 py-1">{d}</div>
          ))}
          {monthData.map((day, i) => (
            <div key={i} className="aspect-square flex items-center justify-center">
              {day ? (
                <div className={`w-full h-full rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                  day.isToday ? 'bg-primary-500 text-white ring-2 ring-primary-300' :
                  day.active ? 'bg-green-400 text-white' :
                  'bg-gray-100 text-dark-400'
                }`}>
                  {day.day}
                </div>
              ) : <div />}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center space-x-4 mt-3">
          <div className="flex items-center space-x-1.5"><div className="w-3 h-3 bg-green-400 rounded" /><span className="text-[10px] text-dark-400">Active</span></div>
          <div className="flex items-center space-x-1.5"><div className="w-3 h-3 bg-gray-100 rounded" /><span className="text-[10px] text-dark-400">Inactive</span></div>
          <div className="flex items-center space-x-1.5"><div className="w-3 h-3 bg-primary-500 rounded" /><span className="text-[10px] text-dark-400">Today</span></div>
        </div>
      </div>

      {/* Milestones */}
      <div className="card">
        <h3 className="font-bold text-dark-700 mb-3 flex items-center space-x-2">
          <FiAward className="text-primary-500" size={18} />
          <span>Milestones</span>
        </h3>
        <div className="space-y-2">
          {MILESTONES.map((m, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-xl transition-all ${m.unlocked ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
              <div className="flex items-center space-x-3">
                <span className={`text-2xl ${m.unlocked ? '' : 'grayscale opacity-40'}`}>{m.reward.split(' ')[0]}</span>
                <div>
                  <p className={`text-sm font-semibold ${m.unlocked ? 'text-green-700' : 'text-dark-400'}`}>{m.reward.split(' ').slice(1).join(' ')}</p>
                  <p className="text-[10px] text-dark-400">{m.days} days streak</p>
                </div>
              </div>
              {m.unlocked ? (
                <span className="badge-success text-[10px]">✅ Unlocked</span>
              ) : (
                <span className="text-[10px] text-dark-400">{m.days - longestStreak} days left</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}