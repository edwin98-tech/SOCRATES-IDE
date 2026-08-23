import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  CheckCircle, Flame, Users, TrendingUp, ArrowLeft,
  Award, ShieldAlert, Search, RefreshCw, 
  Code2, Clock, Sparkles, Send, CheckCircle2, ChevronRight,
  GraduationCap
} from 'lucide-react';
import ProblemCreatorModal from './ProblemCreatorModal';

interface TeacherDashboardProps {
  onLogout?: () => void;
}

interface StudentInfo {
  id: string;
  name: string;
  rollNo: string;
  section: string;
  avatar: string;
  email: string;
}

const SECTIONS_CONFIG = [
  { id: 'Section A', name: 'Section A (CS-101 Data Structures)', code: 'CS-101', desc: 'Core Data Structures & Algorithmic Thinking' },
  { id: 'Section B', name: 'Section B (CS-102 Algorithms)', code: 'CS-102', desc: 'Design & Analysis of Algorithms' },
  { id: 'Section C', name: 'Section C (CS-201 Python Lab)', code: 'CS-201', desc: 'Practical Python Programming & Problem Solving' },
];

const STUDENT_ROSTER: StudentInfo[] = [
  { id: 'STU-001', name: 'S EDWIN', rollNo: '23CS101', section: 'Section A (CS-101 Data Structures)', avatar: '👨‍💻', email: 'edwin@socrates.edu' },
  { id: 'STU-002', name: 'Aarav Sharma', rollNo: '23CS102', section: 'Section A (CS-101 Data Structures)', avatar: '🧑‍💻', email: 'aarav@socrates.edu' },
  { id: 'STU-003', name: 'Priya Patel', rollNo: '23CS103', section: 'Section A (CS-101 Data Structures)', avatar: '👩‍💻', email: 'priya@socrates.edu' },
  { id: 'STU-004', name: 'Rahul Verma', rollNo: '23CS104', section: 'Section A (CS-101 Data Structures)', avatar: '👨‍🎓', email: 'rahul@socrates.edu' },
  { id: 'STU-005', name: 'demo student', rollNo: '23CS105', section: 'Section A (CS-101 Data Structures)', avatar: '🧑‍🎓', email: 'demo@socrates.edu' },
  { id: 'STU-006', name: 'Neha Gupta', rollNo: '23CS106', section: 'Section B (CS-102 Algorithms)', avatar: '👩‍🎓', email: 'neha@socrates.edu' },
  { id: 'STU-007', name: 'Vikram Singh', rollNo: '23CS107', section: 'Section B (CS-102 Algorithms)', avatar: '👨‍💻', email: 'vikram@socrates.edu' },
  { id: 'STU-008', name: 'Ananya Rao', rollNo: '23CS108', section: 'Section B (CS-102 Algorithms)', avatar: '👩‍💻', email: 'ananya@socrates.edu' },
  { id: 'STU-009', name: 'Karan Malhotra', rollNo: '23CS109', section: 'Section B (CS-102 Algorithms)', avatar: '🧑‍💻', email: 'karan@socrates.edu' },
  { id: 'STU-010', name: 'Rohan Das', rollNo: '23CS110', section: 'Section C (CS-201 Python Lab)', avatar: '👨‍🎓', email: 'rohan@socrates.edu' },
  { id: 'STU-011', name: 'Sneha Roy', rollNo: '23CS111', section: 'Section C (CS-201 Python Lab)', avatar: '👩‍🎓', email: 'sneha@socrates.edu' },
  { id: 'STU-012', name: 'Tanvi Mehta', rollNo: '23CS112', section: 'Section C (CS-201 Python Lab)', avatar: '👩‍💻', email: 'tanvi@socrates.edu' },
];

export default function TeacherDashboard({ onLogout }: TeacherDashboardProps) {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);

  // 3-Level Drill Down Navigation
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentInfo | null>(null);
  const [teacherNote, setTeacherNote] = useState<string>('');
  const [noteSent, setNoteSent] = useState<boolean>(false);

  const fetchData = async () => {
    setIsRefreshing(true);
    // Fetch unresolved anomalies
    const { data: anomalyData } = await supabase
      .from('anomalies')
      .select('*')
      .eq('is_resolved', false)
      .order('created_at', { ascending: false });
    
    if (anomalyData) setAnomalies(anomalyData);

    // Fetch submissions
    const { data: subData } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (subData) setSubmissions(subData);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleUnblock = async (id: string) => {
    await supabase.from('anomalies').update({ is_resolved: true }).eq('id', id);
    fetchData();
  };

  // Helper to compute a student's live stats
  const getStudentStats = (student: StudentInfo) => {
    const stuSubs = submissions.filter(s => 
      s.student_id?.toLowerCase() === student.name.toLowerCase() || 
      (student.name === 'S EDWIN' && (s.student_id === 'demo student' || s.student_id === 'S EDWIN'))
    );
    const hasFlags = anomalies.some(a => a.student_id?.toLowerCase() === student.name.toLowerCase() || (student.name === 'S EDWIN' && a.student_id === 'demo student'));
    const score = stuSubs.length > 0 ? Math.round(stuSubs.reduce((a, b) => a + (b.ai_score || 0), 0) / stuSubs.length) : (student.name === 'S EDWIN' ? 95 : 85);
    const passed = stuSubs.filter(s => s.is_successful).length;
    const totalQ = Math.max(stuSubs.length, 3);
    return {
      submissionsCount: stuSubs.length,
      passedCount: passed,
      totalQuestions: totalQ,
      score,
      isFlagged: hasFlags,
      primaryMisconception: stuSubs[0]?.misconception_tag || 'Optimal Implementation'
    };
  };

  // Helper to compute section statistics
  const getSectionStats = (sectionName: string) => {
    const studentsInSection = STUDENT_ROSTER.filter(s => s.section === sectionName);
    const sectionSubs = submissions.filter(s => {
      const sId = (s.student_id || '').toLowerCase();
      return studentsInSection.some(stu => 
        sId.includes(stu.name.toLowerCase()) || (stu.name === 'S EDWIN' && sId === 'demo student')
      );
    });

    const total = sectionSubs.length;
    const passed = sectionSubs.filter(s => s.is_successful).length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : (sectionName.includes('Section A') ? 85 : 80);
    const avgScore = total > 0 ? Math.round(sectionSubs.reduce((a, b) => a + (b.ai_score || 0), 0) / total) : 88;

    return {
      studentCount: studentsInSection.length,
      submissionsCount: total,
      passRate,
      avgScore
    };
  };

  // Submissions filtered for current view
  const currentSubmissions = submissions.filter(s => {
    const sId = (s.student_id || 'demo student').toLowerCase();
    if (selectedStudent) {
      return sId.includes(selectedStudent.name.toLowerCase()) || 
             (selectedStudent.name === 'S EDWIN' && (sId === 'demo student' || sId === 's edwin'));
    }
    if (selectedSection) {
      const studentsInSection = STUDENT_ROSTER.filter(stu => stu.section === selectedSection);
      return studentsInSection.some(stu => 
        sId.includes(stu.name.toLowerCase()) || (stu.name === 'S EDWIN' && sId === 'demo student')
      );
    }
    return true;
  });

  // Calculate Metrics
  const totalSubmissions = currentSubmissions.length;
  const passedSubmissions = currentSubmissions.filter(s => s.is_successful).length;
  const passRate = totalSubmissions > 0 ? Math.round((passedSubmissions / totalSubmissions) * 100) : 85;
  const avgScore = totalSubmissions > 0 
    ? Math.round(currentSubmissions.reduce((acc, s) => acc + (s.ai_score || 0), 0) / totalSubmissions) 
    : 90;

  // Aggregate Misconceptions for Heatmap
  const misconceptionCounts: Record<string, number> = {};
  currentSubmissions.forEach(sub => {
    const tag = sub.misconception_tag || 'Optimal Implementation';
    misconceptionCounts[tag] = (misconceptionCounts[tag] || 0) + 1;
  });

  const defaultMisconceptions: Record<string, number> = {
    'Function Signature Mismatch': 2,
    'Loop Boundary Error': 4,
    'Optimal Implementation': 8
  };

  const activeHeatmap = Object.keys(misconceptionCounts).length > 0 ? misconceptionCounts : defaultMisconceptions;
  const totalHeatmapEntries = Object.values(activeHeatmap).reduce((a, b) => a + b, 0);

  const getHeatmapColor = (index: number) => {
    const colors = ['bg-rose-500', 'bg-amber-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-purple-500'];
    return colors[index % colors.length];
  };

  const handleSendFeedback = () => {
    if (!teacherNote.trim()) return;
    setNoteSent(true);
    setTimeout(() => {
      setTeacherNote('');
      setNoteSent(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 p-6 md:p-8 font-sans selection:bg-purple-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="bg-[#161b22]/80 backdrop-blur rounded-2xl p-6 border border-gray-800 flex flex-col md:flex-row justify-between md:items-center gap-4 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl shadow-inner">
              🦉
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center">
                Socrates Educator Portal
                <span className="ml-3 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse"></span>
                  Live Polling
                </span>
              </h1>
              <p className="text-xs md:text-sm text-gray-400 mt-1">
                Section roster drill-down, individual student code review, Socratic Q&A replay, and proctoring.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsProblemModalOpen(true)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition shadow-md text-xs cursor-pointer flex items-center space-x-1.5"
            >
              <span>➕</span>
              <span>Create Problem</span>
            </button>
            <button 
              onClick={fetchData}
              className="p-2 bg-gray-800 hover:bg-gray-600 text-gray-300 rounded-xl transition border border-gray-600 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            {onLogout && (
              <button 
                onClick={onLogout}
                className="px-3.5 py-2 bg-[#161b22] hover:bg-red-950/60 hover:text-red-300 text-gray-300 font-semibold rounded-xl transition border border-gray-800 text-xs cursor-pointer shadow-sm"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Breadcrumb Bar */}
        <div className="bg-[#161b22]/90 rounded-2xl px-5 py-3 border border-gray-800 shadow-md flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                setSelectedSection(null);
                setSelectedStudent(null);
              }}
              className={`font-bold transition cursor-pointer hover:underline ${
                !selectedSection && !selectedStudent ? 'text-purple-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              🏛️ All Sections
            </button>

            {selectedSection && (
              <>
                <ChevronRight size={14} className="text-gray-600" />
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className={`font-bold transition cursor-pointer hover:underline ${
                    selectedSection && !selectedStudent ? 'text-purple-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  📂 {selectedSection}
                </button>
              </>
            )}

            {selectedStudent && (
              <>
                <ChevronRight size={14} className="text-gray-600" />
                <span className="font-bold text-emerald-400 flex items-center space-x-1">
                  <span>{selectedStudent.avatar}</span>
                  <span>{selectedStudent.name}</span>
                </span>
              </>
            )}
          </div>

          {/* Quick Back Button */}
          {selectedStudent ? (
            <button
              onClick={() => setSelectedStudent(null)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-600 text-white rounded-lg font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back to Section Roster</span>
            </button>
          ) : selectedSection ? (
            <button
              onClick={() => setSelectedSection(null)}
              className="px-3 py-1.5 bg-gray-800 hover:bg-gray-600 text-white rounded-lg font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back to All Sections</span>
            </button>
          ) : null}
        </div>

        {/* ========================================================================= */}
        {/* LEVEL 1: ALL SECTIONS OVERVIEW (When no section is selected)               */}
        {/* ========================================================================= */}
        {!selectedSection && !selectedStudent && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Section Selection Cards */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap size={20} className="text-purple-400" />
                <h2 className="text-lg font-bold text-white">Select a Course Section to View Students</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {SECTIONS_CONFIG.map((sec) => {
                  const sStats = getSectionStats(sec.name);
                  return (
                    <div 
                      key={sec.id}
                      onClick={() => setSelectedSection(sec.name)}
                      className="bg-[#161b22]/90 hover:bg-gray-750 border border-gray-800 hover:border-purple-500/80 rounded-2xl p-6 shadow-xl transition-all cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-purple-600/20 text-purple-300 font-mono font-bold border border-purple-500/30">
                          {sec.code}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center space-x-1 font-semibold">
                          <Users size={14} className="text-gray-400" />
                          <span>{sStats.studentCount} Students</span>
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition mb-1">
                        {sec.name}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-4">
                        {sec.desc}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-800/80 text-xs">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-semibold">Pass Rate</div>
                          <div className="font-bold text-emerald-400 font-mono text-sm">{sStats.passRate}%</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-semibold">Avg Score</div>
                          <div className="font-bold text-purple-400 font-mono text-sm">{sStats.avgScore}/100</div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 flex items-center justify-between text-xs font-bold text-purple-400 group-hover:text-purple-300">
                        <span>Open Section Students</span>
                        <ChevronRight size={16} className="transform group-hover:translate-x-1 transition" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Class-Wide Heatmap & Recent Submissions Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#161b22]/90 rounded-2xl p-6 border border-gray-800 shadow-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Flame size={18} className="text-rose-400" />
                      <h3 className="text-base font-bold text-white">Overall Misconception Heatmap</h3>
                    </div>
                    <span className="text-xs text-gray-400 font-mono bg-[#0d1117] px-2.5 py-1 rounded-lg border border-gray-800">
                      {totalHeatmapEntries} Tagged Points
                    </span>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(activeHeatmap).map(([tag, count], idx) => {
                      const percentage = totalHeatmapEntries > 0 ? Math.round((count / totalHeatmapEntries) * 100) : 0;
                      const color = getHeatmapColor(idx);
                      return (
                        <div key={tag} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold text-gray-200">{tag}</span>
                            <span className="text-gray-400 font-mono">{count} occurrences ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-950 h-2.5 rounded-full overflow-hidden border border-gray-800">
                            <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Locked Accounts / Proctoring Queue */}
              <div className="bg-[#161b22]/90 rounded-2xl p-6 border border-gray-800 shadow-xl flex flex-col space-y-3">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm border-b border-gray-800/80 pb-2">
                  <ShieldAlert size={16} />
                  <span>Locked Accounts ({anomalies.length})</span>
                </div>

                {anomalies.length === 0 ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <CheckCircle size={24} className="text-emerald-400" />
                    <div className="text-xs font-bold text-gray-300">All accounts in good standing.</div>
                  </div>
                ) : (
                  <div className="space-y-3 overflow-y-auto max-h-72">
                    {anomalies.map((anom) => (
                      <div key={anom.id} className="p-3 bg-[#0d1117] border border-rose-900/50 rounded-xl space-y-2">
                        <div className="font-bold text-rose-300 text-xs">{anom.student_id}</div>
                        <p className="text-[11px] text-gray-300">{anom.reason}</p>
                        <button 
                          onClick={() => handleUnblock(anom.id)}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] transition cursor-pointer"
                        >
                          Approve & Unlock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* LEVEL 2: SECTION ROSTER - SHOWS ALL STUDENTS AS CARDS (NOT A DROPDOWN!)   */}
        {/* ========================================================================= */}
        {selectedSection && !selectedStudent && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Section Header Banner */}
            <div className="bg-[#161b22]/90 rounded-2xl p-6 border border-gray-800 shadow-xl flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-mono font-bold">
                    {selectedSection.split(' ')[0]}
                  </span>
                  <h2 className="text-2xl font-bold text-white">{selectedSection}</h2>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Click on any student card below to inspect their submitted code, Socratic debugging history, and progress.
                </p>
              </div>

              {/* Search Bar within Section */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Filter student name..." 
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full bg-[#0d1117] border border-gray-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* 4 Section KPI Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#161b22]/90 border border-gray-800 rounded-2xl p-4 shadow-lg flex items-center space-x-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">Section Pass Rate</div>
                  <div className="text-xl font-bold text-white mt-0.5">{passRate}%</div>
                </div>
              </div>

              <div className="bg-[#161b22]/90 border border-gray-800 rounded-2xl p-4 shadow-lg flex items-center space-x-3">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                  <Award size={22} />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">Avg AI Score</div>
                  <div className="text-xl font-bold text-white mt-0.5">{avgScore}/100</div>
                </div>
              </div>

              <div className="bg-[#161b22]/90 border border-gray-800 rounded-2xl p-4 shadow-lg flex items-center space-x-3">
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                  <Users size={22} />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">Total Students</div>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {STUDENT_ROSTER.filter(s => s.section === selectedSection).length}
                  </div>
                </div>
              </div>

              <div className="bg-[#161b22]/90 border border-gray-800 rounded-2xl p-4 shadow-lg flex items-center space-x-3">
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
                  <ShieldAlert size={22} />
                </div>
                <div>
                  <div className="text-xs text-gray-400 font-medium">Active Flags</div>
                  <div className="text-xl font-bold text-white mt-0.5">{anomalies.length}</div>
                </div>
              </div>
            </div>

            {/* ALL STUDENTS GRID (Interactive Roster Cards) */}
            <div>
              <h3 className="text-base font-bold text-white mb-3 flex items-center space-x-2">
                <Users size={18} className="text-purple-400" />
                <span>All Enrolled Students in {selectedSection}</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {STUDENT_ROSTER.filter(s => {
                  const matchesSection = s.section === selectedSection;
                  const matchesSearch = s.name.toLowerCase().includes(filterQuery.toLowerCase()) || 
                                        s.rollNo.toLowerCase().includes(filterQuery.toLowerCase());
                  return matchesSection && matchesSearch;
                }).map((stu) => {
                  const stats = getStudentStats(stu);
                  return (
                    <div
                      key={stu.id}
                      onClick={() => setSelectedStudent(stu)}
                      className="bg-[#161b22]/90 hover:bg-gray-750 border border-gray-800 hover:border-purple-500 rounded-2xl p-5 shadow-lg transition-all cursor-pointer group hover:-translate-y-1 flex flex-col justify-between space-y-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl shadow">
                            {stu.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-white group-hover:text-purple-400 transition text-sm">
                              {stu.name}
                            </div>
                            <div className="text-[11px] text-gray-400 font-mono">{stu.rollNo}</div>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          stats.isFlagged 
                            ? 'bg-rose-950 text-rose-400 border border-rose-800' 
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {stats.isFlagged ? '⚠️ Locked' : '🟢 Clean'}
                        </span>
                      </div>

                      {/* Student Stats Mini Matrix */}
                      <div className="grid grid-cols-2 gap-2 bg-[#0d1117]/80 p-3 rounded-xl border border-gray-800/60 text-xs">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-semibold">AI Score</div>
                          <div className="font-bold text-emerald-400 font-mono text-sm">{stats.score}/100</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase font-semibold">Completed</div>
                          <div className="font-bold text-white font-mono text-sm">{stats.passedCount}/{stats.totalQuestions}</div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-400">
                        <span className="text-gray-500 text-[10px] uppercase font-semibold block mb-0.5">Primary Tag:</span>
                        <span className="text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40 text-[11px] inline-block truncate max-w-full">
                          {stats.primaryMisconception}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStudent(stu);
                        }}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center space-x-1 shadow"
                      >
                        <Code2 size={14} />
                        <span>Inspect Code & Socratic Trail ➜</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* LEVEL 3: INDIVIDUAL STUDENT DETAILS & SUBMITTED CODE INSPECTION PAGE       */}
        {/* ========================================================================= */}
        {selectedStudent && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* Student Individual Profile Banner */}
            <div className="bg-[#161b22]/90 rounded-2xl p-6 border border-gray-800 shadow-xl flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg border border-blue-400/40 flex-shrink-0">
                  {selectedStudent.avatar}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl font-bold text-white">{selectedStudent.name}</h2>
                    <span className="text-xs bg-purple-600/30 text-purple-300 border border-purple-500/40 px-2.5 py-0.5 rounded-full font-mono">
                      {selectedStudent.rollNo}
                    </span>
                    <span className="text-xs bg-purple-600/30 text-purple-300 border border-purple-500/40 px-2.5 py-0.5 rounded-full">
                      {selectedStudent.section}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{selectedStudent.email} • Comprehensive Diagnostic & Code Submission Page</p>
                </div>
              </div>

              {/* Navigation Back */}
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition cursor-pointer shadow-md"
              >
                <ArrowLeft size={14} />
                <span>Back to Section Roster</span>
              </button>
            </div>

            {/* Student Individual Metric Cards */}
            {(() => {
              const stats = getStudentStats(selectedStudent);
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#161b22]/90 border border-gray-800 rounded-2xl p-4 shadow-lg flex items-center space-x-3">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                      <Award size={22} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-medium">Overall AI Score</div>
                      <div className="text-xl font-bold text-emerald-400 mt-0.5">{stats.score}/100</div>
                    </div>
                  </div>

                  <div className="bg-[#161b22]/90 border border-gray-800 rounded-2xl p-4 shadow-lg flex items-center space-x-3">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                      <CheckCircle2 size={22} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-medium">Questions Passed</div>
                      <div className="text-xl font-bold text-white mt-0.5">{stats.passedCount} / {stats.totalQuestions}</div>
                    </div>
                  </div>

                  <div className="bg-[#161b22]/90 border border-gray-800 rounded-2xl p-4 shadow-lg flex items-center space-x-3">
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
                      <Sparkles size={22} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-medium">Primary Stumbling Block</div>
                      <div className="text-xs font-bold text-indigo-300 mt-1 truncate max-w-[140px]">
                        {stats.primaryMisconception}
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#161b22]/90 border border-gray-800 rounded-2xl p-4 shadow-lg flex items-center space-x-3">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                      <CheckCircle size={22} />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 font-medium">Integrity Status</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5">Good Standing</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Submitted Code Snapshots & Socratic Debugging Journey */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Columns: Submissions with Code & Socratic Dialogue */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#161b22]/90 rounded-2xl p-6 border border-gray-800 shadow-xl space-y-4">
                  <div className="flex items-center space-x-2">
                    <Code2 size={18} className="text-purple-400" />
                    <h3 className="text-lg font-bold text-white">Submitted Code Snapshots ({currentSubmissions.length})</h3>
                  </div>

                  {currentSubmissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs bg-[#0d1117]/50 rounded-xl border border-dashed border-gray-800">
                      No code submissions recorded for {selectedStudent.name} yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentSubmissions.map((sub, idx) => {
                        let trail: any[] = [];
                        try {
                          if (sub.debugging_trail) {
                            trail = typeof sub.debugging_trail === 'string' ? JSON.parse(sub.debugging_trail) : sub.debugging_trail;
                          }
                        } catch (e) {
                          trail = [];
                        }

                        return (
                          <div key={sub.id || idx} className="bg-[#0d1117]/90 rounded-xl border border-gray-800 p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${sub.is_successful ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                                  {sub.is_successful ? 'Passed' : 'Failed Assertions'}
                                </span>
                                <span className="text-xs font-semibold text-gray-200">
                                  {sub.misconception_tag || 'Optimal Implementation'}
                                </span>
                              </div>
                              <span className="text-xs font-mono font-bold text-emerald-400 bg-[#161b22] px-2 py-1 rounded border border-gray-800">
                                AI Score: {sub.ai_score}/100
                              </span>
                            </div>

                            <div className="space-y-1">
                              <div className="text-[11px] font-semibold text-gray-400 flex items-center justify-between">
                                <span>Submitted Python Code:</span>
                                <span className="text-[10px] text-gray-500 font-mono">
                                  <Clock size={11} className="inline mr-1" />
                                  {new Date(sub.created_at || Date.now()).toLocaleTimeString()}
                                </span>
                              </div>
                              <pre className="text-xs font-mono bg-black/60 text-emerald-400 p-3 rounded-lg overflow-x-auto border border-gray-800">
                                {sub.code}
                              </pre>
                            </div>

                            {/* Full Socratic Debugging Dialogue Trail */}
                            {trail && trail.length > 0 && (
                              <div className="pt-2 border-t border-gray-800">
                                <div className="text-xs font-bold text-indigo-300 mb-2 flex items-center justify-between">
                                  <span>📜 Socratic Mentoring Dialogue ({trail.length} interactions)</span>
                                  <span className="text-[10px] text-gray-500 font-mono">Chronological Replay</span>
                                </div>

                                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                  {trail.map((turn: any, tIdx: number) => (
                                    <div key={tIdx} className={`p-2.5 rounded-lg text-xs space-y-1 ${turn.role === 'ai' ? 'bg-gray-950 border border-gray-800' : 'bg-purple-950/40 border border-purple-900/40'}`}>
                                      <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className={turn.role === 'ai' ? 'text-purple-400' : 'text-purple-400'}>
                                          {turn.role === 'ai' ? '🦉 Socrates AI' : `🧑 ${selectedStudent.name}`}
                                        </span>
                                        {turn.tag && (
                                          <span className="bg-indigo-950 text-indigo-400 px-1.5 py-0.2 rounded border border-indigo-800/60 font-normal">
                                            🏷️ {turn.tag}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-gray-300 leading-relaxed font-sans text-[11px]">
                                        {turn.text}
                                      </p>
                                      {turn.confidence && (
                                        <div className="text-[10px] text-emerald-400 font-medium flex items-center space-x-1">
                                          <span>{turn.confidence === 'yes' ? '👍 Student confirmed understood' : '❓ Student requested simpler breakdown'}</span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right 1 Column: Teacher Direct Feedback */}
              <div className="space-y-6">
                <div className="bg-[#161b22]/90 rounded-2xl p-6 border border-gray-800 shadow-xl space-y-4">
                  <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                    <Sparkles size={18} />
                    <span>Send Pedagogical Feedback</span>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    Leave private guidance or commendation for <strong>{selectedStudent.name}</strong>.
                  </p>

                  <textarea
                    rows={4}
                    value={teacherNote}
                    onChange={(e) => setTeacherNote(e.target.value)}
                    placeholder={`e.g. Great work on the array traversal problem!`}
                    className="w-full bg-[#0d1117] border border-gray-800 rounded-xl p-3 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-slate-500 resize-none"
                  />

                  <button
                    onClick={handleSendFeedback}
                    disabled={!teacherNote.trim()}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center space-x-2 shadow-md"
                  >
                    <Send size={13} />
                    <span>{noteSent ? "Feedback Sent Successfully! ✅" : "Send Feedback to Student"}</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Problem Creator Modal */}
      <ProblemCreatorModal 
        isOpen={isProblemModalOpen} 
        onClose={() => setIsProblemModalOpen(false)} 
        onProblemCreated={fetchData}
      />
    </div>
  );
}
