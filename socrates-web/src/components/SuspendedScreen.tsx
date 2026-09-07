import React, { useState } from 'react';
import { ShieldAlert, Send, CheckCircle2, ArrowLeft, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface SuspendedScreenProps {
  reason: string;
  anomalyId?: string;
  studentId?: string;
  onAppealSubmitted?: () => void;
  onDismiss?: () => void;
}

export default function SuspendedScreen({ 
  reason, 
  anomalyId, 
  studentId = 'S EDWIN',
  onAppealSubmitted,
  onDismiss 
}: SuspendedScreenProps) {
  const [appealText, setAppealText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealText.trim()) return;

    setIsSubmitting(true);
    try {
      if (anomalyId) {
        await supabase
          .from('anomalies')
          .update({ appeal_note: appealText })
          .eq('id', anomalyId);
      } else {
        await supabase
          .from('anomalies')
          .update({ appeal_note: appealText })
          .eq('student_id', studentId);
      }

      window.dispatchEvent(new CustomEvent('socrates:db_change', { detail: { table: 'anomalies' } }));
      setIsSubmitted(true);
      if (onAppealSubmitted) onAppealSubmitted();
    } catch (err) {
      console.error('Error submitting appeal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#0d1117] flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-[#161b22] border border-amber-500/30 rounded-2xl p-8 max-w-xl w-full shadow-2xl relative z-10 space-y-6">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <ShieldAlert size={36} />
          </div>
          <div className="space-y-1">
            <div className="inline-block text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold mb-1">
              Academic Integrity Signal
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Session Flagged for Instructor Review
            </h1>
            <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
              Our pedagogical integrity monitor noted an atypical activity signal during this session.
            </p>
          </div>
        </div>

        {/* Flagged Signal Box */}
        <div className="bg-[#0d1117] p-4 rounded-xl border border-gray-800 space-y-1.5">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider font-mono">
            Triggering Pattern:
          </span>
          <p className="text-xs font-mono text-amber-300">
            {reason || 'Atypical paste velocity or multiple focus switches detected.'}
          </p>
          <p className="text-[11px] text-gray-400 leading-relaxed pt-1">
            We recognize that fast typists, accessibility tools, and legitimate reference workflows can occasionally trigger false positives.
          </p>
        </div>

        {/* Student Self-Appeal Form (Requested by Reviewer Priority 2 Item 5) */}
        {!isSubmitted ? (
          <form onSubmit={handleSubmitAppeal} className="space-y-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center justify-between">
                <span>Provide an explanation for your instructor:</span>
                <span className="text-[10px] text-gray-500 font-normal">Optional self-appeal</span>
              </label>
              <textarea
                value={appealText}
                onChange={(e) => setAppealText(e.target.value)}
                placeholder="e.g., I was using an accessibility screen reader, or I typed from my own local paper scratchpad..."
                rows={3}
                className="w-full bg-[#0d1117] border border-gray-700/80 focus:border-amber-500 rounded-xl p-3 text-xs text-gray-200 placeholder-gray-500 focus:outline-none transition resize-none"
              />
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="submit"
                disabled={isSubmitting || !appealText.trim()}
                className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-2 shadow-md cursor-pointer"
              >
                <Send size={13} />
                <span>{isSubmitting ? 'Sending Appeal...' : 'Submit Appeal to Instructor'}</span>
              </button>

              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className="py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold rounded-xl text-xs transition border border-gray-700 cursor-pointer flex items-center space-x-1.5"
                >
                  <ArrowLeft size={13} />
                  <span>Return to IDE</span>
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-xl text-center space-y-2 animate-in fade-in">
            <div className="flex items-center justify-center space-x-1.5 text-emerald-400 font-bold text-xs">
              <CheckCircle2 size={16} />
              <span>Appeal Submitted to Educator Review Queue</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Your explanation has been added directly to the instructor's dashboard. Your instructor will review your note and restore full session status.
            </p>
            {onDismiss && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onDismiss}
                  className="py-1.5 px-4 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold rounded-lg text-xs transition border border-gray-700 cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <ArrowLeft size={13} />
                  <span>Continue in Review Mode</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer Note */}
        <div className="text-[10px] text-gray-500 text-center border-t border-gray-800/80 pt-4 flex items-center justify-center space-x-2">
          <HelpCircle size={12} />
          <span>Socrates Academic Integrity Guidelines • Evaluated by human instructors</span>
        </div>

      </div>
    </div>
  );
}
