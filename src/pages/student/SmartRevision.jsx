import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../../contexts/DatabaseContext';
import { FiArrowLeft, FiRefreshCw, FiCheck, FiX, FiClock, FiTarget, FiAward, FiChevronRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SmartRevision() {
  const navigate = useNavigate();
  const { fetchQuestions } = useDatabase();
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({ easy: 0, hard: 0, again: 0, total: 0 });
  const [revisionQueue, setRevisionQueue] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionActive, setSessionActive] = useState(false);

  const startRevision = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (selectedSubject) filters.subject = selectedSubject;
      const result = await fetchQuestions(filters);
      if (result.length === 0) {
        toast.error('No questions available for revision');
        setLoading(false);
        return;
      }
      const shuffled = [...result].sort(() => Math.random() - 0.5).slice(0, 20);
      setQuestions(shuffled);
      setRevisionQueue(shuffled.map((_, i) => i));
      setCurrentIdx(0);
      setShowAnswer(false);
      setStats({ easy: 0, hard: 0, again: 0, total: 0 });
      setSessionActive(true);
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = (difficulty) => {
    setStats(prev => ({
      ...prev,
      [difficulty]: prev[difficulty] + 1,
      total: prev.total + 1
    }));

    if (difficulty === 'again') {
      setRevisionQueue(prev => [...prev, revisionQueue[0]]);
    }

    const newQueue = revisionQueue.slice(1);
    setRevisionQueue(newQueue);
    
    if (newQueue.length > 0) {
      setCurrentIdx(newQueue[0]);
      setShowAnswer(false);
    } else {
      setSessionActive(false);
      toast.success('Revision session complete! 🎉');
    }
  };

  const currentQuestion = questions[currentIdx];
  const remaining = revisionQueue.length;

  if (!sessionActive) {
    return (
      <div className="page-container pt-4 animate-fade-in">
        <div className="flex items-center space-x-3 mb-6">
          <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-dark-800">Smart Revision 🔄</h1>
            <p className="text-xs text-dark-400">Spaced repetition flashcards</p>
          </div>
        </div>

        {stats.total > 0 && (
          <div className="card mb-5 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <h3 className="font-bold text-lg mb-3">Session Complete! 🎉</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <p className="text-xl font-bold">{stats.easy}</p>
                <p className="text-xs opacity-80">Easy ✅</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <p className="text-xl font-bold">{stats.hard}</p>
                <p className="text-xs opacity-80">Hard 🤔</p>
              </div>
              <div className="bg-white/20 rounded-xl p-3 text-center">
                <p className="text-xl font-bold">{stats.again}</p>
                <p className="text-xs opacity-80">Again 🔄</p>
              </div>
            </div>
          </div>
        )}

        <div className="card text-center py-8">
          <span className="text-5xl mb-4 block">🧠</span>
          <h2 className="text-lg font-bold text-dark-800">Start Revision Session</h2>
          <p className="text-sm text-dark-400 mt-2 mb-6">Review questions using spaced repetition</p>
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="input-field mb-4 max-w-xs mx-auto"
          >
            <option value="">All Subjects</option>
            <option>Physics</option>
            <option>Chemistry</option>
            <option>Mathematics</option>
            <option>Biology</option>
          </select>

          <button onClick={startRevision} disabled={loading} className="btn-primary px-8 py-3 mx-auto flex items-center space-x-2">
            {loading ? <FiRefreshCw className="animate-spin" size={18} /> : <FiTarget size={18} />}
            <span>{loading ? 'Loading...' : 'Start Revision'}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container pt-4 animate-fade-in">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <button onClick={() => setSessionActive(false)} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-base font-bold text-dark-800">Revision</h1>
            <p className="text-[10px] text-dark-400">{remaining} cards remaining</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-primary-500">{stats.total}/{questions.length}</p>
          <p className="text-[10px] text-dark-400">Reviewed</p>
        </div>
      </div>

      {/* Progress */}
      <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${(stats.total / questions.length) * 100}%` }} />
      </div>

      {/* Card */}
      {currentQuestion && (
        <div className="card min-h-[300px] flex flex-col justify-between mb-5">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              {currentQuestion.subject && <span className="badge-primary text-[10px]">{currentQuestion.subject}</span>}
              {currentQuestion.difficulty && <span className="badge-warning text-[10px]">{currentQuestion.difficulty}</span>}
            </div>
            <p className="text-base text-dark-800 font-medium leading-relaxed">{currentQuestion.questionText}</p>
          </div>

          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full btn-primary py-3.5 mt-6"
            >
              Show Answer
            </button>
          ) : (
            <div className="mt-6 animate-slide-up">
              <div className="p-4 bg-green-50 rounded-xl border border-green-200 mb-4">
                <p className="text-sm font-semibold text-green-700 mb-1">Answer:</p>
                {currentQuestion.questionType === 'Numerical' ? (
                  <p className="text-dark-700">{currentQuestion.correctAnswer}</p>
                ) : (
                  <p className="text-dark-700">{currentQuestion.options?.[currentQuestion.correctOptionIndex]}</p>
                )}
                {currentQuestion.explanation && (
                  <p className="text-xs text-dark-500 mt-2">{currentQuestion.explanation}</p>
                )}
              </div>

              <p className="text-xs text-dark-400 text-center mb-3">How well did you know this?</p>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handleResponse('again')} className="py-3 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 active:scale-95 transition-all">
                  🔄 Again
                </button>
                <button onClick={() => handleResponse('hard')} className="py-3 bg-amber-50 text-amber-600 rounded-xl font-semibold text-sm hover:bg-amber-100 active:scale-95 transition-all">
                  🤔 Hard
                </button>
                <button onClick={() => handleResponse('easy')} className="py-3 bg-green-50 text-green-600 rounded-xl font-semibold text-sm hover:bg-green-100 active:scale-95 transition-all">
                  ✅ Easy
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}