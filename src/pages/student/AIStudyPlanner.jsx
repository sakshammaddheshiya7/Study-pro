import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiArrowLeft, FiCalendar, FiClock, FiTarget, FiPlus, FiCheck, FiX, FiChevronRight, FiStar, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

const STUDY_TEMPLATES = {
  'JEE 30-Day': {
    weeks: 4,
    daily: [
      { time: '06:00 - 08:00', subject: 'Mathematics', topic: 'Calculus', type: 'study' },
      { time: '08:30 - 10:30', subject: 'Physics', topic: 'Mechanics', type: 'study' },
      { time: '11:00 - 12:00', subject: 'Chemistry', topic: 'Organic', type: 'study' },
      { time: '14:00 - 15:30', subject: 'Physics', topic: 'Practice Problems', type: 'practice' },
      { time: '16:00 - 17:30', subject: 'Mathematics', topic: 'Practice Problems', type: 'practice' },
      { time: '18:00 - 19:00', subject: 'Chemistry', topic: 'Revision', type: 'revision' },
      { time: '20:00 - 21:00', subject: 'Mixed', topic: 'Mock Test', type: 'test' }
    ]
  },
  'NEET 30-Day': {
    weeks: 4,
    daily: [
      { time: '06:00 - 08:00', subject: 'Biology', topic: 'Botany', type: 'study' },
      { time: '08:30 - 10:30', subject: 'Physics', topic: 'Theory + Numericals', type: 'study' },
      { time: '11:00 - 12:30', subject: 'Chemistry', topic: 'Inorganic', type: 'study' },
      { time: '14:00 - 15:30', subject: 'Biology', topic: 'Zoology', type: 'study' },
      { time: '16:00 - 17:00', subject: 'Chemistry', topic: 'Physical Chemistry', type: 'practice' },
      { time: '18:00 - 19:00', subject: 'Biology', topic: 'MCQ Practice', type: 'practice' },
      { time: '20:00 - 21:00', subject: 'Mixed', topic: 'NEET Mock', type: 'test' }
    ]
  }
};

export default function AIStudyPlanner() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState('JEE 30-Day');
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState(new Set());
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [showCustom, setShowCustom] = useState(false);
  const [customTask, setCustomTask] = useState({ time: '', subject: '', topic: '' });

  useEffect(() => {
    const plan = STUDY_TEMPLATES[selectedPlan];
    if (plan) setTasks(plan.daily);
  }, [selectedPlan]);

  const toggleTask = (index) => {
    setCompletedTasks(prev => {
      const updated = new Set(prev);
      if (updated.has(index)) updated.delete(index);
      else updated.add(index);
      return updated;
    });
  };

  const addCustomTask = () => {
    if (!customTask.time || !customTask.subject || !customTask.topic) {
      toast.error('Fill all fields');
      return;
    }
    setTasks(prev => [...prev, { ...customTask, type: 'custom' }]);
    setCustomTask({ time: '', subject: '', topic: '' });
    setShowCustom(false);
    toast.success('Task added');
  };

  const removeTask = (index) => {
    setTasks(prev => prev.filter((_, i) => i !== index));
    toast.success('Task removed');
  };

  const progress = tasks.length > 0 ? Math.round((completedTasks.size / tasks.length) * 100) : 0;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date().getDay();

  const getTypeColor = (type) => {
    switch (type) {
      case 'study': return 'border-l-blue-500 bg-blue-50';
      case 'practice': return 'border-l-green-500 bg-green-50';
      case 'revision': return 'border-l-purple-500 bg-purple-50';
      case 'test': return 'border-l-red-500 bg-red-50';
      default: return 'border-l-primary-500 bg-primary-50';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'study': return '📖';
      case 'practice': return '✏️';
      case 'revision': return '🔄';
      case 'test': return '📝';
      default: return '⭐';
    }
  };

  return (
    <div className="page-container pt-4 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-dark-800">AI Study Planner 📅</h1>
          <p className="text-xs text-dark-400">Personalized study schedule</p>
        </div>
      </div>

      {/* Plan Selector */}
      <div className="flex space-x-2 mb-5 overflow-x-auto no-scrollbar">
        {Object.keys(STUDY_TEMPLATES).map(plan => (
          <button
            key={plan}
            onClick={() => { setSelectedPlan(plan); setCompletedTasks(new Set()); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              selectedPlan === plan ? 'bg-primary-500 text-white shadow-md' : 'bg-gray-100 text-dark-500'
            }`}
          >
            {plan}
          </button>
        ))}
      </div>

      {/* Day Selector */}
      <div className="flex space-x-2 mb-5 overflow-x-auto no-scrollbar">
        {days.map((day, i) => (
          <button
            key={i}
            onClick={() => setSelectedDay(i)}
            className={`w-12 h-14 rounded-xl flex flex-col items-center justify-center text-xs font-medium transition-all flex-shrink-0 ${
              selectedDay === i
                ? 'bg-primary-500 text-white shadow-md'
                : i === today
                  ? 'bg-primary-100 text-primary-600 border-2 border-primary-300'
                  : 'bg-gray-100 text-dark-500'
            }`}
          >
            <span className="text-[10px]">{day}</span>
            <span className="font-bold">{new Date(Date.now() + (i - today) * 86400000).getDate()}</span>
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="card mb-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Today's Progress</h3>
          <span className="text-2xl font-extrabold">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-white/80 mt-2">{completedTasks.size}/{tasks.length} tasks completed</p>
      </div>

      {/* Tasks */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title">Schedule</h2>
        <button
          onClick={() => setShowCustom(!showCustom)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-xl text-xs font-semibold"
        >
          <FiPlus size={12} />
          <span>Add Task</span>
        </button>
      </div>

      {showCustom && (
        <div className="card mb-4 border-2 border-primary-200 animate-slide-up">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <input type="text" value={customTask.time} onChange={(e) => setCustomTask(p => ({ ...p, time: e.target.value }))} placeholder="Time (e.g. 6:00-8:00)" className="input-field text-xs py-2" />
            <input type="text" value={customTask.subject} onChange={(e) => setCustomTask(p => ({ ...p, subject: e.target.value }))} placeholder="Subject" className="input-field text-xs py-2" />
            <input type="text" value={customTask.topic} onChange={(e) => setCustomTask(p => ({ ...p, topic: e.target.value }))} placeholder="Topic" className="input-field text-xs py-2" />
          </div>
          <div className="flex space-x-2">
            <button onClick={addCustomTask} className="btn-primary py-2 text-xs flex-1">Add</button>
            <button onClick={() => setShowCustom(false)} className="btn-secondary py-2 text-xs">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2 mb-8">
        {tasks.map((task, i) => {
          const done = completedTasks.has(i);
          return (
            <div
              key={i}
              className={`rounded-xl border-l-4 p-3.5 transition-all ${getTypeColor(task.type)} ${done ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleTask(i)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      done ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-300'
                    }`}
                  >
                    {done && <FiCheck size={14} />}
                  </button>
                  <div>
                    <p className={`text-sm font-semibold ${done ? 'line-through text-dark-400' : 'text-dark-700'}`}>
                      {getTypeIcon(task.type)} {task.subject} — {task.topic}
                    </p>
                    <p className="text-[10px] text-dark-400 flex items-center space-x-1 mt-0.5">
                      <FiClock size={10} />
                      <span>{task.time}</span>
                    </p>
                  </div>
                </div>
                <button onClick={() => removeTask(i)} className="text-dark-300 hover:text-red-500 transition-colors p-1">
                  <FiX size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}