import React, { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { EXAM_TYPES, SUBJECTS, DIFFICULTY_LEVELS, QUESTION_TYPES, CHAPTERS } from '../../utils/constants';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiX, FiChevronDown,
  FiChevronUp, FiSave, FiImage, FiFile, FiRefreshCw, FiCopy,
  FiCheck, FiAlertCircle, FiDatabase, FiEye, FiEyeOff
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const emptyQuestion = {
  examType: 'JEE Mains',
  subject: 'Physics',
  chapter: '',
  difficulty: 'Medium',
  questionType: 'MCQ',
  questionText: '',
  options: ['', '', '', ''],
  correctOptionIndex: 0,
  correctAnswer: '',
  explanation: '',
  imageUrl: '',
  svgDiagram: '',
  optionImages: ['', '', '', ''],
  tags: [],
  year: ''
};

export default function QuestionManager() {
  const {
    fetchQuestions, addQuestion, updateQuestion, deleteQuestion,
    uploadFile, loading, addLog
  } = useDatabase();

  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...emptyQuestion });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterExam, setFilterExam] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedQ, setExpandedQ] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showOptionImages, setShowOptionImages] = useState(false);

  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const filters = {};
    if (filterExam) filters.examType = filterExam;
    if (filterSubject) filters.subject = filterSubject;
    if (filterDifficulty) filters.difficulty = filterDifficulty;
    const result = await fetchQuestions(filters);
    setQuestions(result);
  };

  useEffect(() => {
    loadQuestions();
  }, [filterExam, filterSubject, filterDifficulty]);

  const filteredQuestions = questions.filter(q => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.questionText?.toLowerCase().includes(query) ||
      q.chapter?.toLowerCase().includes(query) ||
      q.subject?.toLowerCase().includes(query) ||
      q.examType?.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = filteredQuestions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const availableChapters = formData.subject ? (CHAPTERS[formData.subject] || []) : [];
  const availableSubjects = formData.examType?.includes('NEET')
    ? SUBJECTS.NEET
    : formData.examType?.includes('JEE')
      ? SUBJECTS.JEE
      : SUBJECTS.ALL;

  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'examType') {
        updated.subject = '';
        updated.chapter = '';
      }
      if (field === 'subject') {
        updated.chapter = '';
      }
      if (field === 'questionType') {
        if (value === 'Numerical') {
          updated.options = [];
          updated.correctOptionIndex = -1;
        } else if (prev.options.length === 0) {
          updated.options = ['', '', '', ''];
          updated.correctOptionIndex = 0;
        }
      }
      return updated;
    });
  };

  const handleOptionChange = (index, value) => {
    setFormData(prev => {
      const options = [...prev.options];
      options[index] = value;
      return { ...prev, options };
    });
  };

  const handleOptionImageChange = (index, value) => {
    setFormData(prev => {
      const optionImages = [...(prev.optionImages || ['', '', '', ''])];
      optionImages[index] = value;
      return { ...prev, optionImages };
    });
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, ''],
      optionImages: [...(prev.optionImages || []), '']
    }));
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      toast.error('Minimum 2 options required');
      return;
    }
    setFormData(prev => {
      const options = prev.options.filter((_, i) => i !== index);
      const optionImages = (prev.optionImages || []).filter((_, i) => i !== index);
      let correctIdx = prev.correctOptionIndex;
      if (correctIdx === index) correctIdx = 0;
      else if (correctIdx > index) correctIdx--;
      return { ...prev, options, optionImages, correctOptionIndex: correctIdx };
    });
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const url = await uploadFile(file, 'question-images');
      if (field.startsWith('optionImage_')) {
        const idx = parseInt(field.split('_')[1]);
        handleOptionImageChange(idx, url);
      } else {
        handleFormChange(field, url);
      }
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    if (!formData.questionText.trim()) {
      toast.error('Question text is required');
      return false;
    }
    if (!formData.examType) {
      toast.error('Select exam type');
      return false;
    }
    if (!formData.subject) {
      toast.error('Select subject');
      return false;
    }
    if (formData.questionType !== 'Numerical') {
      if (formData.options.some(o => !o.trim())) {
        toast.error('All options must be filled');
        return false;
      }
      if (formData.correctOptionIndex < 0 || formData.correctOptionIndex >= formData.options.length) {
        toast.error('Select correct option');
        return false;
      }
    } else {
      if (!formData.correctAnswer?.toString().trim()) {
        toast.error('Correct answer is required for numerical questions');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const data = { ...formData };
      // Clean empty option images
      data.optionImages = (data.optionImages || []).map(img => img || '');

      if (editingId) {
        await updateQuestion(editingId, data);
        await addLog({ type: 'success', message: 'Question updated', details: `ID: ${editingId}` });
      } else {
        await addQuestion(data);
        await addLog({ type: 'success', message: 'Question added', details: data.subject });
      }

      resetForm();
      loadQuestions();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (question) => {
    setFormData({
      examType: question.examType || 'JEE Mains',
      subject: question.subject || 'Physics',
      chapter: question.chapter || '',
      difficulty: question.difficulty || 'Medium',
      questionType: question.questionType || 'MCQ',
      questionText: question.questionText || '',
      options: question.options || ['', '', '', ''],
      correctOptionIndex: question.correctOptionIndex ?? 0,
      correctAnswer: question.correctAnswer || '',
      explanation: question.explanation || '',
      imageUrl: question.imageUrl || '',
      svgDiagram: question.svgDiagram || '',
      optionImages: question.optionImages || ['', '', '', ''],
      tags: question.tags || [],
      year: question.year || ''
    });
    setEditingId(question.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    try {
      await deleteQuestion(id);
      await addLog({ type: 'success', message: 'Question deleted', details: `ID: ${id}` });
      setDeleteConfirm(null);
      loadQuestions();
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({ ...emptyQuestion });
    setEditingId(null);
    setShowForm(false);
    setShowOptionImages(false);
  };

  const duplicateQuestion = (question) => {
    setFormData({
      examType: question.examType || 'JEE Mains',
      subject: question.subject || 'Physics',
      chapter: question.chapter || '',
      difficulty: question.difficulty || 'Medium',
      questionType: question.questionType || 'MCQ',
      questionText: question.questionText || '',
      options: [...(question.options || ['', '', '', ''])],
      correctOptionIndex: question.correctOptionIndex ?? 0,
      correctAnswer: question.correctAnswer || '',
      explanation: question.explanation || '',
      imageUrl: question.imageUrl || '',
      svgDiagram: question.svgDiagram || '',
      optionImages: [...(question.optionImages || ['', '', '', ''])],
      tags: [...(question.tags || [])],
      year: question.year || ''
    });
    setEditingId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success('Question duplicated — edit and save');
  };

  return (
    <div className="page-container pt-16 md:pt-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-800">Question Manager</h1>
          <p className="text-dark-400 text-sm mt-1">
            <FiDatabase className="inline mr-1" size={14} />
            {questions.length} questions in database
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className={`btn-primary flex items-center justify-center space-x-2 ${showForm ? 'bg-dark-700 hover:bg-dark-800' : ''}`}
        >
          {showForm ? <FiX size={18} /> : <FiPlus size={18} />}
          <span>{showForm ? 'Close Form' : 'Add Question'}</span>
        </button>
      </div>

      {/* Question Form */}
      {showForm && (
        <div className="card mb-6 border-2 border-primary-200 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-dark-800">
              {editingId ? '✏️ Edit Question' : '➕ New Question'}
            </h2>
            <button onClick={resetForm} className="text-dark-400 hover:text-dark-600">
              <FiX size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {/* Exam Type */}
            <div>
              <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">
                Exam Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.examType}
                onChange={(e) => handleFormChange('examType', e.target.value)}
                className="input-field text-sm"
              >
                {EXAM_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subject}
                onChange={(e) => handleFormChange('subject', e.target.value)}
                className="input-field text-sm"
              >
                <option value="">Select Subject</option>
                {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Chapter */}
            <div>
              <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">Chapter</label>
              <select
                value={formData.chapter}
                onChange={(e) => handleFormChange('chapter', e.target.value)}
                className="input-field text-sm"
              >
                <option value="">Select Chapter</option>
                {availableChapters.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">
                Difficulty <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                {DIFFICULTY_LEVELS.map(d => (
                  <button
                    key={d}
                    onClick={() => handleFormChange('difficulty', d)}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      formData.difficulty === d
                        ? d === 'Easy' ? 'bg-green-500 text-white shadow-md'
                          : d === 'Medium' ? 'bg-amber-500 text-white shadow-md'
                            : 'bg-red-500 text-white shadow-md'
                        : 'bg-gray-100 text-dark-500 hover:bg-gray-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">
                Question Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.questionType}
                onChange={(e) => handleFormChange('questionType', e.target.value)}
                className="input-field text-sm"
              >
                {QUESTION_TYPES.map(qt => <option key={qt} value={qt}>{qt}</option>)}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">Year (Optional)</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => handleFormChange('year', e.target.value)}
                placeholder="e.g., 2024"
                className="input-field text-sm"
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">
              Question Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.questionText}
              onChange={(e) => handleFormChange('questionText', e.target.value)}
              placeholder="Enter the full question text here..."
              rows={4}
              className="input-field text-sm resize-y min-h-[100px]"
            />
          </div>

          {/* Question Image */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">
              <FiImage className="inline mr-1" size={12} /> Question Image (Optional)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={formData.imageUrl}
                onChange={(e) => handleFormChange('imageUrl', e.target.value)}
                placeholder="Image URL or upload below"
                className="input-field text-sm flex-1"
              />
              <label className="btn-secondary text-xs cursor-pointer flex items-center space-x-1 px-3 py-2.5 flex-shrink-0">
                <FiImage size={14} />
                <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'imageUrl')}
                  disabled={uploadingImage}
                />
              </label>
            </div>
            {formData.imageUrl && (
              <div className="mt-2 relative inline-block">
                <img src={formData.imageUrl} alt="Preview" className="max-h-32 rounded-lg border" />
                <button
                  onClick={() => handleFormChange('imageUrl', '')}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <FiX size={12} />
                </button>
              </div>
            )}
          </div>

          {/* SVG Diagram */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">
              SVG Diagram (Optional)
            </label>
            <textarea
              value={formData.svgDiagram}
              onChange={(e) => handleFormChange('svgDiagram', e.target.value)}
              placeholder='Paste SVG code here, e.g., <svg>...</svg>'
              rows={3}
              className="input-field text-sm font-mono resize-y"
            />
            {formData.svgDiagram && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg border" dangerouslySetInnerHTML={{ __html: formData.svgDiagram }} />
            )}
          </div>

          {/* Options Section (for non-Numerical) */}
          {formData.questionType !== 'Numerical' ? (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-dark-500 uppercase tracking-wide">
                  Options <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowOptionImages(!showOptionImages)}
                    className="text-xs text-primary-500 font-medium flex items-center space-x-1"
                  >
                    {showOptionImages ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                    <span>Option Images</span>
                  </button>
                  <button
                    onClick={addOption}
                    className="text-xs text-primary-500 font-semibold flex items-center space-x-1"
                  >
                    <FiPlus size={12} />
                    <span>Add Option</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {formData.options.map((option, idx) => (
                  <div key={idx}>
                    <div className="flex items-start space-x-2">
                      {/* Correct Option Radio */}
                      <button
                        onClick={() => handleFormChange('correctOptionIndex', idx)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 transition-all ${
                          formData.correctOptionIndex === idx
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-100 text-dark-400 hover:bg-gray-200'
                        }`}
                        title={formData.correctOptionIndex === idx ? 'Correct answer' : 'Set as correct'}
                      >
                        {formData.correctOptionIndex === idx ? <FiCheck size={14} /> : String.fromCharCode(65 + idx)}
                      </button>

                      {/* Option Input */}
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className="input-field text-sm flex-1"
                      />

                      {/* Remove Option */}
                      <button
                        onClick={() => removeOption(idx)}
                        className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-100 transition-all flex-shrink-0 mt-0.5"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>

                    {/* Option Image */}
                    {showOptionImages && (
                      <div className="ml-11 mt-1.5 flex items-center space-x-2">
                        <input
                          type="text"
                          value={formData.optionImages?.[idx] || ''}
                          onChange={(e) => handleOptionImageChange(idx, e.target.value)}
                          placeholder="Option image URL (optional)"
                          className="input-field text-xs flex-1 py-2"
                        />
                        <label className="px-2 py-2 bg-gray-100 text-dark-500 rounded-lg text-xs cursor-pointer hover:bg-gray-200 flex-shrink-0">
                          <FiImage size={12} />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, `optionImage_${idx}`)}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-xs text-dark-400 mt-2">
                <FiCheck className="inline text-green-500 mr-1" size={12} />
                Click the letter button to mark the correct answer. Green = Correct
              </p>
            </div>
          ) : (
            /* Numerical Answer */
            <div className="mb-4">
              <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">
                Correct Answer (Numerical) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.correctAnswer}
                onChange={(e) => handleFormChange('correctAnswer', e.target.value)}
                placeholder="Enter the correct numerical answer"
                className="input-field text-sm font-mono"
              />
            </div>
          )}

          {/* Explanation */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">
              Explanation (Optional but recommended)
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => handleFormChange('explanation', e.target.value)}
              placeholder="Provide a detailed explanation for the correct answer..."
              rows={3}
              className="input-field text-sm resize-y"
            />
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 btn-primary py-3.5 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiSave size={18} />
                  <span className="font-bold">{editingId ? 'Update Question' : 'Save Question'}</span>
                </>
              )}
            </button>
            <button onClick={resetForm} className="btn-secondary py-3.5">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search questions..."
              className="input-field pl-10 text-sm py-2.5"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <FiX size={16} className="text-dark-400" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2.5 rounded-xl flex items-center space-x-1.5 transition-all ${
              showFilters ? 'bg-primary-500 text-white' : 'bg-white text-dark-600 border border-dark-200'
            }`}
          >
            <FiFilter size={14} />
            <span className="text-sm font-medium hidden sm:inline">Filters</span>
          </button>
          <button
            onClick={loadQuestions}
            className="px-3 py-2.5 rounded-xl bg-white text-dark-600 border border-dark-200 hover:bg-gray-50 transition-all"
          >
            <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl animate-slide-up">
            <select
              value={filterExam}
              onChange={(e) => { setFilterExam(e.target.value); setCurrentPage(1); }}
              className="input-field text-xs py-2 w-auto min-w-[120px]"
            >
              <option value="">All Exams</option>
              {EXAM_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
            <select
              value={filterSubject}
              onChange={(e) => { setFilterSubject(e.target.value); setCurrentPage(1); }}
              className="input-field text-xs py-2 w-auto min-w-[120px]"
            >
              <option value="">All Subjects</option>
              {SUBJECTS.ALL.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={filterDifficulty}
              onChange={(e) => { setFilterDifficulty(e.target.value); setCurrentPage(1); }}
              className="input-field text-xs py-2 w-auto min-w-[100px]"
            >
              <option value="">All Difficulty</option>
              {DIFFICULTY_LEVELS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button
              onClick={() => { setFilterExam(''); setFilterSubject(''); setFilterDifficulty(''); setCurrentPage(1); }}
              className="px-3 py-2 text-xs text-primary-500 font-semibold hover:bg-primary-50 rounded-lg"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-dark-400">
          Showing {paginatedQuestions.length} of {filteredQuestions.length} questions
        </p>
        {totalPages > 1 && (
          <p className="text-sm text-dark-400">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      {/* Questions List */}
      {paginatedQuestions.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">{searchQuery ? '🔍' : '📭'}</p>
          <h3 className="text-lg font-bold text-dark-700">
            {searchQuery ? 'No matching questions' : 'No questions yet'}
          </h3>
          <p className="text-dark-400 text-sm mt-2">
            {searchQuery ? 'Try different search terms' : 'Click "Add Question" to create your first question'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {paginatedQuestions.map((q, idx) => {
            const isExpanded = expandedQ === q.id;
            return (
              <div key={q.id} className="card p-0 overflow-hidden">
                {/* Question Header */}
                <button
                  onClick={() => setExpandedQ(isExpanded ? null : q.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-dark-700 line-clamp-2 font-medium">{q.questionText}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        <span className="badge-primary text-[9px]">{q.examType}</span>
                        <span className="badge-success text-[9px]">{q.subject}</span>
                        <span className={`badge text-[9px] ${
                          q.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>{q.difficulty}</span>
                        <span className="badge bg-blue-100 text-blue-700 text-[9px]">{q.questionType}</span>
                        {q.chapter && <span className="badge bg-gray-100 text-dark-500 text-[9px]">{q.chapter}</span>}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      {isExpanded ? <FiChevronUp size={16} className="text-dark-400" /> : <FiChevronDown size={16} className="text-dark-400" />}
                    </div>
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 animate-slide-up">
                    {/* Options / Answer */}
                    {q.questionType !== 'Numerical' && q.options && (
                      <div className="mt-3 space-y-1.5">
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className={`flex items-start space-x-2 p-2.5 rounded-xl text-sm ${
                            optIdx === q.correctOptionIndex
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50'
                          }`}>
                            <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              optIdx === q.correctOptionIndex
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-dark-500'
                            }`}>
                              {String.fromCharCode(65 + optIdx)}
                            </span>
                            <span className="text-dark-600">{opt}</span>
                            {optIdx === q.correctOptionIndex && (
                              <FiCheck className="text-green-500 flex-shrink-0 ml-auto" size={14} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.questionType === 'Numerical' && (
                      <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-sm text-green-700">
                          <span className="font-semibold">Correct Answer:</span> {q.correctAnswer}
                        </p>
                      </div>
                    )}

                    {q.explanation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
                        <p className="text-xs font-semibold text-blue-700 mb-1">Explanation:</p>
                        <p className="text-sm text-blue-600">{q.explanation}</p>
                      </div>
                    )}

                    {q.imageUrl && (
                      <div className="mt-3">
                        <img src={q.imageUrl} alt="Question" className="max-h-40 rounded-lg border" />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(q)}
                        className="flex items-center space-x-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-medium hover:bg-blue-100 transition-all"
                      >
                        <FiEdit2 size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => duplicateQuestion(q)}
                        className="flex items-center space-x-1.5 px-3 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-medium hover:bg-green-100 transition-all"
                      >
                        <FiCopy size={12} />
                        <span>Duplicate</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(q.id)}
                        className="flex items-center space-x-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-medium hover:bg-red-100 transition-all ml-auto"
                      >
                        <FiTrash2 size={12} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-50 transition-all"
          >
            Previous
          </button>
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page;
              if (totalPages <= 5) page = i + 1;
              else if (currentPage <= 3) page = i + 1;
              else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
              else page = currentPage - 2 + i;

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-white border border-gray-200 text-dark-600 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-50 transition-all"
          >
            Next
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiAlertCircle className="text-red-500" size={28} />
              </div>
              <h3 className="text-lg font-bold text-dark-800">Delete Question?</h3>
              <p className="text-dark-500 text-sm mt-2">This action cannot be undone.</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn-secondary py-3"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 btn-danger py-3"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}