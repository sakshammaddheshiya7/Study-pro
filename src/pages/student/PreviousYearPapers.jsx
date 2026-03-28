import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiDownload, FiExternalLink, FiSearch, FiFileText } from 'react-icons/fi';

const PYQ_DATA = {
  'JEE Mains': [
    { year: '2024', sessions: ['January', 'April'], subjects: ['Physics', 'Chemistry', 'Mathematics'] },
    { year: '2023', sessions: ['January', 'April'], subjects: ['Physics', 'Chemistry', 'Mathematics'] },
    { year: '2022', sessions: ['June', 'July'], subjects: ['Physics', 'Chemistry', 'Mathematics'] },
    { year: '2021', sessions: ['February', 'March', 'July', 'August'], subjects: ['Physics', 'Chemistry', 'Mathematics'] },
    { year: '2020', sessions: ['January', 'September'], subjects: ['Physics', 'Chemistry', 'Mathematics'] }
  ],
  'JEE Advanced': [
    { year: '2024', sessions: ['Paper 1', 'Paper 2'], subjects: ['Physics', 'Chemistry', 'Mathematics'] },
    { year: '2023', sessions: ['Paper 1', 'Paper 2'], subjects: ['Physics', 'Chemistry', 'Mathematics'] },
    { year: '2022', sessions: ['Paper 1', 'Paper 2'], subjects: ['Physics', 'Chemistry', 'Mathematics'] }
  ],
  'NEET': [
    { year: '2024', sessions: ['May'], subjects: ['Physics', 'Chemistry', 'Biology'] },
    { year: '2023', sessions: ['May'], subjects: ['Physics', 'Chemistry', 'Biology'] },
    { year: '2022', sessions: ['July'], subjects: ['Physics', 'Chemistry', 'Biology'] },
    { year: '2021', sessions: ['September'], subjects: ['Physics', 'Chemistry', 'Biology'] }
  ]
};

export default function PreviousYearPapers() {
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState('JEE Mains');
  const [expandedYear, setExpandedYear] = useState(null);

  const papers = PYQ_DATA[selectedExam] || [];

  return (
    <div className="page-container pt-4 animate-fade-in">
      <div className="flex items-center space-x-3 mb-6">
        <button onClick={() => navigate('/student')} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-dark-800">Previous Year Papers 📄</h1>
          <p className="text-xs text-dark-400">Practice with real exam papers</p>
        </div>
      </div>

      {/* Exam Selector */}
      <div className="flex space-x-2 mb-5 overflow-x-auto no-scrollbar">
        {Object.keys(PYQ_DATA).map(exam => (
          <button key={exam} onClick={() => { setSelectedExam(exam); setExpandedYear(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              selectedExam === exam ? 'bg-primary-500 text-white shadow-md' : 'bg-gray-100 text-dark-500'
            }`}
          >{exam}</button>
        ))}
      </div>

      {/* Papers List */}
      <div className="space-y-3">
        {papers.map((paper, i) => {
          const isExpanded = expandedYear === paper.year;
          return (
            <div key={i} className="card p-0 overflow-hidden">
              <button
                onClick={() => setExpandedYear(isExpanded ? null : paper.year)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg font-extrabold text-primary-600">{paper.year.slice(-2)}</span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-dark-800">{selectedExam} {paper.year}</p>
                    <p className="text-xs text-dark-400">{paper.sessions.length} session(s) • {paper.subjects.length} subjects</p>
                  </div>
                </div>
                <FiFileText size={18} className="text-dark-400" />
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 animate-slide-up">
                  {paper.sessions.map((session, si) => (
                    <div key={si} className="mt-3">
                      <p className="text-xs font-semibold text-dark-500 uppercase mb-2">{session} Session</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {paper.subjects.map((subj, subi) => (
                          <button
                            key={subi}
                            onClick={() => navigate(`/student/tests?examType=${encodeURIComponent(selectedExam)}&subject=${subj}`)}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-primary-50 hover:border-primary-200 border border-transparent transition-all group"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">{subj === 'Physics' ? '⚡' : subj === 'Chemistry' ? '🧪' : subj === 'Mathematics' ? '📐' : '🧬'}</span>
                              <span className="text-sm text-dark-700 font-medium">{subj}</span>
                            </div>
                            <FiExternalLink size={14} className="text-dark-300 group-hover:text-primary-500 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}