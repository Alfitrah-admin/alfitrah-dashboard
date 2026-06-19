"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area
} from 'recharts';
import { Student, Evaluation } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useStudent } from './context';

// --- MOCK DATA FOR CHARTS AND EXTENDED FEATURES ---
const subjectRadarData = [
  { subject: 'Maths', score: 85, fullMark: 100 },
  { subject: 'English', score: 90, fullMark: 100 },
  { subject: 'Science', score: 80, fullMark: 100 },
  { subject: 'Islamic Studies', score: 95, fullMark: 100 },
  { subject: 'Quran', score: 88, fullMark: 100 },
  { subject: 'Arabic', score: 75, fullMark: 100 },
];

const mannersRadarData = [
  { trait: 'Respectful', score: 95, fullMark: 100 },
  { trait: 'Helpful', score: 85, fullMark: 100 },
  { trait: 'Honesty', score: 100, fullMark: 100 },
  { trait: 'Patience', score: 75, fullMark: 100 },
  { trait: 'Cleanliness', score: 90, fullMark: 100 },
];

const attendanceTrendData = [
  { month: 'Sep', rate: 98 },
  { month: 'Oct', rate: 100 },
  { month: 'Nov', rate: 95 },
  { month: 'Dec', rate: 92 },
  { month: 'Jan', rate: 96 },
];

const timelineData = [
  { cycle: 'Term 2 (Current)', title: 'Excellent Progress in Quran', desc: 'Successfully memorised Surah Al-Mulk. Needs slight focus on Math multiplication tables.', badge: 'Memorised Surah Al-Mulk', type: 'positive' },
  { cycle: 'Term 1', title: 'Strong Start', desc: 'Settled in very well. Shown great enthusiasm in Islamic Studies and English.', badge: '100% Attendance', type: 'neutral' },
  { cycle: 'Previous Year', title: 'Promoted to Grade 3', desc: 'Completed Grade 2 with overall A grade. Outstanding behavior.', badge: 'Star Student Award', type: 'award' },
];

const surahs = [
  { name: 'Surah Al-Mulk', status: 'completed' },
  { name: 'Surah Al-Qalam', status: 'completed' },
  { name: 'Surah Al-Haqqah', status: 'in-progress', progress: 60 },
  { name: 'Surah Al-Ma`arij', status: 'pending', progress: 0 },
];

const duas = ['Dua for Waking Up', 'Dua for Sleeping', 'Dua before Meals', 'Dua for Parents', 'Morning Adhkar'];

export default function ParentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any | null>(null);
  const { student, isLoading } = useStudent();

  useEffect(() => {
    const fetchEvals = async () => {
      if (!student) return;
      // fetch all evaluations, not just submitted, since some teachers might just insert directly
      const { data: evalsData } = await supabase.from('evaluations').select('*').eq('student_id', student.id);
      
      if (evalsData) {
        setEvaluations(evalsData.map(e => {
          let parsedGrades = e.grade_value;
          try {
            if (typeof parsedGrades === 'string') parsedGrades = JSON.parse(parsedGrades);
          } catch(err) {}

          return {
            ...e,
            grades: parsedGrades || {},
            comments: e.teacher_remarks || e.comments || '',
            studentId: e.student_id,
            studentName: e.student_name,
            reportingCycle: e.reporting_cycle,
          };
        }) as any[]);
      }
    };
    fetchEvals();
  }, [student]);


  const getOverallProgress = (grades: Record<string, string> = {}) => {
    const values = Object.values(grades);
    if (values.length === 0) return { pct: 0, letter: 'N/A', color: 'bg-slate-200', text: 'text-slate-500' };
    
    const map: Record<string, number> = { "A+": 95, "A": 85, "B": 75, "C": 65, "D": 50 };
    let sum = 0;
    values.forEach(v => sum += map[v] || 75);
    const avg = sum / values.length;
    
    if (avg >= 90) return { pct: Math.round(avg), letter: 'A', color: 'bg-emerald-500', text: 'text-emerald-500' };
    if (avg >= 80) return { pct: Math.round(avg), letter: 'B', color: 'bg-blue-500', text: 'text-blue-500' };
    if (avg >= 70) return { pct: Math.round(avg), letter: 'C', color: 'bg-orange-500', text: 'text-orange-500' };
    if (avg >= 60) return { pct: Math.round(avg), letter: 'D', color: 'bg-red-500', text: 'text-red-500' };
    return { pct: Math.round(avg), letter: 'E', color: 'bg-red-700', text: 'text-red-700' };
  };

  const getSchoolOverall = () => {
    if (evaluations.length === 0) return { letter: 'N/A', color: 'bg-slate-200' };
    let totalScore = 0;
    evaluations.forEach(ev => totalScore += getOverallProgress(ev.grades).pct);
    const avg = totalScore / evaluations.length;
    
    if (avg >= 90) return { letter: 'A', color: 'bg-emerald-500' };
    if (avg >= 80) return { letter: 'B', color: 'bg-blue-500' };
    if (avg >= 70) return { letter: 'C', color: 'bg-orange-500' };
    if (avg >= 60) return { letter: 'D', color: 'bg-red-500' };
    return { letter: 'E', color: 'bg-red-700' };
  };

  const overall = getSchoolOverall();

  if (isLoading || !student) return <div className="p-8 text-center text-slate-500">Loading Portal...</div>;

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      
      {/* PARENT DASHBOARD - Main Overview */}
      <div className="glass-card p-8 bg-gradient-to-br from-white to-brand-emerald/5 border-b-4 border-b-brand-emerald relative overflow-hidden">
        {/* Subtle Arabic pattern background hint */}
        <div className="absolute right-0 top-0 w-64 h-64 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10b981 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-2xl bg-white border-2 border-brand-emerald/20 shadow-md flex items-center justify-center p-1">
              <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-3xl font-bold text-slate-400">
                {student.name.charAt(0)}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{student.name}</h1>
              <p className="text-slate-500 font-medium mt-1">{student.grade} • ID: {student.id.toUpperCase()}</p>
              
              <div className="flex items-center mt-3 space-x-4">
                <div className="flex items-center text-sm font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-slate-100">
                  <span className="w-2 h-2 rounded-full bg-brand-emerald mr-2"></span>
                  Overall Grade: <span className={`ml-2 text-lg font-bold ${overall.color.replace('bg-', 'text-')}`}>{overall.letter}</span>
                </div>
                <Link href={`/reports/${student.id}`} className="text-sm font-medium text-primary hover:text-indigo-700 transition-colors flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                  Download Latest PDF
                </Link>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/60 p-4 rounded-xl border border-slate-200/50 text-center">
              <p className="text-2xl font-bold text-slate-800">{evaluations.length}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-1">Subjects Evaluated</p>
            </div>
            <div className="bg-white/60 p-4 rounded-xl border border-slate-200/50 text-center">
              <p className="text-2xl font-bold text-brand-emerald">96%</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-1">Attendance</p>
            </div>
            <div className="bg-white/60 p-4 rounded-xl border border-slate-200/50 text-center">
              <p className="text-2xl font-bold text-primary">2</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-1">Surahs Memorised</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar border-b border-slate-200">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'reports', label: 'Progress Reports' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'islamic', label: 'Islamic Progress' },
          { id: 'timeline', label: 'Growth Timeline' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-4 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'border-brand-emerald text-brand-emerald bg-brand-emerald/5' 
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* ==================== TAB 1: CHILD OVERVIEW ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Radar Chart Area */}
              <div className="glass-card p-6 flex flex-col items-center justify-center lg:col-span-1">
                <h3 className="text-lg font-bold text-slate-800 w-full text-left mb-2">Subject Performance Array</h3>
                <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={subjectRadarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Performance" dataKey="score" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.4} />
                      <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Subject Score Cards */}
              <div className="lg:col-span-2 glass-card p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex justify-between items-center">
                  Recent Evaluations
                  <button onClick={() => setActiveTab('reports')} className="text-sm font-medium text-primary hover:underline">View Detailed</button>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {evaluations.slice(0, 6).map(ev => {
                    const prog = getOverallProgress(ev.grades);
                    return (
                      <div key={ev.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex justify-between items-center hover:border-brand-emerald/30 transition-colors">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg ${prog.color} bg-opacity-20 flex items-center justify-center mr-3`}>
                            <span className={`font-bold text-lg ${prog.text}`}>{prog.letter}</span>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">{ev.subject}</h4>
                            <p className="text-xs text-slate-500">Evaluated: {new Date(ev.date || ev.created_at || Date.now()).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSelectedEvaluation(ev)}
                          className="text-brand-emerald hover:bg-brand-emerald/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          View Detail
                        </button>
                      </div>
                    );
                  })}
                  {evaluations.length === 0 && (
                    <p className="text-slate-500 col-span-2 py-4">No evaluations available yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 border-l-4 border-l-emerald-500">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="20 6 9 17 4 12"/></svg>
                  Identified Strengths
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start"><span className="text-emerald-500 mr-2 mt-0.5">•</span><span className="text-sm text-slate-700">Excellent pronunciation in Quranic recitation.</span></li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2 mt-0.5">•</span><span className="text-sm text-slate-700">Very active participant in Islamic Studies discussions.</span></li>
                  <li className="flex items-start"><span className="text-emerald-500 mr-2 mt-0.5">•</span><span className="text-sm text-slate-700">Consistently shows great manners with peers.</span></li>
                </ul>
              </div>
              <div className="glass-card p-6 border-l-4 border-l-orange-500">
                <h3 className="text-sm font-bold uppercase tracking-wider text-orange-600 mb-4 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m10.29 3.86 8.59 14.9c.78 1.35-.19 3.04-1.75 3.04H2.87c-1.56 0-2.53-1.69-1.75-3.04l8.59-14.9c.78-1.35 2.12-1.35 2.9 0Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start"><span className="text-orange-500 mr-2 mt-0.5">•</span><span className="text-sm text-slate-700">Needs more practice with Arabic vocabulary recall.</span></li>
                  <li className="flex items-start"><span className="text-orange-500 mr-2 mt-0.5">•</span><span className="text-sm text-slate-700">Handwriting consistency in English assignments.</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: PROGRESS REPORTS ==================== */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              <p className="text-sm font-medium text-slate-600">Showing complete indicator breakdown for the latest reporting cycle.</p>
              <Link href={`/reports/${student.id}`} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Download PDF
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {evaluations.map(ev => {
                const prog = getOverallProgress(ev.grades);
                return (
                  <div key={ev.id} className="glass-card overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-100 p-5 flex justify-between items-center">
                      <div className="flex items-center">
                        <h3 className="text-xl font-bold text-slate-800">{ev.subject}</h3>
                        <span className={`ml-4 px-3 py-1 rounded-full text-xs font-bold ${prog.color} bg-opacity-20 ${prog.text}`}>
                          Overall: {prog.letter}
                        </span>
                      </div>
                      <div className="text-emerald-600 text-sm font-bold flex items-center bg-emerald-50 px-3 py-1 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                        Improved
                      </div>
                    </div>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                      {Object.entries(ev.grades).map(([indicator, grade]) => {
                        const gradeColor = grade === 'A+' || grade === 'A' ? 'text-emerald-600' : 
                                           grade === 'B' ? 'text-blue-600' : 
                                           grade === 'C' ? 'text-orange-500' : 'text-red-500';
                        return (
                          <div key={indicator} className="flex justify-between items-center py-2 border-b border-slate-100 border-dashed">
                            <span className="text-sm font-medium text-slate-600">{indicator}</span>
                            <span className={`text-sm font-bold ${gradeColor}`}>{grade}</span>
                          </div>
                        )
                      })}
                    </div>
                    {ev.comments && (
                      <div className="bg-primary/5 p-4 mx-5 mb-5 rounded-xl border border-primary/10">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Teacher Remarks</p>
                        <p className="text-sm text-slate-700 italic">"{ev.comments}"</p>
                      </div>
                    )}
                  </div>
                );
              })}
              {evaluations.length === 0 && <p className="text-center text-slate-500 py-10">No reports available.</p>}
            </div>
          </div>
        )}

        {/* ==================== TAB 3: ATTENDANCE ==================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Present</p>
                <p className="text-4xl font-bold text-emerald-500">43</p>
                <p className="text-xs text-slate-500 mt-1">Days</p>
              </div>
              <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Total Absent</p>
                <p className="text-4xl font-bold text-orange-500">2</p>
                <p className="text-xs text-slate-500 mt-1">Days</p>
              </div>
              <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Late Arrivals</p>
                <p className="text-4xl font-bold text-slate-700">0</p>
                <p className="text-xs text-slate-500 mt-1">Days</p>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Attendance Trend</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[80, 100]} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Area type="monotone" dataKey="rate" name="Attendance %" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 4: ISLAMIC PROGRESS ==================== */}
        {activeTab === 'islamic' && (
          <div className="space-y-8">
            <div className="bg-brand-emerald text-white rounded-2xl p-8 relative overflow-hidden shadow-lg shadow-emerald-500/20">
              <div className="absolute right-[-20%] top-[-50%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Islamic Foundation & Tarbiyah</h2>
                  <p className="text-emerald-50 max-w-lg">Monitoring the spiritual, ethical, and practical development of the student's Islamic knowledge.</p>
                </div>
                <div className="flex space-x-4">
                  <div className="bg-white/20 px-6 py-3 rounded-xl backdrop-blur-sm text-center">
                    <p className="text-3xl font-bold">2</p>
                    <p className="text-xs uppercase tracking-widest font-semibold text-emerald-100">Surahs</p>
                  </div>
                  <div className="bg-white/20 px-6 py-3 rounded-xl backdrop-blur-sm text-center">
                    <p className="text-3xl font-bold">5</p>
                    <p className="text-xs uppercase tracking-widest font-semibold text-emerald-100">Duas</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Surah Memorisation */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-brand-emerald"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
                  Surah Memorisation
                </h3>
                <div className="space-y-4">
                  {surahs.map(surah => (
                    <div key={surah.name} className="flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-slate-700">{surah.name}</span>
                        {surah.status === 'completed' && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">Completed</span>}
                        {surah.status === 'in-progress' && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">Learning ({surah.progress}%)</span>}
                        {surah.status === 'pending' && <span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded">Pending</span>}
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${surah.status === 'completed' ? 'bg-brand-emerald' : surah.status === 'in-progress' ? 'bg-blue-500' : 'bg-transparent'}`} 
                          style={{ width: surah.status === 'completed' ? '100%' : `${surah.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dua Progress */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
                  Duas Learned
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {duas.map(dua => (
                    <div key={dua} className="flex items-center p-3 rounded-lg border border-slate-100 bg-slate-50">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-3 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <span className="text-sm font-medium text-slate-700">{dua}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manners Radar */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Islamic Manners Profile</h3>
                <p className="text-xs text-slate-500 mb-4">Behavioral traits observed in class</p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={mannersRadarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="trait" tick={{fill: '#475569', fontSize: 11, fontWeight: 600}} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar name="Student" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Skill Bars */}
              <div className="glass-card p-6 flex flex-col justify-center">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Core Islamic Skills</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-700">Salah Awareness & Etiquette</span>
                      <span className="font-bold text-brand-emerald">Advanced</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className="bg-brand-emerald h-3 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-700">Tajweed Application</span>
                      <span className="font-bold text-blue-500">Intermediate</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-slate-700">Recitation Confidence</span>
                      <span className="font-bold text-emerald-600">Excellent</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3">
                      <div className="bg-emerald-500 h-3 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 5: GROWTH TIMELINE ==================== */}
        {activeTab === 'timeline' && (
          <div className="max-w-3xl mx-auto py-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-10 text-center">Academic Journey</h2>
            
            <div className="relative border-l-4 border-brand-emerald/20 ml-6 md:ml-0 md:left-1/2 md:-translate-x-2 space-y-12">
              
              {timelineData.map((item, i) => (
                <div key={i} className={`relative flex items-center md:justify-between w-full ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                  
                  {/* Timeline Dot */}
                  <div className="absolute left-[-11px] md:left-1/2 md:-ml-3 w-6 h-6 rounded-full border-4 border-white bg-brand-emerald shadow-sm z-10"></div>
                  
                  {/* Card Content */}
                  <div className={`w-full md:w-[45%] pl-8 md:pl-0 ${i % 2 === 0 ? 'md:pl-8' : 'md:pr-8'}`}>
                    <div className="glass-card p-6 transform hover:-translate-y-1 transition-transform duration-300">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider mb-2 block">{item.cycle}</span>
                      <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">{item.desc}</p>
                      {item.badge && (
                        <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M12 15l-2 5l9-9l-9-9l2 5l-10 4z"/></svg>
                          {item.badge}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

            </div>
          </div>
        )}
      </div>

      {/* Modal for View Detail */}
      {selectedEvaluation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
            <div className="bg-brand-emerald/5 px-6 py-4 border-b border-brand-emerald/10 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{selectedEvaluation.subject}</h3>
                <p className="text-sm text-slate-500">{selectedEvaluation.reportingCycle}</p>
              </div>
              <button 
                onClick={() => setSelectedEvaluation(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-y-3">
                {Object.entries(selectedEvaluation.grades || {}).map(([indicator, grade]) => {
                  const g = String(grade);
                  const color = g.includes('A') ? 'text-emerald-600' : g.includes('B') ? 'text-blue-600' : g.includes('C') ? 'text-orange-500' : 'text-red-500';
                  return (
                    <div key={indicator} className="flex justify-between items-center py-2 border-b border-slate-100 border-dashed last:border-0">
                      <span className="text-sm font-medium text-slate-600">{indicator}</span>
                      <span className={`text-sm font-bold ${color}`}>{g}</span>
                    </div>
                  );
                })}
                {Object.keys(selectedEvaluation.grades || {}).length === 0 && (
                  <p className="text-center text-slate-500 py-4">No indicators graded.</p>
                )}
              </div>
              {selectedEvaluation.comments && (
                <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Teacher Remarks</h4>
                  <p className="text-sm text-slate-700 italic">"{selectedEvaluation.comments}"</p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedEvaluation(null)}
                className="bg-slate-800 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
