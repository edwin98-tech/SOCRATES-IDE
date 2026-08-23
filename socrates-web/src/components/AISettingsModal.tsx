import { useState, useEffect } from 'react';
import { X, ExternalLink, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { testGeminiApiKey } from '../lib/gemini';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StoredKey {
  id: string;
  provider: string;
  label: string;
  key: string;
  isDefault: boolean;
}

export default function AISettingsModal({ isOpen, onClose }: AISettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'keys' | 'experience' | 'usage'>('keys');
  const [provider, setProvider] = useState('Gemini');
  const [label, setLabel] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [keysList, setKeysList] = useState<StoredKey[]>([]);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; msg: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('socrates_api_keys');
    if (stored) {
      try {
        setKeysList(JSON.parse(stored));
      } catch (e) {
        setKeysList([]);
      }
    } else {
      const defaultEnvKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (defaultEnvKey && defaultEnvKey !== 'YOUR_GEMINI_API_KEY') {
        const initial = [
          {
            id: 'aikey-default',
            provider: 'Gemini',
            label: 'Default Gemini Key',
            key: defaultEnvKey,
            isDefault: true
          }
        ];
        setKeysList(initial);
        localStorage.setItem('socrates_api_keys', JSON.stringify(initial));
        localStorage.setItem('socrates_gemini_api_key', defaultEnvKey);
      }
    }
  }, [isOpen]);

  const handleAddKey = () => {
    if (!apiKeyInput.trim()) return;
    const newKey: StoredKey = {
      id: `aikey-${Math.random().toString(36).substr(2, 8)}`,
      provider,
      label: label.trim() || `${provider} Key`,
      key: apiKeyInput.trim(),
      isDefault: keysList.length === 0
    };

    const updated = [...keysList, newKey];
    setKeysList(updated);
    localStorage.setItem('socrates_api_keys', JSON.stringify(updated));
    if (newKey.isDefault) {
      localStorage.setItem('socrates_gemini_api_key', newKey.key);
    }

    setApiKeyInput('');
    setLabel('');
  };

  const handleDelete = (id: string) => {
    const updated = keysList.filter(k => k.id !== id);
    setKeysList(updated);
    localStorage.setItem('socrates_api_keys', JSON.stringify(updated));
    if (updated.length > 0 && !updated.some(k => k.isDefault)) {
      updated[0].isDefault = true;
      localStorage.setItem('socrates_gemini_api_key', updated[0].key);
    } else if (updated.length === 0) {
      localStorage.removeItem('socrates_gemini_api_key');
    }
  };

  const handleSetDefault = (id: string) => {
    const updated = keysList.map(k => ({
      ...k,
      isDefault: k.id === id
    }));
    setKeysList(updated);
    localStorage.setItem('socrates_api_keys', JSON.stringify(updated));
    const def = updated.find(k => k.id === id);
    if (def) {
      localStorage.setItem('socrates_gemini_api_key', def.key);
    }
  };

  const handleTestKey = async (item: StoredKey) => {
    setTestingId(item.id);
    setTestResult(null);
    try {
      const res = await testGeminiApiKey(item.key);
      setTestResult({
        id: item.id,
        success: res.success,
        msg: res.message
      });
    } catch (e: any) {
      setTestResult({
        id: item.id,
        success: false,
        msg: e.message || "Failed to test key"
      });
    } finally {
      setTestingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl text-gray-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Mentor Settings</h2>
            <p className="text-xs text-gray-500 mt-1">Manage your Gemini API keys and personalize your tutoring experience.</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition">
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-6 space-x-6 text-sm font-medium">
          <button 
            onClick={() => setActiveTab('keys')}
            className={`py-3 border-b-2 transition ${activeTab === 'keys' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            API keys
          </button>
          <button 
            onClick={() => setActiveTab('experience')}
            className={`py-3 border-b-2 transition ${activeTab === 'experience' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Experience
          </button>
          <button 
            onClick={() => setActiveTab('usage')}
            className={`py-3 border-b-2 transition ${activeTab === 'usage' ? 'border-blue-600 text-blue-600 font-semibold' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Usage
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {activeTab === 'keys' && (
            <>
              {/* AI Configuration Box */}
              <div className="border border-gray-200 rounded-xl p-5 bg-white space-y-4">
                <h3 className="font-semibold text-sm text-gray-900">AI Configuration</h3>
                <p className="text-xs text-gray-500">Add your API keys to enable AI-powered features</p>

                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-semibold text-gray-700">Add New API Key</label>
                  <div className="grid grid-cols-2 gap-3">
                    <select 
                      value={provider} 
                      onChange={(e) => setProvider(e.target.value)}
                      className="bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="Gemini">Gemini</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="Label (e.g.: My Gemini Key, etc...)"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      className="bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Guide Box */}
                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-xs text-gray-700 space-y-2">
                    <h4 className="font-semibold text-blue-900">How to get a Gemini API Key</h4>
                    <ol className="list-decimal pl-4 space-y-1 text-gray-600">
                      <li>Visit Google AI Studio <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 underline inline-flex items-center">Google AI Studio <ExternalLink size={10} className="ml-0.5" /></a></li>
                      <li>Sign in with your Google account</li>
                      <li>Click "Get API Key" or "Create API Key"</li>
                      <li>Copy the generated API key</li>
                      <li>Paste it here and test it</li>
                    </ol>
                  </div>

                  {/* Input & Add Button */}
                  <div className="flex gap-2">
                    <input 
                      type="password" 
                      placeholder="Enter API key" 
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      className="flex-grow bg-gray-50 border border-gray-200 text-gray-800 text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    />
                    <button 
                      onClick={handleAddKey}
                      className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-lg transition shadow-sm"
                    >
                      Add Key
                    </button>
                  </div>
                </div>
              </div>

              {/* Your API Keys List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Your API Keys ({keysList.length})</h4>
                
                {keysList.length === 0 ? (
                  <div className="text-xs text-gray-400 text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    No custom keys added yet. Add one above to get started.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {keysList.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3.5 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition">
                        <div className="flex items-center space-x-3">
                          <span className="text-[11px] font-bold px-2 py-1 bg-gray-100 text-gray-700 rounded-md border border-gray-200">
                            {item.provider}
                          </span>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-semibold text-gray-900">{item.label}</span>
                              {item.isDefault && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-semibold">
                                  Default
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-mono text-gray-400">
                              {item.key.slice(0, 6)}••••{item.key.slice(-4)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {testResult && testResult.id === item.id && (
                            <span className={`text-[11px] flex items-center ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                              {testResult.success ? <CheckCircle size={12} className="mr-1" /> : <AlertCircle size={12} className="mr-1" />}
                              {testResult.msg}
                            </span>
                          )}

                          <button 
                            onClick={() => handleTestKey(item)}
                            disabled={testingId === item.id}
                            className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 transition"
                          >
                            {testingId === item.id ? 'Testing...' : 'Test'}
                          </button>

                          <label className="flex items-center space-x-1 text-xs text-gray-600 cursor-pointer ml-1">
                            <input 
                              type="radio" 
                              checked={item.isDefault} 
                              onChange={() => handleSetDefault(item.id)} 
                              className="text-blue-600"
                            />
                            <span>Default</span>
                          </label>

                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-md transition ml-1"
                            title="Delete Key"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'experience' && (
            <div className="text-xs text-gray-600 space-y-4">
              <h3 className="font-semibold text-sm text-gray-900">Socratic Mentoring Experience</h3>
              <p>Configure how Socrates AI interacts with students during coding tasks.</p>
              <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800">Strict Socratic Mode</span>
                  <span className="text-green-600 font-bold">Enabled (70/30 Rule)</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-800">Misconception Auto-Tagging</span>
                  <span className="text-green-600 font-bold">Active</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'usage' && (
            <div className="text-xs text-gray-600 space-y-4">
              <h3 className="font-semibold text-sm text-gray-900">API Usage & Rate Limits</h3>
              <p>Monitor your token consumption across Gemini requests.</p>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-1">
                <div className="text-gray-500">Active Model:</div>
                <div className="font-mono font-bold text-gray-900">gemini-2.5-flash</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 text-xs font-semibold rounded-lg transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
