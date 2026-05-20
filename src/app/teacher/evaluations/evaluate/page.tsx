"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDB, initDB, Student, Evaluation } from '@/lib/store';
import { supabase } from '@/lib/supabase';

function EvaluateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const className = searchParams.get('class');
  const subjectName = searchParams.get('subject');
  const cycleName = searchParams.get('cycle');

  const [students, setStudents] = useState<Student[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [evaluationData, setEvaluationData] = useState<{ grades: Record<string, string>, comments: string }>({ grades: {}, comments: '' });
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  // Common evaluation criteria for simplicity
  const criteria = [
    "Participation",
    "Understanding of Concepts",
    "Homework Completion",
    "Behavior",
    "Overall Progress"
  ];

  const fetchEvaluationsAndStudents = async () => {
    // Note: We're replacing DB calls, but we also need the student list from Supabase
    const { data: studentsData } = await supabase.from('students').select('*').eq('grade', className);
    if (studentsData) {
      // mapping snake_case from db if needed, assuming Student interface has admissionId etc.
      setStudents(studentsData.map(s => ({
        ...s,
        admissionId: s.admission_id || s.admissionId
      })) as any[]);
    }
    
    const { data: evalsData } = await supabase.from('evaluations')
      .select('*')
      .eq('subject', subjectName)
      .eq('grade', className)
      .eq('reporting_cycle', cycleName);
    
    if (evalsData) {
      setEvaluations(evalsData.map(e => ({
        ...e,
        studentId: e.student_id,
        studentName: e.student_name,
        reportingCycle: e.reporting_cycle,
      })) as any[]);
    }
  };

  useEffect(() => {
    if (!className || !subjectName || !cycleName) {
      router.push('/teacher/evaluations');
      return;
    }

    fetchEvaluationsAndStudents();
  }, [className, subjectName, cycleName, router]);

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    const existingEval = evaluations.find(e => 
      e.studentId === student.id && 
      e.subject === subjectName && 
      e.grade === className && 
      e.reportingCycle === cycleName
    );

    if (existingEval) {
      setEvaluationData({ grades: existingEval.grades, comments: existingEval.comments });
    } else {
      // Init default grades
      const initialGrades: Record<string, string> = {};
      criteria.forEach(c => initialGrades[c] = 'B');
      setEvaluationData({ grades: initialGrades, comments: '' });
    }
  };

  const handleSaveEvaluation = async (status: 'draft' | 'submitted') => {
    if (!selectedStudent || !className || !subjectName || !cycleName) return;

    setSaving(true);
    setActionMessage({ type: '', text: '' });

    const evalData = {
      student_id: selectedStudent.id,
      student_name: selectedStudent.name,
      subject: subjectName,
      grade: className,
      reporting_cycle: cycleName,
      grades: evaluationData.grades,
      comments: evaluationData.comments,
      status
    };

    const existingEval = evaluations.find(e => 
      e.studentId === selectedStudent.id && 
      e.subject === subjectName && 
      e.grade === className && 
      e.reportingCycle === cycleName
    );

    let err;

    if (existingEval) {
      const { error } = await supabase.from('evaluations').update(evalData).eq('id', existingEval.id);
      err = error;
    } else {
      const { error } = await supabase.from('evaluations').insert([evalData]);
      err = error;
    }

    setSaving(false);

    if (err) {
      setActionMessage({ type: 'error', text: 'Failed to save evaluation.' });
    } else {
      setActionMessage({ type: 'success', text: `Evaluation ${status === 'submitted' ? 'submitted' : 'saved'} successfully!` });
      fetchEvaluationsAndStudents();
      setTimeout(() => {
        setActionMessage({ type: '', text: '' });
      }, 3000);
    }
  };

  if (!className || !subjectName || !cycleName) return null;

  return (
    <div className="space-y-6 mt-4">
      <div className="flex justify-between items-center">
        <div>
          <button 
            onClick={() => router.push('/teacher/evaluations')}
            className="text-slate-500 hover:text-brand-emerald font-medium flex items-center mb-2 text-sm transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
            Back to Evaluations
          </button>
          <h2 className="text-2xl font-bold text-slate-800">Evaluate: {subjectName}</h2>
          <p className="text-slate-500 text-sm mt-1">{className} • {cycleName}</p>
        </div>
      </div>

      {actionMessage.text && (
        <div className={`p-4 rounded-xl border ${actionMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          {actionMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student List */}
        <div className="lg:col-span-1 glass-card p-4 flex flex-col h-[70vh]">
          <h3 className="font-semibold text-slate-800 mb-4 px-2">Students ({students.length})</h3>
          <div className="overflow-y-auto flex-1 space-y-2 pr-2">
            {students.length === 0 ? (
              <p className="text-slate-500 text-sm px-2">No students found in this class.</p>
            ) : (
              students.map(student => {
                const existingEval = evaluations.find(e => 
                  e.studentId === student.id && 
                  e.subject === subjectName && 
                  e.grade === className && 
                  e.reportingCycle === cycleName
                );
                const isSelected = selectedStudent?.id === student.id;

                return (
                  <button
                    key={student.id}
                    onClick={() => handleStudentClick(student)}
                    className={`w-full text-left p-3 rounded-xl transition-all border ${isSelected ? 'bg-brand-emerald/10 border-brand-emerald shadow-sm' : 'bg-white/40 border-slate-100 hover:bg-white/80'} flex justify-between items-center`}
                  >
                    <div>
                      <p className={`font-medium ${isSelected ? 'text-brand-emerald' : 'text-slate-800'}`}>{student.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">ID: {student.admissionId}</p>
                    </div>
                    {existingEval?.status === 'submitted' ? (
                      <span className="w-6 h-6 rounded-full bg-brand-emerald text-white flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </span>
                    ) : existingEval?.status === 'draft' ? (
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-white flex items-center justify-center text-xs font-bold">D</span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Evaluation Form */}
        <div className="lg:col-span-2 glass-card p-6 h-[70vh] flex flex-col">
          {selectedStudent ? (
            <>
              <div className="border-b border-slate-100 pb-4 mb-6">
                <h3 className="text-xl font-bold text-slate-800">Evaluating: {selectedStudent.name}</h3>
                <p className="text-slate-500 text-sm">{selectedStudent.admissionId}</p>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-4">Criteria Grades</h4>
                  <div className="space-y-4">
                    {criteria.map(criterion => (
                      <div key={criterion} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <span className="text-sm font-medium text-slate-700">{criterion}</span>
                        <select 
                          value={evaluationData.grades[criterion] || 'B'}
                          onChange={e => setEvaluationData(prev => ({ ...prev, grades: { ...prev.grades, [criterion]: e.target.value } }))}
                          className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald"
                        >
                          <option value="A+">A+</option>
                          <option value="A">A</option>
                          <option value="B+">B+</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-3">Teacher Comments</h4>
                  <textarea 
                    value={evaluationData.comments}
                    onChange={e => setEvaluationData(prev => ({ ...prev, comments: e.target.value }))}
                    className="w-full h-32 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald bg-white/50 resize-none"
                    placeholder={`Write your constructive feedback and observations for ${selectedStudent.name.split(' ')[0]} here...`}
                  ></textarea>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end space-x-3 mt-auto">
                <button 
                  onClick={() => handleSaveEvaluation('draft')}
                  disabled={saving}
                  className="px-6 py-2.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button 
                  onClick={() => handleSaveEvaluation('submitted')}
                  disabled={saving}
                  className="px-6 py-2.5 bg-brand-emerald text-white hover:bg-emerald-600 rounded-xl font-bold shadow-sm transition-colors disabled:opacity-50 flex items-center"
                >
                  {saving && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                  {saving ? 'Saving...' : 'Submit Final'}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-50"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <p className="font-medium text-slate-500">Select a student from the list to begin evaluation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EvaluatePage() {
  return (
    <Suspense fallback={<div className="p-8">Loading evaluation system...</div>}>
      <EvaluateContent />
    </Suspense>
  );
}
