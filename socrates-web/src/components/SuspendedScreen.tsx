import { AlertTriangle } from 'lucide-react';

interface SuspendedScreenProps {
  reason: string;
  anomalyId?: string;
  onAppealSubmitted?: () => void;
}

export default function SuspendedScreen({ reason }: SuspendedScreenProps) {

  return (
    <div className="h-screen w-full bg-[#1e1e1e] flex items-center justify-center p-4">
      <div className="bg-[#2d2d2d] border border-red-500 rounded-xl p-8 max-w-lg w-full text-center shadow-2xl">
        <div className="flex justify-center mb-4">
          <div className="bg-red-500/20 p-4 rounded-full">
            <AlertTriangle size={48} className="text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">Account Temporarily Suspended</h1>
        <p className="text-gray-300 mb-6">
          Our proctoring system has locked your account due to: <br/>
          <span className="font-mono text-red-400 mt-2 block">{reason}</span>
        </p>

        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg border border-red-500/30">
          Your instructor has been notified on the Teacher Dashboard. Please wait for them to review the flag and manually unblock your account.
        </div>
      </div>
    </div>
  );
}
