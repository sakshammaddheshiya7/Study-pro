import React, { useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import {
  FiCode, FiCheckCircle, FiAlertCircle, FiDatabase, FiCopy,
  FiTrash2, FiEye, FiEyeOff, FiZap, FiChevronDown
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function JsonPaste() {
  const { bulkUploadQuestions, addLog, loading } = useDatabase();
  const [jsonText, setJsonText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [parseStatus, setParseStatus] = useState(null); // null | 'success' | 'error'
  const [parseMessage, setParseMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleParse = () => {
    if (!jsonText.trim()) {
      toast.error('Please paste JSON data');
      return;
    }

    try {
      let data;

      // Try standard JSON parse
      try {
        data = JSON.parse(jsonText);
      } catch {
        // Try fixing common issues: trailing commas, single quotes
        const cleaned = jsonText
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/'/g, '"')
          .replace(/(\w+)\s*:/g, '"$1":');
        data = JSON.parse(cleaned);
      }

      const questions = Array.isArray(data) ? data : data.questions || data.data || [data];

      if (questions.length === 0) {
        setParseStatus('error');
        setParseMessage('No questions found in the JSON data');
        setParsedQuestions([]);
        return;
      }

      const validQuestions = questions.map((q, i) => ({
        examType: q.examType || q.exam_type || q.exam || 'JEE Mains',
        subject: q.subject || q.sub || 'Physics',
        chapter: q.chapter || q.chap || q.topic || '',
        difficulty: q.difficulty || q.diff || q.level || 'Medium',
        questionType: q.questionType || q.question_type || q.type || q.qtype || 'MCQ',
        questionText: q.questionText || q.question_text || q.question || q.text || q.q || '',
        options: q.options || q.opts || [
          q.optionA || q.option_a || q.a || q.A,
          q.optionB || q.option_b || q.b || q.B,
          q.optionC || q.option_c || q.c || q.C,
          q.optionD || q.option_d || q.d || q.D,
          q.optionE || q.option_e || q.e || q.E
        ].filter(Boolean),
        correctOptionIndex: q.correctOptionIndex ?? q.correct_option ?? q.correctOption ?? q.answer ?? q.ans ?? 0,
        correctAnswer: q.correctAnswer || q.correct_answer || q.numerical_answer || '',
        explanation: q.explanation || q.solution || q.sol || q.explain || '',
        imageUrl: q.imageUrl || q.image_url || q.image || q.img || '',
        svgDiagram: q.svgDiagram || q.svg_diagram || q.svg || '',
        optionImages: q.optionImages || q.option_images || [],
        tags: q.tags || [],
        year: q.year || ''
      })).filter(q => q.questionText.trim());

      if (validQuestions.length === 0) {
        setParseStatus('error');
        setParseMessage('All items were invalid or had no question text');
        setParsedQuestions([]);
        return;
      }

      setParsedQuestions(validQuestions);
      setParseStatus('success');
      setParseMessage(`Successfully parsed ${validQuestions.length} questions from ${questions.length} items`);
      toast.success(`Parsed ${validQuestions.length} questions`);
    } catch (error) {
      setParseStatus('error');
      setParseMessage(`JSON Parse Error: ${error.message}`);
      setParsedQuestions([]);
      toast.error('Invalid JSON format');
    }
  };

  const handleUpload = async () => {
    if (parsedQuestions.length === 0) {
      toast.error('No questions to upload');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 12, 90));
      }, 400);

      const count = await bulkUploadQuestions(parsedQuestions);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadComplete(true);

      await addLog({
        type: 'success',
        message: `JSON paste: ${count} questions uploaded`,
        details: `Via JSON Paste Box`
      });

      toast.success(`${count} questions uploaded!`);
    } catch (error) {
      toast.error('Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setJsonText('');
    setParsedQuestions([]);
    setParseStatus(null);
    setParseMessage('');
    setUploadComplete(false);
    setShowPreview(false);
    setUploadProgress(0);
  };

  const sampleJson = `[
  {
    "examType": "JEE Mains",
    "subject": "Physics",
    "chapter": "Mechanics",
    "difficulty": "Easy",
    "questionType": "MCQ",
    "questionText": "What is the SI unit of force?",
    "options": ["Newton", "Joule", "Watt", "Pascal"],
    "correctOptionIndex": 0,
    "explanation": "Force = mass × acceleration. SI unit is Newton (N)."
  },
  {
    "examType": "NEET",
    "subject": "Biology",
    "chapter": "Cell Biology",
    "difficulty": "Medium",
    "questionType": "MCQ",
    "questionText": "Which organelle is known as the powerhouse of the cell?",
    "options": ["Nucleus", "Ribosome", "Mitochondria", "Golgi Body"],
    "correctOptionIndex": 2,
    "explanation": "Mitochondria produces ATP through cellular respiration."
  },
  {
    "examType": "JEE Mains",
    "subject": "Mathematics",
    "chapter": "Trigonometry",
    "difficulty": "Easy",
    "questionType": "Numerical",
    "questionText": "What is the value of sin(90°)?",
    "correctAnswer": "1",
    "explanation": "sin(90°) = 1 by definition."
  }
]`;

  const loadSample = () => {
    setJsonText(sampleJson);
    toast.success('Sample loaded — click Parse to continue');
  };

  const copyFormat = () => {
    navigator.clipboard?.writeText(sampleJson);
    toast.success('Format copied to clipboard');
  };

  // Count unique subjects/exams in parsed data
  const uniqueSubjects = [...new Set(parsedQuestions.map(q => q.subject))];
  const uniqueExams = [...new Set(parsedQuestions.map(q => q.examType))];
  const uniqueDifficulties = [...new Set(parsedQuestions.map(q => q.difficulty))];

  return (
    <div className="page-container pt-16 md:pt-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-dark-800 flex items-center space-x-2">
          <FiCode className="text-primary-500" />
          <span>JSON Paste Box</span>
        </h1>
        <p className="text-dark-400 text-sm mt-1">
          Paste large JSON datasets to upload unlimited questions instantly
        </p>
      </div>

      {uploadComplete ? (
        /* Upload Complete */
        <div className="card text-center py-12 animate-slide-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-green-500" size={36} />
          </div>
          <h2 className="text-xl font-bold text-dark-800">Upload Successful!</h2>
          <p className="text-dark-400 mt-2">
            {parsedQuestions.length} questions uploaded to database
          </p>
          <p className="text-dark-300 text-sm mt-1">Students can access them instantly</p>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mt-6 mb-6">
            <div className="p-3 bg-blue-50 rounded-xl text-center">
              <p className="text-lg font-bold text-blue-600">{parsedQuestions.length}</p>
              <p className="text-[10px] text-blue-500">Uploaded</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-center">
              <p className="text-lg font-bold text-green-600">{uniqueSubjects.length}</p>
              <p className="text-[10px] text-green-500">Subjects</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl text-center">
              <p className="text-lg font-bold text-purple-600">{uniqueExams.length}</p>
              <p className="text-[10px] text-purple-500">Exams</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <button onClick={handleClear} className="flex-1 btn-primary">
              Paste More
            </button>
            <button
              onClick={() => window.location.href = '/admin/questions'}
              className="flex-1 btn-secondary"
            >
              View Questions
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={loadSample}
              className="flex items-center space-x-1.5 px-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-medium hover:bg-blue-100 transition-all"
            >
              <FiZap size={14} />
              <span>Load Sample</span>
            </button>
            <button
              onClick={copyFormat}
              className="flex items-center space-x-1.5 px-3 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-medium hover:bg-green-100 transition-all"
            >
              <FiCopy size={14} />
              <span>Copy Format</span>
            </button>
            {jsonText && (
              <button
                onClick={handleClear}
                className="flex items-center space-x-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-medium hover:bg-red-100 transition-all"
              >
                <FiTrash2 size={14} />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* JSON Text Area */}
          <div className="card mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-dark-700">Paste JSON Data</label>
              {jsonText && (
                <span className="text-xs text-dark-400">
                  {jsonText.length.toLocaleString()} characters
                </span>
              )}
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setParseStatus(null);
                setParsedQuestions([]);
              }}
              placeholder={`Paste your JSON array of questions here...\n\nExample:\n[\n  {\n    "questionText": "Your question?",\n    "options": ["A", "B", "C", "D"],\n    "correctOptionIndex": 0,\n    "subject": "Physics"\n  }\n]`}
              rows={12}
              className="input-field font-mono text-xs resize-y min-h-[200px] leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Parse Status */}
          {parseStatus && (
            <div className={`card mb-4 border-l-4 ${
              parseStatus === 'success' ? 'border-green-500' : 'border-red-500'
            } animate-slide-up`}>
              <div className="flex items-start space-x-3">
                {parseStatus === 'success' ? (
                  <FiCheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                ) : (
                  <FiAlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    parseStatus === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {parseMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Parse Button */}
          <button
            onClick={handleParse}
            disabled={!jsonText.trim() || isUploading}
            className="w-full btn-secondary py-3.5 mb-4 flex items-center justify-center space-x-2 disabled:opacity-40"
          >
            <FiCode size={18} />
            <span className="font-bold">Parse JSON</span>
          </button>

          {/* Parsed Results */}
          {parsedQuestions.length > 0 && (
            <div className="space-y-4 animate-slide-up">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="card p-3 text-center border-l-4 border-green-500">
                  <p className="text-xl font-bold text-green-600">{parsedQuestions.length}</p>
                  <p className="text-xs text-dark-400">Questions</p>
                </div>
                <div className="card p-3 text-center border-l-4 border-blue-500">
                  <p className="text-xl font-bold text-blue-600">{uniqueSubjects.length}</p>
                  <p className="text-xs text-dark-400">Subjects</p>
                </div>
                <div className="card p-3 text-center border-l-4 border-purple-500">
                  <p className="text-xl font-bold text-purple-600">{uniqueExams.length}</p>
                  <p className="text-xs text-dark-400">Exam Types</p>
                </div>
                <div className="card p-3 text-center border-l-4 border-amber-500">
                  <p className="text-xl font-bold text-amber-600">{uniqueDifficulties.length}</p>
                  <p className="text-xs text-dark-400">Difficulty Levels</p>
                </div>
              </div>

              {/* Distribution Tags */}
              <div className="card">
                <h3 className="font-semibold text-dark-700 text-sm mb-2">Distribution</h3>
                <div className="flex flex-wrap gap-1.5">
                  {uniqueSubjects.map(s => {
                    const count = parsedQuestions.filter(q => q.subject === s).length;
                    return (
                      <span key={s} className="badge-primary text-[10px]">
                        {s}: {count}
                      </span>
                    );
                  })}
                  {uniqueDifficulties.map(d => {
                    const count = parsedQuestions.filter(q => q.difficulty === d).length;
                    return (
                      <span key={d} className={`badge text-[10px] ${
                        d === 'Easy' ? 'bg-green-100 text-green-700' :
                        d === 'Medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {d}: {count}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Preview */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm text-dark-600 font-medium hover:bg-gray-100 transition-all"
              >
                <span className="flex items-center space-x-2">
                  {showPreview ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  <span>{showPreview ? 'Hide' : 'Show'} Question Preview</span>
                </span>
                <FiChevronDown size={16} className={`transition-transform ${showPreview ? 'rotate-180' : ''}`} />
              </button>

              {showPreview && (
                <div className="card max-h-80 overflow-y-auto p-0 divide-y divide-gray-50">
                  {parsedQuestions.slice(0, 30).map((q, i) => (
                    <div key={i} className="p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start space-x-2">
                        <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-dark-700 line-clamp-1">{q.questionText}</p>
                          <div className="flex flex-wrap gap-0.5 mt-1">
                            <span className="text-[8px] px-1 py-0.5 bg-blue-50 text-blue-600 rounded">{q.subject}</span>
                            <span className="text-[8px] px-1 py-0.5 bg-amber-50 text-amber-600 rounded">{q.difficulty}</span>
                            <span className="text-[8px] px-1 py-0.5 bg-gray-100 text-dark-500 rounded">{q.questionType}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {parsedQuestions.length > 30 && (
                    <div className="p-3 text-center text-xs text-dark-400">
                      + {parsedQuestions.length - 30} more questions
                    </div>
                  )}
                </div>
              )}

              {/* Progress */}
              {isUploading && (
                <div className="card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-dark-600">Uploading to Firebase...</span>
                    <span className="text-sm font-bold text-primary-500">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full btn-primary py-4 flex items-center justify-center space-x-2 text-lg disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <FiDatabase size={20} />
                    <span className="font-bold">Upload {parsedQuestions.length} Questions</span>
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Accepted Formats Info */}
      <div className="card mt-6">
        <h3 className="font-bold text-dark-700 mb-3">Accepted JSON Formats</h3>
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="font-semibold text-dark-600 mb-1">Format 1: Array of questions</p>
            <code className="text-primary-600 font-mono">[{`{"questionText": "...", ...}`}]</code>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="font-semibold text-dark-600 mb-1">Format 2: Object with questions key</p>
            <code className="text-primary-600 font-mono">{`{"questions": [{"questionText": "...", ...}]}`}</code>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl">
            <p className="font-semibold text-dark-600 mb-1">Format 3: Object with data key</p>
            <code className="text-primary-600 font-mono">{`{"data": [{"questionText": "...", ...}]}`}</code>
          </div>
        </div>
        <p className="text-xs text-dark-400 mt-3">
          💡 The parser also accepts alternate field names like <code className="text-primary-500">question</code>, <code className="text-primary-500">q</code>, <code className="text-primary-500">text</code>, <code className="text-primary-500">opts</code>, <code className="text-primary-500">ans</code>, etc.
        </p>
      </div>
    </div>
  );
}