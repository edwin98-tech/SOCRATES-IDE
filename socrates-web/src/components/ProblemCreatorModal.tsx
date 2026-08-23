import React, { useState } from 'react';
import { X, Plus, Code, CheckCircle, Save } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface ProblemCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProblemCreated: (newQuestion: any) => void;
}

export default function ProblemCreatorModal({ isOpen, onClose, onProblemCreated }: ProblemCreatorModalProps) {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('Python');
  const [description, setDescription] = useState('');
  const [defaultCode, setDefaultCode] = useState('def solution(arr):\n    # Write your solution here\n    pass\n');
  const [sampleCases, setSampleCases] = useState('Input: [1, 2, 3]\nExpected Output: [3, 2, 1]');
  const [testHarness, setTestHarness] = useState(`
# Test Harness (Hidden assertions)
try:
    assert solution([1, 2, 3]) == [3, 2, 1], "Failed on simple array"
    print("ALL_PASSED")
except Exception as e:
    print(f"FAILED: {e}")
`);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Please fill in problem title and description.");
      return;
    }

    setIsSaving(true);

    const newQuestion = {
      id: `custom_${Date.now()}`,
      title,
      language,
      description,
      defaultCode,
      sampleCases,
      testHarness,
      created_at: new Date().toISOString()
    };

    // Save to local storage cache for instant availability
    try {
      const existing = JSON.parse(localStorage.getItem('socrates_custom_questions') || '[]');
      localStorage.setItem('socrates_custom_questions', JSON.stringify([...existing, newQuestion]));
      
      // Also try saving to Supabase questions table if exists
      try {
        await supabase.from('questions').insert([newQuestion]);
      } catch (err) {
        console.warn("Supabase questions table not available, saved locally:", err);
      }

      onProblemCreated(newQuestion);
      onClose();
    } catch (e: any) {
      alert(`Error saving problem: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
              <Plus size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create New Programming Problem</h2>
              <p className="text-xs text-slate-400">Publish custom challenges with test assertions to your class</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-slate-300 font-semibold">Problem Title *</label>
              <input 
                type="text" 
                placeholder="e.g. 1.2.4 Binary Search on Rotated Array"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Language</label>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Python">Python</option>
                <option value="C">C</option>
                <option value="C++">C++</option>
                <option value="Java">Java</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Problem Description & Objective *</label>
            <textarea 
              rows={3}
              placeholder="Write a Python program to perform binary search..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold flex items-center">
              <Code size={13} className="mr-1.5 text-blue-400" />
              Starter / Default Code Template
            </label>
            <textarea 
              rows={4}
              value={defaultCode}
              onChange={(e) => setDefaultCode(e.target.value)}
              className="w-full bg-black/60 font-mono text-[11px] text-emerald-400 border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Sample Test Cases (Visible to Students)</label>
            <textarea 
              rows={2}
              value={sampleCases}
              onChange={(e) => setSampleCases(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold flex items-center text-amber-400">
              <CheckCircle size={13} className="mr-1.5" />
              Hidden Test Assertion Harness (Python)
            </label>
            <textarea 
              rows={4}
              value={testHarness}
              onChange={(e) => setTestHarness(e.target.value)}
              className="w-full bg-black/60 font-mono text-[11px] text-amber-300 border border-slate-700 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition shadow-lg flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={14} />
              <span>{isSaving ? "Publishing..." : "Publish Problem"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
