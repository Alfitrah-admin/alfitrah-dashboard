"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { useReactToPrint } from 'react-to-print';
import { supabase } from '@/lib/supabase';
import { Student } from '@/lib/store';

export default function StudentReportCard() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;
  
  const [student, setStudent] = useState<Student | null>(null);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef });
  
  useEffect(() => {
    const load = async () => {
      try {
        const { data: studentsData, error: stuError } = await supabase.from('students').select('*').eq('student_id', studentId).limit(1);
        if (studentsData && studentsData.length > 0) {
          const dbStudent = studentsData[0];
          setStudent({
            ...dbStudent,
            admissionId: dbStudent.admission_id || dbStudent.admissionId,
            parentName: dbStudent.parent_name || dbStudent.parentName,
            parentPhone: dbStudent.parent_phone || dbStudent.parentPhone,
          } as Student);
          
          const { data: evalsData, error: evalsError } = await supabase.from('evaluations').select('*').eq('student_id', studentId);
          if (evalsError) {
            setError('Error fetching evaluations.');
          } else if (evalsData) {
            setEvaluations(evalsData.map(e => {
              let parsedGrades = e.grade_value;
              try {
                if (typeof parsedGrades === 'string') parsedGrades = JSON.parse(parsedGrades);
              } catch(err) {}
              return {
                ...e,
                subject: e.subject,
                grades: parsedGrades || {},
                comments: e.teacher_remarks || e.comments || '',
                studentName: dbStudent.name,
                reportingCycle: e.reporting_cycle,
              };
            }));
          }
        } else {
          setError('Student not found');
        }
      } catch (err) {
        console.error('Loading error:', err);
        setError('An unexpected error occurred.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [studentId]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">Loading Report Card...</div>;
  }

  if (error || !student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-slate-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Report Not Available</h2>
          <p className="text-slate-500 mb-6 text-sm">{error || 'Student not found'}</p>
          <button 
            onClick={() => router.back()}
            className="w-full bg-slate-800 text-white font-medium py-3 rounded-xl hover:bg-slate-700 transition-colors shadow-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (evaluations.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-slate-100">
          <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Evaluations Yet</h2>
          <p className="text-slate-500 mb-6 text-sm">No evaluations found for this cycle. Please check back after teacher submission.</p>
          <button 
            onClick={() => router.back()}
            className="w-full bg-slate-800 text-white font-medium py-3 rounded-xl hover:bg-slate-700 transition-colors shadow-sm"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getOverallProgress = (grades: Record<string, string> = {}) => {
    const values = Object.values(grades);
    if (values.length === 0) return { pct: 0, letter: 'E' };
    
    const map: Record<string, number> = { "A": 95, "B": 85, "C": 75, "D": 65, "E": 50 };
    let sum = 0;
    values.forEach(v => sum += map[v] || 75);
    const avg = sum / values.length;
    
    let letter = 'E';
    if (avg >= 90) letter = 'A';
    else if (avg >= 80) letter = 'B';
    else if (avg >= 70) letter = 'C';
    else if (avg >= 60) letter = 'D';
    
    return { pct: Math.round(avg), letter };
  };

  const verificationUrl = typeof window !== 'undefined' ? window.location.href : `https://alfitrah.edu/verify/${studentId}`;

  return (
    <div className="bg-slate-50 min-h-screen py-8 print:py-0 print:bg-white">
      {/* Non-printable action bar */}
      <div className="max-w-4xl mx-auto mb-6 px-4 print:hidden flex justify-between items-center">
        <button 
          onClick={() => router.back()}
          className="text-slate-500 hover:text-primary font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
          Back
        </button>
        <button 
          onClick={() => handlePrint()}
          className="bg-brand-emerald hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-[0.98] flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>
          Print / Download PDF
        </button>
      </div>

      {/* Printable Report Card Area */}
      <div ref={contentRef} className="max-w-4xl mx-auto bg-white p-10 shadow-xl print:shadow-none print:p-0 print:m-0">
        
        {/* Header - Branding */}
        <div className="border-b-4 border-brand-emerald pb-6 mb-8 flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-brand-emerald rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-2xl tracking-tighter leading-none">AL</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">ALFITRAH</h1>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest">Students Dashboard</p>
              <p className="text-xs text-slate-500 mt-1">Nurturing the Innate Goodness</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest">Progress Report</h2>
            <p className="text-sm text-slate-500 mt-1">Academic Year 2026-2027</p>
          </div>
        </div>

        {/* Student Information Section */}
        <div className="bg-slate-50 rounded-2xl p-6 mb-8 flex justify-between items-center border border-slate-100">
          <div className="grid grid-cols-2 gap-x-12 gap-y-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Student Name</p>
              <p className="text-lg font-bold text-slate-800">{student.name}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Student ID</p>
              <p className="text-lg font-bold text-slate-800">{student.admissionId?.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Grade/Class</p>
              <p className="text-lg font-bold text-slate-800">{student.grade}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reporting Cycle</p>
              <p className="text-lg font-bold text-slate-800">{evaluations.length > 0 ? evaluations[0].reportingCycle || "Term 1" : "N/A"}</p>
            </div>
          </div>
          <div className="hidden sm:block opacity-80">
            <QRCode value={verificationUrl} size={80} level="M" fgColor="#0f172a" />
            <p className="text-[9px] text-center text-slate-400 mt-2 font-medium">Scan to Verify</p>
          </div>
        </div>

        {/* Grade Summary Table */}
        <div className="mb-10 bg-white border border-slate-200 rounded-xl overflow-hidden print:border-none">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">Grade Summary</h3>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-3 border-b border-slate-200 text-sm font-bold text-slate-600">Subject</th>
                <th className="px-6 py-3 border-b border-slate-200 text-sm font-bold text-slate-600 w-32">Final Grade</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.length === 0 ? (
                <tr><td colSpan={2} className="px-6 py-4 text-slate-500 text-center">No subjects evaluated yet</td></tr>
              ) : (
                evaluations.map(ev => {
                  const prog = getOverallProgress(ev.grades);
                  return (
                    <tr key={ev.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-6 py-4 text-slate-800 font-medium">{ev.subject}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-brand-emerald">{prog.letter}</span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Attendance Summary */}
        <div className="mb-10 bg-white border border-slate-200 rounded-xl overflow-hidden flex divide-x divide-slate-200 print:border-none">
          <div className="flex-1 p-6 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Days Present</p>
            <p className="text-3xl font-bold text-emerald-500">43</p>
          </div>
          <div className="flex-1 p-6 text-center">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total Days Absent</p>
            <p className="text-3xl font-bold text-orange-500">2</p>
          </div>
        </div>

        {/* Grading Key */}
        <div className="mb-8 p-3 rounded-lg border border-slate-200 bg-white flex flex-col md:flex-row justify-between items-center text-xs px-6 print:border-none">
          <span className="font-bold text-slate-600 mr-4 mb-2 md:mb-0">Grading Key:</span>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-brand-emerald mr-2"></span> A (Excellent)</span>
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span> B (Good)</span>
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span> C (Average)</span>
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span> D (Needs Attention)</span>
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span> E (Poor)</span>
          </div>
        </div>

        {/* Detailed Evaluations Page Break */}
        <div className="print:break-before-page">
          <div className="border-b-4 border-brand-emerald pb-4 mb-8 hidden print:block">
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-widest">Detailed Subject Indicators</h2>
            <p className="text-sm text-slate-500 mt-1">{student.name} | {student.admissionId?.toUpperCase()}</p>
          </div>
          
          <div className="space-y-10">
            {evaluations.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-medium">No submitted evaluations found for this period.</div>
            ) : (
              evaluations.map((ev, index) => {
                const progress = getOverallProgress(ev.grades);
                const indicators = Object.entries(ev.grades);
                
                return (
                  <div key={ev.id} className="break-inside-avoid">
                    <div className="flex justify-between items-center bg-brand-emerald/5 px-6 py-4 rounded-t-2xl border-b border-brand-emerald/10">
                      <h3 className="text-xl font-bold text-slate-800">{ev.subject}</h3>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-semibold text-slate-500">Overall:</span>
                        <span className="bg-white px-3 py-1 rounded-lg font-bold text-brand-emerald border border-brand-emerald/20 shadow-sm">
                          {progress.letter}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border border-t-0 border-slate-100 rounded-b-2xl p-6 bg-white">
                      {/* Indicators Grid */}
                      <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6">
                        {indicators.map(([indicator, grade]) => (
                          <div key={indicator} className="flex justify-between items-center py-1 border-b border-slate-50 border-dashed">
                            <span className="text-sm font-medium text-slate-600">{indicator}</span>
                            <span className="text-sm font-bold text-slate-800">{String(grade)}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Teacher Remarks */}
                      <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Teacher Remarks</h4>
                        <p className="text-sm text-slate-700 italic">"{ev.comments || 'No specific remarks provided.'}"</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-16 pt-8 border-t-2 border-slate-100 flex justify-between items-end break-inside-avoid px-8">
          <div className="text-center w-48">
            <div className="h-16 border-b border-slate-800 mb-2"></div>
            <p className="text-sm font-bold text-slate-800">Class Teacher</p>
            <p className="text-xs text-slate-500">Signature</p>
          </div>
          
          <div className="text-center w-48">
            <div className="h-16 border-b border-slate-800 mb-2 flex items-end justify-center pb-2">
              <span className="text-slate-300 font-serif italic">School Seal</span>
            </div>
            <p className="text-sm font-bold text-slate-800">Principal</p>
            <p className="text-xs text-slate-500">Signature</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-slate-400 print:mb-4">
          <p>This is an electronically generated report by the Alfitrah Students Dashboard.</p>
          <p className="mt-1">Generated on: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
        </div>

      </div>
    </div>
  );
}
