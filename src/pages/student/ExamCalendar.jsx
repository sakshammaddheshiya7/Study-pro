import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCalendar, FiClock, FiAlertCircle, FiBell } from 'react-icons/fi';

const EXAMS = [
  { name: 'JEE Mains Session 1', date: '2025-01-22', endDate: '2025-01-31', type: 'JEE', color: 'bg-blue-500' },
  { name: 'JEE Mains Session 2', date: '2025-04-01', endDate: '2025-04-15', type: 'JEE', color: 'bg-blue-500' },
  { name: 'JEE Advanced', date: '2025-06-08', endDate: '2025-06-08', type: 'JEE', color: 'bg-red-500' },
  { name: 'NEET UG', date: '2025-05-04', endDate: '2025-05-04', type: 'NEET', color: 'bg-green-500' },
  { name: 'CUET UG', date: '2025-05-15', endDate: '2025-05-30', type: 'CUET', color: 'bg-purple-500' },
  { name: 'BITSAT', date: '2025-05-20', endDate: '2025-06-05', type: 'Other', color: 'bg-amber-500' },
  { name: 'VITEEE', date: '2025-04-20', endDate: '2025-05-01', type: 'Other', color: 'bg-pink-500' },
  { name: 'JEE Mains 2026 Session 1', date: '2026-01-20', endDate: '2026-01-30', type: 'JEE', color: 'bg-blue-500' },
  { name: 'NEET UG 2026', date: '2026-05-03', endDate: '2026-05-03', type: 'NEET', color: 'bg-green-500' }
];

export default function ExamCalendar() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const now = new Date();

  const getDaysLeft = (dateStr) => {
    const examDate = new Date(dateStr);
    const diff = Math.ceil((examDate - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const filteredExams = EXAMS
    .filter(e => filter === 'all' || e.type === filter)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const upcomingExams = filteredExams.filter(e => getDaysLeft(e.date) >= 0);
  const pastExams = filteredExams.filter(e => getDaysLeft(e.date) < 0);

  return (
    <div className="page-container pt-4 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-dark-800">Exam Calendar 📅</h1>
          <p className="text-xs text-dark-400">Important exam dates</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-5 overflow-x-auto no-scrollbar">
        {['all', 'JEE', 'NEET', 'CUET', 'Other'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              filter === f ? 'bg-primary-500 text-white shadow-md' : 'bg-gray-100 text-dark-500'
            }`}
          >{f === 'all' ? 'All Exams' : f}</button>
        ))}
      </div>

      {/* Nearest Exam Highlight */}
      {upcomingExams.length > 0 && (
        <div className={`card mb-5 text-white ${upcomingExams[0].color}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/80 uppercase">Next Exam</p>
              <h3 className="text-lg font-bold mt-1">{upcomingExams[0].name}</h3>
              <p className="text-sm text-white/80 mt-1">
                {new Date(upcomingExams[0].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="text-center bg-white/20 rounded-2xl px-4 py-3">
              <p className="text-3xl font-extrabold">{getDaysLeft(upcomingExams[0].date)}</p>
              <p className="text-xs text-white/80">days left</p>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming */}
      <h2 className="section-title mb-3">Upcoming Exams</h2>
      <div className="space-y-2 mb-6">
        {upcomingExams.length === 0 ? (
          <div className="card p-8 text-center"><p className="text-dark-400">No upcoming exams</p></div>
        ) : upcomingExams.map((exam, i) => {
          const daysLeft = getDaysLeft(exam.date);
          return (
            <div key={i} className="card p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-10 rounded-full ${exam.color}`} />
                <div>
                  <p className="text-sm font-semibold text-dark-800">{exam.name}</p>
                  <p className="text-xs text-dark-400 flex items-center space-x-1 mt-0.5">
                    <FiCalendar size={10} />
                    <span>{new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    {exam.date !== exam.endDate && <span>— {new Date(exam.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-bold ${daysLeft <= 30 ? 'text-red-500' : daysLeft <= 90 ? 'text-amber-500' : 'text-green-600'}`}>
                  {daysLeft}d
                </p>
                <p className="text-[9px] text-dark-400">remaining</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Past */}
      {pastExams.length > 0 && (
        <>
          <h2 className="section-title mb-3 text-dark-400">Past Exams</h2>
          <div className="space-y-2 opacity-60">
            {pastExams.map((exam, i) => (
              <div key={i} className="card p-3 flex items-center space-x-3">
                <div className={`w-2 h-8 rounded-full bg-gray-300`} />
                <div>
                  <p className="text-sm text-dark-500 line-through">{exam.name}</p>
                  <p className="text-xs text-dark-400">{new Date(exam.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}