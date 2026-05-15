"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { getDB, initDB, Student, Evaluation } from '@/lib/store';

export default function StudentReportCard() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;
  
  const [student, setStudent] = useState<Student | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  
  useEffect(() => {
    initDB();
    const db = getDB();
    const foundStudent = db.students.find(s => s.id === studentId);
    
    if (foundStudent) {
      setStudent(foundStudent);
      const studentEvals = db.evaluations.filter(e => e.studentId === studentId && e.status === 'submitted');
      setEvaluations(studentEvals);
    }
  }, [studentId]);

  if (!student) {
    return <div className="p-10 text-center text-slate-500">Loading Report Card...</div>;
  }

  const handlePrint = () => {
    window.print();
  };

  const getOverallProgress = (grades: Record<string, string> = {}) => {
    const values = Object.values(grades);
    if (values.length === 0) return { pct: 0, letter: 'N/A' };
    
    const map: Record<string, number> = { "A+": 95, "A": 85, "B": 75, "C": 65, "D": 50 };
    let sum = 0;
    values.forEach(v => sum += map[v] || 75);
    const avg = sum / values.length;
    
    let letter = 'D';
    if (avg >= 90) letter = 'A+';
    else if (avg >= 80) letter = 'A';
    else if (avg >= 70) letter = 'B';
    else if (avg >= 60) letter = 'C';
    
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
          onClick={handlePrint}
          className="bg-brand-emerald hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm transition-all active:scale-[0.98] flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>
          Print / Download PDF
        </button>
      </div>

      {/* Printable Report Card Area */}
      <div className="max-w-4xl mx-auto bg-white p-10 shadow-xl print:shadow-none print:p-0 print:m-0">
        
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
              <p className="text-lg font-bold text-slate-800">{student.id.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Grade/Class</p>
              <p className="text-lg font-bold text-slate-800">{student.grade}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Reporting Cycle</p>
              <p className="text-lg font-bold text-slate-800">{evaluations.length > 0 ? evaluations[0].reportingCycle : "N/A"}</p>
            </div>
          </div>
          <div className="hidden sm:block opacity-80">
            <QRCode value={verificationUrl} size={80} level="M" fgColor="#0f172a" />
            <p className="text-[9px] text-center text-slate-400 mt-2 font-medium">Scan to Verify</p>
          </div>
        </div>

        {/* Grading Key */}
        <div className="mb-8 p-3 rounded-lg border border-slate-200 bg-white flex justify-between items-center text-xs px-6">
          <span className="font-bold text-slate-600 mr-4">Grading Key:</span>
          <div className="flex space-x-6">
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-brand-emerald mr-2"></span> A+ (Excellent)</span>
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span> A (Very Good)</span>
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span> B (Good)</span>
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-2"></span> C (Improving)</span>
            <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span> D (Needs Attention)</span>
          </div>
        </div>

        {/* Evaluations */}
        <div className="space-y-10">
          {evaluations.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-medium">No submitted evaluations found for this period.</div>
          ) : (
            evaluations.map((ev, index) => {
              const progress = getOverallProgress(ev.grades);
              const indicators = Object.entries(ev.grades);
              
              return (
                <div key={ev.id} className={`break-inside-avoid ${index !== 0 ? 'print:mt-10' : ''}`}>
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
                          <span className="text-sm font-bold text-slate-800">{grade}</span>
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

        {/* Parent Support Tips */}
        <div className="mt-12 break-inside-avoid bg-primary/5 border border-primary/10 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-primary mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M2 12h4l3-9 5 18 3-9h5"/></svg>
            Parent Support Tips
          </h3>
          <ul className="text-sm text-slate-700 space-y-2 list-disc list-inside marker:text-primary">
            <li>Encourage daily reading habits, particularly focusing on Quran recitation and Tajweed rules.</li>
            <li>Review the "Needs Attention" and "Improving" areas and dedicate 15 minutes a day for targeted practice.</li>
            <li>Maintain an open dialogue with your child about their classroom experiences and Islamic values.</li>
            <li>Celebrate their "Excellent" achievements to build confidence and positive reinforcement.</li>
          </ul>
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
