"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Teacher, ReportingCycle, Subject } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function NewEvaluationPage() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [cycles, setCycles] = useState<ReportingCycle[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [selectedCycle, setSelectedCycle] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const parseStringArray = (val: any) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
          if (val.startsWith('[')) {
            try { return JSON.parse(val); } catch(e) {}
          }
          return val.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [];
      };

      const { data: teacherData } = await supabase.from('teachers').select('*').eq('email', session.user.email).limit(1);
      if (teacherData && teacherData.length > 0) {
        const dbTeacher = teacherData[0];
        setTeacher({
          ...dbTeacher,
          subjectsAssigned: parseStringArray(dbTeacher.subjects),
          gradesAssigned: parseStringArray(dbTeacher.grades),
        } as Teacher);
      } else {
        router.push('/');
        return;
      }

      // Get cycles (demo hardcoded or from db)
      // Since we don't have cycles in our store update, let's just use some default cycles
      const defaultCycles: ReportingCycle[] = [
        { id: "rc1", name: "Jun-Jul 2026", startDate: "2026-06-01", endDate: "2026-07-31", gradesIncluded: ["Grade 1: The Pioneers", "Grade 2"], status: "Completed" },
        { id: "rc2", name: "Aug-Sep 2026", startDate: "2026-08-01", endDate: "2026-09-30", gradesIncluded: ["Grade 1: The Pioneers", "Grade 2"], status: "Active" }
      ];
      setCycles(defaultCycles);
      
      const activeCycle = defaultCycles.find(c => c.status === 'Active');
      if (activeCycle) setSelectedCycle(activeCycle.name);
    };

    fetchData();
  }, [router]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycle || !selectedClass || !selectedSubject) return;
    router.push(`/teacher/evaluations/evaluate?class=${encodeURIComponent(selectedClass)}&subject=${encodeURIComponent(selectedSubject)}&cycle=${encodeURIComponent(selectedCycle)}`);
  };

  if (!teacher) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 mt-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">New Evaluation Setup</h2>
        <p className="text-slate-500 text-sm mt-1">Select the parameters to begin evaluating your students.</p>
      </div>

      <div className="glass-card p-6">
        <form onSubmit={handleContinue} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Reporting Cycle</label>
            <select 
              value={selectedCycle}
              onChange={e => setSelectedCycle(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald transition-all bg-white"
              required
            >
              <option value="" disabled>Select a cycle...</option>
              {cycles.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Class / Grade</label>
            <select 
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald transition-all bg-white"
              required
            >
              <option value="" disabled>Select a class...</option>
              {teacher.gradesAssigned?.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            {(!teacher.gradesAssigned || teacher.gradesAssigned.length === 0) && (
              <p className="text-xs text-red-500 mt-1">You have no assigned classes.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
            <select 
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald transition-all bg-white"
              required
            >
              <option value="" disabled>Select a subject...</option>
              {teacher.subjectsAssigned?.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {(!teacher.subjectsAssigned || teacher.subjectsAssigned.length === 0) && (
              <p className="text-xs text-red-500 mt-1">You have no assigned subjects.</p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => router.push('/teacher/evaluations')}
              className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!selectedCycle || !selectedClass || !selectedSubject}
              className="bg-brand-emerald text-white px-8 py-3 rounded-xl font-bold shadow-sm hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Evaluating
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
