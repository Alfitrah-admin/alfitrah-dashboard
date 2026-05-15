"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDB, initDB, setDB, ReportingCycle, Teacher, Student, Evaluation } from '@/lib/store';

export default function ReportsAdmin() {
  const [cycles, setCycles] = useState<ReportingCycle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ReportingCycle>>({ gradesIncluded: [] });
  
  // Navigation State
  const [activeView, setActiveView] = useState<'list' | 'manage' | 'results'>('list');
  const [selectedCycle, setSelectedCycle] = useState<ReportingCycle | null>(null);

  // Data for Manage/Results views
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  const ALL_GRADES = ["Grade 1: The Pioneers", "Grade 1: The Visionaries", "Grade 2", "Grade 3", "Grade 4"];

  useEffect(() => {
    initDB();
    const db = getDB();
    setCycles(db.reportingCycles);
    setTeachers(db.teachers);
    setStudents(db.students);
    setEvaluations(db.evaluations);
  }, []);

  const openModal = () => {
    setFormData({
      id: `rc${Date.now()}`,
      status: 'Active',
      gradesIncluded: ALL_GRADES
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ gradesIncluded: [] });
  };

  const handleSaveCycle = () => {
    if (!formData.name || !formData.startDate || !formData.endDate) return alert("Please fill all required fields");
    
    const db = getDB();
    db.reportingCycles.push(formData as ReportingCycle);
    setDB(db);
    setCycles(db.reportingCycles);
    closeModal();
  };

  const markCompleted = (id: string) => {
    if (confirm("Are you sure you want to mark this cycle as Completed? This locks evaluations.")) {
      const db = getDB();
      const idx = db.reportingCycles.findIndex(c => c.id === id);
      if (idx >= 0) db.reportingCycles[idx].status = 'Completed';
      setDB(db);
      setCycles(db.reportingCycles);
    }
  };

  const toggleGrade = (grade: string) => {
    setFormData(prev => {
      const list = prev.gradesIncluded || [];
      if (list.includes(grade)) return { ...prev, gradesIncluded: list.filter(g => g !== grade) };
      return { ...prev, gradesIncluded: [...list, grade] };
    });
  };

  const viewManage = (cycle: ReportingCycle) => {
    setSelectedCycle(cycle);
    setActiveView('manage');
  };

  const viewResults = (cycle: ReportingCycle) => {
    setSelectedCycle(cycle);
    setActiveView('results');
  };

  // ----- RENDER MANAGE VIEW -----
  if (activeView === 'manage' && selectedCycle) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <button onClick={() => setActiveView('list')} className="text-slate-500 hover:text-primary font-medium flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
              Back to Reports
            </button>
            <h2 className="text-2xl font-bold text-slate-800">Manage: {selectedCycle.name}</h2>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Teacher Completion Status</h3>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Teacher</th>
                <th className="px-6 py-4 font-semibold">Subjects</th>
                <th className="px-6 py-4 font-semibold">Progress</th>
                <th className="px-6 py-4 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map(t => {
                // Simplistic completion logic for UI demonstration
                const teacherEvals = evaluations.filter(e => e.reportingCycle === selectedCycle.name && t.subjectsAssigned?.includes(e.subject));
                const submitted = teacherEvals.filter(e => e.status === 'submitted').length;
                
                // Assume 10 evals required for demo if not accurately calculable without specific class assignments
                const required = t.gradesAssigned?.length ? t.gradesAssigned.length * 5 : 10;
                const progressPct = Math.min(100, Math.round((submitted / required) * 100)) || 0;
                
                return (
                  <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-800">{t.name}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {t.subjectsAssigned?.join(", ") || 'None'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-full bg-slate-200 rounded-full h-2 max-w-[150px]">
                          <div className={`h-2 rounded-full ${progressPct === 100 ? 'bg-brand-emerald' : 'bg-primary'}`} style={{ width: `${progressPct}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{progressPct}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {progressPct === 100 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Completed</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">In Progress</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ----- RENDER RESULTS VIEW -----
  if (activeView === 'results' && selectedCycle) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <button onClick={() => setActiveView('list')} className="text-slate-500 hover:text-primary font-medium flex items-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
              Back to Reports
            </button>
            <h2 className="text-2xl font-bold text-slate-800">Results: {selectedCycle.name}</h2>
          </div>
          <button className="bg-brand-emerald hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition-colors flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export All PDFs
          </button>
        </div>

        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold">Grade</th>
                <th className="px-6 py-4 font-semibold">Evaluations Submitted</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => {
                const stuEvals = evaluations.filter(e => e.reportingCycle === selectedCycle.name && e.studentId === s.id && e.status === 'submitted');
                return (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-800">{s.name}</td>
                    <td className="px-6 py-4 text-slate-600">{s.grade}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-700">{stuEvals.length}</span> <span className="text-slate-500">subjects evaluated</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/reports/${s.id}`} target="_blank" className="text-primary hover:underline font-medium">View Report</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ----- RENDER MAIN LIST VIEW -----
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin" className="text-slate-500 hover:text-primary font-medium flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
            Back to Admin
          </Link>
          <h2 className="text-2xl font-bold text-slate-800">Reporting Cycles</h2>
        </div>
        <button 
          onClick={openModal}
          className="bg-brand-emerald hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          New Cycle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cycles.map(c => (
          <div key={c.id} className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-800">{c.name}</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  c.status === 'Completed' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {c.status}
                </span>
              </div>
              <div className="space-y-2 mb-6 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-700">Period:</span> {c.startDate} to {c.endDate}</p>
                <p><span className="font-semibold text-slate-700">Grades:</span> {c.gradesIncluded?.length || 0} grades included</p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
              {c.status === 'Active' ? (
                <>
                  <button onClick={() => markCompleted(c.id)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors">Mark Completed</button>
                  <button onClick={() => viewManage(c)} className="px-4 py-2 bg-primary hover:bg-indigo-700 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">Manage Status</button>
                </>
              ) : (
                <button onClick={() => viewResults(c)} className="px-4 py-2 bg-brand-emerald hover:bg-emerald-600 text-white font-bold rounded-lg text-sm transition-colors shadow-sm">View Results</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">Create New Reporting Cycle</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cycle Name</label>
                <input 
                  type="text" 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald"
                  placeholder="e.g. Feb-Mar 2027"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={formData.startDate || ''} 
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={formData.endDate || ''} 
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-600 mb-2">Grades Included</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GRADES.map(gr => (
                    <label key={gr} className={`px-4 py-2 border rounded-xl text-sm font-medium cursor-pointer transition-colors ${formData.gradesIncluded?.includes(gr) ? 'bg-brand-emerald/10 border-brand-emerald/30 text-brand-emerald' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={formData.gradesIncluded?.includes(gr)}
                        onChange={() => toggleGrade(gr)}
                      />
                      {gr}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">Cancel</button>
              <button onClick={handleSaveCycle} className="bg-brand-emerald hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">Create Cycle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
