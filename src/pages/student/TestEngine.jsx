import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDatabase } from '../../contexts/DatabaseContext';
import {
  FiClock, FiChevronLeft, FiChevronRight, FiFlag, FiCheck,
  FiAlertTriangle, FiGrid, FiX, FiSend, FiBookmark,
  FiEye, FiChevronDown, FiMaximize, FiMinimize
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

const QUESTION_STATUS = {
  NOT_VISITED: 'not_visited',
  NOT_ANSWERED: 'not_answered',
  ANSWERED: 'answered',
  MARKED: 'marked',
  MARKED_ANSWERED: 'marked_answered'
};

export default function TestEngine() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { user, updateUserProfile, userProfile } = useAuth();
  const { saveTestAttempt, addLog } = useDatabase();

  const [testConfig, setTestConfig] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [statuses, setStatuses] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showNavPanel, setShowNavPanel] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [numericalInput, setNumericalInput] = useState('');

  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const questionTimeRef = useRef({});

  // Load test config
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`test_${testId}`);
      if (stored) {
        const config = JSON.parse(stored);
        setTestConfig(config);
        setQuestions(config.questions || []);
        setTimeLeft(config.timeLimit || 1800);

        const initialStatuses = {};
        (config.questions || []).forEach((_, i) => {
          initialStatuses[i] = QUESTION_STATUS.NOT_VISITED;
        });
        if (config.questions?.length > 0) {
          initialStatuses[0] = QUESTION_STATUS.NOT_ANSWERED;
        }
        setStatuses(initialStatuses);
      } else {
        toast.error('Test not found');
        navigate('/student/tests');
      }
    } catch (error) {
      toast.error('Error loading test');
      navigate('/student/tests');
    }
  }, [testId]);

  // Timer
  useEffect(() => {
    if (!isStarted || isSubmitted || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isStarted, isSubmitted]);

  // Track per-question time
  useEffect(() => {
    if (!isStarted) return;
    const now = Date.now();
    questionTimeRef.current[currentIndex] = questionTimeRef.current[currentIndex] || 0;

    const interval = setInterval(() => {
      questionTimeRef.current[currentIndex] = (questionTimeRef.current[currentIndex] || 0) + 1;
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, isStarted]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timerColor = timeLeft <= 60 ? 'text-red-500' : timeLeft <= 300 ? 'text-amber-500' : 'text-dark-700';
  const timerBg = timeLeft <= 60 ? 'bg-red-50' : timeLeft <= 300 ? 'bg-amber-50' : 'bg-gray-100';

  const currentQuestion = questions[currentIndex] || {};

  const handleSelectOption = (optionIndex) => {
    if (isSubmitted) return;

    setAnswers(prev => ({ ...prev, [currentIndex]: optionIndex }));
    setStatuses(prev => ({
      ...prev,
      [currentIndex]: prev[currentIndex] === QUESTION_STATUS.MARKED
        ? QUESTION_STATUS.MARKED_ANSWERED
        : QUESTION_STATUS.ANSWERED
    }));
  };

  const handleNumericalAnswer = (value) => {
    if (isSubmitted) return;
    setNumericalInput(value);
    setAnswers(prev => ({ ...prev, [currentIndex]: value }));
    setStatuses(prev => ({
      ...prev,
      [currentIndex]: prev[currentIndex] === QUESTION_STATUS.MARKED
        ? QUESTION_STATUS.MARKED_ANSWERED
        : QUESTION_STATUS.ANSWERED
    }));
  };

  const handleClearResponse = () => {
    if (isSubmitted) return;
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[currentIndex];
      return updated;
    });
    setNumericalInput('');
    setStatuses(prev => ({
      ...prev,
      [currentIndex]: prev[currentIndex] === QUESTION_STATUS.MARKED_ANSWERED
        ? QUESTION_STATUS.MARKED
        : QUESTION_STATUS.NOT_ANSWERED
    }));
  };

  const handleMarkForReview = () => {
    if (isSubmitted) return;
    setStatuses(prev => {
      const current = prev[currentIndex];
      if (current === QUESTION_STATUS.ANSWERED) return { ...prev, [currentIndex]: QUESTION_STATUS.MARKED_ANSWERED };
      if (current === QUESTION_STATUS.MARKED_ANSWERED) return { ...prev, [currentIndex]: QUESTION_STATUS.ANSWERED };
      if (current === QUESTION_STATUS.MARKED) return { ...prev, [currentIndex]: QUESTION_STATUS.NOT_ANSWERED };
      return { ...prev, [currentIndex]: QUESTION_STATUS.MARKED };
    });
  };

  const goToQuestion = (index) => {
    if (index < 0 || index >= questions.length) return;
    setCurrentIndex(index);
    setShowNavPanel(false);

    if (statuses[index] === QUESTION_STATUS.NOT_VISITED) {
      setStatuses(prev => ({ ...prev, [index]: QUESTION_STATUS.NOT_ANSWERED }));
    }

    // Set numerical input for the target question
    const q = questions[index];
    if (q?.questionType === 'Numerical' && answers[index] !== undefined) {
      setNumericalInput(String(answers[index]));
    } else {
      setNumericalInput('');
    }
  };

  const handleNext = () => goToQuestion(currentIndex + 1);
  const handlePrev = () => goToQuestion(currentIndex - 1);

  const handleAutoSubmit = useCallback(() => {
    toast('Time\'s up! Auto-submitting...', { icon: '⏰' });
    submitTest();
  }, [answers, questions, testConfig]);

  const submitTest = useCallback(async () => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    clearInterval(timerRef.current);

    const marksPerQ = testConfig?.marksPerQuestion || 4;
    const negMarks = testConfig?.negativeMarking ? (testConfig?.negativeMarks || 1) : 0;

    let correct = 0;
    let wrong = 0;
    let unattempted = 0;
    let score = 0;
    const questionResults = [];

    questions.forEach((q, i) => {
      const userAnswer = answers[i];
      const isAttempted = userAnswer !== undefined && userAnswer !== '';
      let isCorrect = false;

      if (isAttempted) {
        if (q.questionType === 'Numerical') {
          const correctAns = parseFloat(q.correctAnswer);
          const userAns = parseFloat(userAnswer);
          isCorrect = Math.abs(correctAns - userAns) < 0.01;
        } else {
          isCorrect = userAnswer === q.correctOptionIndex;
        }

        if (isCorrect) {
          correct++;
          score += marksPerQ;
        } else {
          wrong++;
          score -= negMarks;
        }
      } else {
        unattempted++;
      }

      questionResults.push({
        questionIndex: i,
        questionId: q.id,
        questionText: q.questionText,
        subject: q.subject,
        chapter: q.chapter,
        difficulty: q.difficulty,
        questionType: q.questionType,
        options: q.options,
        correctOptionIndex: q.correctOptionIndex,
        correctAnswer: q.correctAnswer,
        userAnswer,
        isAttempted,
        isCorrect,
        explanation: q.explanation,
        timeSpent: questionTimeRef.current[i] || 0
      });
    });

    const totalMarks = questions.length * marksPerQ;
    const percentage = totalMarks > 0 ? Math.round((Math.max(0, score) / totalMarks) * 100) : 0;
    const timeTaken = (testConfig?.timeLimit || 1800) - timeLeft;

    const attemptData = {
      testId,
      testName: testConfig?.name || 'Practice Test',
      examType: testConfig?.examType || '',
      subject: testConfig?.subject || 'Mixed',
      userId: user?.uid,
      userName: user?.displayName || 'Student',
      questions: questionResults,
      totalQuestions: questions.length,
      attempted: correct + wrong,
      correct,
      wrong,
      unattempted,
      score: Math.max(0, score),
      totalMarks,
      percentage,
      timeTaken,
      marksPerQuestion: marksPerQ,
      negativeMarks: negMarks,
      correctAnswers: correct
    };

    try {
      const attemptId = await saveTestAttempt(attemptData);

      // Update user stats
      const prevStats = userProfile?.stats || {};
      await updateUserProfile({
        stats: {
          testsCompleted: (prevStats.testsCompleted || 0) + 1,
          totalQuestions: (prevStats.totalQuestions || 0) + questions.length,
          correctAnswers: (prevStats.correctAnswers || 0) + correct,
          totalTime: (prevStats.totalTime || 0) + timeTaken,
          averageAccuracy: Math.round(
            (((prevStats.correctAnswers || 0) + correct) /
            ((prevStats.totalQuestions || 0) + questions.length)) * 100
          )
        }
      });

      await addLog({
        type: 'success',
        message: `Test completed: ${testConfig?.name}`,
        details: `Score: ${score}/${totalMarks} (${percentage}%)`,
        userId: user?.uid
      });

      // Store result for result page
      sessionStorage.setItem(`result_${attemptId}`, JSON.stringify(attemptData));
      navigate(`/student/result/${attemptId}`, { replace: true });
      toast.success(`Test submitted! Score: ${percentage}%`);
    } catch (error) {
      console.error('Submit error:', error);
      // Fallback: show result from local data
      const fallbackId = uuidv4();
      sessionStorage.setItem(`result_${fallbackId}`, JSON.stringify(attemptData));
      navigate(`/student/result/${fallbackId}`, { replace: true });
    }
  }, [answers, questions, testConfig, timeLeft, user, isSubmitted]);

  const handleSubmitClick = () => {
    const unanswered = questions.length - Object.keys(answers).length;
    if (unanswered > 0) {
      setShowSubmitConfirm(true);
    } else {
      submitTest();
    }
  };

  const startTest = () => {
    setShowInstructions(false);
    setIsStarted(true);
    startTimeRef.current = Date.now();
    toast.success('Test started! Good luck! 🍀');
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Stats counts
  const statusCounts = useMemo(() => {
    const counts = {
      answered: 0,
      not_answered: 0,
      marked: 0,
      marked_answered: 0,
      not_visited: 0
    };
    Object.values(statuses).forEach(s => {
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [statuses]);

  if (!testConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Instructions Screen
  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="max-w-lg w-full animate-slide-up">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white mb-6">
            <div className="text-center">
              <span className="text-5xl">📝</span>
              <h1 className="text-2xl font-extrabold mt-3">{testConfig.name}</h1>
              <p className="text-white/80 text-sm mt-1">
                {testConfig.examType} • {testConfig.subject || 'Mixed'}
              </p>
            </div>
          </div>

          <div className="card mb-4">
            <h3 className="font-bold text-dark-800 mb-4">Test Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-xl text-center">
                <p className="text-xl font-bold text-blue-600">{questions.length}</p>
                <p className="text-xs text-blue-500">Questions</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl text-center">
                <p className="text-xl font-bold text-green-600">{Math.floor(testConfig.timeLimit / 60)}m</p>
                <p className="text-xs text-green-500">Duration</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl text-center">
                <p className="text-xl font-bold text-purple-600">+{testConfig.marksPerQuestion || 4}</p>
                <p className="text-xs text-purple-500">Per Correct</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl text-center">
                <p className="text-xl font-bold text-red-600">
                  {testConfig.negativeMarking ? `-${testConfig.negativeMarks || 1}` : 'None'}
                </p>
                <p className="text-xs text-red-500">Negative</p>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <h3 className="font-bold text-dark-800 mb-3">Instructions</h3>
            <div className="space-y-2.5 text-sm text-dark-600">
              {[
                'Read each question carefully before answering.',
                'You can navigate between questions using navigation buttons.',
                'Use "Mark for Review" to flag questions you want to revisit.',
                'You can clear your response and re-answer any question.',
                'The test will auto-submit when time runs out.',
                testConfig.negativeMarking && `Wrong answers will deduct ${testConfig.negativeMarks || 1} mark(s).`,
                'Click Submit when you\'re ready to finish.'
              ].filter(Boolean).map((instruction, i) => (
                <div key={i} className="flex items-start space-x-2">
                  <span className="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p>{instruction}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card mb-4">
            <h3 className="font-bold text-dark-800 mb-3">Color Legend</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { color: 'bg-green-500', label: 'Answered' },
                { color: 'bg-red-500', label: 'Not Answered' },
                { color: 'bg-purple-500', label: 'Marked for Review' },
                { color: 'bg-gray-300', label: 'Not Visited' },
                { color: 'bg-purple-500 ring-2 ring-green-400', label: 'Marked & Answered' }
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className={`w-6 h-6 rounded-lg ${item.color}`} />
                  <span className="text-xs text-dark-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={startTest}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center space-x-2"
          >
            <FiClock size={20} />
            <span className="font-bold">Start Test</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-3 py-2.5 max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 min-w-0">
            <h2 className="text-sm font-bold text-dark-800 truncate max-w-[120px] md:max-w-none">
              {testConfig.name}
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            {/* Timer */}
            <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl ${timerBg} ${timerColor} font-mono font-bold text-sm ${
              timeLeft <= 60 ? 'animate-pulse' : ''
            }`}>
              <FiClock size={14} />
              <span>{formatTime(timeLeft)}</span>
            </div>

            {/* Question Nav Toggle */}
            <button
              onClick={() => setShowNavPanel(!showNavPanel)}
              className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all relative"
            >
              <FiGrid size={16} className="text-dark-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {currentIndex + 1}
              </span>
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="hidden md:flex w-9 h-9 bg-gray-100 rounded-xl items-center justify-center hover:bg-gray-200 transition-all"
            >
              {isFullscreen ? <FiMinimize size={16} /> : <FiMaximize size={16} />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500"
            style={{ width: `${((Object.keys(answers).length) / questions.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex relative">
        {/* Question Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-32 md:pb-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            {/* Question Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-primary-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                  {currentIndex + 1}
                </span>
                <span className="text-sm text-dark-400">of {questions.length}</span>
              </div>
              <div className="flex items-center space-x-2">
                {currentQuestion.subject && (
                  <span className="badge-primary text-[10px]">{currentQuestion.subject}</span>
                )}
                {currentQuestion.difficulty && (
                  <span className={`badge text-[10px] ${
                    currentQuestion.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                    currentQuestion.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>{currentQuestion.difficulty}</span>
                )}
                {currentQuestion.questionType && (
                  <span className="badge bg-blue-100 text-blue-700 text-[10px]">{currentQuestion.questionType}</span>
                )}
              </div>
            </div>

            {/* Question Text */}
            <div className="card mb-5">
              <p className="text-base md:text-lg text-dark-800 leading-relaxed font-medium">
                {currentQuestion.questionText}
              </p>

              {/* Question Image */}
              {currentQuestion.imageUrl && (
                <div className="mt-4 rounded-xl overflow-hidden bg-gray-50 p-2">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Question"
                    className="max-w-full h-auto mx-auto rounded-lg max-h-64 object-contain"
                  />
                </div>
              )}

              {/* SVG Diagram */}
              {currentQuestion.svgDiagram && (
                <div
                  className="mt-4 flex justify-center"
                  dangerouslySetInnerHTML={{ __html: currentQuestion.svgDiagram }}
                />
              )}

              {currentQuestion.chapter && (
                <p className="text-xs text-dark-400 mt-3">📖 Chapter: {currentQuestion.chapter}</p>
              )}
            </div>

            {/* Options / Answer Input */}
            {currentQuestion.questionType === 'Numerical' ? (
              /* Numerical Input */
              <div className="card mb-5">
                <h4 className="font-semibold text-dark-700 mb-3">Enter your answer:</h4>
                <input
                  type="number"
                  step="any"
                  value={numericalInput}
                  onChange={(e) => handleNumericalAnswer(e.target.value)}
                  placeholder="Type numerical answer here..."
                  className="input-field text-lg font-mono text-center py-4"
                  disabled={isSubmitted}
                />
              </div>
            ) : currentQuestion.questionType === 'Match the Following' ? (
              /* Match the Following */
              <div className="space-y-2 mb-5">
                {(currentQuestion.options || []).map((option, optIdx) => {
                  const isSelected = answers[currentIndex] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      disabled={isSubmitted}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98] ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50/30'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          isSelected
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-dark-500'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <p className="text-sm md:text-base text-dark-700 pt-1 flex-1">{option}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* MCQ / Assertion Reason */
              <div className="space-y-2.5 mb-5">
                {(currentQuestion.options || []).map((option, optIdx) => {
                  const isSelected = answers[currentIndex] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      disabled={isSubmitted}
                      className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98] ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-primary-200 hover:bg-primary-50/30'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          isSelected
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-dark-500'
                        }`}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <div className="flex-1 pt-1">
                          <p className="text-sm md:text-base text-dark-700">{option}</p>
                          {/* Option Image */}
                          {currentQuestion.optionImages?.[optIdx] && (
                            <img
                              src={currentQuestion.optionImages[optIdx]}
                              alt={`Option ${String.fromCharCode(65 + optIdx)}`}
                              className="mt-2 max-h-32 rounded-lg"
                            />
                          )}
                        </div>
                        {isSelected && (
                          <FiCheck className="text-primary-500 flex-shrink-0 mt-1" size={20} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={handleClearResponse}
                disabled={isSubmitted || answers[currentIndex] === undefined}
                className="px-4 py-2.5 bg-white border border-gray-200 text-dark-600 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-40 transition-all active:scale-95"
              >
                Clear Response
              </button>
              <button
                onClick={handleMarkForReview}
                disabled={isSubmitted}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 flex items-center space-x-1.5 ${
                  statuses[currentIndex] === QUESTION_STATUS.MARKED ||
                  statuses[currentIndex] === QUESTION_STATUS.MARKED_ANSWERED
                    ? 'bg-purple-500 text-white shadow-md'
                    : 'bg-white border border-purple-200 text-purple-600 hover:bg-purple-50'
                }`}
              >
                <FiBookmark size={14} />
                <span>{
                  statuses[currentIndex] === QUESTION_STATUS.MARKED ||
                  statuses[currentIndex] === QUESTION_STATUS.MARKED_ANSWERED
                    ? 'Marked' : 'Mark for Review'
                }</span>
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-between">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="btn-secondary flex items-center space-x-2 disabled:opacity-40"
              >
                <FiChevronLeft size={18} />
                <span>Previous</span>
              </button>

              <button
                onClick={handleSubmitClick}
                className="btn-danger flex items-center space-x-2"
              >
                <FiSend size={16} />
                <span>Submit Test</span>
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="btn-primary flex items-center space-x-2 disabled:opacity-40"
              >
                <span>Next</span>
                <FiChevronRight size={18} />
              </button>
            </div>
          </div>
        </main>

        {/* Desktop Question Nav Panel */}
        <aside className="hidden lg:block w-72 bg-white border-l border-gray-100 p-4 overflow-y-auto">
          <h3 className="font-bold text-dark-700 mb-3 text-sm">Question Navigation</h3>

          {/* Status Summary */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
              <div className="w-4 h-4 bg-green-500 rounded" />
              <span className="text-xs text-dark-600">{statusCounts.answered + statusCounts.marked_answered} Answered</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
              <div className="w-4 h-4 bg-red-500 rounded" />
              <span className="text-xs text-dark-600">{statusCounts.not_answered} Unanswered</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
              <div className="w-4 h-4 bg-purple-500 rounded" />
              <span className="text-xs text-dark-600">{statusCounts.marked + statusCounts.marked_answered} Marked</span>
            </div>
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
              <div className="w-4 h-4 bg-gray-300 rounded" />
              <span className="text-xs text-dark-600">{statusCounts.not_visited} Not Visited</span>
            </div>
          </div>

          {/* Question Grid */}
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, i) => {
              const status = statuses[i] || QUESTION_STATUS.NOT_VISITED;
              let bgColor = 'bg-gray-200 text-dark-500';
              if (status === QUESTION_STATUS.ANSWERED) bgColor = 'bg-green-500 text-white';
              else if (status === QUESTION_STATUS.NOT_ANSWERED) bgColor = 'bg-red-500 text-white';
              else if (status === QUESTION_STATUS.MARKED) bgColor = 'bg-purple-500 text-white';
              else if (status === QUESTION_STATUS.MARKED_ANSWERED) bgColor = 'bg-purple-500 text-white ring-2 ring-green-400';

              return (
                <button
                  key={i}
                  onClick={() => goToQuestion(i)}
                  className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all hover:scale-105 active:scale-95 ${bgColor} ${
                    i === currentIndex ? 'ring-2 ring-primary-500 ring-offset-2' : ''
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSubmitClick}
            className="w-full btn-danger mt-4 py-3 flex items-center justify-center space-x-2"
          >
            <FiSend size={16} />
            <span>Submit Test</span>
          </button>
        </aside>

        {/* Mobile Nav Panel Overlay */}
        {showNavPanel && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowNavPanel(false)} />
            <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-[70vh] overflow-y-auto animate-slide-up safe-area-bottom">
              <div className="sticky top-0 bg-white p-4 border-b border-gray-100 flex items-center justify-between rounded-t-3xl">
                <h3 className="font-bold text-dark-800">Question Navigation</h3>
                <button onClick={() => setShowNavPanel(false)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiX size={16} />
                </button>
              </div>

              <div className="p-4">
                {/* Status Summary */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
                    <div className="w-4 h-4 bg-green-500 rounded" />
                    <span className="text-xs text-dark-600">{statusCounts.answered + statusCounts.marked_answered} Answered</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-red-50 rounded-lg">
                    <div className="w-4 h-4 bg-red-500 rounded" />
                    <span className="text-xs text-dark-600">{statusCounts.not_answered} Unanswered</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                    <div className="w-4 h-4 bg-purple-500 rounded" />
                    <span className="text-xs text-dark-600">{statusCounts.marked + statusCounts.marked_answered} Marked</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-4 h-4 bg-gray-300 rounded" />
                    <span className="text-xs text-dark-600">{statusCounts.not_visited} Not Visited</span>
                  </div>
                </div>

                {/* Question Grid */}
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
                  {questions.map((_, i) => {
                    const status = statuses[i] || QUESTION_STATUS.NOT_VISITED;
                    let bgColor = 'bg-gray-200 text-dark-500';
                    if (status === QUESTION_STATUS.ANSWERED) bgColor = 'bg-green-500 text-white';
                    else if (status === QUESTION_STATUS.NOT_ANSWERED) bgColor = 'bg-red-500 text-white';
                    else if (status === QUESTION_STATUS.MARKED) bgColor = 'bg-purple-500 text-white';
                    else if (status === QUESTION_STATUS.MARKED_ANSWERED) bgColor = 'bg-purple-500 text-white ring-2 ring-green-400';

                    return (
                      <button
                        key={i}
                        onClick={() => goToQuestion(i)}
                        className={`aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all active:scale-90 ${bgColor} ${
                          i === currentIndex ? 'ring-2 ring-primary-500 ring-offset-2' : ''
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-nav md:hidden z-20 safe-area-bottom">
        <div className="flex items-center justify-between px-3 py-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center disabled:opacity-30 active:scale-90 transition-all"
          >
            <FiChevronLeft size={20} className="text-dark-600" />
          </button>

          <button
            onClick={handleMarkForReview}
            className={`w-12 h-12 rounded-xl flex items-center justify-center active:scale-90 transition-all ${
              statuses[currentIndex] === QUESTION_STATUS.MARKED ||
              statuses[currentIndex] === QUESTION_STATUS.MARKED_ANSWERED
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-purple-500'
            }`}
          >
            <FiBookmark size={20} />
          </button>

          <button
            onClick={handleSubmitClick}
            className="px-6 h-12 bg-red-500 text-white font-bold rounded-xl flex items-center justify-center space-x-1.5 active:scale-95 transition-all shadow-md"
          >
            <FiSend size={16} />
            <span className="text-sm">Submit</span>
          </button>

          <button
            onClick={() => setShowNavPanel(true)}
            className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center active:scale-90 transition-all relative"
          >
            <FiGrid size={20} className="text-dark-600" />
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === questions.length - 1}
            className="w-12 h-12 bg-primary-500 text-white rounded-xl flex items-center justify-center disabled:opacity-30 active:scale-90 transition-all shadow-md"
          >
            <FiChevronRight size={20} />
          </button>
        </div>
      </nav>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiAlertTriangle className="text-amber-500" size={28} />
              </div>
              <h3 className="text-lg font-bold text-dark-800">Submit Test?</h3>
              <p className="text-dark-500 text-sm mt-2">
                You have <span className="font-bold text-red-500">
                  {questions.length - Object.keys(answers).length}
                </span> unanswered questions.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="text-center p-2 bg-green-50 rounded-xl">
                <p className="text-lg font-bold text-green-600">{statusCounts.answered + statusCounts.marked_answered}</p>
                <p className="text-[10px] text-green-500">Answered</p>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-xl">
                <p className="text-lg font-bold text-red-600">{statusCounts.not_answered + statusCounts.not_visited}</p>
                <p className="text-[10px] text-red-500">Unanswered</p>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded-xl">
                <p className="text-lg font-bold text-purple-600">{statusCounts.marked + statusCounts.marked_answered}</p>
                <p className="text-[10px] text-purple-500">Marked</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 btn-secondary py-3"
              >
                Go Back
              </button>
              <button
                onClick={() => { setShowSubmitConfirm(false); submitTest(); }}
                className="flex-1 btn-danger py-3"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
