import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPlay, FiPause, FiRefreshCw, FiCoffee, FiBookOpen, FiSettings, FiVolume2, FiVolumeX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function PomodoroTimer() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('focus'); // focus, short, long
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [durations, setDurations] = useState({ focus: 25, short: 5, long: 15 });
  const intervalRef = useRef(null);

  const modes = {
    focus: { label: 'Focus', duration: durations.focus * 60, color: 'from-red-500 to-red-600', icon: FiBookOpen },
    short: { label: 'Short Break', duration: durations.short * 60, color: 'from-green-500 to-green-600', icon: FiCoffee },
    long: { label: 'Long Break', duration: durations.long * 60, color: 'from-blue-500 to-blue-600', icon: FiCoffee }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            handleTimerComplete();
            return 0;
          }
          if (mode === 'focus') setTotalFocusTime(t => t + 1);
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, mode]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (mode === 'focus') {
      setSessions(s => s + 1);
      toast.success('Focus session complete! Take a break 🎉');
      if ((sessions + 1) % 4 === 0) {
        switchMode('long');
      } else {
        switchMode('short');
      }
    } else {
      toast.success('Break over! Ready to focus? 💪');
      switchMode('focus');
    }
  };

  const switchMode = (newMode) => {
    clearInterval(intervalRef.current);
    setMode(newMode);
    setTimeLeft(modes[newMode].duration);
    setIsRunning(false);
  };

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setTimeLeft(modes[mode].duration);
    setIsRunning(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((modes[mode].duration - timeLeft) / modes[mode].duration) * 100;
  const ModeIcon = modes[mode].icon;

  return (
    <div className="page-container pt-4 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-dark-800">Pomodoro Timer ⏱️</h1>
            <p className="text-xs text-dark-400">Stay focused, take breaks</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
            {soundEnabled ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center">
            <FiSettings size={16} />
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-8 max-w-md mx-auto">
        {Object.entries(modes).map(([key, val]) => (
          <button
            key={key}
            onClick={() => switchMode(key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              mode === key ? `bg-gradient-to-r ${val.color} text-white shadow-md` : 'text-dark-500'
            }`}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="flex justify-center mb-8">
        <div className="relative w-64 h-64">
          <svg className="w-64 h-64 transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#F1F5F9" strokeWidth="6" />
            <circle
              cx="50" cy="50" r="44" fill="none"
              stroke={mode === 'focus' ? '#EF4444' : mode === 'short' ? '#10B981' : '#3B82F6'}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 44}`}
              strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <ModeIcon size={24} className={mode === 'focus' ? 'text-red-500' : mode === 'short' ? 'text-green-500' : 'text-blue-500'} />
            <span className="text-5xl font-extrabold text-dark-800 font-mono mt-2">{formatTime(timeLeft)}</span>
            <span className="text-sm text-dark-400 mt-1">{modes[mode].label}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <button
          onClick={resetTimer}
          className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-dark-500 hover:bg-gray-200 active:scale-90 transition-all"
        >
          <FiRefreshCw size={22} />
        </button>
        <button
          onClick={toggleTimer}
          className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-lg active:scale-90 transition-all bg-gradient-to-br ${modes[mode].color}`}
        >
          {isRunning ? <FiPause size={32} /> : <FiPlay size={32} className="ml-1" />}
        </button>
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-dark-800">{sessions}</span>
          <span className="text-[8px] text-dark-400">Sessions</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
        <div className="card p-3 text-center">
          <p className="text-xl font-bold text-red-500">{sessions}</p>
          <p className="text-[10px] text-dark-400">Focus Sessions</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xl font-bold text-blue-500">{Math.floor(totalFocusTime / 60)}</p>
          <p className="text-[10px] text-dark-400">Total Minutes</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-xl font-bold text-green-500">{Math.floor(totalFocusTime / 3600)}</p>
          <p className="text-[10px] text-dark-400">Total Hours</p>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
            <h3 className="text-lg font-bold text-dark-800 mb-4">Timer Settings</h3>
            {[
              { key: 'focus', label: 'Focus Duration', suffix: 'min' },
              { key: 'short', label: 'Short Break', suffix: 'min' },
              { key: 'long', label: 'Long Break', suffix: 'min' }
            ].map(s => (
              <div key={s.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-2">
                <span className="text-sm text-dark-600">{s.label}</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="number" min="1" max="120"
                    value={durations[s.key]}
                    onChange={(e) => setDurations(prev => ({ ...prev, [s.key]: parseInt(e.target.value) || 1 }))}
                    className="w-16 text-center input-field text-sm py-1"
                  />
                  <span className="text-xs text-dark-400">{s.suffix}</span>
                </div>
              </div>
            ))}
            <button
              onClick={() => { setShowSettings(false); switchMode(mode); toast.success('Settings saved'); }}
              className="w-full btn-primary py-3 mt-3"
            >
              Save & Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}