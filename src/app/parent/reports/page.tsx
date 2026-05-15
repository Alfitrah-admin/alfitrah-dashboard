"use client";

import { useEffect, useState } from 'react';
import { getDB, initDB, Evaluation } from '@/lib/store';

export default function ParentReportsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    initDB();
    const db = getDB();
    const studentId = localStorage.getItem('parent_logged_in_student_id');
    if (studentId) {
      const childEvals = db.evaluations.filter(ev => ev.studentId === studentId && ev.status === 'submitted');
      setEvaluations(childEvals);
    }
  }, []);

  // Group evaluations by reporting cycle
  const reportsByCycle = evaluations.reduce((acc, ev) => {
    if (!acc[ev.reportingCycle]) acc[ev.reportingCycle] = [];
    acc[ev.reportingCycle].push(ev);
    return acc;
  }, {} as Record<string, Evaluation[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Academic Reports</h2>
      </div>
      <div className="glass-card p-6">
        <div className="space-y-4">
          {Object.keys(reportsByCycle).length > 0 ? (
            Object.keys(reportsByCycle).map(cycle => (
              <div key={cycle} className="p-5 border border-slate-200/50 rounded-xl bg-white/40 flex justify-between items-center hover:border-primary/30 transition-colors cursor-pointer group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{cycle}</h4>
                    <p className="text-sm text-slate-500">Contains {reportsByCycle[cycle].length} subjects</p>
                  </div>
                </div>
                <button className="text-primary font-medium text-sm hover:underline">View Report</button>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-center py-6">No reports available for this student.</p>
          )}
        </div>
      </div>
    </div>
  );
}
