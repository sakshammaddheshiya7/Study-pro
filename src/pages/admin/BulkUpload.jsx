import React, { useState, useCallback } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import { useDropzone } from 'react-dropzone';
import {
  FiUpload, FiFile, FiCheckCircle, FiAlertCircle, FiX,
  FiDownload, FiDatabase, FiLoader, FiList, FiEye
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function BulkUpload() {
  const { bulkUploadQuestions, addLog, loading } = useDatabase();
  const [uploadedData, setUploadedData] = useState(null);
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      toast.error('CSV must have at least a header row and one data row');
      return [];
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const questions = [];
    const parseErrors = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        // Handle commas inside quotes
        const values = [];
        let current = '';
        let inQuotes = false;

        for (const char of lines[i]) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());

        if (values.length < 4) {
          parseErrors.push(`Row ${i + 1}: Not enough columns`);
          continue;
        }

        const row = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || '';
        });

        const question = {
          examType: row.examType || row.exam_type || row.exam || 'JEE Mains',
          subject: row.subject || 'Physics',
          chapter: row.chapter || '',
          difficulty: row.difficulty || 'Medium',
          questionType: row.questionType || row.question_type || row.type || 'MCQ',
          questionText: row.questionText || row.question_text || row.question || '',
          options: [
            row.optionA || row.option_a || row.A || '',
            row.optionB || row.option_b || row.B || '',
            row.optionC || row.option_c || row.C || '',
            row.optionD || row.option_d || row.D || ''
          ].filter(o => o),
          correctOptionIndex: parseInt(row.correctOption || row.correct_option || row.answer || '0'),
          correctAnswer: row.correctAnswer || row.correct_answer || '',
          explanation: row.explanation || '',
          imageUrl: row.imageUrl || row.image_url || '',
          tags: row.tags ? row.tags.split(';').map(t => t.trim()) : [],
          year: row.year || ''
        };

        if (!question.questionText) {
          parseErrors.push(`Row ${i + 1}: Missing question text`);
          continue;
        }

        questions.push(question);
      } catch (error) {
        parseErrors.push(`Row ${i + 1}: Parse error - ${error.message}`);
      }
    }

    setErrors(parseErrors);
    return questions;
  };

  const parseJSON = (text) => {
    try {
      const data = JSON.parse(text);
      const questions = Array.isArray(data) ? data : data.questions || [data];
      const parseErrors = [];

      const validQuestions = questions.filter((q, i) => {
        if (!q.questionText && !q.question_text && !q.question) {
          parseErrors.push(`Item ${i + 1}: Missing question text`);
          return false;
        }
        return true;
      }).map(q => ({
        examType: q.examType || q.exam_type || 'JEE Mains',
        subject: q.subject || 'Physics',
        chapter: q.chapter || '',
        difficulty: q.difficulty || 'Medium',
        questionType: q.questionType || q.question_type || 'MCQ',
        questionText: q.questionText || q.question_text || q.question || '',
        options: q.options || [q.optionA, q.optionB, q.optionC, q.optionD].filter(Boolean) || [],
        correctOptionIndex: q.correctOptionIndex ?? q.correct_option ?? q.answer ?? 0,
        correctAnswer: q.correctAnswer || q.correct_answer || '',
        explanation: q.explanation || '',
        imageUrl: q.imageUrl || q.image_url || '',
        svgDiagram: q.svgDiagram || q.svg || '',
        optionImages: q.optionImages || [],
        tags: q.tags || [],
        year: q.year || ''
      }));

      setErrors(parseErrors);
      return validQuestions;
    } catch (error) {
      toast.error('Invalid JSON format');
      setErrors([`JSON Parse Error: ${error.message}`]);
      return [];
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedData(null);
    setParsedQuestions([]);
    setErrors([]);
    setUploadComplete(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      setUploadedData({ name: file.name, size: file.size, type: file.type });

      let questions = [];
      if (file.name.endsWith('.csv') || file.type === 'text/csv') {
        questions = parseCSV(text);
      } else if (file.name.endsWith('.json') || file.type === 'application/json') {
        questions = parseJSON(text);
      } else {
        // Try JSON first, then CSV
        try {
          questions = parseJSON(text);
        } catch {
          questions = parseCSV(text);
        }
      }

      setParsedQuestions(questions);
      if (questions.length > 0) {
        toast.success(`Parsed ${questions.length} questions`);
      }
    };

    reader.onerror = () => toast.error('Failed to read file');
    reader.readAsText(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'text/plain': ['.txt']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false
  });

  const handleUpload = async () => {
    if (parsedQuestions.length === 0) {
      toast.error('No questions to upload');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + Math.random() * 15, 90));
      }, 500);

      const count = await bulkUploadQuestions(parsedQuestions);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadComplete(true);

      await addLog({
        type: 'success',
        message: `Bulk uploaded ${count} questions`,
        details: `Source: ${uploadedData?.name || 'File upload'}`
      });

      toast.success(`Successfully uploaded ${count} questions!`);
    } catch (error) {
      toast.error('Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setUploadedData(null);
    setParsedQuestions([]);
    setErrors([]);
    setUploadProgress(0);
    setUploadComplete(false);
    setShowPreview(false);
  };

  const sampleCSV = `examType,subject,chapter,difficulty,questionType,questionText,optionA,optionB,optionC,optionD,correctOption,explanation
JEE Mains,Physics,Mechanics,Easy,MCQ,What is the SI unit of force?,Newton,Joule,Watt,Pascal,0,The SI unit of force is Newton (N). Force = mass × acceleration.
JEE Mains,Chemistry,Atomic Structure,Medium,MCQ,What is the atomic number of Carbon?,4,6,8,12,1,Carbon has atomic number 6 with 6 protons in its nucleus.
NEET,Biology,Cell Biology,Easy,MCQ,Which organelle is the powerhouse of the cell?,Nucleus,Ribosome,Mitochondria,Golgi body,2,Mitochondria produces ATP through cellular respiration.`;

  const sampleJSON = JSON.stringify([
    {
      examType: "JEE Mains",
      subject: "Physics",
      chapter: "Mechanics",
      difficulty: "Easy",
      questionType: "MCQ",
      questionText: "What is the SI unit of force?",
      options: ["Newton", "Joule", "Watt", "Pascal"],
      correctOptionIndex: 0,
      explanation: "The SI unit of force is Newton (N)."
    },
    {
      examType: "JEE Mains",
      subject: "Mathematics",
      chapter: "Trigonometry",
      difficulty: "Medium",
      questionType: "Numerical",
      questionText: "What is the value of sin(90°)?",
      correctAnswer: "1",
      explanation: "sin(90°) = 1"
    }
  ], null, 2);

  const downloadSample = (type) => {
    const content = type === 'csv' ? sampleCSV : sampleJSON;
    const blob = new Blob([content], { type: type === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample_questions.${type}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Sample ${type.toUpperCase()} downloaded`);
  };

  return (
    <div className="page-container pt-16 md:pt-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-dark-800">Bulk Upload</h1>
        <p className="text-dark-400 text-sm mt-1">Upload multiple questions at once via CSV or JSON</p>
      </div>

      {/* Sample Downloads */}
      <div className="card mb-5">
        <h3 className="font-bold text-dark-700 mb-3 flex items-center space-x-2">
          <FiDownload className="text-primary-500" size={18} />
          <span>Download Templates</span>
        </h3>
        <p className="text-sm text-dark-400 mb-3">Download sample files to see the correct format</p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => downloadSample('csv')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-green-50 text-green-600 rounded-xl text-sm font-medium hover:bg-green-100 transition-all"
          >
            <FiFile size={16} />
            <span>Sample CSV</span>
          </button>
          <button
            onClick={() => downloadSample('json')}
            className="flex items-center space-x-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all"
          >
            <FiFile size={16} />
            <span>Sample JSON</span>
          </button>
        </div>
      </div>

      {/* Upload Zone */}
      {!uploadComplete && (
        <div
          {...getRootProps()}
          className={`card mb-5 border-2 border-dashed cursor-pointer transition-all ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-primary-50/30'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-center py-8">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              isDragActive ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-500'
            }`}>
              <FiUpload size={28} />
            </div>
            <h3 className="font-bold text-dark-700 text-lg">
              {isDragActive ? 'Drop file here' : 'Upload Questions File'}
            </h3>
            <p className="text-dark-400 text-sm mt-2">
              Drag & drop a CSV or JSON file, or click to browse
            </p>
            <p className="text-dark-300 text-xs mt-1">Max file size: 50MB</p>

            <div className="flex justify-center space-x-4 mt-4">
              <span className="badge bg-green-100 text-green-700">.csv</span>
              <span className="badge bg-blue-100 text-blue-700">.json</span>
              <span className="badge bg-gray-100 text-dark-500">.txt</span>
            </div>
          </div>
        </div>
      )}

      {/* File Info */}
      {uploadedData && (
        <div className="card mb-5 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FiFile className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="font-semibold text-dark-700 text-sm">{uploadedData.name}</p>
                <p className="text-xs text-dark-400">
                  {(uploadedData.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button onClick={handleClear} className="text-dark-400 hover:text-dark-600">
              <FiX size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Parse Results */}
      {parsedQuestions.length > 0 && !uploadComplete && (
        <div className="space-y-4 animate-slide-up">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="card p-3 text-center border-l-4 border-green-500">
              <p className="text-xl font-bold text-green-600">{parsedQuestions.length}</p>
              <p className="text-xs text-dark-400">Questions Parsed</p>
            </div>
            <div className="card p-3 text-center border-l-4 border-red-500">
              <p className="text-xl font-bold text-red-600">{errors.length}</p>
              <p className="text-xs text-dark-400">Errors</p>
            </div>
            <div className="card p-3 text-center border-l-4 border-blue-500">
              <p className="text-xl font-bold text-blue-600">
                {[...new Set(parsedQuestions.map(q => q.subject))].length}
              </p>
              <p className="text-xs text-dark-400">Subjects</p>
            </div>
            <div className="card p-3 text-center border-l-4 border-purple-500">
              <p className="text-xl font-bold text-purple-600">
                {[...new Set(parsedQuestions.map(q => q.examType))].length}
              </p>
              <p className="text-xs text-dark-400">Exam Types</p>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="card border-l-4 border-red-500">
              <h3 className="font-bold text-red-600 mb-2 flex items-center space-x-2">
                <FiAlertCircle size={16} />
                <span>Errors ({errors.length})</span>
              </h3>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-500">{err}</p>
                ))}
              </div>
            </div>
          )}

          {/* Preview Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center space-x-2 text-primary-500 font-semibold text-sm"
            >
              <FiEye size={16} />
              <span>{showPreview ? 'Hide Preview' : 'Preview Questions'}</span>
            </button>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="card max-h-96 overflow-y-auto">
              <div className="space-y-3">
                {parsedQuestions.slice(0, 20).map((q, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-start space-x-2">
                      <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-dark-700 line-clamp-2">{q.questionText}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <span className="badge-primary text-[8px]">{q.subject}</span>
                          <span className="badge-warning text-[8px]">{q.difficulty}</span>
                          <span className="badge bg-blue-100 text-blue-700 text-[8px]">{q.questionType}</span>
                        </div>
                        {q.options?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {q.options.map((opt, oi) => (
                              <span key={oi} className={`text-[10px] px-1.5 py-0.5 rounded ${
                                oi === q.correctOptionIndex ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-100 text-dark-400'
                              }`}>
                                {String.fromCharCode(65 + oi)}: {opt.substring(0, 30)}{opt.length > 30 ? '...' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {parsedQuestions.length > 20 && (
                  <p className="text-center text-xs text-dark-400 py-2">
                    ... and {parsedQuestions.length - 20} more questions
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-dark-600">Uploading...</span>
                <span className="text-sm font-bold text-primary-500">{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || parsedQuestions.length === 0}
            className="w-full btn-primary py-4 flex items-center justify-center space-x-2 text-lg disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Uploading {parsedQuestions.length} questions...</span>
              </>
            ) : (
              <>
                <FiDatabase size={20} />
                <span className="font-bold">Upload {parsedQuestions.length} Questions to Database</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Upload Complete */}
      {uploadComplete && (
        <div className="card text-center py-10 animate-slide-up">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-green-500" size={36} />
          </div>
          <h2 className="text-xl font-bold text-dark-800">Upload Complete!</h2>
          <p className="text-dark-400 mt-2">
            {parsedQuestions.length} questions have been uploaded to the database.
          </p>
          <p className="text-dark-300 text-sm mt-1">Students can now access these questions instantly.</p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6 max-w-sm mx-auto">
            <button
              onClick={handleClear}
              className="flex-1 btn-primary"
            >
              Upload More
            </button>
            <button
              onClick={() => window.location.href = '/admin/questions'}
              className="flex-1 btn-secondary"
            >
              View Questions
            </button>
          </div>
        </div>
      )}

      {/* Format Guide */}
      <div className="card mt-6">
        <h3 className="font-bold text-dark-700 mb-3 flex items-center space-x-2">
          <FiList size={16} className="text-primary-500" />
          <span>Supported Format Fields</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 text-dark-500 font-semibold">Field</th>
                <th className="text-left py-2 pr-4 text-dark-500 font-semibold">Required</th>
                <th className="text-left py-2 text-dark-500 font-semibold">Example</th>
              </tr>
            </thead>
            <tbody className="text-dark-600">
              {[
                ['questionText', 'Yes', 'What is the SI unit of force?'],
                ['examType', 'No', 'JEE Mains'],
                ['subject', 'No', 'Physics'],
                ['chapter', 'No', 'Mechanics'],
                ['difficulty', 'No', 'Easy / Medium / Hard'],
                ['questionType', 'No', 'MCQ / Numerical'],
                ['options', 'For MCQ', '["Newton", "Joule", "Watt", "Pascal"]'],
                ['correctOptionIndex', 'For MCQ', '0 (zero-indexed)'],
                ['correctAnswer', 'For Numerical', '9.8'],
                ['explanation', 'No', 'Detailed solution text'],
                ['imageUrl', 'No', 'https://...'],
                ['svgDiagram', 'No', '<svg>...</svg>']
              ].map(([field, req, example], i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 pr-4 font-mono text-primary-600">{field}</td>
                  <td className="py-2 pr-4">
                    <span className={`badge text-[9px] ${req === 'Yes' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-dark-500'}`}>
                      {req}
                    </span>
                  </td>
                  <td className="py-2 text-dark-400 max-w-[200px] truncate">{example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}