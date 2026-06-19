"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useStudent } from '../context';

export default function ParentReportsPage() {
  const { student, isLoading } = useStudent();
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [expandedCycle, setExpandedCycle] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvals = async () => {
      if (!student) return;
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
            reportingCycle: e.reporting_cycle || 'Term 1',
          };
        }));
      }
    };
    fetchEvals();
  }, [student]);

  if (isLoading || !student) return <div className="p-8 text-center text-slate-500">Loading Reports...</div>;

  const getOverallProgress = (grades: Record<string, string> = {}) => {
    const values = Object.values(grades);
    if (values.length === 0) return 'E';
    
    const map: Record<string, number> = { "A+": 95, "A": 85, "B": 75, "C": 65, "D": 50, "E": 40 };
    let sum = 0;
    values.forEach(v => sum += map[v] || 75);
    const avg = sum / values.length;
    
    if (avg >= 90) return 'A';
    if (avg >= 80) return 'B';
    if (avg >= 70) return 'C';
    if (avg >= 60) return 'D';
    return 'E';
  };

  const reportsByCycle = evaluations.reduce((acc, ev) => {
    if (!acc[ev.reportingCycle]) acc[ev.reportingCycle] = [];
    acc[ev.reportingCycle].push(ev);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Academic Reports</h2>
      </div>
      <div className="glass-card p-6">
        <div className="space-y-4">
          {Object.keys(reportsByCycle).length > 0 ? (
            Object.keys(reportsByCycle).map(cycle => {
              const isExpanded = expandedCycle === cycle;
              const cycleEvals = reportsByCycle[cycle];
              
              return (
                <div key={cycle} className="border border-slate-200/50 rounded-xl bg-white/40 overflow-hidden hover:border-brand-emerald/30 transition-colors">
                  <div 
                    onClick={() => setExpandedCycle(isExpanded ? null : cycle)}
                    className="p-5 flex justify-between items-center cursor-pointer group"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-brand-emerald text-white' : 'bg-brand-emerald/10 text-brand-emerald group-hover:bg-brand-emerald group-hover:text-white'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{cycle}</h4>
                        <p className="text-sm text-slate-500">{cycleEvals.length} Subjects Evaluated</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {isExpanded ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m18 15-6-6-6 6"/></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m6 9 6 6 6-6"/></svg>
                      )}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                      <div className="flex justify-between items-center mb-6">
                        <h5 className="font-bold text-slate-700">Subject Overview</h5>
                        <Link 
                          href={`/reports/${student.id}?cycle=${encodeURIComponent(cycle)}`}
                          className="text-sm font-bold bg-brand-emerald hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                          Download PDF Report
                        </Link>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {cycleEvals.map(ev => (
                          <div key={ev.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                            <span className="font-semibold text-slate-700">{ev.subject}</span>
                            <span className="font-bold text-brand-emerald text-lg bg-emerald-50 w-8 h-8 flex items-center justify-center rounded-lg">{getOverallProgress(ev.grades)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-slate-500 text-center py-6">No reports available for this student.</p>
          )}
        </div>
      </div>
    </div>
  );
}
