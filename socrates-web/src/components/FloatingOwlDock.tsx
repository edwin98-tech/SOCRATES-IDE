import { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { BookOpen, LayoutList, GraduationCap, Key, Sparkles, X } from 'lucide-react';

interface FloatingOwlDockProps {
  onOpenChat: () => void;
  onOpenTerminal: () => void;
  onOpenTestCases: () => void;
  onOpenSettings: () => void;
}

export default function FloatingOwlDock({
  onOpenChat,
  onOpenTerminal,
  onOpenTestCases,
  onOpenSettings
}: FloatingOwlDockProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Draggable nodeRef={nodeRef} bounds="body">
      <div 
        ref={nodeRef} 
        className="fixed top-1/3 right-6 z-40 flex flex-col items-center select-none"
      >
        {/* Main Draggable Centered Circular Owl Badge */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-14 h-14 rounded-full bg-white/95 backdrop-blur shadow-2xl border-2 border-blue-500 flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-105 transition-all relative group"
          title="Socrates Owl AI (Drag to move, Click to expand)"
        >
          <img 
            src="/owl_mascot.png" 
            alt="Socrates Owl Mascot" 
            className="w-12 h-12 rounded-full object-cover pointer-events-none select-none"
          />
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
          
          {!isExpanded && (
            <span className="absolute right-16 bg-gray-900 text-white text-[10px] px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition shadow pointer-events-none">
              Socrates AI (Click to open) 🦉
            </span>
          )}
        </div>

        {/* Pop-up Action Menu (Appears only when clicked) */}
        {isExpanded && (
          <div className="mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 p-2 flex flex-col space-y-2 items-center animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => { onOpenChat(); setIsExpanded(false); }}
              className="p-2 hover:bg-blue-50 text-blue-600 rounded-xl transition cursor-pointer group relative"
              title="Ask Socrates AI"
            >
              <Sparkles size={16} className="fill-blue-600" />
              <span className="absolute right-12 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition shadow pointer-events-none">
                Ask Socrates AI
              </span>
            </button>

            <button 
              onClick={() => { onOpenTerminal(); setIsExpanded(false); }}
              className="p-2 hover:bg-gray-100 text-gray-700 rounded-xl transition cursor-pointer group relative"
              title="Terminal"
            >
              <BookOpen size={16} />
              <span className="absolute right-12 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition shadow pointer-events-none">
                Terminal
              </span>
            </button>

            <button 
              onClick={() => { onOpenTestCases(); setIsExpanded(false); }}
              className="p-2 hover:bg-gray-100 text-gray-700 rounded-xl transition cursor-pointer group relative"
              title="Test Cases"
            >
              <LayoutList size={16} />
              <span className="absolute right-12 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition shadow pointer-events-none">
                Test Cases
              </span>
            </button>

            <button 
              onClick={() => { onOpenChat(); setIsExpanded(false); }}
              className="p-2 hover:bg-purple-50 text-purple-600 rounded-xl transition cursor-pointer group relative"
              title="Explain Concepts"
            >
              <GraduationCap size={16} />
              <span className="absolute right-12 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition shadow pointer-events-none">
                Concepts
              </span>
            </button>

            <button 
              onClick={() => { onOpenSettings(); setIsExpanded(false); }}
              className="p-2 hover:bg-amber-50 text-amber-600 rounded-xl transition cursor-pointer group relative"
              title="AI Settings & API Keys"
            >
              <Key size={16} />
              <span className="absolute right-12 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition shadow pointer-events-none">
                API Keys & Settings
              </span>
            </button>

            <button 
              onClick={() => setIsExpanded(false)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
              title="Close Menu"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </Draggable>
  );
}
