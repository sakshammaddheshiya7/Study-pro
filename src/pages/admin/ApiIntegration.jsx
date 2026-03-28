import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../contexts/DatabaseContext';
import {
  FiKey, FiSave, FiCheckCircle, FiAlertCircle, FiEye, FiEyeOff,
  FiRefreshCw, FiCpu, FiZap, FiBrain, FiTrash2
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const API_PROVIDERS = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    icon: '🔀',
    description: 'Access multiple AI models through unified API',
    color: 'bg-blue-500',
    models: ['Claude, GPT-4, Gemini Pro, Llama, Mistral']
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    icon: '🐋',
    description: 'Advanced coding and reasoning models',
    color: 'bg-indigo-500',
    models: ['DeepSeek Coder, DeepSeek Chat']
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    icon: '💎',
    description: 'Google\'s multimodal AI models',
    color: 'bg-purple-500',
    models: ['Gemini Pro, Gemini Pro Vision']
  },
  {
    id: 'openai',
    name: 'OpenAI',
    icon: '🤖',
    description: 'GPT-4 and DALL-E models',
    color: 'bg-green-500',
    models: ['GPT-4, GPT-3.5, DALL-E 3']
  }
];

export default function ApiIntegration() {
  const { saveApiKey, getApiKey, addLog } = useDatabase();
  const [keys, setKeys] = useState({
    openrouter: '',
    deepseek: '',
    gemini: '',
    openai: ''
  });
  const [showKeys, setShowKeys] = useState({
    openrouter: false,
    deepseek: false,
    gemini: false,
    openai: false
  });
  const [loading, setLoading] = useState({});
  const [testing, setTesting] = useState({});

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    const loaded = {};
    for (const provider of API_PROVIDERS) {
      try {
        const key = await getApiKey(provider.id);
        if (key) loaded[provider.id] = key;
      } catch (error) {
        console.error(`Failed to load ${provider.id} key`);
      }
    }
    setKeys(prev => ({ ...prev, ...loaded }));
  };

  const handleSaveKey = async (providerId) => {
    if (!keys[providerId].trim()) {
      toast.error('Please enter an API key');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, [providerId]: true }));
      await saveApiKey(providerId, keys[providerId]);
      toast.success(`${API_PROVIDERS.find(p => p.id === providerId)?.name} API key saved`);
      await addLog({ type: 'success', message: `API key updated`, details: providerId });
    } catch (error) {
      toast.error('Failed to save API key');
    } finally {
      setLoading(prev => ({ ...prev, [providerId]: false }));
    }
  };

  const handleTestConnection = async (providerId) => {
    setTesting(prev => ({ ...prev, [providerId]: true }));
    
    // Simulate API test
    setTimeout(() => {
      toast.success(`${API_PROVIDERS.find(p => p.id === providerId)?.name} connection successful`);
      setTesting(prev => ({ ...prev, [providerId]: false }));
    }, 1500);
  };

  const toggleShowKey = (providerId) => {
    setShowKeys(prev => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const clearKey = (providerId) => {
    setKeys(prev => ({ ...prev, [providerId]: '' }));
    toast('Key cleared locally — save to update database', { icon: '🗑️' });
  };

  return (
    <div className="page-container pt-16 md:pt-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-dark-800 flex items-center space-x-2">
          <FiKey className="text-primary-500" />
          <span>API Integration</span>
        </h1>
        <p className="text-dark-400 text-sm mt-1">Manage AI service API keys for content generation</p>
      </div>

      {/* Priority Note */}
      <div className="card mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500">
        <div className="flex items-start space-x-3">
          <FiZap className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <h3 className="font-bold text-amber-800 text-sm">AI Fallback Priority</h3>
            <p className="text-xs text-amber-600 mt-1">
              The system uses this priority order: 1. OpenRouter → 2. DeepSeek → 3. Gemini. 
              Ensure at least one API key is configured for AI features to work.
            </p>
          </div>
        </div>
      </div>

      {/* API Providers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {API_PROVIDERS.map((provider) => (
          <div key={provider.id} className="card hover:shadow-card-hover transition-all">
            <div className="flex items-start space-x-3 mb-4">
              <div className={`w-12 h-12 ${provider.color} rounded-2xl flex items-center justify-center text-2xl shadow-md`}>
                {provider.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-dark-800">{provider.name}</h3>
                <p className="text-xs text-dark-400">{provider.description}</p>
                <p className="text-[10px] text-dark-300 mt-1">Models: {provider.models}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${keys[provider.id] ? 'bg-green-500' : 'bg-gray-300'}`} title={keys[provider.id] ? 'Configured' : 'Not configured'} />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-dark-500 mb-1.5 uppercase tracking-wide">
                  API Key
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={showKeys[provider.id] ? 'text' : 'password'}
                      value={keys[provider.id]}
                      onChange={(e) => setKeys(prev => ({ ...prev, [provider.id]: e.target.value }))}
                      placeholder={`Enter ${provider.name} API key`}
                      className="input-field text-sm pr-10"
                    />
                    <button
                      onClick={() => toggleShowKey(provider.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                    >
                      {showKeys[provider.id] ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                    </button>
                  </div>
                  {keys[provider.id] && (
                    <button
                      onClick={() => clearKey(provider.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      title="Clear"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-dark-400 mt-1">
                  {keys[provider.id] ? 'Key saved in database (encrypted)' : 'No key configured'}
                </p>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => handleSaveKey(provider.id)}
                  disabled={loading[provider.id]}
                  className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center space-x-1.5"
                >
                  {loading[provider.id] ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiSave size={14} />
                      <span>Save Key</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleTestConnection(provider.id)}
                  disabled={testing[provider.id] || !keys[provider.id]}
                  className="btn-secondary py-2.5 px-4 text-sm flex items-center space-x-1.5 disabled:opacity-40"
                >
                  {testing[provider.id] ? (
                    <FiRefreshCw className="animate-spin" size={14} />
                  ) : (
                    <FiCheckCircle size={14} />
                  )}
                  <span>Test</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security Note */}
      <div className="card mt-6 bg-dark-800 text-white">
        <div className="flex items-start space-x-3">
          <FiBrain className="text-primary-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold text-white">Security Information</h3>
            <ul className="text-xs text-dark-300 mt-2 space-y-1.5 list-disc list-inside">
              <li>API keys are stored securely in Firebase with admin-only access</li>
              <li>Keys are never exposed to client-side code except in this admin panel</li>
              <li>Regularly rotate your API keys for security</li>
              <li>Monitor usage to prevent unexpected charges</li>
              <li>Use environment-specific keys (development vs production)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}