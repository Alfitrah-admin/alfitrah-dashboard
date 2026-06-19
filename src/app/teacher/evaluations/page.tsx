"use client";
import { useRouter } from "next/navigation";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Evaluation, Teacher, Student } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function EvaluationsPage() {
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeCycle, setActiveCycle] = useState<string>("");
  const [teacherEmail, setTeacherEmail] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setTeacherEmail(session.user.email);

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
      
      let loggedInTeacher = null;
      if (teacherData && teacherData.length > 0) {
        loggedInTeacher = {
          ...teacherData[0],
          subjectsAssigned: parseStringArray(teacherData[0].subjects),
          gradesAssigned: parseStringArray(teacherData[0].grades),
        } as Teacher;
        setTeacher(loggedInTeacher);
      }

      if (loggedInTeacher) {
        const { data: studentsData } = await supabase.from('students').select('*');
        if (studentsData) {
          setStudents(studentsData.map(s => ({
            ...s,
            admissionId: s.admission_id
          })) as any[]);
        }

        const { data: evalsData } = await supabase.from('evaluations').select('*');
        if (evalsData) {
          setEvaluations(evalsData.map(e => ({
            ...e,
            studentId: e.student_id,
            studentName: e.student_name,
            reportingCycle: e.reporting_cycle,
          })) as any[]);
        }
      }

      // active cycle
      setActiveCycle("Jun-Jul 2026");
    };
    
    fetchData();
  }, []);

  if (!teacher) return <div className="p-8">Loading evaluations...</div>;

  // Generate pending evaluation tasks for the active cycle based on teacher's assignments
  const pendingTasks: { grade: string, subject: string, remaining: number, total: number }[] = [];
  
  if (teacher.gradesAssigned && teacher.subjectsAssigned) {
    teacher.gradesAssigned.forEach(grade => {
      const classStudents = students.filter(s => s.grade === grade);
      const total = classStudents.length;
      
      if (total > 0) {
        teacher.subjectsAssigned.forEach(subject => {
          const submittedCount = evaluations.filter(e => 
            e.grade === grade && 
            e.subject === subject && 
            e.reportingCycle === activeCycle &&
            e.status === 'submitted'
          ).length;
          
          if (submittedCount < total) {
            pendingTasks.push({
              grade,
              subject,
              remaining: total - submittedCount,
              total
            });
          }
        });
      }
    });
  }

  // Filter recent evaluations (teacher's own submitted evals)
  const recentEvaluations = evaluations.filter(e => 
    (e.teacher_email === teacherEmail || 
    (teacher.subjectsAssigned?.includes(e.subject) && teacher.gradesAssigned?.includes(e.grade))) &&
    e.status === 'submitted'
  ).sort((a, b) => new Date(b.created_at || b.date || 0).getTime() - new Date(a.created_at || a.date || 0).getTime()).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Evaluations</h2>
          <p className="text-sm text-slate-500 mt-1">Active Cycle: {activeCycle}</p>
        </div>
        <Link 
          href="/teacher/evaluations/new"
          className="bg-brand-emerald text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm hover:bg-emerald-600 transition-colors"
        >
          New Evaluation Setup
        </Link>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Pending Tasks ({activeCycle})</h3>
        <div className="space-y-4 mb-8">
          {pendingTasks.length === 0 ? (
            <div className="p-6 border border-slate-200/50 rounded-xl bg-slate-50/50 text-center">
              <span className="w-12 h-12 rounded-full bg-brand-emerald/10 text-brand-emerald flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </span>
              <p className="text-slate-600 font-medium">All caught up!</p>
              <p className="text-slate-500 text-sm mt-1">You have completed all evaluations for this cycle.</p>
            </div>
          ) : (
            pendingTasks.map((task, idx) => (
              <div key={idx} className="p-4 border border-slate-200/50 rounded-xl bg-white/40 flex justify-between items-center hover:border-brand-emerald/30 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-sm border border-amber-100">
                    {task.grade.split(' ')[1] || task.grade}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">{task.grade} - {task.subject}</h4>
                    <p className="text-sm text-slate-500">{task.remaining} of {task.total} students remaining</p>
                  </div>
                </div>
                <Link 
                  href={`/teacher/evaluations/evaluate?class=${encodeURIComponent(task.grade)}&subject=${encodeURIComponent(task.subject)}&cycle=${encodeURIComponent(activeCycle)}`} 
                  className="text-brand-emerald font-medium text-sm hover:bg-brand-emerald/10 px-4 py-2 rounded-lg transition-colors border border-brand-emerald/20"
                >
                  {task.remaining === task.total ? 'Start' : 'Continue'}
                </Link>
              </div>
            ))
          )}
        </div>

        <h3 className="text-lg font-semibold text-slate-800 mb-4 mt-8">Recent Submissions</h3>
        <div className="space-y-4">
          {recentEvaluations.length === 0 ? (
            <p className="text-slate-500 text-sm">No recent evaluations found.</p>
          ) : (
            recentEvaluations.map((ev) => (
              <div key={ev.id} className="p-4 border border-slate-200/50 rounded-xl bg-white/40 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
                <div>
                  <h4 className="font-medium text-slate-800">{ev.studentName}</h4>
                  <p className="text-sm text-slate-500">{ev.grade} • {ev.subject}</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-brand-emerald/10 text-brand-emerald text-xs font-medium mb-1">
                    Submitted
                  </span>
                  <p className="text-xs text-slate-400">
                    {new Date(ev.created_at || ev.date || Date.now()).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
