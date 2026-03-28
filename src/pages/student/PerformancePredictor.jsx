import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import { FiArrowLeft, FiTrendingUp, FiTarget, FiAward, FiZap } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PerformancePredictor() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { getTestHistory } = useDatabase();
  const { user } = useAuth();
  const [prediction, setPrediction] = useState(null);
  const [testHistory, setTestHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const history = await getTestHistory(user.uid);
      setTestHistory(history);
      generatePrediction(history);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const generatePrediction = (history) => {
    const stats = userProfile?.stats || {};
    const accuracy = stats.totalQuestions > 0 ? (stats.correctAnswers / stats.totalQuestions) * 100 : 0;
    const testsCount = stats.testsCompleted || 0;
    
    // Simple prediction model
    const jeeScore = Math.round(Math.min(300, accuracy * 3 + testsCount * 0.5));
    const neetScore = Math.round(Math.min(720, accuracy * 7.2 + testsCount * 0.8));
    const percentile = Math.round(Math.min(99.9, accuracy * 0.95 + testsCount * 0.1));
    
    const trend = history.length >= 2
      ? history.slice(0, 5).reduce((sum, t) => sum + (t.percentage || 0), 0) / Math.min(5, history.length)
      : accuracy;

    const improvementRate = history.length >= 3
      ? ((history[0]?.percentage || 0) - (history[history.length - 1]?.percentage || 0)) / history.length
      : 0;

    setPrediction({
      jeeScore,
      neetScore,
      percentile: Math.min(99.9, percentile),
      trend: Math.round(trend),
      accuracy: Math.round(accuracy),
      improvementRate: Math.round(improvementRate * 10) / 10,
      readiness: accuracy >= 70 ? 'High' : accuracy >= 40 ? 'Medium' : 'Building',
      projectedRank: {
        jee: Math.max(1, Math.round(300000 * (1 - percentile / 100))),
        neet: Math.max(1, Math.round(2000000 * (1 - percentile / 100)))
      }
    });
  };

  const trendData = testHistory.slice(0, 10).reverse().map((t, i) => ({
    name: `T${i + 1}`,
    score: t.percentage || 0
  }));

  if (loading) {
    return (
      <div className="page-container pt-4 flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="page-container pt-4 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-dark-800">Performance Predictor 🔮</h1>
          <p className="text-xs text-dark-400">AI-powered score prediction</p>
        </div>
      </div>

      {!prediction ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-3">📊</p>
          <p className="text-dark-500">Take more tests to get predictions</p>
        </div>
      ) : (
        <>
          {/* Predicted Scores */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white p-5 text-center">
              <p className="text-xs text-white/80 uppercase tracking-wide">JEE Predicted</p>
              <p className="text-3xl font-extrabold mt-1">{prediction.jeeScore}</p>
              <p className="text-xs text-white/70 mt-1">out of 300</p>
              <p className="text-[10px] text-white/60 mt-2">Est. Rank: ~{prediction.projectedRank.jee.toLocaleString()}</p>
            </div>
            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white p-5 text-center">
              <p className="text-xs text-white/80 uppercase tracking-wide">NEET Predicted</p>
              <p className="text-3xl font-extrabold mt-1">{prediction.neetScore}</p>
              <p className="text-xs text-white/70 mt-1">out of 720</p>
              <p className="text-[10px] text-white/60 mt-2">Est. Rank: ~{prediction.projectedRank.neet.toLocaleString()}</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card p-3 text-center">
              <FiTarget className="mx-auto text-primary-500 mb-1" size={20} />
              <p className="text-xl font-bold text-dark-800">{prediction.accuracy}%</p>
              <p className="text-[10px] text-dark-400">Accuracy</p>
            </div>
            <div className="card p-3 text-center">
              <FiTrendingUp className="mx-auto text-green-500 mb-1" size={20} />
              <p className="text-xl font-bold text-dark-800">{prediction.percentile}%</p>
              <p className="text-[10px] text-dark-400">Percentile</p>
            </div>
            <div className="card p-3 text-center">
              <FiAward className="mx-auto text-amber-500 mb-1" size={20} />
              <p className="text-xl font-bold text-dark-800">{prediction.readiness}</p>
              <p className="text-[10px] text-dark-400">Readiness</p>
            </div>
          </div>

          {/* Trend Chart */}
          {trendData.length > 1 && (
            <div className="card mb-6">
              <h3 className="font-bold text-dark-700 mb-3">Score Trend</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#F97316" strokeWidth={3} dot={{ r: 4, fill: '#F97316' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* AI Recommendations */}
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-3 flex items-center space-x-2">
              <FiZap className="text-primary-500" size={18} />
              <span>AI Recommendations</span>
            </h3>
            <div className="space-y-2">
              {[
                { icon: '🎯', text: prediction.accuracy < 50 ? 'Focus on understanding basic concepts first' : 'Practice advanced level problems' },
                { icon: '📚', text: `Take ${Math.max(1, 5 - (userProfile?.stats?.testsCompleted || 0))} more tests this week` },
                { icon: '⏱️', text: 'Improve time management — aim for 2 minutes per question' },
                { icon: '🔄', text: 'Review wrong answers daily using Smart Revision' },
                { icon: '📊', text: prediction.improvementRate > 0 ? `You're improving at ${prediction.improvementRate}% per test!` : 'Consistent practice will show results soon' }
              ].map((rec, i) => (
                <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                  <span className="text-xl">{rec.icon}</span>
                  <p className="text-sm text-dark-600">{rec.text}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}