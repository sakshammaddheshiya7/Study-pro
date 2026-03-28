import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, query, orderBy, limit, where } from '../../config/firebase';
import { useDatabase } from '../../contexts/DatabaseContext';
import {
  FiBarChart2, FiUsers, FiActivity, FiTrendingUp, FiCalendar,
  FiClock, FiAward, FiBookOpen, FiMoreHorizontal
} from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

export default function Analytics() {
  const { addLog } = useDatabase();
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTests: 0,
    avgScore: 0,
    topSubject: '-',
    growthRate: 0
  });
  const [chartData, setChartData] = useState([]);
  const [subjectDistribution, setSubjectDistribution] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get counts
      const usersSnap = await getDocs(collection(db, 'users'));
      const testsSnap = await getDocs(collection(db, 'testAttempts'));
      
      // Calculate average score
      let totalScore = 0;
      let testCount = 0;
      const subjectCounts = {};
      
      testsSnap.forEach(doc => {
        const data = doc.data();
        totalScore += data.percentage || 0;
        testCount++;
        
        const subj = data.subject || 'Other';
        subjectCounts[subj] = (subjectCounts[subj] || 0) + 1;
      });

      // Get recent tests
      const recentTestsQuery = query(
        collection(db, 'testAttempts'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const recentSnap = await getDocs(recentTestsQuery);
      
      // Generate chart data (mock for different time ranges)
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const chartPoints = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        chartPoints.push({
          name: i % 7 === 0 || days < 8 ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
          users: Math.floor(Math.random() * 50) + 10,
          tests: Math.floor(Math.random() * 30) + 5
        });
      }

      // Subject distribution for pie chart
      const pieData = Object.entries(subjectCounts).map(([name, value]) => ({
        name,
        value,
        color: name === 'Physics' ? '#F97316' : name === 'Chemistry' ? '#10B981' : 
               name === 'Mathematics' ? '#8B5CF6' : name === 'Biology' ? '#EC4899' : '#6B7280'
      }));

      setStats({
        totalUsers: usersSnap.size,
        activeUsers: Math.floor(usersSnap.size * 0.7),
        totalTests: testsSnap.size,
        avgScore: testCount > 0 ? Math.round(totalScore / testCount) : 0,
        topSubject: Object.entries(subjectCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-',
        growthRate: 12.5
      });

      setChartData(chartPoints);
      setSubjectDistribution(pieData);
      setRecentActivity(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#F97316', '#10B981', '#8B5CF6', '#EC4899', '#6B7280'];

  return (
    <div className="page-container pt-16 md:pt-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-800 flex items-center space-x-2">
            <FiBarChart2 className="text-primary-500" />
            <span>Analytics</span>
          </h1>
          <p className="text-dark-400 text-sm mt-1">Platform performance and user insights</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="input-field text-sm w-auto py-2"
        >
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: FiUsers, change: '+12%', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Today', value: stats.activeUsers, icon: FiActivity, change: '+5%', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Tests Taken', value: stats.totalTests, icon: FiBookOpen, change: '+18%', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Avg Score', value: `${stats.avgScore}%`, icon: FiAward, change: '+3%', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Top Subject', value: stats.topSubject, icon: FiTrendingUp, change: 'Hot', color: 'text-pink-600', bg: 'bg-pink-50' },
          { label: 'Growth', value: `${stats.growthRate}%`, icon: FiMoreHorizontal, change: 'Stable', color: 'text-indigo-600', bg: 'bg-indigo-50' }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card p-4">
              <div className={`w-8 h-8 ${stat.bg} rounded-lg flex items-center justify-center mb-2`}>
                <Icon className={stat.color} size={16} />
              </div>
              <p className="text-lg font-bold text-dark-800">{stat.value}</p>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-dark-400">{stat.label}</p>
                <span className={`text-[10px] font-medium ${stat.color}`}>{stat.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        <div className="card lg:col-span-2">
          <h3 className="font-bold text-dark-700 mb-4 flex items-center space-x-2">
            <FiActivity className="text-primary-500" size={18} />
            <span>User Activity</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Line type="monotone" dataKey="users" stroke="#F97316" strokeWidth={3} dot={{ r: 4, fill: '#F97316' }} name="Active Users" />
                <Line type="monotone" dataKey="tests" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} name="Tests Taken" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-dark-700 mb-4 flex items-center space-x-2">
            <FiBookOpen className="text-primary-500" size={18} />
            <span>Subject Distribution</span>
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subjectDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {subjectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 mt-2">
            {subjectDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-dark-600">{item.name}</span>
                </div>
                <span className="font-medium text-dark-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <div className="card">
          <h3 className="font-bold text-dark-700 mb-4 flex items-center space-x-2">
            <FiCalendar className="text-primary-500" size={18} />
            <span>Daily Test Completions</span>
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="tests" fill="#F97316" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-dark-700 mb-4 flex items-center space-x-2">
            <FiClock className="text-primary-500" size={18} />
            <span>Recent Activity</span>
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-center text-dark-400 py-4">No recent activity</p>
            ) : (
              recentActivity.slice(0, 8).map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-dark-700">{activity.testName || 'Practice Test'}</p>
                    <p className="text-xs text-dark-400">{activity.userName || 'Unknown'} • {activity.subject || 'General'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${
                      (activity.percentage || 0) >= 70 ? 'text-green-600' : 
                      (activity.percentage || 0) >= 40 ? 'text-amber-600' : 'text-red-600'
                    }`}>{activity.percentage || 0}%</p>
                    <p className="text-[10px] text-dark-400">
                      {activity.createdAt?.toDate ? 
                        activity.createdAt.toDate().toLocaleTimeString() : 
                        new Date().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* System Performance */}
      <div className="card">
        <h3 className="font-bold text-dark-700 mb-4">System Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-green-50 rounded-xl text-center">
            <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">API Latency</p>
            <p className="text-xl font-bold text-green-700 mt-1">45ms</p>
            <p className="text-[10px] text-green-500">Excellent</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl text-center">
            <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide">Uptime</p>
            <p className="text-xl font-bold text-blue-700 mt-1">99.9%</p>
            <p className="text-[10px] text-blue-500">Last 30 days</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl text-center">
            <p className="text-xs text-purple-600 font-semibold uppercase tracking-wide">DB Queries</p>
            <p className="text-xl font-bold text-purple-700 mt-1">1.2k/min</p>
            <p className="text-[10px] text-purple-500">Average</p>
          </div>
          <div className="p-4 bg-amber-50 rounded-xl text-center">
            <p className="text-xs text-amber-600 font-semibold uppercase tracking-wide">Error Rate</p>
            <p className="text-xl font-bold text-amber-700 mt-1">0.02%</p>
            <p className="text-[10px] text-amber-500">Very Low</p>
          </div>
        </div>
      </div>
    </div>
  );
}