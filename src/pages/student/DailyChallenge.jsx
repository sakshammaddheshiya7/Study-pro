import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../../contexts/DatabaseContext';
import { FiArrowLeft, FiCheck, FiX, FiAward, FiCalendar, FiZap, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DailyChallenge() {
  const navigate = useNavigate();
  const { fetchQuestions } = useDatabase();
  const [question, setQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDailyQuestion(); }, []);

  const loadDailyQuestion = async () => {
    try {
      setLoading(true);
      const questions = await fetchQuestions({});
      if (questions.length > 0) {
        const today = new Date().toDateString();
        const seed = today.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        const idx = seed % questions.length;
        setQuestion(questions[idx]);
      }
      const savedStreak = parseInt(localStorage.getItem('dailyStreak') || '0');
      setStreak(savedStreak);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (selectedOption === null) { toast.error('Select an answer'); return; }
    setSubmitted(true);
    const isCorrect = selectedOption === question.correctOptionIndex;
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('dailyStreak', newStreak.toString());
      localStorage.setItem('lastDailyDate', new Date().toDateString());
      toast.success('Correct! 🎉 Streak: ' + newStreak);
    } else {
      localStorage.setItem('dailyStreak', '0');
      setStreak(0);
      toast.error('Wrong answer. Keep trying!');
    }
  };

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
          <h1 className="text-xl font-bold text-dark-800">Daily Challenge 🎲</h1>
          <p className="text-xs text-dark-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      {/* Streak */}
      <div className="card mb-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">🔥</span>
            <div>
              <p className="font-bold text-lg">{streak} Day Streak</p>
              <p className="text-white/80 text-xs">Keep it going!</p>
            </div>
          </div>
          <FiCalendar size={24} className="text-white/60" />
        </div>
      </div>

      {!question ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-dark-500">No questions available</p>
          <p className="text-dark-400 text-sm mt-1">Ask admin to upload questions</p>
        </div>
      ) : (
        <>
          <div className="card mb-5">
            <div className="flex items-center space-x-2 mb-3">
              {question.subject && <span className="badge-primary text-[10px]">{question.subject}</span>}
              {question.difficulty && <span className="badge-warning text-[10px]">{question.difficulty}</span>}
              <span className="badge bg-purple-100 text-purple-700 text-[10px]">Daily Challenge</span>
            </div>
            <p className="text-base text-dark-800 font-medium leading-relaxed">{question.questionText}</p>
          </div>

          <div className="space-y-2.5 mb-5">
            {(question.options || []).map((opt, i) => {
              let style = 'border-gray-200 bg-white';
              if (submitted) {
                if (i === question.correctOptionIndex) style = 'border-green-500 bg-green-50';
                else if (i === selectedOption && i !== question.correctOptionIndex) style = 'border-red-500 bg-red-50';
              } else if (i === selectedOption) {
                style = 'border-primary-500 bg-primary-50';
              }
              return (
                <button
                  key={i}
                  onClick={() => !submitted && setSelectedOption(i)}
                  disabled={submitted}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${style}`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      submitted && i === question.correctOptionIndex ? 'bg-green-500 text-white' :
                      submitted && i === selectedOption ? 'bg-red-500 text-white' :
                      i === selectedOption ? 'bg-primary-500 text-white' :
                      'bg-gray-100 text-dark-500'
                    }`}>
                      {submitted && i === question.correctOptionIndex ? <FiCheck size={14} /> :
                       submitted && i === selectedOption ? <FiX size={14} /> :
                       String.fromCharCode(65 + i)}
                    </span>
                    <span className="text-sm text-dark-700">{opt}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {!submitted ? (
            <button onClick={handleSubmit} disabled={selectedOption === null} className="w-full btn-primary py-3.5 disabled:opacity-40">
              <FiZap className="inline mr-2" size={18} />Submit Answer
            </button>
          ) : (
            <div className="space-y-3">
              {question.explanation && (
                <div className="card bg-blue-50 border border-blue-200">
                  <p className="text-sm font-semibold text-blue-700 mb-1">💡 Explanation</p>
                  <p className="text-sm text-blue-600">{question.explanation}</p>
                </div>
              )}
              <button onClick={() => navigate('/student/tests')} className="w-full btn-primary py-3.5">
                Practice More Questions →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}