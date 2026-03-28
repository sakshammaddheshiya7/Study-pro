import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { EXAM_TYPES, SUBJECTS, DIFFICULTY_LEVELS, QUESTION_TYPES, CHAPTERS } from '../../utils/constants';
import { FiFilter, FiSearch, FiX, FiChevronDown, FiChevronUp, FiPlay, FiClock, FiTarget, FiZap, FiBookOpen, FiArrowLeft, FiSliders, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export default function TestFilters() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { fetchQuestions, loading } = useDatabase();
  const { user } = useAuth();

  const [showFilters, setShowFilters] = useState(true);
  const [examType, setExamType] = useState(searchParams.get('examType') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  const [difficulty, setDifficulty] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [chapter, setChapter] = useState('');
  const [questionCount, setQuestionCount] = useState(20);
  const [timeLimit, setTimeLimit] = useState(30);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const availableSubjects = examType
    ? (examType.includes('NEET') ? SUBJECTS.NEET : examType.includes('JEE') ? SUBJECTS.JEE : SUBJECTS.ALL)
    : SUBJECTS.ALL;

  const availableChapters = subject ? (CHAPTERS[subject] || []) : [];

  const handleSearch = useCallback(async () => {
    const filters = {};
    if (examType) filters.examType = examType;
    if (subject) filters.subject = subject;
    if (difficulty) filters.difficulty = difficulty;
    if (questionType) filters.questionType = questionType;
    if (chapter) filters.chapter = chapter;

    const results = await fetchQuestions(filters);
    setAvailableQuestions(results);
    setFilteredQuestions(results);
    setHasSearched(true);

    if (results.length === 0) {
      toast('No questions found with these filters', { icon: '🔍' });
    } else {
      toast.success(`Found ${results.length} questions`);
    }
  }, [examType, subject, difficulty, questionType, chapter, fetchQuestions]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = availableQuestions.filter(q =>
        q.questionText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.chapter?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredQuestions(filtered);
    } else {
      setFilteredQuestions(availableQuestions);
    }
  }, [searchQuery, availableQuestions]);

  const handleStartTest = () => {
    if (filteredQuestions.length === 0) {
      toast.error('No questions available to create a test');
      return;
    }

    const count = Math.min(questionCount, filteredQuestions.length);
    const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
    const selectedQuestions = shuffled.slice(0, count);

    const testId = uuidv4();
    const testConfig = {
      id: testId,
      name: `${examType || 'Practice'} - ${subject || 'Mixed'} Test`,
      examType: examType || 'Practice',
      subject: subject || 'Mixed',
      difficulty: difficulty || 'Mixed',
      questionType: questionType || 'Mixed',
      questions: selectedQuestions,
      timeLimit: timeLimit * 60,
      totalQuestions: count,
      createdBy: user?.uid,
      createdAt: new Date().toISOString()
    };

    sessionStorage.setItem(`test_${testId}`, JSON.stringify(testConfig));
    navigate(`/student/test/${testId}`);
  };

  const clearFilters = () => {
    setExamType('');
    setSubject('');
    setDifficulty('');
    setQuestionType('');
    setChapter('');
    setQuestionCount(20);
    setTimeLimit(30);
    setSearchQuery('');
    setAvailableQuestions([]);
    setFilteredQuestions([]);
    setHasSearched(false);
  };

  const presetTests = [
    { name: 'JEE Quick Physics', examType: 'JEE Mains', subject: 'Physics', count: 15, time: 20, icon: '⚡', color: 'from-blue-400 to-blue-600' },
    { name: 'NEET Biology', examType: 'NEET', subject: 'Biology', count: 20, time: 30, icon: '🧬', color: 'from-green-400 to-green-600' },
    { name: 'JEE Math Challenge', examType: 'JEE Mains', subject: 'Mathematics', count: 25, time: 45, icon: '📐', color: 'from-purple-400 to-purple-600' },
    { name: 'Chemistry Sprint', examType: 'JEE Mains', subject: 'Chemistry', count: 15, time: 15, icon: '🧪', color: 'from-amber-400 to-amber-600' },
    { name: 'JEE Advanced Mix', examType: 'JEE Advanced', subject: '', count: 30, time: 60, icon: '🔥', color: 'from-red-400 to-red-600' },
    { name: 'NEET Full Test', examType: 'NEET', subject: '', count: 50, time: 90, icon: '🏥', color: 'from-teal-400 to-teal-600' }
  ];

  const handlePresetTest = (preset) => {
    setExamType(preset.examType);
    setSubject(preset.subject);
    setQuestionCount(preset.count);
    setTimeLimit(preset.time);
    setShowFilters(true);
  };

  return (
    <div className="page-container pt-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm hover:shadow-md transition-all">
            <FiArrowLeft size={18} className="text-dark-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-dark-800">Find Tests</h1>
            <p className="text-xs text-dark-400">Filter and start practice</p>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
            showFilters ? 'bg-primary-500 text-white' : 'bg-white text-dark-600 shadow-sm'
          }`}
        >
          <FiSliders size={16} />
          <span>Filters</span>
        </button>
      </div>

      {/* Preset Tests */}
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-dark-600 mb-3">Quick Start</h2>
        <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
          {presetTests.map((preset, i) => (
            <button
              key={i}
              onClick={() => handlePresetTest(preset)}
              className="flex-shrink-0 w-36 p-3 rounded-2xl bg-gradient-to-br text-white shadow-md hover:shadow-lg active:scale-95 transition-all"
              style={{ backgroundImage: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))` }}
            >
              <div className={`w-36 p-3 rounded-2xl bg-gradient-to-br ${preset.color} text-white shadow-md hover:shadow-lg active:scale-95 transition-all -m-3`}>
                <span className="text-2xl">{preset.icon}</span>
                <p className="text-xs font-bold mt-2 leading-tight">{preset.name}</p>
                <p className="text-[10px] text-white/80 mt-1">{preset.count}Q • {preset.time}min</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search questions by topic, chapter..."
          className="input-field pl-11 pr-10"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card mb-5 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-dark-800 flex items-center space-x-2">
              <FiFilter size={16} className="text-primary-500" />
              <span>Test Filters</span>
            </h3>
            <button onClick={clearFilters} className="text-xs text-primary-500 font-semibold flex items-center space-x-1 hover:text-primary-600">
              <FiRefreshCw size={12} />
              <span>Clear All</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Exam Type */}
            <div>
              <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">Exam Type</label>
              <select
                value={examType}
                onChange={(e) => { setExamType(e.target.value); setSubject(''); setChapter(''); }}
                className="input-field text-sm"
              >
                <option value="">All Exams</option>
                {EXAM_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">Subject</label>
              <select
                value={subject}
                onChange={(e) => { setSubject(e.target.value); setChapter(''); }}
                className="input-field text-sm"
              >
                <option value="">All Subjects</option>
                {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-field text-sm">
                <option value="">All Levels</option>
                {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">Question Type</label>
              <select value={questionType} onChange={(e) => setQuestionType(e.target.value)} className="input-field text-sm">
                <option value="">All Types</option>
                {QUESTION_TYPES.map(qt => <option key={qt} value={qt}>{qt}</option>)}
              </select>
            </div>

            {/* Chapter */}
            {availableChapters.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">Chapter</label>
                <select value={chapter} onChange={(e) => setChapter(e.target.value)} className="input-field text-sm">
                  <option value="">All Chapters</option>
                  {availableChapters.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            {/* Question Count */}
            <div>
              <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">
                Questions: <span className="text-primary-500">{questionCount}</span>
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-[10px] text-dark-400 mt-1">
                <span>5</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>

            {/* Time Limit */}
            <div>
              <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">
                Time: <span className="text-primary-500">{timeLimit} min</span>
              </label>
              <input
                type="range"
                min="5"
                max="180"
                step="5"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-[10px] text-dark-400 mt-1">
                <span>5m</span>
                <span>45m</span>
                <span>90m</span>
                <span>135m</span>
                <span>180m</span>
              </div>
            </div>
          </div>

          {/* Active Filters Tags */}
          {(examType || subject || difficulty || questionType || chapter) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
              {examType && (
                <span className="badge-primary flex items-center space-x-1">
                  <span>{examType}</span>
                  <button onClick={() => setExamType('')}><FiX size={12} /></button>
                </span>
              )}
              {subject && (
                <span className="badge-success flex items-center space-x-1">
                  <span>{subject}</span>
                  <button onClick={() => setSubject('')}><FiX size={12} /></button>
                </span>
              )}
              {difficulty && (
                <span className="badge-warning flex items-center space-x-1">
                  <span>{difficulty}</span>
                  <button onClick={() => setDifficulty('')}><FiX size={12} /></button>
                </span>
              )}
              {questionType && (
                <span className="badge-danger flex items-center space-x-1">
                  <span>{questionType}</span>
                  <button onClick={() => setQuestionType('')}><FiX size={12} /></button>
                </span>
              )}
              {chapter && (
                <span className="badge bg-indigo-100 text-indigo-700 flex items-center space-x-1">
                  <span>{chapter}</span>
                  <button onClick={() => setChapter('')}><FiX size={12} /></button>
                </span>
              )}
            </div>
          )}

          {/* Search and Start Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex-1 btn-secondary flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-dark-300 border-t-dark-600 rounded-full animate-spin" />
              ) : (
                <>
                  <FiSearch size={18} />
                  <span>Search Questions</span>
                </>
              )}
            </button>
            <button
              onClick={handleStartTest}
              disabled={filteredQuestions.length === 0}
              className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <FiPlay size={18} />
              <span>Start Test ({Math.min(questionCount, filteredQuestions.length)} Q • {timeLimit}m)</span>
            </button>
          </div>
        </div>
      )}

      {/* Results Section */}
      {hasSearched && (
        <div className="animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">
              Available Questions
              <span className="text-primary-500 ml-2">({filteredQuestions.length})</span>
            </h2>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-5xl mb-4">📭</p>
              <h3 className="text-lg font-bold text-dark-700">No Questions Found</h3>
              <p className="text-dark-400 text-sm mt-2">Try adjusting your filters or ask admin to upload questions</p>
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {filteredQuestions.slice(0, 20).map((q, i) => (
                <div key={q.id || i} className="card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {q.subject && <span className="badge-primary text-[10px]">{q.subject}</span>}
                        {q.difficulty && (
                          <span className={`badge text-[10px] ${
                            q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                            q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>{q.difficulty}</span>
                        )}
                        {q.questionType && <span className="badge bg-blue-100 text-blue-700 text-[10px]">{q.questionType}</span>}
                      </div>
                      <p className="text-sm text-dark-700 line-clamp-2">{q.questionText}</p>
                      {q.chapter && <p className="text-xs text-dark-400 mt-1.5">📖 {q.chapter}</p>}
                    </div>
                    <span className="text-xs text-dark-300 ml-3 flex-shrink-0">#{i + 1}</span>
                  </div>
                </div>
              ))}
              {filteredQuestions.length > 20 && (
                <p className="text-center text-sm text-dark-400 py-3">
                  Showing 20 of {filteredQuestions.length} questions. Start test to access all.
                </p>
              )}
            </div>
          )}

          {/* Start Test Floating Button (Mobile) */}
          {filteredQuestions.length > 0 && (
            <div className="fixed bottom-20 left-4 right-4 md:hidden z-30">
              <button
                onClick={handleStartTest}
                className="w-full btn-primary py-4 flex items-center justify-center space-x-2 shadow-lg rounded-2xl"
              >
                <FiPlay size={20} />
                <span className="font-bold">Start Test • {Math.min(questionCount, filteredQuestions.length)} Questions</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Initial State */}
      {!hasSearched && !showFilters && (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">🎯</p>
          <h3 className="text-lg font-bold text-dark-700">Ready to Practice?</h3>
          <p className="text-dark-400 text-sm mt-2 mb-6">Use filters above to find questions and create your test</p>
          <button onClick={() => setShowFilters(true)} className="btn-primary">
            Open Filters
          </button>
        </div>
      )}
    </div>
  );
}