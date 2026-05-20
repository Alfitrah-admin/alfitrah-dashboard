"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Student, Teacher, Evaluation } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: teacherData } = await supabase.from('teachers').select('*').limit(1);
      
      let loggedInTeacher = null;
      if (teacherData && teacherData.length > 0) {
        loggedInTeacher = {
          ...teacherData[0],
          subjectsAssigned: teacherData[0].subjects_assigned || [],
          gradesAssigned: teacherData[0].grades_assigned || [],
        } as Teacher;
        setTeacher(loggedInTeacher);
      } else {
        router.push('/');
        return;
      }

      if (loggedInTeacher) {
        const { data: studentData } = await supabase.from('students').select('*').eq('id', studentId).limit(1);
        if (studentData && studentData.length > 0) {
          const foundStudent = studentData[0];
          
          if (loggedInTeacher.gradesAssigned.includes(foundStudent.grade)) {
            setStudent({
              ...foundStudent,
              admissionId: foundStudent.admission_id
            } as Student);
            
            const { data: evalsData } = await supabase.from('evaluations')
              .select('*')
              .eq('student_id', studentId)
              .eq('status', 'submitted');
              
            if (evalsData) {
              const studentEvals = evalsData.filter(e => loggedInTeacher.subjectsAssigned.includes(e.subject)).map(e => ({
                ...e,
                studentId: e.student_id,
                reportingCycle: e.reporting_cycle,
              }));
              setEvaluations(studentEvals as any[]);
            }
          } else {
            router.push('/teacher/students');
          }
        } else {
          router.push('/teacher/students');
        }
      }
    };
    
    fetchData();
  }, [studentId, router]);

  if (!student || !teacher) return <div className="p-8">Loading profile...</div>;

  // Derive mock attendance from student id
  const mockAttendance = {
    present: student.id === 's1' ? 44 : 20,
    late: student.id === 's1' ? 1 : 0,
    absent: student.id === 's1' ? 0 : 2,
  };
  
  const totalDays = mockAttendance.present + mockAttendance.late + mockAttendance.absent;
  const attendanceRate = totalDays > 0 ? Math.round((mockAttendance.present / totalDays) * 100) : 100;

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center space-x-4 mb-6">
        <Link 
          href="/teacher/students"
          className="text-slate-500 hover:text-brand-emerald font-medium flex items-center transition-colors bg-white/50 px-3 py-1.5 rounded-lg border border-slate-200/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="glass-card p-6 md:col-span-1 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-brand-emerald/10 border-4 border-white shadow-sm flex items-center justify-center text-brand-emerald font-bold text-3xl mb-4">
            {student.name.substring(0, 2).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
          <p className="text-slate-500 font-medium mb-4">{student.admissionId || student.id}</p>
          
          <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            {student.grade}
          </span>

          <div className="w-full pt-4 border-t border-slate-100/60">
            <h4 className="text-sm font-bold text-slate-800 text-left mb-3">Attendance Summary</h4>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-500">Present</span>
              <span className="text-sm font-semibold text-brand-emerald">{mockAttendance.present}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-500">Late</span>
              <span className="text-sm font-semibold text-amber-500">{mockAttendance.late}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-slate-500">Absent</span>
              <span className="text-sm font-semibold text-red-500">{mockAttendance.absent}</span>
            </div>
            
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-brand-emerald h-2 rounded-full" style={{ width: `${attendanceRate}%` }}></div>
            </div>
            <p className="text-xs text-slate-400 mt-2 text-right">{attendanceRate}% Rate</p>
          </div>
        </div>

        {/* Evaluations & Progress */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Latest Grades & Evaluations</h3>
            <p className="text-sm text-slate-500 mb-6">Showing evaluations from your assigned subjects.</p>
            
            {evaluations.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl text-center">
                <p className="text-slate-500 font-medium">No evaluations submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {evaluations.map(ev => {
                  const firstGrade = Object.values(ev.grades)[0] || 'C';
                  return (
                    <div key={ev.id} className="p-4 border border-slate-100 bg-slate-50/50 rounded-xl">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-slate-800">{ev.subject}</h4>
                          <p className="text-xs text-slate-500">Cycle: {ev.reportingCycle} • {new Date(ev.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${firstGrade.includes('A') ? 'bg-green-100 text-green-700' : firstGrade.includes('B') ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                          {firstGrade}
                        </span>
                      </div>
                      
                      {ev.comments && (
                        <div className="mt-3 p-3 bg-white border border-slate-100 rounded-lg">
                          <p className="text-sm font-semibold text-slate-700 mb-1">Teacher Remarks:</p>
                          <p className="text-sm text-slate-600 italic">"{ev.comments}"</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Islamic Progress Summary</h3>
            <div className="p-4 border border-slate-100 bg-brand-emerald/5 rounded-xl">
              {teacher.subjectsAssigned.some(s => s.toLowerCase().includes('quran') || s.toLowerCase().includes('islamic')) ? (
                <p className="text-sm text-slate-700 leading-relaxed">
                  Based on recent evaluations, {student.name.split(' ')[0]} is showing steady progress in Islamic studies and Quran memorization. Continuous practice at home is recommended to maintain fluency.
                </p>
              ) : (
                <p className="text-sm text-slate-500 italic">Islamic progress is managed by the respective Quran/Islamic Studies teachers.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
