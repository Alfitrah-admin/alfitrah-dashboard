"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getDB, initDB, Student, Evaluation } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { getIndicatorsForSubject, GRADES } from '@/lib/constants';

const gradeColors: Record<string, string> = {
  A: '#22c55e',
  B: '#3b82f6',
  C: '#eab308',
  D: '#f97316',
  E: '#ef4444'
};

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
  const [saved, setSaved] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  const criteria = getIndicatorsForSubject(subjectName || "");

  const fetchEvaluationsAndStudents = async () => {
    const gradeName = className ? className.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';

    const { data: studentsData } = await supabase.from('students').select('*').ilike('grade', `${gradeName}%`);
    if (studentsData) {
      setStudents(studentsData.map(s => ({
        ...s,
        admissionId: s.admission_id || s.admissionId
      })) as any[]);
    }
    
    const { data: evalsData } = await supabase.from('evaluations')
      .select('*')
      .eq('subject', subjectName)
      .ilike('grade', `${gradeName}%`)
      .eq('reporting_cycle', cycleName);
    
    if (evalsData) {
      setEvaluations(evalsData.map(e => ({
        ...e,
        student_id: e.student_id,
        studentName: e.student_name,
        reporting_cycle: e.reporting_cycle,
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
    setSaved(false);
    const existingEval = evaluations.find(e => 
      e.student_id === student.id && 
      e.subject === subjectName && 
      e.grade === className && 
      e.reporting_cycle === cycleName
    );

    if (existingEval) {
      setEvaluationData({ grades: existingEval.grade_value || existingEval.grades || {}, comments: existingEval.comments || '' });
    } else {
      // Init default grades empty
      setEvaluationData({ grades: {}, comments: '' });
    }
  };

  const handleSaveEvaluation = async (status: 'draft' | 'submitted') => {
    if (!selectedStudent || !className || !subjectName || !cycleName) return;

    setSaving(true);
    setSaved(false);
    setActionMessage({ type: '', text: '' });

    const evalData = {
      student_id: selectedStudent.id,
      student_name: selectedStudent.name,
      subject: subjectName,
      grade: className,
      reporting_cycle: cycleName,
      grade_value: evaluationData.grades,
      comments: evaluationData.comments,
      status
    };

    const existingEval = evaluations.find(e => 
      e.student_id === selectedStudent.id && 
      e.subject === subjectName && 
      e.grade === className && 
      e.reporting_cycle === cycleName
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
      setSaved(true);
      fetchEvaluationsAndStudents();
      setTimeout(() => {
        setSaved(false);
      }, 3000);
    }
  };

  const onSelectScore = (criterion: string, letter: string) => {
    setEvaluationData(prev => ({ ...prev, grades: { ...prev.grades, [criterion]: letter } }));
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
                  e.student_id === student.id && 
                  e.subject === subjectName && 
                  e.grade === className && 
                  e.reporting_cycle === cycleName
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
              <div className="border-b border-slate-100 pb-4 mb-6 flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Evaluating: {selectedStudent.name}</h3>
                  <p className="text-slate-500 text-sm">ID: {selectedStudent.admissionId}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                <div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                    {[
                      { letter: 'A', label: 'Excellent', color: '#22c55e' },
                      { letter: 'B', label: 'Good', color: '#3b82f6' },
                      { letter: 'C', label: 'Average', color: '#eab308' },
                      { letter: 'D', label: 'Needs Improvement', color: '#f97316' },
                      { letter: 'E', label: 'Poor', color: '#ef4444' }
                    ].map(({ letter, label, color }) => (
                      <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 24, height: 24, borderRadius: 6, background: color, display: 'flex', alignItems: 'center', justifyItems: 'center', color: 'white', fontWeight: 700, fontSize: 12, textAlign: 'center', paddingLeft: 8 }}>{letter}</div>
                        <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
                      </div>
                    ))}
                  </div>

                  <h4 className="font-semibold text-slate-800 mb-4">Criteria Grades</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {criteria.map(criterion => (
                      <div
                        key={criterion}
                        style={{
                          padding: '16px',
                          borderRadius: 12,
                          border: '1px solid #e2e8f0',
                          background: 'white',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                        }}
                      >
                        <div style={{ fontWeight: 600, marginBottom: 10, color: '#1e293b', fontSize: 14 }}>
                          {criterion}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {['A','B','C','D','E'].map(letter => (
                            <button
                              key={letter}
                              onClick={() => onSelectScore(criterion, letter)}
                              style={{
                                padding: '8px 14px',
                                borderRadius: 8,
                                border: evaluationData.grades[criterion] === letter
                                  ? `2px solid ${gradeColors[letter]}`
                                  : '1px solid #e2e8f0',
                                background: evaluationData.grades[criterion] === letter
                                  ? gradeColors[letter]
                                  : '#f8fafc',
                                color: evaluationData.grades[criterion] === letter ? 'white' : '#64748b',
                                fontWeight: evaluationData.grades[criterion] === letter ? 700 : 400,
                                cursor: 'pointer',
                                fontSize: 14,
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {letter}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 18 }}>
                  <h4 className="font-semibold text-slate-800 mb-3">Remarks & Feedback</h4>
                  <textarea 
                    value={evaluationData.comments}
                    onChange={e => setEvaluationData(prev => ({ ...prev, comments: e.target.value }))}
                    className="w-full h-32 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald bg-white/50 resize-none"
                    placeholder={`Write your constructive feedback and observations for ${selectedStudent.name.split(' ')[0]} here...`}
                  ></textarea>
                </div>
              </div>

              {saved && (
                <div style={{ marginTop: 16, padding: '10px 16px', background: '#dcfce7', border: '1px solid #22c55e', borderRadius: 8, color: '#15803d', fontWeight: 600, marginBottom: 12 }}>
                  ✅ Evaluation saved successfully!
                </div>
              )}

              <div style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'center', paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => handleSaveEvaluation('submitted')}
                  disabled={saving}
                  style={{
                    padding: '12px 32px',
                    background: saving ? '#94a3b8' : '#22c55e',
                    color: 'white',
                    borderRadius: 10,
                    border: 'none',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                    fontSize: 16,
                    boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {saving ? '⏳ Saving...' : '✅ Submit Evaluation'}
                </button>
              
                <button
                  onClick={() => setEvaluationData({ grades: {}, comments: '' })}
                  style={{
                    padding: '12px 24px',
                    background: 'transparent',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: 14,
                    color: '#64748b'
                  }}
                >
                  🔄 Reset
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
