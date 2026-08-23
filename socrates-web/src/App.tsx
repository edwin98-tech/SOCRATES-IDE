import React, { useState } from 'react';
import StudentIDE from './components/StudentIDE';
import TeacherDashboard from './components/TeacherDashboard';
import OwlMascot from './components/OwlMascot';
import { 
  User, Lock, Eye, EyeOff, Sparkles, ArrowRight, 
  Cpu, BarChart3, GraduationCap, CheckCircle2, Shield
} from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<'student' | 'teacher' | null>(() => {
    return (localStorage.getItem('hackathon_role') as any) || null;
  });

  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [username, setUsername] = useState('demo student');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleRoleTabChange = (selectedRole: 'student' | 'teacher') => {
    setActiveTab(selectedRole);
    if (selectedRole === 'student') {
      setUsername('demo student');
      setPassword('password123');
    } else {
      setUsername('demo teacher');
      setPassword('teacher2026');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(activeTab);
    if (rememberMe) {
      localStorage.setItem('hackathon_role', activeTab);
    }
  };

  const handleQuickLogin = (quickRole: 'student' | 'teacher') => {
    setRole(quickRole);
    if (rememberMe) {
      localStorage.setItem('hackathon_role', quickRole);
    }
  };

  const handleLogout = () => {
    setRole(null);
    localStorage.removeItem('hackathon_role');
  };

  if (role === 'student') return <StudentIDE onLogout={handleLogout} />;
  if (role === 'teacher') return <TeacherDashboard onLogout={handleLogout} />;

  return (
    <div className="min-h-screen bg-[#0d1117] bg-radial from-[#161b22] via-[#0d1117] to-[#090d13] text-gray-200 flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      
      {/* Subtle Background Glow Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Container Card */}
      <div className="w-full max-w-4xl bg-[#161b22]/90 backdrop-blur-xl border border-gray-800/80 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Side: Brand & Feature Showcase (5 Columns) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#1c2128] to-[#12161c] p-8 sm:p-10 border-b lg:border-b-0 lg:border-r border-gray-800 flex flex-col justify-between relative">
          
          {/* Logo & Platform Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg border border-blue-500/30">
                <OwlMascot size={34} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center">
                  Socrates <span className="text-blue-400 ml-1">IDE</span>
                </h1>
                <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                  AI Pedagogical Platform
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed mb-8">
              Intelligent Socratic mentoring and real-time empathy analytics designed for computer science education.
            </p>

            {/* Core Pillars */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5 border border-blue-500/20 flex-shrink-0">
                  <Sparkles size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Socratic Feedback Engine</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                    Diagnoses root misconceptions and guides students without giving copy-paste answers.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5 border border-emerald-500/20 flex-shrink-0">
                  <Cpu size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Local WASM Python Runtime</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                    Zero-latency in-browser Pyodide execution with automated test assertions.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 mt-0.5 border border-purple-500/20 flex-shrink-0">
                  <BarChart3 size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-200">Educator Empathy Telemetry</h4>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                    Class-wide misconception heatmaps and Socratic dialogue replay for teachers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* System Status Pill */}
          <div className="pt-8 flex items-center justify-between border-t border-gray-800/80 mt-6 text-[11px] text-gray-400">
            <span className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              All Systems Operational
            </span>
            <span className="font-mono text-gray-500">v2.4 Pro</span>
          </div>
        </div>

        {/* Right Side: Authentication Form (7 Columns) */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-[#161b22]">
          
          {/* Role Switcher Tabs */}
          <div className="mb-6">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Select Your Portal
            </span>
            <div className="grid grid-cols-2 gap-2 bg-[#0d1117] p-1 rounded-xl border border-gray-800">
              <button
                type="button"
                onClick={() => handleRoleTabChange('student')}
                className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'student'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <GraduationCap size={15} />
                <span>Student Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleTabChange('teacher')}
                className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'teacher'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <Shield size={15} />
                <span>Educator Portal</span>
              </button>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {activeTab === 'student' ? 'Student Sign In' : 'Educator Sign In'}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {activeTab === 'student' 
                ? 'Enter your student credentials or use one-click demo login.' 
                : 'Access classroom telemetry, misconception heatmaps & student code.'}
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Username Input */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                {activeTab === 'student' ? 'Student ID / Name' : 'Educator Email / Username'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <User size={15} />
                </div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={activeTab === 'student' ? 'e.g. demo student' : 'e.g. teacher@university.edu'}
                  required
                  className="w-full bg-[#0d1117] border border-gray-700/80 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock size={15} />
                </div>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0d1117] border border-gray-700/80 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors shadow-inner font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-gray-400 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
                <span>Remember session</span>
              </label>
              <span className="text-gray-500 hover:text-gray-400 cursor-pointer">
                Need assistance?
              </span>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`w-full py-3 px-4 rounded-xl text-xs font-bold text-white transition-all shadow-lg flex items-center justify-center space-x-2 cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/30'
                  : 'bg-purple-600 hover:bg-purple-700 shadow-purple-900/30'
              }`}
            >
              <span>Sign In to {activeTab === 'student' ? 'Student IDE' : 'Educator Portal'}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <span className="relative bg-[#161b22] px-3 text-[11px] text-gray-500 uppercase tracking-wider font-mono">
              Or Instant Demo Launch
            </span>
          </div>

          {/* Quick Demo Access Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickLogin('student')}
              className="py-2.5 px-3 bg-[#0d1117] hover:bg-blue-950/40 text-blue-400 hover:text-blue-300 border border-blue-900/50 hover:border-blue-700 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <CheckCircle2 size={13} />
              <span>Launch Student IDE</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('teacher')}
              className="py-2.5 px-3 bg-[#0d1117] hover:bg-purple-950/40 text-purple-400 hover:text-purple-300 border border-purple-900/50 hover:border-purple-700 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm"
            >
              <CheckCircle2 size={13} />
              <span>Launch Educator Portal</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
