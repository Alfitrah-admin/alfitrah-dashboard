"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSubjectsForGrade } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teacher, setTeacher] = useState<any>(null);
  const [userName, setUserName] = useState<string>('Teacher');

  useEffect(() => {
    const fetchData = async () => {
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get teacher
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

      const { data: userData } = await supabase.from('users').select('name').ilike('email', session.user.email).single();
      if (userData && userData.name) {
        setUserName(userData.name.split(' ')[0]);
      }

      const { data: teacherData } = await supabase.from('teachers').select('*').ilike('email', session.user.email).limit(1);
      
      if (teacherData && teacherData.length > 0) {
        const loggedInTeacher = {
          ...teacherData[0],
          subjectsAssigned: parseStringArray(teacherData[0].subjects),
          gradesAssigned: parseStringArray(teacherData[0].grades),
        };
        setTeacher(loggedInTeacher);
        
        // Get classes (from DB or mock if no classes table)
        const { data: studentsData } = await supabase.from('students').select('*');
        if (studentsData) {
          const studentList = studentsData.map(s => ({
            ...s,
            id: s.id,
            grade: s.grade,
            admissionId: s.admission_id,
            parentPhone: s.parent_phone,
            parentName: s.parent_name,
          }));
          setStudents(studentList);
          
          // Mock classes based on assigned grades
          if (loggedInTeacher.gradesAssigned) {
            const assignedClasses = loggedInTeacher.gradesAssigned.map((grade: string) => {
              const shortName = grade.split(':')[0].trim(); // "Grade 4"
              const id = shortName.toLowerCase().replace(/\s+/g, '-'); // "grade-4"
              return { 
                id, 
                name: grade, 
                shortName, 
                studentsCount: studentList.filter(s => s.grade === grade).length 
              };
            });
            setClasses(assignedClasses);
          }
        }

        const { data: evalsData } = await supabase.from('evaluations').select('*');
        if (evalsData) {
          setEvaluations(evalsData.map(e => ({
            ...e,
            studentId: e.student_id,
            studentName: e.student_name,
            reportingCycle: e.reporting_cycle,
          })));
        }
      }
    };
    
    fetchData();
  }, []);

  const getProgress = (className: string) => {
    const classStudents = students.filter(s => s.grade === className);
    const totalStudents = classStudents.length;
    if (totalStudents === 0) return 0;
    
    const numSubjects = teacher?.subjectsAssigned?.length || 0;
    const requiredEvals = totalStudents * numSubjects;
    if (requiredEvals === 0) return 0;
    
    const submittedEvals = evaluations.filter(e => 
      e.grade === className && 
      e.reportingCycle === reportingCycle && 
      e.status === 'submitted' &&
      teacher?.subjectsAssigned?.includes(e.subject)
    ).length;
    return Math.min(100, Math.round((submittedEvals / requiredEvals) * 100));
  };

  const getPendingCount = () => {
    let pending = 0;
    classes.forEach(c => {
      const classStudents = students.filter(s => s.grade === c.name).length;
      const numSubjects = teacher?.subjectsAssigned?.length || 0;
      const required = classStudents * numSubjects;
      const submitted = evaluations.filter(e => 
        e.grade === c.name && 
        e.reportingCycle === reportingCycle && 
        e.status === 'submitted' &&
        teacher?.subjectsAssigned?.includes(e.subject)
      ).length;
      pending += Math.max(0, required - submitted);
    });
    return pending;
  };

  const [reportingCycle, setReportingCycle] = useState("Jun-Jul 2026");
  
  useEffect(() => {
    const savedCycle = localStorage.getItem('reportingCycle');
    if (savedCycle) {
      setReportingCycle(savedCycle);
    } else {
      localStorage.setItem('reportingCycle', "Jun-Jul 2026");
    }
  }, []);

  const handleCycleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCycle = e.target.value;
    setReportingCycle(newCycle);
    localStorage.setItem('reportingCycle', newCycle);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="glass-card p-8 bg-gradient-to-br from-white/60 to-brand-emerald/5 border-brand-emerald/10 relative overflow-hidden">
        <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-brand-emerald/20 rounded-full mix-blend-multiply filter blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome back, {userName}!</h2>
              <p className="text-slate-600">You have <span className="font-semibold text-brand-emerald">{getPendingCount()} pending evaluations</span> for the {reportingCycle} reporting cycle.</p>
            </div>
            <div className="bg-white/80 p-1.5 rounded-xl border border-slate-200/60 shadow-sm flex items-center">
              <span className="text-sm text-slate-500 pl-3 pr-2 font-medium">Cycle:</span>
              <select 
                value={reportingCycle} 
                onChange={handleCycleChange}
                className="bg-transparent border-none text-slate-800 font-semibold focus:ring-0 text-sm cursor-pointer py-1.5"
              >
                <option value="Jun-Jul 2026">Jun-Jul 2026</option>
                <option value="Aug-Sep 2026">Aug-Sep 2026</option>
                <option value="Oct-Nov 2026">Oct-Nov 2026</option>
                <option value="Dec-Jan 2026-27">Dec-Jan 2026-27</option>
                <option value="Feb-Mar 2027">Feb-Mar 2027</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4">
            <Link href="/teacher/evaluations" className="bg-brand-emerald hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-colors flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              Resume Evaluations
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* My Classes */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-slate-800">My Assigned Classes</h3>
          </div>
          <div className="space-y-4">
            {classes.map(c => (
              <Link href={`/teacher/classes/${c.id}`} key={c.id}>
                <div className="glass-card p-5 hover:border-brand-emerald/30 transition-colors group cursor-pointer mb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-brand-emerald/10 flex items-center justify-center text-brand-emerald font-bold text-lg">
                        {c.name.split(' ')[1]}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 group-hover:text-brand-emerald transition-colors">{c.name}</h4>
                        <p className="text-sm text-slate-500">{c.studentsCount} Students</p>
                      </div>
                    </div>
                    <div className="text-brand-emerald opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-slate-800">Evaluation Progress</h3>
          </div>
          <div className="glass-card p-6">
            <h4 className="font-medium text-slate-700 mb-5">Current Cycle Progress</h4>
            
            <div className="space-y-6">
              {classes.length === 0 && <p className="text-sm text-slate-500">No classes assigned to you.</p>}
              {classes.map(c => {
                const progress = getProgress(c.name);
                const classStudents = students.filter(s => s.grade === c.name).length;
                const numSubjects = teacher?.subjectsAssigned?.length || 0; // only teacher's subjects
                const required = classStudents * numSubjects;
                
                // only evaluations matching teacher's subjects
                const submitted = evaluations.filter(e => 
                  e.grade === c.name && 
                  e.reportingCycle === reportingCycle && 
                  e.status === 'submitted' &&
                  teacher?.subjectsAssigned?.includes(e.subject)
                ).length;
                
                return (
                  <div key={`prog-${c.id}`}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-slate-800">{c.name}</span>
                      <span className="text-brand-emerald font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200/50 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-brand-emerald h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">{submitted}/{required} submitted</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Analytics Section */}
      <div className="mt-8 pt-8 border-t border-slate-200/60">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-800">Analytics & Insights</h3>
          <span className="bg-brand-emerald/10 text-brand-emerald px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase">Active Cycle</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 border-l-4 border-l-brand-emerald">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Completion</p>
            <div className="flex items-end space-x-2">
              <p className="text-3xl font-bold text-slate-800">
                {(() => {
                  let req = 0; let sub = 0;
                  classes.forEach(c => {
                    const classStudents = students.filter(s => s.grade === c.name).length;
                    const numSubjects = teacher?.subjectsAssigned?.length || 0;
                    req += classStudents * numSubjects;
                    sub += evaluations.filter(e => 
                      e.grade === c.name && e.reportingCycle === reportingCycle && e.status === 'submitted' && teacher?.subjectsAssigned?.includes(e.subject)
                    ).length;
                  });
                  return req === 0 ? 0 : Math.round((sub / req) * 100);
                })()}%
              </p>
            </div>
          </div>
          
          <div className="glass-card p-6 border-l-4 border-l-indigo-500">
            <p className="text-sm font-medium text-slate-500 mb-1">Completed Evaluations</p>
            <p className="text-3xl font-bold text-slate-800">
              {classes.reduce((acc, c) => acc + evaluations.filter(e => 
                e.grade === c.name && e.reportingCycle === reportingCycle && e.status === 'submitted' && teacher?.subjectsAssigned?.includes(e.subject)
              ).length, 0)}
            </p>
          </div>

          <div className="glass-card p-6 border-l-4 border-l-amber-500">
            <p className="text-sm font-medium text-slate-500 mb-1">Pending Evaluations</p>
            <p className="text-3xl font-bold text-slate-800">{getPendingCount()}</p>
          </div>

          <div className="glass-card p-6 border-l-4 border-l-blue-500">
            <p className="text-sm font-medium text-slate-500 mb-1">Students Assessed</p>
            <p className="text-3xl font-bold text-slate-800">
              {new Set(evaluations.filter(e => e.reportingCycle === reportingCycle && e.status === 'submitted' && teacher?.subjectsAssigned?.includes(e.subject)).map(e => e.studentId)).size}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-6">
            <h4 className="font-semibold text-slate-800 mb-4">Subject-wise Progress</h4>
            <div className="space-y-5">
              {teacher?.subjectsAssigned?.map((subject: string) => {
                let req = 0; let sub = 0;
                classes.forEach(c => {
                  const classStudents = students.filter(s => s.grade === c.name).length;
                  req += classStudents;
                  sub += evaluations.filter(e => 
                    e.grade === c.name && e.subject === subject && e.reportingCycle === reportingCycle && e.status === 'submitted'
                  ).length;
                });
                const progress = req === 0 ? 0 : Math.round((sub / req) * 100);

                return (
                  <div key={subject}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700">{subject}</span>
                      <span className="text-indigo-600 font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {(!teacher?.subjectsAssigned || teacher.subjectsAssigned.length === 0) && (
                <p className="text-sm text-slate-500">No subjects assigned.</p>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h4 className="font-semibold text-slate-800 mb-4">Performance Summary (Average Grades)</h4>
            <div className="space-y-4">
              <p className="text-sm text-slate-500 mb-4">A high-level view of student performance across your assigned subjects based on submitted evaluations.</p>
              
              {teacher?.subjectsAssigned?.map((subject: string) => {
                // Calculate average grade for this subject
                const subjectEvals = evaluations.filter(e => e.subject === subject && e.reportingCycle === reportingCycle && e.status === 'submitted');
                
                let aCount = 0, bCount = 0, cCount = 0;
                subjectEvals.forEach(e => {
                  // just checking the first criterion for a mock average, or count A's
                  const firstGrade = Object.values(e.grades)[0] || 'C';
                  if (firstGrade.includes('A')) aCount++;
                  else if (firstGrade.includes('B')) bCount++;
                  else cCount++;
                });
                
                const total = aCount + bCount + cCount;
                if (total === 0) return null;

                return (
                  <div key={`perf-${subject}`} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-medium text-slate-700 text-sm">{subject}</span>
                    <div className="flex space-x-2 text-xs font-medium">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg" title="Excellent (A/A+)">{aCount} A</span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg" title="Good (B/B+)">{bCount} B</span>
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg" title="Needs Improvement (C/D)">{cCount} C/D</span>
                    </div>
                  </div>
                );
              })}
              {evaluations.filter(e => e.reportingCycle === reportingCycle && e.status === 'submitted' && teacher?.subjectsAssigned?.includes(e.subject)).length === 0 && (
                <p className="text-sm text-slate-500 italic">No evaluated students yet for this cycle to generate performance metrics.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
