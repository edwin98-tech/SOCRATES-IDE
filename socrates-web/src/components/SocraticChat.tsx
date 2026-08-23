import { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { Key, Settings, Maximize2, Minus, Send, HelpCircle } from 'lucide-react';
import OwlMascot from './OwlMascot';
import { callGeminiSocratic } from '../lib/gemini';

interface SocraticChatProps {
  isVisible: boolean;
  onToggleVisible: () => void;
  onClose: () => void;
  errorContext?: string;
  studentCode?: string;
  problemDescription?: string;
  onOpenSettings?: () => void;
  onMessagesChange?: (messages: any[]) => void;
}

export default function SocraticChat({ 
  isVisible, 
  onToggleVisible,
  onClose, 
  errorContext, 
  studentCode = '', 
  problemDescription = '',
  onOpenSettings,
  onMessagesChange
}: SocraticChatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<{ role: 'ai' | 'student'; text: string; tag?: string; confidence?: 'yes' | 'no' }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isDraggingRef = useRef(false);
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('socrates_owl_position');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch (e) {}
    // Default to left pane position
    return { x: 28, y: 120 };
  });

  // Notify parent of chat trail updates for teacher replay
  useEffect(() => {
    onMessagesChange?.(messages);
  }, [messages, onMessagesChange]);

  // Confidence Check-in Handler (PRD § 5.2c)
  const handleConfidence = (index: number, response: 'yes' | 'no') => {
    const updated = [...messages];
    updated[index].confidence = response;
    setMessages(updated);

    if (response === 'yes') {
      handleSendMessage("I understand this step! What should I check next in my code?");
    } else {
      handleSendMessage("I'm still a bit confused about this. Could you clarify that concept in simpler terms with a basic analogy?");
    }
  };

  // Idle Stuck Detection State
  const [isIdleStuck, setIsIdleStuck] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());

  // Track activity (typing, clicking, etc.)
  useEffect(() => {
    const handleActivity = () => {
      lastActivityRef.current = Date.now();
      if (isIdleStuck) setIsIdleStuck(false);
    };

    window.addEventListener('keydown', handleActivity);
    window.addEventListener('mousedown', handleActivity);

    // Check for idle every 5 seconds (>60s idle triggers "Are you stuck?" prompt)
    const interval = setInterval(() => {
      const idleSeconds = (Date.now() - lastActivityRef.current) / 1000;
      if (idleSeconds >= 60 && !isVisible && !isIdleStuck) {
        setIsIdleStuck(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      clearInterval(interval);
    };
  }, [isVisible, isIdleStuck]);

  // Close chat on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isVisible, onClose]);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Initial Socratic diagnosis when opened with an error
  useEffect(() => {
    if (isVisible && errorContext && errorContext.includes('Error') && messages.length === 0) {
      handleAutoDiagnose();
    }
  }, [isVisible, errorContext]);

  const handleAutoDiagnose = async () => {
    setIsLoading(true);
    const prompt = `I ran my code and encountered this error: ${errorContext}. Can you guide me through fixing it using the Socratic method?`;
    const res = await callGeminiSocratic({
      userMessage: prompt,
      studentCode,
      errorContext,
      problemDescription
    });

    setMessages([
      { role: 'ai', text: res.message, tag: res.misconceptionTag }
    ]);
    setIsLoading(false);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || isLoading) return;

    setInput('');
    const newMessages = [...messages, { role: 'student' as const, text: textToSend }];
    setMessages(newMessages);
    setIsLoading(true);

    const res = await callGeminiSocratic({
      userMessage: textToSend,
      studentCode,
      errorContext,
      problemDescription,
      chatHistory: newMessages
    });

    setMessages([...newMessages, { role: 'ai', text: res.message, tag: res.misconceptionTag }]);
    setIsLoading(false);
  };

  const handleOpenFromMascot = () => {
    if (isDraggingRef.current) {
      return;
    }
    setIsIdleStuck(false);
    const totalW = isExpanded ? 550 : 440;
    const screenW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const screenH = typeof window !== 'undefined' ? window.innerHeight : 800;
    const maxX = Math.max(20, screenW - totalW - 24);
    const clampedX = Math.max(20, Math.min(position.x, maxX));
    const clampedY = Math.max(40, Math.min(position.y, screenH - 580));
    setPosition({ x: clampedX, y: clampedY });
    onToggleVisible();
    if (isIdleStuck && messages.length === 0) {
      handleSendMessage("I've been thinking about this problem for a while. Could you give me a starting Socratic hint?");
    }
  };

  return (
    <Draggable 
      nodeRef={containerRef} 
      bounds="body"
      position={position}
      onStart={() => {
        isDraggingRef.current = false;
      }}
      onDrag={() => {
        isDraggingRef.current = true;
      }}
      onStop={(_e, data) => {
        const newPos = { x: data.x, y: data.y };
        setPosition(newPos);
        try {
          localStorage.setItem('socrates_owl_position', JSON.stringify(newPos));
        } catch (e) {}
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 150);
      }}
    >
      <div 
        ref={containerRef} 
        className="fixed top-0 left-0 z-40 select-none font-sans text-gray-800"
      >
        {!isVisible ? (
          /* STATE 1: Single Draggable Owl Mascot Circle (ONLY the owl circle is visible) */
          <div className="relative">
            {/* Idle Stuck Speech Bubble */}
            {isIdleStuck && (
              <div 
                onClick={handleOpenFromMascot}
                className="absolute right-18 -top-3 bg-amber-50 border border-amber-300 shadow-2xl rounded-2xl p-3 w-60 text-xs text-amber-950 cursor-pointer animate-in fade-in slide-in-from-right-3 duration-200 z-50 hover:bg-amber-100/90 transition"
              >
                <div className="flex items-center justify-between font-bold text-amber-900 mb-1">
                  <span className="flex items-center">
                    <HelpCircle size={13} className="mr-1 text-amber-600" />
                    Are you stuck?
                  </span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full font-mono">
                    Hint
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 leading-snug">
                  You've been thinking for a while! Click here for a guided Socratic hint.
                </p>
                {/* Arrow pointing right */}
                <div className="absolute -right-2 top-5 w-0 h-0 border-t-6 border-t-transparent border-b-6 border-b-transparent border-l-6 border-l-amber-300"></div>
              </div>
            )}

            <div 
              onClick={handleOpenFromMascot}
              className={`w-14 h-14 rounded-full bg-slate-900 shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 transition-transform relative ${
                isIdleStuck ? 'ring-4 ring-amber-400 ring-offset-2 animate-bounce' : ''
              }`}
              title="Socrates Owl AI (Click to open)"
            >
              <OwlMascot size={56} />
              <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full ${isIdleStuck ? 'bg-amber-400 animate-ping' : 'bg-green-500'}`}></span>
            </div>
          </div>
        ) : (
          /* STATE 2: The Clean Socratic Chat Dialog Card */
          <div className="animate-in fade-in zoom-in-95 duration-150">
            <div 
              className={`${isExpanded ? 'w-[480px] h-[640px]' : 'w-[370px] h-[540px]'} bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all`}
            >
              {/* Header */}
              <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center justify-between select-none">
                <div className="flex items-center space-x-2">
                  <OwlMascot size={22} />
                  <span className="font-bold text-xs text-gray-800 tracking-tight">Assisting S EDWIN</span>
                </div>

                <div className="flex items-center space-x-1 text-gray-400">
                  {onOpenSettings && (
                    <button 
                      onClick={onOpenSettings} 
                      className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded transition cursor-pointer"
                      title="AI Settings & API Keys"
                    >
                      <Key size={13} />
                    </button>
                  )}
                  <button 
                    onClick={onOpenSettings}
                    className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded transition cursor-pointer"
                    title="Settings"
                  >
                    <Settings size={13} />
                  </button>
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded transition cursor-pointer"
                    title={isExpanded ? "Restore" : "Expand"}
                  >
                    <Maximize2 size={13} />
                  </button>
                  <button 
                    onClick={onClose}
                    className="p-1 hover:text-gray-700 hover:bg-gray-100 rounded transition cursor-pointer"
                    title="Minimize"
                  >
                    <Minus size={13} />
                  </button>
                </div>
              </div>

              {/* Chat Body */}
              <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-[#fbfbfd]">
                {/* Welcome Card when empty */}
                {messages.length === 0 && (
                  <div className="mt-2 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm text-center space-y-2">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Socrates AI Mentor
                    </div>
                    <div className="flex justify-center my-2">
                      <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center shadow-md">
                        <OwlMascot size={32} />
                      </div>
                    </div>
                    <h4 className="text-xs font-semibold text-gray-800">
                      Welcome to your personal Socratic Tutor!
                    </h4>
                    <p className="text-[11px] text-gray-500 leading-relaxed max-w-[280px] mx-auto">
                      I won't give you direct answers, but I will ask questions to help you think through algorithms and debug issues yourself.
                    </p>
                    <div className="pt-2 flex flex-col space-y-1.5 text-left">
                      <button 
                        onClick={() => handleSendMessage("Can you explain this question clearly and what the objective is?")}
                        className="text-[11px] px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-left transition border border-blue-100 cursor-pointer"
                      >
                        💡 Explain problem objective
                      </button>
                      <button 
                        onClick={() => handleSendMessage("What should be my first step in structuring this solution?")}
                        className="text-[11px] px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-left transition border border-purple-100 cursor-pointer"
                      >
                        🧭 Guide my first step
                      </button>
                      {errorContext && errorContext.includes('Error') && (
                        <button 
                          onClick={handleAutoDiagnose}
                          className="text-[11px] px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-left transition border border-amber-200 cursor-pointer"
                        >
                          🔍 Diagnose current runtime error
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Chat Messages */}
                {messages.map((m, index) => (
                  <div key={index} className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className={`flex ${m.role === 'student' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed ${
                          m.role === 'student'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>

                    {/* Tag badge for AI responses */}
                    {m.role === 'ai' && m.tag && (
                      <div className="flex items-center space-x-1 pl-1">
                        <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                          🏷️ {m.tag}
                        </span>
                      </div>
                    )}

                    {/* Interactive Socratic Confidence Check-In (PRD § 5.2c) */}
                    {m.role === 'ai' && index === messages.length - 1 && !isLoading && (
                      <div className="flex items-center space-x-1.5 pl-1 pt-1">
                        <span className="text-[10px] text-gray-400 font-medium">Makes sense?</span>
                        <button
                          onClick={() => handleConfidence(index, 'yes')}
                          disabled={m.confidence !== undefined}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition cursor-pointer flex items-center space-x-1 ${
                            m.confidence === 'yes'
                              ? 'bg-green-100 text-green-700 border-green-300 font-semibold'
                              : 'bg-green-50/80 hover:bg-green-100 text-green-700 border-green-200'
                          }`}
                        >
                          <span>👍</span>
                          <span>Yes</span>
                        </button>
                        <button
                          onClick={() => handleConfidence(index, 'no')}
                          disabled={m.confidence !== undefined}
                          className={`text-[10px] px-2 py-0.5 rounded-full border transition cursor-pointer flex items-center space-x-1 ${
                            m.confidence === 'no'
                              ? 'bg-amber-100 text-amber-800 border-amber-300 font-semibold'
                              : 'bg-amber-50/80 hover:bg-amber-100 text-amber-700 border-amber-200'
                          }`}
                        >
                          <span>❓</span>
                          <span>Clarify</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-100 text-gray-500 rounded-2xl rounded-bl-none px-3.5 py-2.5 text-xs shadow-sm flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                      </div>
                      <span className="text-[11px] text-gray-400">Socrates is formulating a guiding hint...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask about your code, this question, or tests"
                  className="flex-grow bg-gray-50 text-gray-800 text-xs px-3.5 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-gray-400"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition shadow-sm cursor-pointer"
                  title="Send message (Enter)"
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Draggable>
  );
}
