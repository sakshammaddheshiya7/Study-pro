import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { FiArrowLeft, FiUser, FiBarChart2, FiTrendingUp, FiTarget, FiAward, FiClock, FiBookOpen, FiChevronRight, FiLogOut, FiSettings } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function ProfileAnalysis() {
  const navigate = useNavigate();
  const { user, userProfile, logout, updateUserProfile } = useAuth();
  const { getTestHistory } = useDatabase();
  const [activeTab, setActiveTab] = useState('overview');
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (user) {
      try {
        const history = await getTestHistory(user.uid);
        setTestHistory(history);
      } catch (error) {
        console.error(error);
      }
    }
    setLoading(false);
  };

  const stats = userProfile?.stats || {
    testsCompleted: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    totalTime: 0,
    averageAccuracy: 0
  };

  const accuracy = stats.totalQuestions > 0
    ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100)
    : 0;

  const wrongAnswers = stats.totalQuestions - stats.correctAnswers;

  // Generate performance data from test history
  const monthlyData = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthTests = testHistory.filter(t => {
      if (!t.createdAt) return false;
      const testDate = t.createdAt?.toDate ? t.createdAt.toDate() : new Date(t.createdAt);
      return testDate.getMonth() === month.getMonth() && testDate.getFullYear() === month.getFullYear();
    });
    const avgScore = monthTests.length > 0
      ? Math.round(monthTests.reduce((sum, t) => sum + (t.percentage || 0), 0) / monthTests.length)
      : 0;

    monthlyData.push({
      name: monthNames[month.getMonth()],
      tests: monthTests.length,
      score: avgScore
    });
  }

  // Subject-wise analysis
  const subjectData = {};
  testHistory.forEach(t => {
    const subj = t.subject || 'Other';
    if (!subjectData[subj]) {
      subjectData[subj] = { correct: 0, total: 0, tests: 0 };
    }
    subjectData[subj].correct += t.correctAnswers || 0;
    subjectData[subj].total += t.totalQuestions || 0;
    subjectData[subj].tests += 1;
  });

  const subjectChartData = Object.entries(subjectData).map(([name, data]) => ({
    name,
    accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    tests: data.tests
  }));

  const pieData = [
    { name: 'Correct', value: stats.correctAnswers || 0, color: '#10B981' },
    { name: 'Wrong', value: wrongAnswers > 0 ? wrongAnswers : 0, color: '#EF4444' }
  ].filter(d => d.value > 0);

  const weakChapters = userProfile?.weakChapters || [];
  const strongChapters = userProfile?.strongChapters || [];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FiBarChart2 },
    { id: 'subjects', label: 'Subjects', icon: FiBookOpen },
    { id: 'history', label: 'History', icon: FiClock },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  return (
    <div className="page-container pt-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <FiArrowLeft size={18} className="text-dark-600" />
        </button>
        <h1 className="text-xl font-bold text-dark-800">Profile Analysis</h1>
      </div>

      {/* Profile Card */}
      <div className="card mb-5 bg-gradient-to-br from-dark-800 to-dark-900 text-white">
        <div className="flex items-center space-x-4">
          <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'S'}&background=F97316&color=fff&size=96`}
            alt="Profile"
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20"
          />
          <div className="flex-1">
            <h2 className="text-lg font-bold">{user?.displayName || 'Student'}</h2>
            <p className="text-dark-300 text-sm">{user?.email}</p>
            <p className="text-primary-400 text-xs mt-1">{userProfile?.preferences?.examType || 'JEE'} Aspirant</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="text-center p-2 bg-white/10 rounded-xl">
            <p className="text-xl font-bold">{stats.testsCompleted}</p>
            <p className="text-[10px] text-dark-300">Tests</p>
          </div>
          <div className="text-center p-2 bg-white/10 rounded-xl">
            <p className="text-xl font-bold">{accuracy}%</p>
            <p className="text-[10px] text-dark-300">Accuracy</p>
          </div>
          <div className="text-center p-2 bg-white/10 rounded-xl">
            <p className="text-xl font-bold">{stats.totalQuestions}</p>
            <p className="text-[10px] text-dark-300">Questions</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-2xl p-1 mb-5 overflow-x-auto no-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-dark-400'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-5 animate-slide-up">
          {/* Accuracy Ring */}
          <div className="card flex items-center justify-center">
            <div className="text-center">
              <h3 className="font-bold text-dark-700 mb-4">Overall Accuracy</h3>
              <div className="relative w-40 h-40 mx-auto">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="40" fill="none"
                    stroke={accuracy >= 70 ? '#10B981' : accuracy >= 40 ? '#F59E0B' : '#EF4444'}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - accuracy / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-dark-800">{accuracy}%</span>
                  <span className="text-xs text-dark-400">Accuracy</span>
                </div>
              </div>
              <div className="flex justify-center space-x-6 mt-4">
                <div className="text-center">
                  <p className="text-sm font-bold text-green-600">{stats.correctAnswers}</p>
                  <p className="text-[10px] text-dark-400">Correct</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-red-500">{wrongAnswers > 0 ? wrongAnswers : 0}</p>
                  <p className="text-[10px] text-dark-400">Wrong</p>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Performance Graph */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4 flex items-center space-x-2">
              <FiTrendingUp className="text-primary-500" size={18} />
              <span>Monthly Performance</span>
            </h3>
            {monthlyData.some(d => d.tests > 0) ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="tests" fill="#F97316" radius={[6, 6, 0, 0]} name="Tests" />
                    <Bar dataKey="score" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Avg Score %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-dark-300">
                <div className="text-center">
                  <p className="text-3xl mb-2">📊</p>
                  <p className="text-sm">Take tests to see performance data</p>
                </div>
              </div>
            )}
          </div>

          {/* Pie Chart */}
          {pieData.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-dark-700 mb-4">Answer Distribution</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
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
              <div className="flex justify-center space-x-6">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <span className="text-xs text-dark-500">{d.name}: {d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weak & Strong Chapters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card border-l-4 border-red-400">
              <h3 className="font-bold text-dark-700 mb-3 flex items-center space-x-2">
                <span className="text-red-500">📉</span>
                <span>Weak Areas</span>
              </h3>
              {weakChapters.length > 0 ? (
                <div className="space-y-2">
                  {weakChapters.map((ch, i) => (
                    <div key={i} className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
                      <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-sm text-dark-600">{ch}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-dark-400">Take more tests to identify weak areas</p>
              )}
            </div>

            <div className="card border-l-4 border-green-400">
              <h3 className="font-bold text-dark-700 mb-3 flex items-center space-x-2">
                <span className="text-green-500">📈</span>
                <span>Strong Areas</span>
              </h3>
              {strongChapters.length > 0 ? (
                <div className="space-y-2">
                  {strongChapters.map((ch, i) => (
                    <div key={i} className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                      <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="text-sm text-dark-600">{ch}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-dark-400">Take more tests to identify strong areas</p>
              )}
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-3 flex items-center space-x-2">
              <FiAward className="text-primary-500" size={18} />
              <span>Improvement Suggestions</span>
            </h3>
            <div className="space-y-3">
              {[
                { icon: '🎯', text: 'Focus on weak chapters and practice daily', color: 'bg-blue-50' },
                { icon: '⏱️', text: 'Improve time management during tests', color: 'bg-green-50' },
                { icon: '📝', text: 'Review wrong answers and learn from mistakes', color: 'bg-amber-50' },
                { icon: '🔄', text: 'Take regular mock tests to track progress', color: 'bg-purple-50' }
              ].map((tip, i) => (
                <div key={i} className={`flex items-center space-x-3 p-3 ${tip.color} rounded-xl`}>
                  <span className="text-xl">{tip.icon}</span>
                  <p className="text-sm text-dark-600">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="space-y-4 animate-slide-up">
          {subjectChartData.length > 0 ? (
            <>
              <div className="card">
                <h3 className="font-bold text-dark-700 mb-4">Subject-wise Accuracy</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectChartData} barCategoryGap="25%">
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="accuracy" fill="#F97316" radius={[8, 8, 0, 0]} name="Accuracy %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {subjectChartData.map((subj, i) => (
                <div key={i} className="card flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-dark-700">{subj.name}</h4>
                    <p className="text-xs text-dark-400">{subj.tests} tests taken</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      subj.accuracy >= 70 ? 'text-green-600' :
                      subj.accuracy >= 40 ? 'text-amber-600' : 'text-red-600'
                    }`}>{subj.accuracy}%</p>
                    <p className="text-[10px] text-dark-400">accuracy</p>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="card p-12 text-center">
              <p className="text-5xl mb-4">📚</p>
              <p className="text-dark-500 font-medium">No subject data yet</p>
              <p className="text-dark-400 text-sm mt-2">Complete tests to see subject analysis</p>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-3 animate-slide-up">
          {testHistory.length > 0 ? (
            testHistory.map((test, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-dark-700 text-sm truncate">{test.testName || 'Practice Test'}</h4>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {test.subject && <span className="badge-primary text-[10px]">{test.subject}</span>}
                      {test.examType && <span className="badge bg-blue-100 text-blue-700 text-[10px]">{test.examType}</span>}
                    </div>
                    <p className="text-xs text-dark-400 mt-1.5">
                      Score: {test.score || 0}/{test.totalMarks || 0} • {test.totalQuestions || 0} questions
                    </p>
                  </div>
                  <div className="text-right ml-3">
                    <p className={`text-lg font-bold ${
                      (test.percentage || 0) >= 70 ? 'text-green-600' :
                      (test.percentage || 0) >= 40 ? 'text-amber-600' : 'text-red-600'
                    }`}>{test.percentage || 0}%</p>
                    <p className="text-[10px] text-dark-400">
                      {test.createdAt?.toDate
                        ? test.createdAt.toDate().toLocaleDateString()
                        : new Date(test.createdAt).toLocaleDateString()
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="card p-12 text-center">
              <p className="text-5xl mb-4">📋</p>
              <p className="text-dark-500 font-medium">No test history</p>
              <p className="text-dark-400 text-sm mt-2">Complete your first test to see results here</p>
              <button onClick={() => navigate('/student/tests')} className="btn-primary mt-4">
                Take a Test
              </button>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4 animate-slide-up">
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4">Preferences</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase">Preferred Exam</label>
                <select
                  value={userProfile?.preferences?.examType || 'JEE Mains'}
                  onChange={(e) => updateUserProfile({ preferences: { ...userProfile?.preferences, examType: e.target.value } })}
                  className="input-field"
                >
                  <option>JEE Mains</option>
                  <option>JEE Advanced</option>
                  <option>NEET</option>
                  <option>CUET</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase">
                  Daily Goal: {userProfile?.preferences?.dailyGoal || 50} questions
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="10"
                  value={userProfile?.preferences?.dailyGoal || 50}
                  onChange={(e) => updateUserProfile({ preferences: { ...userProfile?.preferences, dailyGoal: parseInt(e.target.value) } })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full btn-danger py-4 flex items-center justify-center space-x-2"
          >
            <FiLogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}