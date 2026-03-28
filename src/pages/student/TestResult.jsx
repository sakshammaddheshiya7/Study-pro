import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FiArrowLeft, FiHome, FiRepeat, FiCheckCircle, FiXCircle,
  FiMinusCircle, FiClock, FiTarget, FiAward, FiTrendingUp,
  FiChevronDown, FiChevronUp, FiBookOpen, FiShare2, FiEye
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function TestResult() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [expandedQ, setExpandedQ] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const stored = sessionStorage.getItem(`result_${attemptId}`);
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      navigate('/student', { replace: true });
    }
  }, [attemptId]);

  const filteredQuestions = useMemo(() => {
    if (!result?.questions) return [];
    return result.questions.filter(q => {
      if (filterStatus === 'correct') return q.isCorrect;
      if (filterStatus === 'wrong') return q.isAttempted && !q.isCorrect;
      if (filterStatus === 'unattempted') return !q.isAttempted;
      return true;
    });
  }, [result, filterStatus]);

  const subjectAnalysis = useMemo(() => {
    if (!result?.questions) return [];
    const analysis = {};
    result.questions.forEach(q => {
      const subj = q.subject || 'Other';
      if (!analysis[subj]) {
        analysis[subj] = { correct: 0, wrong: 0, unattempted: 0, total: 0, totalTime: 0 };
      }
      analysis[subj].total++;
      analysis[subj].totalTime += q.timeSpent || 0;
      if (!q.isAttempted) analysis[subj].unattempted++;
      else if (q.isCorrect) analysis[subj].correct++;
      else analysis[subj].wrong++;
    });
    return Object.entries(analysis).map(([name, data]) => ({
      name,
      ...data,
      accuracy: data.total > 0 ? Math.round(((data.correct) / data.total) * 100) : 0
    }));
  }, [result]);

  const difficultyAnalysis = useMemo(() => {
    if (!result?.questions) return [];
    const analysis = {};
    result.questions.forEach(q => {
      const diff = q.difficulty || 'Medium';
      if (!analysis[diff]) {
        analysis[diff] = { correct: 0, wrong: 0, unattempted: 0, total: 0 };
      }
      analysis[diff].total++;
      if (!q.isAttempted) analysis[diff].unattempted++;
      else if (q.isCorrect) analysis[diff].correct++;
      else analysis[diff].wrong++;
    });
    return Object.entries(analysis).map(([name, data]) => ({
      name,
      ...data,
      accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
    }));
  }, [result]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const percentage = result.percentage || 0;
  const grade = percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' :
    percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : percentage >= 35 ? 'D' : 'F';

  const gradeColor = percentage >= 70 ? 'text-green-600' : percentage >= 40 ? 'text-amber-600' : 'text-red-600';
  const gradeBg = percentage >= 70 ? 'from-green-400 to-green-600' : percentage >= 40 ? 'from-amber-400 to-amber-600' : 'from-red-400 to-red-600';

  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const pieData = [
    { name: 'Correct', value: result.correct, color: '#10B981' },
    { name: 'Wrong', value: result.wrong, color: '#EF4444' },
    { name: 'Skipped', value: result.unattempted, color: '#CBD5E1' }
  ].filter(d => d.value > 0);

  const tabs = [
    { id: 'summary', label: 'Summary' },
    { id: 'analysis', label: 'Analysis' },
    { id: 'solutions', label: 'Solutions' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Hero Section */}
      <div className={`bg-gradient-to-br ${gradeBg} text-white px-4 pt-6 pb-16 md:pb-20 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

        <div className="max-w-3xl mx-auto relative">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/student')}
              className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <FiArrowLeft size={18} />
            </button>
            <h2 className="text-sm font-semibold opacity-80">Test Result</h2>
            <button className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-all">
              <FiShare2 size={18} />
            </button>
          </div>

          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42" fill="none" stroke="white" strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentage / 100)}`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold">{percentage}%</span>
                <span className="text-xs opacity-80">Score</span>
              </div>
            </div>

            <h1 className="text-xl font-bold mb-1">{result.testName}</h1>
            <p className="opacity-80 text-sm">
              {result.score}/{result.totalMarks} marks • Grade: {grade}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards - overlapping hero */}
      <div className="max-w-3xl mx-auto px-4 -mt-10 relative z-10">
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="card p-3 text-center shadow-lg">
            <FiCheckCircle className="mx-auto text-green-500 mb-1" size={20} />
            <p className="text-lg font-bold text-green-600">{result.correct}</p>
            <p className="text-[10px] text-dark-400">Correct</p>
          </div>
          <div className="card p-3 text-center shadow-lg">
            <FiXCircle className="mx-auto text-red-500 mb-1" size={20} />
            <p className="text-lg font-bold text-red-600">{result.wrong}</p>
            <p className="text-[10px] text-dark-400">Wrong</p>
          </div>
          <div className="card p-3 text-center shadow-lg">
            <FiMinusCircle className="mx-auto text-gray-400 mb-1" size={20} />
            <p className="text-lg font-bold text-dark-500">{result.unattempted}</p>
            <p className="text-[10px] text-dark-400">Skipped</p>
          </div>
        </div>

        {/* Time & Attempt Info */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="card p-3 flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <FiClock className="text-blue-500" size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-dark-800">{formatTime(result.timeTaken)}</p>
              <p className="text-[10px] text-dark-400">Time Taken</p>
            </div>
          </div>
          <div className="card p-3 flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <FiTarget className="text-purple-500" size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-dark-800">{result.attempted}/{result.totalQuestions}</p>
              <p className="text-[10px] text-dark-400">Attempted</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-dark-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-4 animate-slide-up">
            {/* Pie Chart */}
            {pieData.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-dark-700 mb-3">Answer Distribution</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center space-x-4 mt-2">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center space-x-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                      <span className="text-xs text-dark-500">{d.name}: {d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Marking Details */}
            <div className="card">
              <h3 className="font-bold text-dark-700 mb-3">Marking Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2.5 bg-green-50 rounded-xl">
                  <span className="text-dark-600">Correct ({result.correct} × +{result.marksPerQuestion || 4})</span>
                  <span className="font-bold text-green-600">+{result.correct * (result.marksPerQuestion || 4)}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-red-50 rounded-xl">
                  <span className="text-dark-600">Wrong ({result.wrong} × -{result.negativeMarks || 0})</span>
                  <span className="font-bold text-red-600">-{result.wrong * (result.negativeMarks || 0)}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-gray-50 rounded-xl">
                  <span className="text-dark-600">Unattempted ({result.unattempted})</span>
                  <span className="font-bold text-dark-400">0</span>
                </div>
                <div className="flex justify-between p-3 bg-dark-800 text-white rounded-xl">
                  <span className="font-semibold">Total Score</span>
                  <span className="font-bold">{result.score} / {result.totalMarks}</span>
                </div>
              </div>
            </div>

            {/* Performance Remark */}
            <div className={`card border-l-4 ${
              percentage >= 70 ? 'border-green-500' : percentage >= 40 ? 'border-amber-500' : 'border-red-500'
            }`}>
              <div className="flex items-start space-x-3">
                <span className="text-3xl">
                  {percentage >= 90 ? '🏆' : percentage >= 70 ? '🌟' : percentage >= 50 ? '💪' : percentage >= 30 ? '📚' : '🎯'}
                </span>
                <div>
                  <h3 className="font-bold text-dark-800">
                    {percentage >= 90 ? 'Outstanding!' :
                     percentage >= 70 ? 'Great Performance!' :
                     percentage >= 50 ? 'Good Effort!' :
                     percentage >= 30 ? 'Keep Practicing!' : 'Don\'t Give Up!'}
                  </h3>
                  <p className="text-sm text-dark-500 mt-1">
                    {percentage >= 70
                      ? 'Excellent work! Focus on maintaining this level.'
                      : percentage >= 40
                        ? 'You\'re improving. Focus on your weak areas.'
                        : 'Review the solutions carefully and practice more questions.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-4 animate-slide-up">
            {/* Subject-wise Analysis */}
            {subjectAnalysis.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-dark-700 mb-4 flex items-center space-x-2">
                  <FiBookOpen className="text-primary-500" size={18} />
                  <span>Subject-wise Analysis</span>
                </h3>
                <div className="h-48 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectAnalysis} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                      <Bar dataKey="correct" fill="#10B981" radius={[4, 4, 0, 0]} name="Correct" stackId="a" />
                      <Bar dataKey="wrong" fill="#EF4444" radius={[0, 0, 0, 0]} name="Wrong" stackId="a" />
                      <Bar dataKey="unattempted" fill="#CBD5E1" radius={[4, 4, 0, 0]} name="Skipped" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {subjectAnalysis.map((subj, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-2 last:mb-0">
                    <div>
                      <p className="font-semibold text-dark-700 text-sm">{subj.name}</p>
                      <p className="text-[10px] text-dark-400">
                        ✅ {subj.correct} &nbsp; ❌ {subj.wrong} &nbsp; ⬜ {subj.unattempted}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${
                        subj.accuracy >= 70 ? 'text-green-600' : subj.accuracy >= 40 ? 'text-amber-600' : 'text-red-600'
                      }`}>{subj.accuracy}%</p>
                      <p className="text-[10px] text-dark-400">accuracy</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Difficulty Analysis */}
            {difficultyAnalysis.length > 0 && (
              <div className="card">
                <h3 className="font-bold text-dark-700 mb-4 flex items-center space-x-2">
                  <FiTrendingUp className="text-primary-500" size={18} />
                  <span>Difficulty Analysis</span>
                </h3>
                {difficultyAnalysis.map((diff, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                        diff.name === 'Easy' ? 'bg-green-100 text-green-700' :
                        diff.name === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>{diff.name}</span>
                      <span className="text-xs text-dark-500">{diff.correct}/{diff.total} correct</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          diff.name === 'Easy' ? 'bg-green-500' :
                          diff.name === 'Medium' ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${diff.accuracy}%` }}
                      />
                    </div>
                    <p className="text-right text-xs text-dark-400 mt-0.5">{diff.accuracy}%</p>
                  </div>
                ))}
              </div>
            )}

            {/* Time Analysis */}
            <div className="card">
              <h3 className="font-bold text-dark-700 mb-3 flex items-center space-x-2">
                <FiClock className="text-primary-500" size={18} />
                <span>Time Analysis</span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-xl text-center">
                  <p className="text-lg font-bold text-blue-600">{formatTime(result.timeTaken)}</p>
                  <p className="text-[10px] text-blue-500">Total Time</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl text-center">
                  <p className="text-lg font-bold text-green-600">
                    {result.totalQuestions > 0 ? formatTime(Math.round(result.timeTaken / result.totalQuestions)) : '0s'}
                  </p>
                  <p className="text-[10px] text-green-500">Avg per Question</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Solutions Tab */}
        {activeTab === 'solutions' && (
          <div className="space-y-3 animate-slide-up">
            {/* Filter */}
            <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
              {[
                { id: 'all', label: `All (${result.questions?.length || 0})`, color: 'bg-dark-800 text-white' },
                { id: 'correct', label: `Correct (${result.correct})`, color: 'bg-green-500 text-white' },
                { id: 'wrong', label: `Wrong (${result.wrong})`, color: 'bg-red-500 text-white' },
                { id: 'unattempted', label: `Skipped (${result.unattempted})`, color: 'bg-gray-400 text-white' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
                    filterStatus === f.id ? f.color + ' shadow-md' : 'bg-gray-100 text-dark-500'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Question Solutions */}
            {filteredQuestions.map((q, i) => {
              const isExpanded = expandedQ === q.questionIndex;
              return (
                <div key={q.questionIndex} className={`card border-l-4 ${
                  q.isCorrect ? 'border-green-500' : q.isAttempted ? 'border-red-500' : 'border-gray-300'
                }`}>
                  {/* Question Header */}
                  <button
                    onClick={() => setExpandedQ(isExpanded ? null : q.questionIndex)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2 flex-1 min-w-0">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          q.isCorrect ? 'bg-green-500 text-white' :
                          q.isAttempted ? 'bg-red-500 text-white' : 'bg-gray-300 text-dark-500'
                        }`}>
                          {q.questionIndex + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-dark-700 line-clamp-2">{q.questionText}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {q.subject && <span className="badge-primary text-[9px]">{q.subject}</span>}
                            {q.difficulty && (
                              <span className={`badge text-[9px] ${
                                q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                              }`}>{q.difficulty}</span>
                            )}
                            {q.timeSpent > 0 && (
                              <span className="badge bg-blue-100 text-blue-700 text-[9px]">⏱ {formatTime(q.timeSpent)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                        {q.isCorrect ? (
                          <FiCheckCircle className="text-green-500" size={18} />
                        ) : q.isAttempted ? (
                          <FiXCircle className="text-red-500" size={18} />
                        ) : (
                          <FiMinusCircle className="text-gray-400" size={18} />
                        )}
                        {isExpanded ? <FiChevronUp size={16} className="text-dark-400" /> : <FiChevronDown size={16} className="text-dark-400" />}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Solution */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100 animate-slide-up">
                      {/* Options */}
                      {q.questionType !== 'Numerical' && q.options && (
                        <div className="space-y-2 mb-4">
                          {q.options.map((opt, optIdx) => {
                            const isCorrectOption = optIdx === q.correctOptionIndex;
                            const isUserAnswer = optIdx === q.userAnswer;

                            let optStyle = 'border-gray-200 bg-white';
                            if (isCorrectOption) optStyle = 'border-green-500 bg-green-50';
                            else if (isUserAnswer && !q.isCorrect) optStyle = 'border-red-500 bg-red-50';

                            return (
                              <div key={optIdx} className={`p-3 rounded-xl border-2 ${optStyle}`}>
                                <div className="flex items-start space-x-2">
                                  <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                    isCorrectOption ? 'bg-green-500 text-white' :
                                    isUserAnswer && !q.isCorrect ? 'bg-red-500 text-white' :
                                    'bg-gray-100 text-dark-500'
                                  }`}>
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <p className="text-sm text-dark-700 flex-1">{opt}</p>
                                  {isCorrectOption && <FiCheckCircle className="text-green-500 flex-shrink-0" size={16} />}
                                  {isUserAnswer && !q.isCorrect && <FiXCircle className="text-red-500 flex-shrink-0" size={16} />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Numerical Answer */}
                      {q.questionType === 'Numerical' && (
                        <div className="mb-4 space-y-2">
                          <div className="p-3 bg-green-50 rounded-xl border-2 border-green-500">
                            <p className="text-sm font-medium text-green-700">
                              Correct Answer: <span className="font-bold">{q.correctAnswer}</span>
                            </p>
                          </div>
                          {q.isAttempted && (
                            <div className={`p-3 rounded-xl border-2 ${
                              q.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                            }`}>
                              <p className={`text-sm font-medium ${q.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                Your Answer: <span className="font-bold">{q.userAnswer}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Your Answer Summary */}
                      <div className="flex items-center space-x-2 mb-3 text-sm">
                        <span className="text-dark-500">Your answer:</span>
                        {q.isAttempted ? (
                          <span className={`font-semibold ${q.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {q.questionType === 'Numerical'
                              ? q.userAnswer
                              : q.options?.[q.userAnswer] ? `Option ${String.fromCharCode(65 + q.userAnswer)}` : 'Invalid'
                            }
                            {q.isCorrect ? ' ✅' : ' ❌'}
                          </span>
                        ) : (
                          <span className="text-dark-400 italic">Not attempted</span>
                        )}
                      </div>

                      {/* Explanation */}
                      {q.explanation && (
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <h4 className="font-semibold text-blue-800 text-sm mb-1.5 flex items-center space-x-1">
                            <FiEye size={14} />
                            <span>Explanation</span>
                          </h4>
                          <p className="text-sm text-blue-700 leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredQuestions.length === 0 && (
              <div className="card p-8 text-center">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-dark-500">No questions match this filter</p>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6 mb-8">
          <button
            onClick={() => navigate('/student')}
            className="flex-1 btn-secondary py-3.5 flex items-center justify-center space-x-2"
          >
            <FiHome size={18} />
            <span>Home</span>
          </button>
          <button
            onClick={() => navigate('/student/tests')}
            className="flex-1 btn-primary py-3.5 flex items-center justify-center space-x-2"
          >
            <FiRepeat size={18} />
            <span>New Test</span>
          </button>
        </div>

        {/* Credit */}
        <p className="text-center text-xs text-dark-400 pb-4">Developer: Saksham Gupta</p>
      </div>
    </div>
  );
}