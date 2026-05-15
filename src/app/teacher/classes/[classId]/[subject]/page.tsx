"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDB, initDB, saveEvaluation, Student, Evaluation } from '@/lib/store';
import { getIndicatorsForSubject, GRADES } from '@/lib/constants';

export default function SubjectEvaluationWorkflow() {
  const params = useParams();
  const router = useRouter();
  const classId = params.classId as string;
  const subjectName = decodeURIComponent(params.subject as string);
  
  const [classInfo, setClassInfo] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [indicators, setIndicators] = useState<string[]>([]);
  const [reportingCycle, setReportingCycle] = useState("Jun-Jul 2026");
  
  // Workflow state
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ grades: Record<string, string>; comments: string }>({ grades: {}, comments: '' });
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initDB();
    const db = getDB();
    const foundClass = db.classes.find(c => c.id === classId);
    
    const cycle = localStorage.getItem('reportingCycle') || "Jun-Jul 2026";
    setReportingCycle(cycle);

    if (foundClass) {
      setClassInfo(foundClass);
      
      const classStudents = db.students.filter(s => s.grade === foundClass.name);
      setStudents(classStudents);
      
      const evals = db.evaluations.filter(e => e.grade === foundClass.name && e.subject === subjectName && e.reportingCycle === cycle);
      setEvaluations(evals);
      
      const subjectIndicators = getIndicatorsForSubject(subjectName);
      setIndicators(subjectIndicators);
      
      if (classStudents.length > 0) {
        setSelectedStudentId(classStudents[0].id);
      }
    }
  }, [classId, subjectName]);

  // Load student data into form when selected student changes
  useEffect(() => {
    if (!selectedStudentId) return;

    const existingEval = evaluations.find(e => e.studentId === selectedStudentId);
    if (existingEval) {
      setFormData({
        grades: { ...existingEval.grades },
        comments: existingEval.comments || ''
      });
    } else {
      // Default to B for all indicators
      const defaultGrades: Record<string, string> = {};
      indicators.forEach(ind => defaultGrades[ind] = "B");
      setFormData({ grades: defaultGrades, comments: '' });
    }
    setIsDirty(false);
    setSaveStatus('');
  }, [selectedStudentId, evaluations, indicators]);

  // Auto-save logic
  useEffect(() => {
    if (isDirty) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave('draft');
      }, 30000); // Auto save every 30 seconds
    }
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [formData, isDirty]);

  const handleGradeChange = (indicator: string, gradeValue: string) => {
    setFormData(prev => ({
      ...prev,
      grades: { ...prev.grades, [indicator]: gradeValue }
    }));
    setIsDirty(true);
  };

  const handleCommentChange = (comments: string) => {
    setFormData(prev => ({ ...prev, comments }));
    setIsDirty(true);
  };

  const handleSave = (status: 'draft' | 'submitted') => {
    if (!classInfo || !selectedStudentId) return;
    const student = students.find(s => s.id === selectedStudentId);
    if (!student) return;

    const evalPayload = {
      studentId: student.id,
      studentName: student.name,
      grade: classInfo.name,
      subject: subjectName,
      reportingCycle: reportingCycle,
      grades: formData.grades,
      comments: formData.comments,
      status: status
    };

    saveEvaluation(evalPayload);
    setSaveStatus(status === 'draft' ? 'Draft saved' : 'Evaluation submitted');
    setIsDirty(false);

    // Update local evaluations list
    setEvaluations(prev => {
      const idx = prev.findIndex(e => e.studentId === student.id);
      const newEval = { ...evalPayload, id: prev[idx]?.id || `e${Date.now()}`, date: new Date().toISOString() };
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newEval;
        return next;
      }
      return [newEval, ...prev];
    });

    // If submitted, move to next student automatically
    if (status === 'submitted') {
      const currentIndex = students.findIndex(s => s.id === selectedStudentId);
      if (currentIndex < students.length - 1) {
        setTimeout(() => setSelectedStudentId(students[currentIndex + 1].id), 500);
      }
    }
  };

  if (!classInfo) {
    return <div className="p-8 text-center text-slate-500">Loading evaluation workflow...</div>;
  }

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const submittedCount = evaluations.filter(e => e.status === 'submitted').length;

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="flex items-center space-x-4">
          <Link href={`/teacher/classes/${classId}`} className="text-slate-500 hover:text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{subjectName} Evaluation</h2>
            <p className="text-sm text-slate-500">{classInfo.name} • {reportingCycle}</p>
          </div>
        </div>
        
        <div className="bg-white/80 px-4 py-2 rounded-full border border-slate-200/60 shadow-sm flex items-center">
          <span className="text-sm font-medium text-slate-600 mr-2">Progress:</span>
          <div className="w-24 bg-slate-200 rounded-full h-2 mr-3 overflow-hidden">
            <div className="bg-brand-emerald h-full" style={{ width: `${(submittedCount / students.length) * 100}%` }}></div>
          </div>
          <span className="text-sm font-bold text-brand-emerald">{submittedCount}/{students.length}</span>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        
        {/* Left Sidebar: Student List */}
        <div className="w-1/3 glass-card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200/50 shrink-0">
            <h3 className="font-semibold text-slate-800">Students</h3>
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {students.map((student) => {
              const ev = evaluations.find(e => e.studentId === student.id);
              const isSelected = student.id === selectedStudentId;
              const status = ev ? ev.status : 'pending';

              return (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors ${
                    isSelected ? 'bg-primary/10 border border-primary/20 shadow-sm' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs mr-3">
                      {student.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-slate-700'}`}>{student.name}</h4>
                    </div>
                  </div>
                  <div>
                    {status === 'submitted' && (
                      <div className="w-5 h-5 rounded-full bg-brand-emerald flex items-center justify-center text-white" title="Submitted">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                    )}
                    {status === 'draft' && (
                      <div className="w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center text-white" title="Draft">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                      </div>
                    )}
                    {status === 'pending' && (
                      <div className="w-2 h-2 rounded-full bg-slate-300" title="Not Started"></div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Area: Evaluation Form */}
        <div className="w-2/3 glass-card flex flex-col overflow-hidden relative">
          {selectedStudent ? (
            <>
              <div className="p-6 border-b border-slate-200/50 shrink-0 flex justify-between items-center bg-white/40">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-500">ID: {selectedStudent.id}</p>
                </div>
                {saveStatus && (
                  <span className="text-sm font-medium text-brand-emerald animate-pulse">✓ {saveStatus}</span>
                )}
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {indicators.map(indicator => {
                    const currentVal = formData.grades[indicator] || "B";
                    const gradeObj = GRADES.find(g => g.value === currentVal) || GRADES[2];
                    
                    return (
                      <div key={indicator} className="flex flex-col">
                        <label className="text-xs font-semibold text-slate-700 mb-1">{indicator}</label>
                        <select
                          value={currentVal}
                          onChange={(e) => handleGradeChange(indicator, e.target.value)}
                          className={`px-3 py-2 text-sm font-medium rounded-lg border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-emerald transition-colors ${gradeObj.color}`}
                        >
                          {GRADES.map(g => (
                            <option key={g.value} value={g.value} className="bg-white text-slate-800 font-normal">
                              {g.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks & Feedback</label>
                  <textarea 
                    value={formData.comments}
                    onChange={(e) => handleCommentChange(e.target.value)}
                    rows={4}
                    placeholder={`Write specific feedback for ${selectedStudent.name.split(' ')[0]}...`}
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald bg-white/70 resize-none transition-shadow"
                  ></textarea>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200/50 shrink-0 flex justify-end space-x-3 bg-white/60">
                <button 
                  onClick={() => handleSave('draft')}
                  className="px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold shadow-sm transition-colors flex items-center"
                >
                  Save as Draft
                </button>
                <button 
                  onClick={() => handleSave('submitted')}
                  className="px-6 py-2.5 bg-brand-emerald hover:bg-emerald-600 text-white rounded-xl font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98] flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M20 6 9 17l-5-5"/></svg>
                  Submit Final
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              Select a student to begin evaluation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
