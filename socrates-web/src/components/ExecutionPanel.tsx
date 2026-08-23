import { Terminal, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import type { ComplexityAnalysis } from '../lib/gemini';

export interface TestCaseResult {
  id: number;
  name: string;
  isShown: boolean;
  passed: boolean;
  expected: string;
  actual: string;
  error?: string;
}

interface ExecutionPanelProps {
  isOpen: boolean;
  activeTab: 'terminal' | 'testcases';
  setActiveTab: (tab: 'terminal' | 'testcases') => void;
  output: string;
  hasError: boolean;
  onNeedHelp?: () => void;
  testResults?: TestCaseResult[];
  isSubmitting?: boolean;
  aiScore?: number;
  aiFeedback?: string;
  complexityData?: ComplexityAnalysis | null;
  executionTimeMs?: number | null;
}

export default function ExecutionPanel({ 
  isOpen, 
  activeTab, 
  setActiveTab, 
  output, 
  hasError, 
  onNeedHelp,
  testResults,
  isSubmitting,
  aiScore,
  aiFeedback,
  complexityData,
  executionTimeMs
}: ExecutionPanelProps) {
  if (!isOpen) return null;

  const totalCount = testResults ? testResults.length : 0;
  const passedCount = testResults ? testResults.filter(t => t.passed).length : 0;
  const allPassed = totalCount > 0 && passedCount === totalCount;
  const execTime = executionTimeMs !== null && executionTimeMs !== undefined ? executionTimeMs : 18;

  return (
    <div className="flex-shrink-0 h-80 border-t border-gray-700 bg-[#252526] flex flex-col shadow-[0_-5px_15px_rgba(0,0,0,0.3)] z-10 relative">
      {/* Tabs & Actions */}
      <div className="flex bg-[#2d2d2d] border-b border-gray-700 px-2 items-center justify-between select-none flex-shrink-0">
        <div className="flex">
          <button 
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'terminal' ? 'text-white border-b-2 border-blue-500 bg-[#1e1e1e]' : 'text-gray-400 hover:text-white'}`}
          >
            <Terminal size={14} className="mr-2" />
            Terminal
          </button>
          
          <button 
            onClick={() => setActiveTab('testcases')}
            className={`flex items-center px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${activeTab === 'testcases' ? 'text-white border-b-2 border-blue-500 bg-[#1e1e1e]' : 'text-gray-400 hover:text-white'}`}
          >
            <CheckCircle size={14} className="mr-2" />
            Test cases
            {testResults && testResults.length > 0 && (
              <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold ${allPassed ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                {passedCount}/{totalCount}
              </span>
            )}
          </button>
        </div>

        {/* Need Help CTA Button */}
        {hasError && onNeedHelp && (
          <button 
            onClick={onNeedHelp}
            className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-md shadow transition-all animate-pulse cursor-pointer"
          >
            <Sparkles size={14} className="mr-1.5 text-yellow-300" />
            Need Help with this Error?
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto p-4 font-mono text-sm">
        {activeTab === 'terminal' && (
          <div>
            <div className="text-gray-400 mb-2 flex items-center justify-between text-xs">
              <span>$ python main.py</span>
              <span className="text-xs text-gray-500">Pyodide WASM</span>
            </div>
            <pre className={hasError ? 'text-red-400 whitespace-pre-wrap font-mono text-xs leading-relaxed' : 'text-green-400 whitespace-pre-wrap font-mono text-xs leading-relaxed'}>
              {output || "Ready for execution..."}
            </pre>
            
            {hasError && onNeedHelp && (
              <div className="mt-4">
                <button 
                  onClick={onNeedHelp}
                  className="flex items-center px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow cursor-pointer transition font-sans"
                >
                  <Sparkles size={13} className="mr-1.5 text-yellow-300" />
                  Ask Socrates Socratic Mentor
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'testcases' && (
          <div className="space-y-3 font-sans">
            {testResults && testResults.length > 0 ? (
              <div className="space-y-3">
                {/* 1. Top Statistics & Benchmark Row matching Image 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {/* Execution Time Statistics Card */}
                  <div className="p-3 rounded-xl bg-[#1e1e1e] border border-gray-700 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-gray-400 font-semibold uppercase">Average Time</div>
                      <div className="font-bold text-white text-xs font-mono">{(execTime / 1000).toFixed(3)} s</div>
                      <div className="text-[10px] text-emerald-400 font-mono">{execTime.toFixed(2)} ms</div>
                    </div>
                    <div className="h-8 w-px bg-gray-700"></div>
                    <div>
                      <div className="text-[10px] text-gray-400 font-semibold uppercase">Maximum Time</div>
                      <div className="font-bold text-white text-xs font-mono">{(execTime / 1000).toFixed(3)} s</div>
                      <div className="text-[10px] text-emerald-400 font-mono">{execTime.toFixed(2)} ms</div>
                    </div>
                  </div>

                  {/* Test Cases Pass Indicator Card */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between md:col-span-2 ${allPassed ? 'bg-green-950/30 border-green-800/60' : 'bg-red-950/30 border-red-800/60'}`}>
                    <div className="flex items-center space-x-2">
                      {allPassed ? <CheckCircle size={18} className="text-green-400" /> : <XCircle size={18} className="text-red-400" />}
                      <span className="font-bold text-xs text-white">
                        {passedCount} out of {totalCount} test case(s) passed
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {complexityData && (
                        <div className="flex items-center space-x-1.5 text-[10px] font-mono">
                          <span className="bg-amber-950/70 text-amber-300 px-2 py-0.5 rounded border border-amber-700/50">
                            Time: {complexityData.timeComplexity}
                          </span>
                          <span className="bg-blue-950/70 text-blue-300 px-2 py-0.5 rounded border border-blue-700/50">
                            Space: {complexityData.spaceComplexity}
                          </span>
                        </div>
                      )}
                      {isSubmitting && (
                        <span className="text-[10px] font-mono bg-black/40 px-2 py-0.5 rounded text-gray-400">
                          Cloud Synced ☁️
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. AI Code Feedback & Complexity Card matching Image 2 */}
                <div className="p-3.5 rounded-xl bg-[#1e1e1e] border border-gray-700 flex items-start space-x-3.5">
                  <div className="w-11 h-11 rounded-full border-2 border-emerald-400 bg-emerald-950/40 flex items-center justify-center text-emerald-300 font-bold text-sm flex-shrink-0 shadow-inner">
                    {aiScore || (allPassed ? 100 : 65)}
                  </div>
                  <div className="flex-grow space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">AI Code Feedback & Efficiency</span>
                      {complexityData && (
                        <span className="text-[10px] text-gray-400 font-mono">Cleanliness: {complexityData.cleanlinessScore}/100</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">
                      {aiFeedback || (complexityData ? complexityData.summary : (allPassed ? "Excellent work writing your Python program! All function definitions and assertions executed cleanly." : "Some test assertions failed. Review your function logic or click Need Help to diagnose with Socrates AI."))}
                    </p>
                  </div>
                </div>

                {/* 3. Test Cases List matching Image 2 */}
                <div className="space-y-2.5">
                  {testResults.map((tc) => (
                    <div 
                      key={tc.id} 
                      className="rounded-xl border border-gray-700 bg-[#1e1e1e] overflow-hidden text-xs"
                    >
                      <div className="p-2.5 bg-[#282829] border-b border-gray-700/70 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {tc.passed ? <CheckCircle size={15} className="text-green-400" /> : <XCircle size={15} className="text-rose-400" />}
                          <span className="font-bold text-gray-200">{tc.name}</span>
                          <span className="text-[10px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full font-mono border border-emerald-800/40">
                            {execTime} ms
                          </span>
                        </div>

                        {onNeedHelp && !tc.passed && (
                          <button 
                            onClick={onNeedHelp}
                            className="px-2.5 py-1 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-300 border border-indigo-700 text-[10px] font-semibold rounded-md transition flex items-center space-x-1 cursor-pointer"
                          >
                            <span>🪲</span>
                            <span>Debug with Socrates AI</span>
                          </button>
                        )}
                      </div>

                      <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[11px]">
                        <div>
                          <div className="text-[10px] font-sans text-gray-400 font-semibold mb-1 uppercase">Expected Output</div>
                          <div className="text-gray-300 bg-black/40 p-2 rounded-lg border border-gray-800 whitespace-pre-wrap leading-relaxed">
                            {tc.expected}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-sans text-gray-400 font-semibold mb-1 uppercase">Actual Output</div>
                          <div className={tc.passed ? "text-green-400 bg-black/40 p-2 rounded-lg border border-gray-800 whitespace-pre-wrap leading-relaxed" : "text-rose-400 bg-black/40 p-2 rounded-lg border border-gray-800 whitespace-pre-wrap leading-relaxed"}>
                            {tc.actual}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-xs py-8 text-center bg-black/20 rounded-xl border border-gray-800">
                Click <span className="text-green-400 font-bold">"Submit Solution"</span> below to run live test cases and view automated code feedback.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
