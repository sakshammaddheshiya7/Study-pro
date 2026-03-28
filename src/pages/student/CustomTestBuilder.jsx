import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { EXAM_TYPES, SUBJECTS, DIFFICULTY_LEVELS, QUESTION_TYPES, CHAPTERS } from '../../utils/constants';
import { FiArrowLeft, FiPlus, FiMinus, FiPlay, FiSettings, FiZap, FiTarget, FiClock, FiBookOpen, FiTrash2, FiCheckCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

export default function CustomTestBuilder() {
  const navigate = useNavigate();
  const { fetchQuestions, loading } = useDatabase();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [testName, setTestName] = useState('');
  const [sections, setSections] = useState([
    {
      id: uuidv4(),
      examType: 'JEE Mains',
      subject: 'Physics',
      difficulty: '',
      questionType: 'MCQ',
      chapter: '',
      questionCount: 10
    }
  ]);
  const [timeLimit, setTimeLimit] = useState(30);
  const [negativeMarking, setNegativeMarking] = useState(true);
  const [marksPerQuestion, setMarksPerQuestion] = useState(4);
  const [negativeMarks, setNegativeMarks] = useState(1);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [showReview, setShowReview] = useState(true);

  const addSection = () => {
    setSections(prev => [...prev, {
      id: uuidv4(),
      examType: 'JEE Mains',
      subject: 'Physics',
      difficulty: '',
      questionType: 'MCQ',
      chapter: '',
      questionCount: 10
    }]);
  };

  const removeSection = (id) => {
    if (sections.length === 1) {
      toast.error('At least one section is required');
      return;
    }
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const updateSection = (id, field, value) => {
    setSections(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, [field]: value };
      if (field === 'examType') {
        updated.subject = '';
        updated.chapter = '';
      }
      if (field === 'subject') {
        updated.chapter = '';
      }
      return updated;
    }));
  };

  const getSubjectsForSection = (examType) => {
    if (examType.includes('NEET')) return SUBJECTS.NEET;
    if (examType.includes('JEE')) return SUBJECTS.JEE;
    return SUBJECTS.ALL;
  };

  const totalQuestions = sections.reduce((sum, s) => sum + s.questionCount, 0);
  const totalMarks = totalQuestions * marksPerQuestion;

  const handleBuildTest = async () => {
    if (!testName.trim()) {
      toast.error('Please enter a test name');
      return;
    }

    try {
      let allQuestions = [];

      for (const section of sections) {
        const filters = {};
        if (section.examType) filters.examType = section.examType;
        if (section.subject) filters.subject = section.subject;
        if (section.difficulty) filters.difficulty = section.difficulty;
        if (section.questionType) filters.questionType = section.questionType;
        if (section.chapter) filters.chapter = section.chapter;

        const sectionQuestions = await fetchQuestions(filters);

        if (sectionQuestions.length === 0) {
          toast.error(`No questions found for ${section.subject || 'selected'} section`);
          continue;
        }

        const shuffled = [...sectionQuestions].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, section.questionCount);
        allQuestions = [...allQuestions, ...selected.map(q => ({
          ...q,
          sectionSubject: section.subject,
          sectionId: section.id
        }))];
      }

      if (allQuestions.length === 0) {
        toast.error('No questions available. Ask admin to upload questions.');
        return;
      }

      if (shuffleQuestions) {
        allQuestions.sort(() => Math.random() - 0.5);
      }

      const testId = uuidv4();
      const testConfig = {
        id: testId,
        name: testName,
        examType: sections[0].examType,
        subject: sections.length > 1 ? 'Mixed' : sections[0].subject,
        questions: allQuestions,
        timeLimit: timeLimit * 60,
        totalQuestions: allQuestions.length,
        marksPerQuestion,
        negativeMarking,
        negativeMarks,
        showReview,
        sections: sections.map(s => ({
          subject: s.subject,
          count: s.questionCount,
          difficulty: s.difficulty
        })),
        createdBy: user?.uid,
        isCustom: true,
        createdAt: new Date().toISOString()
      };

      sessionStorage.setItem(`test_${testId}`, JSON.stringify(testConfig));
      navigate(`/student/test/${testId}`);
      toast.success('Test created! Starting now...');
    } catch (error) {
      toast.error('Failed to build test');
      console.error(error);
    }
  };

  return (
    <div className="page-container pt-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <FiArrowLeft size={18} className="text-dark-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-dark-800">Custom Test Builder</h1>
          <p className="text-xs text-dark-400">Design your own practice test</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center space-x-2 mb-6 overflow-x-auto no-scrollbar">
        {[
          { num: 1, label: 'Sections', icon: FiBookOpen },
          { num: 2, label: 'Settings', icon: FiSettings },
          { num: 3, label: 'Review', icon: FiCheckCircle }
        ].map((s, i) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl transition-all flex-shrink-0 ${
              step === s.num
                ? 'bg-primary-500 text-white shadow-md'
                : step > s.num
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-dark-400'
            }`}
          >
            <s.icon size={16} />
            <span className="text-sm font-semibold">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Step 1: Sections */}
      {step === 1 && (
        <div className="space-y-4 animate-slide-up">
          {/* Test Name */}
          <div className="card">
            <label className="block text-sm font-semibold text-dark-700 mb-2">Test Name</label>
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g., JEE Physics Practice - Mechanics"
              className="input-field"
            />
          </div>

          {/* Sections */}
          {sections.map((section, idx) => (
            <div key={section.id} className="card border-l-4 border-primary-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-dark-800">Section {idx + 1}</h3>
                <button
                  onClick={() => removeSection(section.id)}
                  className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-100 transition-all"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-dark-500 mb-1 uppercase tracking-wide">Exam Type</label>
                  <select
                    value={section.examType}
                    onChange={(e) => updateSection(section.id, 'examType', e.target.value)}
                    className="input-field text-sm"
                  >
                    {EXAM_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-500 mb-1 uppercase tracking-wide">Subject</label>
                  <select
                    value={section.subject}
                    onChange={(e) => updateSection(section.id, 'subject', e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">Any Subject</option>
                    {getSubjectsForSection(section.examType).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-500 mb-1 uppercase tracking-wide">Difficulty</label>
                  <select
                    value={section.difficulty}
                    onChange={(e) => updateSection(section.id, 'difficulty', e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">Any Difficulty</option>
                    {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-dark-500 mb-1 uppercase tracking-wide">Question Type</label>
                  <select
                    value={section.questionType}
                    onChange={(e) => updateSection(section.id, 'questionType', e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="">Any Type</option>
                    {QUESTION_TYPES.map(qt => <option key={qt} value={qt}>{qt}</option>)}
                  </select>
                </div>

                {section.subject && CHAPTERS[section.subject] && (
                  <div>
                    <label className="block text-xs font-semibold text-dark-500 mb-1 uppercase tracking-wide">Chapter</label>
                    <select
                      value={section.chapter}
                      onChange={(e) => updateSection(section.id, 'chapter', e.target.value)}
                      className="input-field text-sm"
                    >
                      <option value="">Any Chapter</option>
                      {CHAPTERS[section.subject].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-dark-500 mb-1 uppercase tracking-wide">
                    Questions: <span className="text-primary-500">{section.questionCount}</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => updateSection(section.id, 'questionCount', Math.max(1, section.questionCount - 5))}
                      className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all"
                    >
                      <FiMinus size={16} />
                    </button>
                    <input
                      type="number"
                      value={section.questionCount}
                      onChange={(e) => updateSection(section.id, 'questionCount', Math.max(1, parseInt(e.target.value) || 1))}
                      className="input-field text-center flex-1"
                      min="1"
                      max="200"
                    />
                    <button
                      onClick={() => updateSection(section.id, 'questionCount', Math.min(200, section.questionCount + 5))}
                      className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-all"
                    >
                      <FiPlus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Section */}
          <button
            onClick={addSection}
            className="w-full py-4 border-2 border-dashed border-primary-300 rounded-2xl text-primary-500 font-semibold flex items-center justify-center space-x-2 hover:bg-primary-50 transition-all active:scale-[0.98]"
          >
            <FiPlus size={18} />
            <span>Add Section</span>
          </button>

          {/* Summary Bar */}
          <div className="card bg-dark-800 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-dark-300">Total Questions</p>
                <p className="text-2xl font-bold">{totalQuestions}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-dark-300">Sections</p>
                <p className="text-2xl font-bold">{sections.length}</p>
              </div>
            </div>
          </div>

          <button onClick={() => setStep(2)} className="w-full btn-primary py-4 text-lg">
            Next: Settings →
          </button>
        </div>
      )}

      {/* Step 2: Settings */}
      {step === 2 && (
        <div className="space-y-4 animate-slide-up">
          <div className="card">
            <h3 className="font-bold text-dark-800 mb-4 flex items-center space-x-2">
              <FiClock size={18} className="text-primary-500" />
              <span>Time Limit</span>
            </h3>
            <label className="block text-sm text-dark-500 mb-2">Duration: <span className="text-primary-500 font-bold">{timeLimit} minutes</span></label>
            <input
              type="range"
              min="5"
              max="240"
              step="5"
              value={timeLimit}
              onChange={(e) => setTimeLimit(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-xs text-dark-400 mt-2">
              <span>5m</span>
              <span>60m</span>
              <span>120m</span>
              <span>180m</span>
              <span>240m</span>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-dark-800 mb-4 flex items-center space-x-2">
              <FiTarget size={18} className="text-primary-500" />
              <span>Marking Scheme</span>
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-dark-500 mb-1 uppercase">Marks per Question</label>
                <input
                  type="number"
                  value={marksPerQuestion}
                  onChange={(e) => setMarksPerQuestion(parseInt(e.target.value) || 1)}
                  className="input-field"
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-500 mb-1 uppercase">Negative Marks</label>
                <input
                  type="number"
                  value={negativeMarks}
                  onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0)}
                  className="input-field"
                  min="0"
                  max="5"
                  step="0.25"
                  disabled={!negativeMarking}
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-dark-800 mb-4 flex items-center space-x-2">
              <FiSettings size={18} className="text-primary-500" />
              <span>Options</span>
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Negative Marking', value: negativeMarking, setter: setNegativeMarking, desc: 'Deduct marks for wrong answers' },
                { label: 'Shuffle Questions', value: shuffleQuestions, setter: setShuffleQuestions, desc: 'Randomize question order' },
                { label: 'Show Review', value: showReview, setter: setShowReview, desc: 'Allow reviewing answers after test' }
              ].map((opt, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-dark-700">{opt.label}</p>
                    <p className="text-xs text-dark-400">{opt.desc}</p>
                  </div>
                  <button
                    onClick={() => opt.setter(!opt.value)}
                    className={`relative w-12 h-7 rounded-full transition-all duration-300 ${
                      opt.value ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-300 ${
                      opt.value ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <button onClick={() => setStep(1)} className="flex-1 btn-secondary py-4">← Back</button>
            <button onClick={() => setStep(3)} className="flex-1 btn-primary py-4">Review →</button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4 animate-slide-up">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <h3 className="font-bold text-xl mb-1">{testName || 'Custom Test'}</h3>
            <p className="text-white/80 text-sm">Review your test configuration</p>
          </div>

          <div className="card">
            <h3 className="font-bold text-dark-800 mb-3">Test Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-blue-600">{totalQuestions}</p>
                <p className="text-xs text-blue-500">Questions</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-green-600">{timeLimit}m</p>
                <p className="text-xs text-green-500">Duration</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-purple-600">{totalMarks}</p>
                <p className="text-xs text-purple-500">Total Marks</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl text-center">
                <p className="text-2xl font-bold text-amber-600">{sections.length}</p>
                <p className="text-xs text-amber-500">Sections</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-dark-800 mb-3">Sections</h3>
            <div className="space-y-2">
              {sections.map((s, i) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-dark-700">{s.subject || 'Mixed'}</p>
                    <p className="text-xs text-dark-400">{s.examType} • {s.difficulty || 'All'} • {s.questionType || 'All'}</p>
                  </div>
                  <span className="badge-primary">{s.questionCount}Q</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-dark-800 mb-3">Settings</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between p-2">
                <span className="text-dark-400">Marks per Question</span>
                <span className="font-semibold text-dark-700">+{marksPerQuestion}</span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-dark-400">Negative Marking</span>
                <span className={`font-semibold ${negativeMarking ? 'text-red-500' : 'text-dark-700'}`}>
                  {negativeMarking ? `-${negativeMarks}` : 'None'}
                </span>
              </div>
              <div className="flex justify-between p-2">
                <span className="text-dark-400">Shuffle</span>
                <span className="font-semibold text-dark-700">{shuffleQuestions ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button onClick={() => setStep(2)} className="flex-1 btn-secondary py-4">← Back</button>
            <button
              onClick={handleBuildTest}
              disabled={loading}
              className="flex-1 btn-primary py-4 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiZap size={20} />
                  <span className="font-bold">Start Test</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}