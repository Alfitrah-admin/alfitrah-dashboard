'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // adjust path if your supabase client is elsewhere

// Subject criteria mapping
const SUBJECT_CRITERIA: Record<string, string[]> = {
  Maths: [
    'Number Understanding',
    'Addition Skills',
    'Subtraction Skills',
    'Multiplication Skills',
    'Division Skills',
    'Mental Maths',
    'Word Problem Solving',
    'Table Memorisation',
    'Accuracy',
    'Logical Thinking',
    'Geometry & Shapes',
    'Fractions & Decimals'
  ],
  'Computer Science': [
    'Computer Parts Identification',
    'Mouse Control',
    'Keyboard Familiarity',
    'Typing Basics',
    'Digital Confidence',
    'Creativity in Activities',
    'Following Instructions',
    'Understanding AI',
    'Basic Software Usage',
    'Online Safety & Ethics',
    'Basic Problem Solving/Logic'
  ],
  Default: ['General Performance', 'Participation', 'Behavior']
};

function slugToText(slug: string) {
  if (!slug) return '';
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SubjectEvaluationPage() {
  const params = useParams();
  const id = params.id as string;
  const subject = params.subject as string;
  const gradeName = useMemo(() => slugToText(id), [id]); // "Grade 4"
  const subjectName = useMemo(() => slugToText(subject), [subject]); // "Maths" or "Computer Science"
  const criteria = SUBJECT_CRITERIA[subjectName] ?? SUBJECT_CRITERIA['Default'];

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);
  const [cycle, setCycle] = useState<string>('Jun-Jul 2026'); // adapt to your cycle logic

  useEffect(() => {
    let mounted = true;
    async function loadStudents() {
      setLoading(true);
      setStudents([]);
      setSelectedStudent(null);
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*')
          .ilike('grade', `${gradeName}%`);
        if (error) throw error;
        if (!mounted) return;
        setStudents(data || []);
        if ((data || []).length > 0) setSelectedStudent((data as any[])[0]);
      } catch (err) {
        console.error('Failed to load students for', gradeName, err);
        setStudents([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadStudents();
    return () => { mounted = false; };
  }, [gradeName]);

  useEffect(() => {
    setScores({});
    setRemarks('');
    if (!selectedStudent) return;
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('evaluations')
          .select('grade_value, teacher_remarks')
          .eq('student_id', selectedStudent.id)
          .eq('subject', subjectName)
          .eq('reporting_cycle', cycle)
          .single();
        if (!mounted) return;
        if (data) {
          const existing = typeof data.grade_value === 'string' ? JSON.parse(data.grade_value) : data.grade_value;
          setScores(existing || {});
          setRemarks(data.teacher_remarks || '');
        }
      } catch (e) {
        // ignore not found
      }
    })();
    return () => { mounted = false; };
  }, [selectedStudent, subjectName, cycle]);

  function onSelectScore(criterion: string, letter: string) {
    setScores(prev => ({ ...prev, [criterion]: letter }));
  }

  async function saveEvaluation() {
    if (!selectedStudent) return;
    setSaving(true);
    const scoresObj = scores;
    try {
      const payload = {
        student_id: selectedStudent.id,
        grade: gradeName,
        subject: subjectName,
        reporting_cycle: cycle,
        grade_value: scoresObj, // if your DB expects text, stringify: JSON.stringify(scoresObj)
        teacher_remarks: remarks
      };
      const { error } = await supabase.from('evaluations').insert([payload]);
      if (error) throw error;
      alert('Saved successfully');
    } catch (err) {
      console.error('Failed to save evaluation', err);
      alert('Failed to save evaluation. Check console.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ display: 'flex', gap: 24, padding: 24 }}>
      <div style={{ width: 320, background: 'var(--color-background-secondary)', borderRadius: 12, padding: 12 }}>
        <h3 style={{ margin: '8px 12px' }}>{subjectName} — {gradeName}</h3>
        <div style={{ maxHeight: '64vh', overflow: 'auto' }}>
          {loading ? <div style={{ padding: 20 }}>Loading students...</div> :
            students.length === 0 ? <div style={{ padding: 20 }}>No students found in this grade.</div> :
            students.map((s) => (
              <div key={s.id} onClick={() => setSelectedStudent(s)} style={{
                padding: '10px 12px', margin: '6px', borderRadius: 8, cursor: 'pointer',
                background: selectedStudent?.id === s.id ? 'rgba(99,102,241,0.12)' : 'transparent'
              }}>
                <div style={{ fontWeight: 500 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>ID: {s.admission_id || s.id}</div>
              </div>
            ))
          }
        </div>
      </div>

      <div style={{ flex: 1, background: 'white', borderRadius: 12, padding: 20 }}>
        {!selectedStudent ? <div style={{ padding: 30, textAlign: 'center', color: 'var(--color-text-tertiary)' }}>Select a student to begin evaluation</div> : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <h2 style={{ margin: 0 }}>{selectedStudent.name}</h2>
                <div style={{ color: 'var(--color-text-tertiary)', fontSize: 13 }}>ID: {selectedStudent.id}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>Progress</div>
                <div style={{ width: 180, height: 12, borderRadius: 8, background: '#eef2ff' }}>
                  <div style={{ width: '0%', height: '100%', borderRadius: 8, background: '#60a5fa' }} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <h4 style={{ marginBottom: 8 }}>{subjectName} Criteria</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {criteria.map((c) => (
                  <div key={c} style={{ padding: 12, borderRadius: 8, border: '1px solid var(--color-border-tertiary)' }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>{c}</div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-start' }}>
                      {['A','B','C','D','E'].map(letter => (
                        <button key={letter} onClick={() => onSelectScore(c, letter)} style={{
                          padding: '6px 10px', borderRadius: 6,
                          border: scores[c] === letter ? '1px solid var(--color-text-info)' : '1px solid var(--color-border-tertiary)',
                          background: scores[c] === letter ? 'rgba(99,102,241,0.12)' : 'transparent', cursor: 'pointer'
                        }}>{letter}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <h4 style={{ marginBottom: 8 }}>Remarks & Feedback</h4>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder={`Write specific feedback for ${selectedStudent.name}...`} style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 8, border: '1px solid var(--color-border-tertiary)' }} />
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
              <button onClick={saveEvaluation} disabled={saving} style={{ padding: '10px 16px', background: 'var(--color-text-info)', color: 'white', borderRadius: 8, border: 'none', cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save Evaluation'}</button>
              <button onClick={() => { setScores({}); setRemarks(''); }} style={{ padding: '10px 16px', background: 'transparent', borderRadius: 8, border: '1px solid var(--color-border-tertiary)', cursor: 'pointer' }}>Reset</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
