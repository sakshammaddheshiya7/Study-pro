import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db, collection, getDocs, query, orderBy, limit } from '../../config/firebase';
import { FiArrowLeft, FiAward, FiTrendingUp, FiUsers } from 'react-icons/fi';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeFrame, setTimeFrame] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadLeaderboard(); }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'users'));
      const users = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(u => u.role !== 'admin' && (u.stats?.testsCompleted || 0) > 0)
        .sort((a, b) => (b.stats?.averageAccuracy || 0) - (a.stats?.averageAccuracy || 0))
        .slice(0, 50);
      setLeaderboard(users);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const getMedal = (rank) => {
    if (rank === 0) return '🥇';
    if (rank === 1) return '🥈';
    if (rank === 2) return '🥉';
    return `#${rank + 1}`;
  };

  const myRank = leaderboard.findIndex(u => u.id === user?.uid);

  return (
    <div className="page-container pt-4 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-dark-800">Leaderboard 🏆</h1>
          <p className="text-xs text-dark-400">{leaderboard.length} students ranked</p>
        </div>
      </div>

      {/* My Rank Card */}
      {myRank >= 0 && (
        <div className="card mb-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold">
                {getMedal(myRank)}
              </div>
              <div>
                <p className="font-bold text-lg">Rank #{myRank + 1}</p>
                <p className="text-white/80 text-sm">Your current position</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{leaderboard[myRank]?.stats?.averageAccuracy || 0}%</p>
              <p className="text-xs text-white/80">Accuracy</p>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <div className="flex items-end justify-center space-x-3 mb-6">
          {[1, 0, 2].map(idx => {
            const u = leaderboard[idx];
            if (!u) return null;
            const heights = { 0: 'h-28', 1: 'h-24', 2: 'h-20' };
            const colors = { 0: 'from-amber-400 to-amber-600', 1: 'from-gray-300 to-gray-500', 2: 'from-orange-300 to-orange-500' };
            return (
              <div key={idx} className="flex flex-col items-center">
                <img
                  src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName || 'U'}&background=F97316&color=fff&size=60`}
                  alt="" className="w-12 h-12 rounded-full border-2 border-white shadow-md mb-2"
                />
                <p className="text-xs font-bold text-dark-800 text-center max-w-[70px] truncate">{u.displayName || 'Student'}</p>
                <p className="text-[10px] text-dark-400">{u.stats?.averageAccuracy || 0}%</p>
                <div className={`${heights[idx]} w-20 bg-gradient-to-t ${colors[idx]} rounded-t-xl mt-1 flex items-center justify-center`}>
                  <span className="text-2xl">{getMedal(idx)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full List */}
      <div className="space-y-2">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="card p-4"><div className="flex items-center space-x-3"><div className="w-10 h-10 bg-gray-100 rounded-full skeleton" /><div className="flex-1"><div className="w-1/3 h-4 bg-gray-100 rounded skeleton mb-1" /><div className="w-1/4 h-3 bg-gray-100 rounded skeleton" /></div></div></div>
          ))
        ) : leaderboard.map((u, i) => (
          <div key={u.id} className={`card p-3.5 flex items-center space-x-3 ${u.id === user?.uid ? 'border-2 border-primary-300 bg-primary-50/50' : ''}`}>
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
              i < 3 ? 'text-lg' : 'bg-gray-100 text-dark-500'
            }`}>
              {i < 3 ? getMedal(i) : i + 1}
            </span>
            <img
              src={u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName || 'U'}&background=ccc&color=555&size=40`}
              alt="" className="w-9 h-9 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark-800 truncate">{u.displayName || 'Student'}</p>
              <p className="text-[10px] text-dark-400">{u.stats?.testsCompleted || 0} tests • {u.stats?.totalQuestions || 0} questions</p>
            </div>
            <div className="text-right">
              <p className={`text-sm font-bold ${(u.stats?.averageAccuracy || 0) >= 70 ? 'text-green-600' : (u.stats?.averageAccuracy || 0) >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                {u.stats?.averageAccuracy || 0}%
              </p>
            </div>
          </div>
        ))}
        {!loading && leaderboard.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-5xl mb-3">🏆</p>
            <p className="text-dark-500 font-medium">No rankings yet</p>
            <p className="text-dark-400 text-sm mt-1">Complete tests to appear on the leaderboard</p>
          </div>
        )}
      </div>
    </div>
  );
}