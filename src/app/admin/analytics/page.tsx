"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- MOCK DATA ---
const subjectPerformanceData = [
  { name: 'Quran', avgScore: 88, target: 85 },
  { name: 'Islamic Studies', avgScore: 92, target: 85 },
  { name: 'Maths', avgScore: 78, target: 80 },
  { name: 'English', avgScore: 82, target: 80 },
  { name: 'EVS', avgScore: 85, target: 80 },
  { name: 'Arabic', avgScore: 75, target: 85 },
];

const gradeDistributionData = [
  { name: 'A+ (Excellent)', value: 120 },
  { name: 'A (Very Good)', value: 210 },
  { name: 'B (Good)', value: 150 },
  { name: 'C (Improving)', value: 60 },
  { name: 'D (Needs Attention)', value: 25 },
];
const COLORS = ['#10b981', '#22c55e', '#3b82f6', '#f97316', '#ef4444'];

const growthTrendsData = [
  { cycle: 'Term 1', 'Grade 1': 72, 'Grade 2': 75, 'Grade 3': 68 },
  { cycle: 'Term 2', 'Grade 1': 78, 'Grade 2': 77, 'Grade 3': 74 },
  { cycle: 'Term 3', 'Grade 1': 82, 'Grade 2': 84, 'Grade 3': 79 },
  { cycle: 'Term 4', 'Grade 1': 89, 'Grade 2': 88, 'Grade 3': 85 },
];

const quranMemorisationData = [
  { month: 'Sep', memorised: 5, target: 5 },
  { month: 'Oct', memorised: 12, target: 10 },
  { month: 'Nov', memorised: 18, target: 15 },
  { month: 'Dec', memorised: 22, target: 20 },
  { month: 'Jan', memorised: 30, target: 25 },
];

const tajweedPerformanceData = [
  { subject: 'Makharij', A: 85, fullMark: 100 },
  { subject: 'Ghunnah', A: 78, fullMark: 100 },
  { subject: 'Madd', A: 92, fullMark: 100 },
  { subject: 'Qalqalah', A: 65, fullMark: 100 },
  { subject: 'Ikhfa', A: 70, fullMark: 100 },
];

const islamicStudiesParticipation = [
  { name: 'Grade 1', 'Classroom': 95, 'Activities': 88 },
  { name: 'Grade 2', 'Classroom': 92, 'Activities': 90 },
  { name: 'Grade 3', 'Classroom': 85, 'Activities': 75 },
  { name: 'Grade 4', 'Classroom': 88, 'Activities': 82 },
];

const attendanceData = [
  { week: 'W1', present: 98, absent: 2 },
  { week: 'W2', present: 96, absent: 4 },
  { week: 'W3', present: 99, absent: 1 },
  { week: 'W4', present: 92, absent: 8 },
  { week: 'W5', present: 97, absent: 3 },
];

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">School Analytics</h1>
          <p className="text-slate-500 mt-1">Comprehensive insights into student performance and growth.</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 shadow-sm transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-b-4 border-brand-emerald">
          <p className="text-sm font-medium text-slate-500 mb-1">Total Students</p>
          <p className="text-3xl font-bold text-slate-800">565</p>
          <p className="text-xs text-brand-emerald font-medium mt-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m18 15-6-6-6 6"/></svg>
            +12 this term
          </p>
        </div>
        <div className="glass-card p-6 border-b-4 border-primary">
          <p className="text-sm font-medium text-slate-500 mb-1">Average Attendance</p>
          <p className="text-3xl font-bold text-slate-800">96.4%</p>
          <p className="text-xs text-brand-emerald font-medium mt-2 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m18 15-6-6-6 6"/></svg>
            +2.1% from last month
          </p>
        </div>
        <div className="glass-card p-6 border-b-4 border-blue-500">
          <p className="text-sm font-medium text-slate-500 mb-1">Evaluations Completed</p>
          <p className="text-3xl font-bold text-slate-800">1,248</p>
          <p className="text-xs text-slate-500 font-medium mt-2">85% of total required</p>
        </div>
        <div className="glass-card p-6 border-b-4 border-orange-500">
          <p className="text-sm font-medium text-slate-500 mb-1">Avg Quran Progress</p>
          <p className="text-3xl font-bold text-slate-800">A-</p>
          <p className="text-xs text-orange-500 font-medium mt-2">Requires focus on Tajweed</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button onClick={() => setActiveTab('overview')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'overview' ? 'border-brand-emerald text-brand-emerald' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Overview</button>
        <button onClick={() => setActiveTab('quran')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'quran' ? 'border-brand-emerald text-brand-emerald' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Quran & Islamic Studies</button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Subject Performance */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Subject Performance Overview</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px'}} />
                    <Bar dataKey="avgScore" name="Actual Score" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="target" name="Target Score" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grade Distribution */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">School-wide Grade Distribution</h3>
              <div className="h-80 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gradeDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {gradeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Inner Text */}
                <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none hidden md:block">
                  <span className="block text-3xl font-bold text-slate-800">565</span>
                  <span className="block text-xs text-slate-500">Evaluations</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Growth Trends */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Growth Trends Over Reporting Cycles</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={growthTrendsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="cycle" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[60, 100]} />
                    <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px'}} />
                    <Line type="monotone" dataKey="Grade 1" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                    <Line type="monotone" dataKey="Grade 2" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                    <Line type="monotone" dataKey="Grade 3" stroke="#f97316" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Attendance Analytics */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Weekly Attendance Analytics</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 100]} />
                    <YAxis dataKey="week" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px'}} />
                    <Bar dataKey="present" name="Present %" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} barSize={20} />
                    <Bar dataKey="absent" name="Absent %" fill="#ef4444" stackId="a" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'quran' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quran Memorisation */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Quran Memorisation Progress (Surahs)</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={quranMemorisationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px'}} />
                    <Area type="monotone" dataKey="memorised" name="Surahs Memorised" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorMem)" />
                    <Line type="step" dataKey="target" name="Target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tajweed Radar */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-6">Tajweed Performance Mapping</h3>
              <div className="h-80 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={tajweedPerformanceData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{fill: '#475569', fontSize: 12, fontWeight: 500}} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="School Average" dataKey="A" stroke="#10b981" strokeWidth={2} fill="#10b981" fillOpacity={0.5} />
                    <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Islamic Studies Participation Comparison</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={islamicStudiesParticipation} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '12px'}} />
                  <Bar dataKey="Classroom" name="Classroom Etiquette" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="Activities" name="Event Participation" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
