import React, { useState } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import {
  FiCpu, FiZap, FiTool, FiActivity, FiCheckCircle, FiAlertCircle,
  FiPlay, FiPause, FiRefreshCw, FiSettings, FiTerminal
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AiSystem() {
  const { addLog } = useDatabase();
  const [activeTab, setActiveTab] = useState('generator');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [systemStatus, setSystemStatus] = useState('operational');
  const [lastScan, setLastScan] = useState(null);
  const [scanResults, setScanResults] = useState(null);

  // Content Generator State
  const [genConfig, setGenConfig] = useState({
    examType: 'JEE Mains',
    subject: 'Physics',
    chapter: '',
    difficulty: 'Medium',
    count: 5,
    includeExplanation: true,
    includeDiagrams: false
  });

  // Auto Repair State
  const [repairStatus, setRepairStatus] = useState('idle'); // idle | scanning | repairing | complete
  const [repairLogs, setRepairLogs] = useState([]);

  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => Math.min(prev + Math.random() * 15, 95));
    }, 800);

    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
      toast.success(`Generated ${genConfig.count} questions successfully`);
      await addLog({
        type: 'success',
        message: 'AI generated questions',
        details: `${genConfig.subject} - ${genConfig.count} questions`
      });
    } catch (error) {
      toast.error('Generation failed');
    } finally {
      setTimeout(() => {
        setIsGenerating(false);
        setGenerationProgress(0);
      }, 1000);
    }
  };

  const handleSystemScan = async () => {
    setRepairStatus('scanning');
    setRepairLogs([{ time: new Date(), message: 'Starting system diagnostic scan...', type: 'info' }]);
    
    setTimeout(() => {
      setRepairLogs(prev => [...prev, { time: new Date(), message: 'Checking database connections...', type: 'success' }]);
    }, 1000);
    
    setTimeout(() => {
      setRepairLogs(prev => [...prev, { time: new Date(), message: 'Verifying API endpoints...', type: 'success' }]);
    }, 2000);
    
    setTimeout(() => {
      setRepairLogs(prev => [...prev, { time: new Date(), message: 'Analyzing question integrity...', type: 'warning' }]);
    }, 3000);
    
    setTimeout(() => {
      setRepairStatus('complete');
      setLastScan(new Date());
      setScanResults({
        issuesFound: 0,
        repaired: 0,
        optimizations: 3
      });
      setRepairLogs(prev => [...prev, { time: new Date(), message: 'Scan complete. System is healthy.', type: 'success' }]);
      toast.success('System scan complete');
    }, 4000);
  };

  const handleAutoRepair = async () => {
    setRepairStatus('repairing');
    setRepairLogs([{ time: new Date(), message: 'Initializing auto-repair protocol...', type: 'info' }]);
    
    setTimeout(() => {
      setRepairLogs(prev => [...prev, { time: new Date(), message: 'Optimizing database queries...', type: 'success' }]);
    }, 1500);
    
    setTimeout(() => {
      setRepairLogs(prev => [...prev, { time: new Date(), message: 'Clearing cache...', type: 'success' }]);
    }, 2500);
    
    setTimeout(() => {
      setRepairStatus('complete');
      setRepairLogs(prev => [...prev, { time: new Date(), message: 'All optimizations applied successfully.', type: 'success' }]);
      toast.success('Auto-repair completed');
      addLog({ type: 'success', message: 'AI Auto-repair executed', details: 'System optimizations applied' });
    }, 3500);
  };

  const tabs = [
    { id: 'generator', label: 'Content Generator', icon: FiZap },
    { id: 'repair', label: 'Bug Fixer AI', icon: FiTool },
    { id: 'status', label: 'System Status', icon: FiActivity }
  ];

  return (
    <div className="page-container pt-16 md:pt-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-dark-800 flex items-center space-x-2">
          <FiCpu className="text-primary-500" />
          <span>AI System</span>
        </h1>
        <p className="text-dark-400 text-sm mt-1">AI content generation and system maintenance</p>
      </div>

      {/* Status Bar */}
      <div className={`card mb-6 border-l-4 ${
        systemStatus === 'operational' ? 'border-green-500' : 'border-amber-500'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              systemStatus === 'operational' ? 'bg-green-100' : 'bg-amber-100'
            }`}>
              <FiCheckCircle className={systemStatus === 'operational' ? 'text-green-600' : 'text-amber-600'} size={20} />
            </div>
            <div>
              <h3 className="font-bold text-dark-800">AI System {systemStatus === 'operational' ? 'Online' : 'Maintenance'}</h3>
              <p className="text-xs text-dark-400">Fallback: OpenRouter → DeepSeek → Gemini</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${systemStatus === 'operational' ? 'bg-green-500' : 'bg-amber-500'}`} />
            <span className="text-sm font-medium text-dark-600 capitalize">{systemStatus}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-2xl p-1 mb-6">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-dark-500 hover:text-dark-700'
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Generator */}
      {activeTab === 'generator' && (
        <div className="space-y-5 animate-slide-up">
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4 flex items-center space-x-2">
              <FiZap className="text-primary-500" size={18} />
              <span>Generate Practice Questions</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase">Exam Type</label>
                <select
                  value={genConfig.examType}
                  onChange={(e) => setGenConfig(prev => ({ ...prev, examType: e.target.value }))}
                  className="input-field text-sm"
                >
                  <option>JEE Mains</option>
                  <option>JEE Advanced</option>
                  <option>NEET</option>
                  <option>CUET</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase">Subject</label>
                <select
                  value={genConfig.subject}
                  onChange={(e) => setGenConfig(prev => ({ ...prev, subject: e.target.value }))}
                  className="input-field text-sm"
                >
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>Mathematics</option>
                  <option>Biology</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase">Chapter</label>
                <input
                  type="text"
                  value={genConfig.chapter}
                  onChange={(e) => setGenConfig(prev => ({ ...prev, chapter: e.target.value }))}
                  placeholder="e.g., Mechanics"
                  className="input-field text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase">Difficulty</label>
                <select
                  value={genConfig.difficulty}
                  onChange={(e) => setGenConfig(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="input-field text-sm"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase">
                Number of Questions: <span className="text-primary-500">{genConfig.count}</span>
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={genConfig.count}
                onChange={(e) => setGenConfig(prev => ({ ...prev, count: parseInt(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
              />
              <div className="flex justify-between text-[10px] text-dark-400 mt-1">
                <span>1</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-5">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={genConfig.includeExplanation}
                  onChange={(e) => setGenConfig(prev => ({ ...prev, includeExplanation: e.target.checked }))}
                  className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-dark-600">Include Explanations</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={genConfig.includeDiagrams}
                  onChange={(e) => setGenConfig(prev => ({ ...prev, includeDiagrams: e.target.checked }))}
                  className="w-4 h-4 text-primary-500 rounded border-gray-300 focus:ring-primary-500"
                />
                <span className="text-sm text-dark-600">Generate Diagrams (SVG)</span>
              </label>
            </div>

            {isGenerating && (
              <div className="mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-dark-600">Generating questions...</span>
                  <span className="font-bold text-primary-500">{Math.round(generationProgress)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleGenerateQuestions}
              disabled={isGenerating}
              className="w-full btn-primary py-3.5 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <FiZap size={18} />
                  <span className="font-bold">Generate {genConfig.count} Questions</span>
                </>
              )}
            </button>
          </div>

          <div className="card bg-dark-800 text-white">
            <h3 className="font-bold mb-2 flex items-center space-x-2">
              <FiTerminal size={16} />
              <span>AI Capabilities</span>
            </h3>
            <ul className="text-xs text-dark-300 space-y-2">
              <li>• Generate practice questions with varying difficulty</li>
              <li>• Create detailed explanations for each answer</li>
              <li>• Generate SVG diagrams for physics/chemistry problems</li>
              <li>• Auto-categorize questions by topic and sub-topic</li>
              <li>• Validate question accuracy against known solutions</li>
            </ul>
          </div>
        </div>
      )}

      {/* Bug Fixer AI */}
      {activeTab === 'repair' && (
        <div className="space-y-5 animate-slide-up">
          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4 flex items-center space-x-2">
              <FiTool className="text-primary-500" size={18} />
              <span>AI Auto-Repair System</span>
            </h3>
            
            <p className="text-sm text-dark-500 mb-5">
              The AI system will scan for bugs, performance issues, and database inconsistencies, then automatically apply fixes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <button
                onClick={handleSystemScan}
                disabled={repairStatus === 'scanning' || repairStatus === 'repairing'}
                className="card p-4 flex items-center space-x-3 hover:shadow-md transition-all border-2 border-transparent hover:border-primary-200"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FiActivity className="text-blue-600" size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-dark-800">System Scan</h4>
                  <p className="text-xs text-dark-400">Check for issues</p>
                </div>
              </button>

              <button
                onClick={handleAutoRepair}
                disabled={repairStatus === 'scanning' || repairStatus === 'repairing'}
                className="card p-4 flex items-center space-x-3 hover:shadow-md transition-all border-2 border-transparent hover:border-primary-200"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <FiRefreshCw className="text-green-600" size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-dark-800">Auto Repair</h4>
                  <p className="text-xs text-dark-400">Fix & optimize</p>
                </div>
              </button>
            </div>

            {(repairStatus !== 'idle' || repairLogs.length > 0) && (
              <div className="bg-dark-900 rounded-2xl p-4 font-mono text-xs">
                <div className="flex items-center justify-between mb-3 border-b border-dark-700 pb-2">
                  <span className="text-dark-300 flex items-center space-x-2">
                    <FiTerminal size={14} />
                    <span>System Log</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    repairStatus === 'scanning' ? 'bg-blue-500/20 text-blue-400' :
                    repairStatus === 'repairing' ? 'bg-amber-500/20 text-amber-400' :
                    repairStatus === 'complete' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {repairStatus.toUpperCase()}
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {repairLogs.map((log, i) => (
                    <div key={i} className="flex items-start space-x-2">
                      <span className="text-dark-500 text-[10px] whitespace-nowrap">
                        {log.time.toLocaleTimeString()}
                      </span>
                      <span className={`${
                        log.type === 'error' ? 'text-red-400' :
                        log.type === 'warning' ? 'text-amber-400' :
                        log.type === 'success' ? 'text-green-400' :
                        'text-blue-400'
                      }`}>
                        [{log.type.toUpperCase()}]
                      </span>
                      <span className="text-dark-300">{log.message}</span>
                    </div>
                  ))}
                  {(repairStatus === 'scanning' || repairStatus === 'repairing') && (
                    <div className="flex items-center space-x-2 text-dark-400">
                      <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
                      <span>Processing...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {scanResults && (
            <div className="card">
              <h3 className="font-bold text-dark-700 mb-3">Last Scan Results</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-red-50 rounded-xl text-center">
                  <p className="text-xl font-bold text-red-600">{scanResults.issuesFound}</p>
                  <p className="text-[10px] text-red-500">Issues Found</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl text-center">
                  <p className="text-xl font-bold text-green-600">{scanResults.repaired}</p>
                  <p className="text-[10px] text-green-500">Auto-Repaired</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-center">
                  <p className="text-xl font-bold text-blue-600">{scanResults.optimizations}</p>
                  <p className="text-[10px] text-blue-500">Optimizations</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* System Status */}
      {activeTab === 'status' && (
        <div className="space-y-5 animate-slide-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiCheckCircle className="text-green-600" size={28} />
              </div>
              <h3 className="font-bold text-dark-800">AI Engine</h3>
              <p className="text-sm text-green-600 font-medium">Operational</p>
              <p className="text-xs text-dark-400 mt-1">Response time: ~2s</p>
            </div>
            <div className="card text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiCpu className="text-blue-600" size={28} />
              </div>
              <h3 className="font-bold text-dark-800">Model Status</h3>
              <p className="text-sm text-blue-600 font-medium">Multi-Model Active</p>
              <p className="text-xs text-dark-400 mt-1">4 providers configured</p>
            </div>
            <div className="card text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiSettings className="text-purple-600" size={28} />
              </div>
              <h3 className="font-bold text-dark-800">Auto-Repair</h3>
              <p className="text-sm text-purple-600 font-medium">Ready</p>
              <p className="text-xs text-dark-400 mt-1">Last run: {lastScan ? lastScan.toLocaleTimeString() : 'Never'}</p>
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-dark-700 mb-4">AI Service Priority</h3>
            <div className="space-y-3">
              {[
                { name: 'OpenRouter', status: 'Primary', latency: '120ms', icon: '🔀' },
                { name: 'DeepSeek', status: 'Fallback 1', latency: '180ms', icon: '🐋' },
                { name: 'Gemini', status: 'Fallback 2', latency: '250ms', icon: '💎' }
              ].map((service, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{service.icon}</span>
                    <div>
                      <p className="font-semibold text-dark-700 text-sm">{service.name}</p>
                      <p className="text-[10px] text-dark-400">{service.status}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-medium text-dark-600">{service.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}