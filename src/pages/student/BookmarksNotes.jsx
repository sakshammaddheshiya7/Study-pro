import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { db, collection, getDocs, addDoc, deleteDoc, doc, query, where, serverTimestamp } from '../../config/firebase';
import { FiArrowLeft, FiBookmark, FiEdit3, FiTrash2, FiPlus, FiSearch, FiX, FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function BookmarksNotes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState('notes');
  const [loading, setLoading] = useState(true);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteForm, setNoteForm] = useState({ title: '', content: '', subject: 'General', color: '#F97316' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const notesSnap = await getDocs(query(collection(db, 'notes'), where('userId', '==', user.uid)));
      setNotes(notesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const addNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) { toast.error('Fill all fields'); return; }
    try {
      await addDoc(collection(db, 'notes'), {
        ...noteForm,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
      toast.success('Note saved');
      setNoteForm({ title: '', content: '', subject: 'General', color: '#F97316' });
      setShowAddNote(false);
      loadData();
    } catch (error) { toast.error('Failed to save note'); }
  };

  const deleteNote = async (id) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
      setNotes(prev => prev.filter(n => n.id !== id));
      toast.success('Note deleted');
    } catch (error) { toast.error('Delete failed'); }
  };

  const filteredNotes = notes.filter(n => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
  });

  const COLORS = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#EF4444'];

  return (
    <div className="page-container pt-4 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <FiArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-dark-800">Bookmarks & Notes 📌</h1>
            <p className="text-xs text-dark-400">{notes.length} notes saved</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddNote(!showAddNote)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all ${showAddNote ? 'bg-dark-700 text-white' : 'bg-primary-500 text-white'}`}
        >
          {showAddNote ? <FiX size={18} /> : <FiPlus size={18} />}
        </button>
      </div>

      {/* Add Note Form */}
      {showAddNote && (
        <div className="card mb-5 border-2 border-primary-200 animate-slide-up">
          <h3 className="font-bold text-dark-800 mb-3">New Note</h3>
          <input
            type="text" value={noteForm.title}
            onChange={(e) => setNoteForm(p => ({ ...p, title: e.target.value }))}
            placeholder="Note title..." className="input-field mb-3"
          />
          <textarea
            value={noteForm.content}
            onChange={(e) => setNoteForm(p => ({ ...p, content: e.target.value }))}
            placeholder="Write your note here..." rows={4} className="input-field mb-3 resize-y"
          />
          <div className="flex items-center justify-between mb-4">
            <select value={noteForm.subject} onChange={(e) => setNoteForm(p => ({ ...p, subject: e.target.value }))} className="input-field w-auto text-sm py-2">
              <option>General</option><option>Physics</option><option>Chemistry</option><option>Mathematics</option><option>Biology</option>
            </select>
            <div className="flex space-x-2">
              {COLORS.map(c => (
                <button key={c} onClick={() => setNoteForm(p => ({ ...p, color: c }))} className={`w-7 h-7 rounded-full border-2 ${noteForm.color === c ? 'border-dark-800 scale-110' : 'border-transparent'}`} style={{ background: c }} />
              ))}
            </div>
          </div>
          <button onClick={addNote} className="w-full btn-primary py-3 flex items-center justify-center space-x-2">
            <FiSave size={16} /><span>Save Note</span>
          </button>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search notes..." className="input-field pl-10 text-sm py-2.5" />
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-4"><div className="w-full h-20 bg-gray-100 rounded skeleton" /></div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-3">📝</p>
          <p className="text-dark-500 font-medium">No notes yet</p>
          <p className="text-dark-400 text-sm mt-1">Tap + to create your first note</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredNotes.map(note => (
            <div key={note.id} className="card p-4 border-l-4 hover:shadow-card-hover transition-all" style={{ borderLeftColor: note.color }}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-dark-800 text-sm">{note.title}</h3>
                <button onClick={() => deleteNote(note.id)} className="p-1 text-dark-300 hover:text-red-500">
                  <FiTrash2 size={14} />
                </button>
              </div>
              <p className="text-xs text-dark-500 line-clamp-3 mb-2">{note.content}</p>
              <div className="flex items-center justify-between">
                <span className="badge text-[9px]" style={{ background: `${note.color}20`, color: note.color }}>{note.subject}</span>
                <span className="text-[10px] text-dark-400">
                  {note.createdAt?.toDate ? note.createdAt.toDate().toLocaleDateString() : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}