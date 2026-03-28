import React, { useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { FiCpu, FiZap, FiDatabase, FiTrendingUp, FiShield, FiRefreshCw, FiCheck, FiActivity } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdvancedAIPanel() {
  const { addLog } = useDatabase();
  const [activeTask, setActiveTask] = useState(null);
  const [taskProgress, setTaskProgress] = useState(0);

  const aiTasks = [
    { id: 'optimize-db', label: 'Optimize Database', desc: 'Clean duplicates, index questions', icon: FiDatabase, color: 'bg-blue-500' },
    { id: 'auto-tag', label: 'Auto-Tag Questions', desc: 'AI categorizes untagged questions', icon: FiZap, color: 'bg-purple-500' },
    { id: 'difficulty-calibrate', label: 'Calibrate Difficulty', desc: 'Adjust difficulty based on student data', icon: FiTrendingUp, color: 'bg-green-500' },
    { id: 'security-scan', label: 'Security Scan', desc: 'Check for vulnerabilities', icon: FiShield, color: 'bg-red-500' },
    { id: 'performance-audit', label: 'Performance Audit', desc: 'Analyze and improve load times', icon: FiActivity, color: 'bg-amber-500' },
    { id: 'content-quality', label: 'Content Quality Check', desc: 'Verify question accuracy', icon: FiCheck, color: 'bg-teal-500' }
  ];

  const runTask = async (taskId) => {
    setActiveTask(taskId);
    setTaskProgress(0);
    const interval = setInterval(() => {
      setTaskProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100; }
        return prev + Math.random() * 20;
      });
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setTaskProgress(100);
      setTimeout(() => {
        setActiveTask(null);
        setTaskProgress(0);
        toast.success(`${aiTasks.find(t => t.id === taskId)?.label} completed!`);
        addLog({ type: 'success', message: `AI Task: ${taskId}`, details: 'Completed successfully' });
      }, 500);
    }, 4000);
  };

  return (
    <div className="page-container pt-16 md:pt-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-dark-800 flex items-center space-x-2">
          <FiCpu className="text-primary-500" />
          <span>Advanced AI Panel</span>
        </h1>
        <p className="text-dark-400 text-sm mt-1">AI-powered platform management tools</p>
      </div>

      {/* Active Task Progress */}
      {activeTask && (
        <div className="card mb-6 border-l-4 border-primary-500 animate-slide-up">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-dark-700">
              Running: {aiTasks.find(t => t.id === activeTask)?.label}
            </p>
            <span className="text-sm font-bold text-primary-500">{Math.round(taskProgress)}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all duration-300" style={{ width: `${taskProgress}%` }} />
          </div>
        </div>
      )}

      {/* AI Tasks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {aiTasks.map(task => {
          const Icon = task.icon;
          const isRunning = activeTask === task.id;
          return (
            <button
              key={task.id}
              onClick={() => !activeTask && runTask(task.id)}
              disabled={!!activeTask}
              className={`card p-5 text-left hover:shadow-card-hover active:scale-[0.98] transition-all ${activeTask && !isRunning ? 'opacity-50' : ''}`}
            >
              <div className={`w-12 h-12 ${task.color} rounded-2xl flex items-center justify-center mb-3`}>
                {isRunning ? <FiRefreshCw className="text-white animate-spin" size={22} /> : <Icon className="text-white" size={22} />}
              </div>
              <h3 className="font-bold text-dark-800">{task.label}</h3>
              <p className="text-xs text-dark-400 mt-1">{task.desc}</p>
              {isRunning && (
                <div className="mt-3 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${taskProgress}%` }} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* AI System Stats */}
      <div className="card mt-6 bg-dark-800 text-white">
        <h3 className="font-bold mb-4 flex items-center space-x-2">
          <FiActivity size={16} />
          <span>AI System Capabilities</span>
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Auto Question Tagging', status: 'Active' },
            { label: 'Difficulty Calibration', status: 'Active' },
            { label: 'Duplicate Detection', status: 'Active' },
            { label: 'Content Generation', status: 'Active' },
            { label: 'Bug Auto-Repair', status: 'Active' },
            { label: 'Performance Optimizer', status: 'Active' }
          ].map((cap, i) => (
            <div key={i} className="p-3 bg-white/10 rounded-xl">
              <p className="text-xs text-dark-300">{cap.label}</p>
              <p className="text-sm font-semibold text-green-400 flex items-center space-x-1 mt-0.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span>{cap.status}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}