import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db, collection, addDoc, getDocs, deleteDoc, doc, query, where, serverTimestamp, orderBy } from '../../config/firebase';
import { FiArrowLeft, FiPlus, FiTrash2, FiSearch, FiFilter, FiBookOpen, FiAlertCircle, FiX, FiSave, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ErrorLogBook() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const [form, setForm] = useState({
    question: '',
    myAnswer: '',
    correctAnswer: '',
    explanation: '',
    subject: 'Physics',
    chapter: '',
    mistakeType: 'concept',
    lesson: ''
  });

  const MISTAKE_TYPES = [
    { id: 'concept', label: 'Concept Error', emoji: '🧠' },
    { id: 'calculation', label: 'Calculation Error', emoji: '🔢' },
    { id: 'silly', label: 'Silly Mistake', emoji: '😅' },
    { id: 'reading', label: 'Misread Question', emoji: '👀' },
    { id: 'time', label: 'Time Pressure', emoji: '⏱️' },
    { id: 'guess', label: 'Wrong Guess', emoji: '🎲' }
  ];

  useEffect(() => { loadErrors(); }, [user]);

  const loadErrors = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const q = query(collection(db, 'errorLogs'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setErrors(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const addError = async () => {
    if (!form.question.trim()) { toast.error('Add the question'); return; }
    try {
      await addDoc(collection(db, 'errorLogs'), {
        ...form,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      toast.success('Error logged! Learn from it 💪');
      setForm({ question: '', myAnswer: '', correctAnswer: '', explanation: '', subject: 'Physics', chapter: '', mistakeType: 'concept', lesson: '' });
      setShowAdd(false);
      loadErrors();
    } catch (error) { toast.error('Failed to save'); }
  };

  const deleteError = async (id) => {
    try {
      await deleteDoc(doc(db, 'errorLogs', id));
      setErrors(prev => prev.filter(e => e.id !== id));
      toast.success('Removed');
    } catch (error) { toast.error('Failed'); }
  };

  const filteredErrors = errors.filter(e => {
    let match = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      match = e.question?.toLowerCase().includes(q) || e.chapter?.toLowerCase().includes(q);
    }
    if (filterSubject) match = match && e.subject === filterSubject;
    return match;
  });

  const mistakeStats = {};
  errors.forEach(e => { mistakeStats[e.mistakeType] = (mistakeStats[e.mistakeType] || 0) + 1; });

  return (
    <div className="page-container pt-4 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-dark-800">Error Log Book 📕</h1>
            <p className="text-xs text-dark-400">{errors.length} mistakes logged</p>
          </div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${showAdd ? 'bg-dark-700 text-white' : 'bg-primary-500 text-white'}`}>
          {showAdd ? <FiX size={18} /> : <FiPlus size={18} />}
        </button>
      </div>

      {/* Mistake Stats */}
      {errors.length > 0 && (
        <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
          {MISTAKE_TYPES.filter(m => mistakeStats[m.id]).map(m => (
            <div key={m.id} className="flex-shrink-0 px-3 py-2 bg-white rounded-xl shadow-sm text-center min-w-[80px]">
              <span className="text-xl">{m.emoji}</span>
              <p className="text-lg font-bold text-dark-800">{mistakeStats[m.id]}</p>
              <p className="text-[9px] text-dark-400">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <div className="card mb-5 border-2 border-primary-200 animate-slide-up">
          <h3 className="font-bold text-dark-800 mb-4">Log a Mistake</h3>
          <div className="space-y-3">
            <textarea value={form.question} onChange={(e) => setForm(p => ({ ...p, question: e.target.value }))} placeholder="What was the question?" rows={2} className="input-field text-sm resize-y" />
            <div className="grid grid-cols-2 gap-3">
              <input type="text" value={form.myAnswer} onChange={(e) => setForm(p => ({ ...p, myAnswer: e.target.value }))} placeholder="Your answer" className="input-field text-sm" />
              <input type="text" value={form.correctAnswer} onChange={(e) => setForm(p => ({ ...p, correctAnswer: e.target.value }))} placeholder="Correct answer" className="input-field text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={form.subject} onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))} className="input-field text-sm">
                <option>Physics</option><option>Chemistry</option><option>Mathematics</option><option>Biology</option>
              </select>
              <input type="text" value={form.chapter} onChange={(e) => setForm(p => ({ ...p, chapter: e.target.value }))} placeholder="Chapter" className="input-field text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase">Mistake Type</label>
              <div className="grid grid-cols-3 gap-2">
                {MISTAKE_TYPES.map(m => (
                  <button key={m.id} onClick={() => setForm(p => ({ ...p, mistakeType: m.id }))}
                    className={`p-2 rounded-xl text-center text-xs transition-all ${form.mistakeType === m.id ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-300' : 'bg-gray-50 text-dark-500'}`}
                  >
                    <span className="text-lg block">{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <textarea value={form.explanation} onChange={(e) => setForm(p => ({ ...p, explanation: e.target.value }))} placeholder="Why did you get it wrong?" rows={2} className="input-field text-sm resize-y" />
            <input type="text" value={form.lesson} onChange={(e) => setForm(p => ({ ...p, lesson: e.target.value }))} placeholder="Lesson learned (what to remember)" className="input-field text-sm" />
            <button onClick={addError} className="w-full btn-primary py-3 flex items-center justify-center space-x-2">
              <FiSave size={16} /><span>Save Error Log</span>
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={14} />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search errors..." className="input-field pl-9 text-sm py-2" />
        </div>
        <select value={filterSubject} onChange={(e) => setFilterSubject(e.target.value)} className="input-field text-sm py-2 w-auto">
          <option value="">All</option><option>Physics</option><option>Chemistry</option><option>Mathematics</option><option>Biology</option>
        </select>
      </div>

      {/* Error List */}
      {filteredErrors.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-3">📕</p>
          <p className="text-dark-500 font-medium">{errors.length === 0 ? 'No errors logged' : 'No matching errors'}</p>
          <p className="text-dark-400 text-sm mt-1">Log mistakes to avoid repeating them</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredErrors.map(err => {
            const mistakeConfig = MISTAKE_TYPES.find(m => m.id === err.mistakeType) || MISTAKE_TYPES[0];
            const isExpanded = expandedId === err.id;
            return (
              <div key={err.id} className="card p-0 overflow-hidden border-l-4 border-red-400">
                <button onClick={() => setExpandedId(isExpanded ? null : err.id)} className="w-full p-4 text-left hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2 flex-1 min-w-0">
                      <span className="text-lg">{mistakeConfig.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-dark-700 font-medium line-clamp-2">{err.question}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="badge-primary text-[9px]">{err.subject}</span>
                          {err.chapter && <span className="badge bg-gray-100 text-dark-500 text-[9px]">{err.chapter}</span>}
                          <span className="badge bg-red-100 text-red-600 text-[9px]">{mistakeConfig.label}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <button onClick={(e) => { e.stopPropagation(); deleteError(err.id); }} className="p-1 text-dark-300 hover:text-red-500"><FiTrash2 size={12} /></button>
                      {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                    </div>
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-gray-100 space-y-2 animate-slide-up">
                    <div className="grid grid-cols-2 gap-2 pt-3">
                      <div className="p-2 bg-red-50 rounded-lg"><p className="text-[10px] text-dark-400">Your Answer</p><p className="text-sm text-red-600 font-medium">{err.myAnswer || '-'}</p></div>
                      <div className="p-2 bg-green-50 rounded-lg"><p className="text-[10px] text-dark-400">Correct Answer</p><p className="text-sm text-green-600 font-medium">{err.correctAnswer || '-'}</p></div>
                    </div>
                    {err.explanation && <div className="p-2 bg-blue-50 rounded-lg"><p className="text-[10px] text-dark-400">Why I got it wrong</p><p className="text-sm text-blue-700">{err.explanation}</p></div>}
                    {err.lesson && <div className="p-2 bg-amber-50 rounded-lg"><p className="text-[10px] text-dark-400">💡 Lesson</p><p className="text-sm text-amber-700 font-medium">{err.lesson}</p></div>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}