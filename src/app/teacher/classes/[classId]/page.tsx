"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ClassSubjectsPage() {
  const params = useParams();
  const classId = params.classId as string;
  const [classInfo, setClassInfo] = useState<any>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [studentsCount, setStudentsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassData = async () => {
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

      const { data: teacherData } = await supabase.from('teachers').select('*').ilike('email', session.user.email).limit(1);
      
      let gradeName = "Grade 1";
      let assignedSubjects: string[] = [];
      if (teacherData && teacherData.length > 0) {
        const grades = parseStringArray(teacherData[0].grades);
        assignedSubjects = parseStringArray(teacherData[0].subjects);
        
        // Match the classId (c0, c1, etc) with the index in grades
        const idxMatch = classId.match(/^c(\d+)$/);
        if (idxMatch && grades.length > parseInt(idxMatch[1])) {
          gradeName = grades[parseInt(idxMatch[1])];
        } else {
          // If the classId is the grade string itself URL encoded
          const decoded = decodeURIComponent(classId);
          if (grades.includes(decoded)) {
            gradeName = decoded;
          } else {
            gradeName = grades[0] || "Grade 1";
          }
        }
      }

      setClassInfo({ id: classId, name: gradeName });
      
      // Optional: you can filter subjects by both what's assigned to the teacher and what's assigned to the grade
      setSubjects(assignedSubjects);

      const { data: studentsData } = await supabase.from('students').select('*').eq('grade', gradeName);
      if (studentsData) {
        setStudentsCount(studentsData.length);
      }

      const { data: evalsData } = await supabase.from('evaluations').select('*').eq('grade', gradeName);
      if (evalsData) {
        setEvaluations(evalsData);
      }
      
      setLoading(false);
    };

    fetchClassData();
  }, [classId]);

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading class data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6">
        <Link href="/teacher" className="text-slate-500 hover:text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{classInfo?.name} - Subjects</h2>
          <p className="text-sm text-slate-500">{studentsCount} Students enrolled</p>
        </div>
      </div>

      {studentsCount === 0 && (
        <div className="glass-card p-6 mb-6 text-center text-slate-600 bg-slate-50/50">
          No students found in this grade.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          // Calculate progress for this specific subject
          const subjectEvals = evaluations.filter(e => e.subject === subject).length;
          const progress = studentsCount > 0 ? Math.round((subjectEvals / studentsCount) * 100) : 0;
          const isComplete = progress === 100;

          return (
            <Link href={`/teacher/classes/${classId}/${encodeURIComponent(subject)}`} key={subject}>
              <div className={`glass-card p-6 h-full flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-lg ${isComplete ? 'border-brand-emerald/30 bg-brand-emerald/5' : 'hover:border-primary/30'}`}>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isComplete ? 'bg-brand-emerald/20 text-brand-emerald' : 'bg-primary/10 text-primary'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                    </div>
                    {isComplete && (
                      <span className="inline-flex items-center rounded-full bg-brand-emerald/10 px-2 py-1 text-xs font-medium text-brand-emerald">
                        Completed
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg mb-1">{subject}</h3>
                  <p className="text-sm text-slate-500">{subjectEvals} of {studentsCount} evaluated</p>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-600">Progress</span>
                    <span className={`font-bold ${isComplete ? 'text-brand-emerald' : 'text-primary'}`}>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200/50 rounded-full h-1.5 overflow-hidden">
                    <div className={`h-1.5 rounded-full ${isComplete ? 'bg-brand-emerald' : 'bg-primary'}`} style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
