"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Student, Teacher, Evaluation } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [search, setSearch] = useState("");

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
      }

      if (loggedInTeacher) {
        const { data: studentsData } = await supabase.from('students').select('*');
        if (studentsData) {
          const teacherStudents = studentsData
            .map(s => ({
              ...s,
              admissionId: s.admission_id,
            }))
            .filter(s => loggedInTeacher.gradesAssigned.includes(s.grade));
          setStudents(teacherStudents as any[]);
        }

        const { data: evalsData } = await supabase.from('evaluations').select('*');
        if (evalsData) {
          setEvaluations(evalsData.map(e => ({
            ...e,
            studentId: e.student_id,
            subject: e.subject,
            status: e.status,
            date: e.date,
            grades: e.grades,
          })) as any[]);
        }
      }
    };
    fetchData();
  }, []);

  const getRecentGrade = (studentId: string) => {
    if (!teacher?.subjectsAssigned) return "N/A";
    
    // Find the most recent submitted evaluation for this student in a subject taught by this teacher
    const studentEvals = evaluations.filter(e => 
      e.studentId === studentId && 
      e.status === 'submitted' &&
      teacher.subjectsAssigned.includes(e.subject)
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (studentEvals.length > 0) {
      // Just take the first criterion grade as a summary
      const firstGrade = Object.values(studentEvals[0].grades)[0] || 'C';
      return firstGrade;
    }
    return "Pending";
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.admissionId?.toLowerCase().includes(search.toLowerCase())
  );

  if (!teacher) return <div className="p-8">Loading students...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Students</h2>
          <p className="text-sm text-slate-500 mt-1">Students enrolled in your assigned classes.</p>
        </div>
        <div className="flex">
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ID..." 
            className="w-full sm:w-64 px-4 py-2 rounded-xl border border-slate-200/50 bg-white/60 focus:outline-none focus:ring-2 focus:ring-brand-emerald/50" 
          />
        </div>
      </div>
      <div className="glass-card p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-100/50 rounded-t-lg">
              <tr>
                <th className="px-6 py-4 font-semibold rounded-tl-lg">Name</th>
                <th className="px-6 py-4 font-semibold">Admission ID</th>
                <th className="px-6 py-4 font-semibold">Class</th>
                <th className="px-6 py-4 font-semibold">Recent Grade</th>
                <th className="px-6 py-4 font-semibold rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student.id} className="border-b border-slate-200/50 hover:bg-white/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{student.name}</td>
                    <td className="px-6 py-4 text-slate-500">{student.admissionId || student.id}</td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-medium">{student.grade}</span>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {(() => {
                        const grade = getRecentGrade(student.id);
                        if (grade.includes('A')) return <span className="text-brand-emerald">{grade}</span>;
                        if (grade.includes('B')) return <span className="text-blue-600">{grade}</span>;
                        if (grade === 'Pending' || grade === 'N/A') return <span className="text-slate-400 font-normal">{grade}</span>;
                        return <span className="text-amber-600">{grade}</span>;
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/teacher/students/${student.id}`} 
                        className="text-brand-emerald hover:text-emerald-700 bg-brand-emerald/10 hover:bg-brand-emerald/20 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        View Profile
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
