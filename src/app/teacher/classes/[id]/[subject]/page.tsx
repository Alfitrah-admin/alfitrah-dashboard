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
  English: [
    'Reading Fluency',
    'Pronunciation',
    'Vocabulary Usage',
    'Handwriting',
    'Spellings',
    'Sentence Formation',
    'Listening Skills',
    'Speaking Confidence',
    'Grammar Understanding',
    'Creative Writing'
  ],
  Malayalam: [
    "Letter Recognition",
    "Reading Ability",
    "Pronunciation",
    "Vocabulary Understanding",
    "Writing Neatness",
    "Dictation",
    "Sentence Reading",
    "Oral Communication"
  ],
  Hindi: [
    "Letter Recognition",
    "Reading Ability",
    "Pronunciation",
    "Vocabulary Understanding",
    "Writing Neatness",
    "Dictation",
    "Sentence Reading",
    "Oral Communication"
  ],
  Arabic: [
    "Letter Recognition",
    "Reading Fluency",
    "Pronunciation",
    "Writing Skills",
    "Vocabulary Understanding",
    "Recitation Skills",
    "Memorisation",
    "Listening Skills",
    "Islamic Vocabulary Usage"
  ],
  Quran: [
    "Letter Recognition",
    "Tajweed Basics",
    "Pronunciation Accuracy",
    "Fluency in Recitation",
    "Memorisation Progress",
    "Listening and Repetition",
    "Surah Recitation Confidence",
    "Dua Memorisation",
    "Daily Revision Consistency",
    "Respectful Quran Handling"
  ],
  "Islamic Studies": [
    "Understanding Islamic Values",
    "Daily Dua Knowledge",
    "Salah Awareness",
    "Islamic Manners and Etiquettes",
    "Prophet Stories Understanding",
    "Participation in Islamic Activities",
    "Moral Behaviour",
    "Classroom Discipline",
    "Respect Towards Teachers and Friends",
    "Islamic Vocabulary Understanding"
  ],
  EVS: [
    "Concept Understanding",
    "Observation Skills",
    "Environmental Awareness",
    "Activity Participation",
    "Diagram Understanding",
    "General Knowledge",
    "Curiosity and Questioning",
    "Oral Responses"
  ],
  Science: [
    "Concept Understanding",
    "Observation Skills",
    "Scientific Thinking",
    "Experiment Participation",
    "Practical Application",
    "Diagram Understanding",
    "Problem Solving",
    "Environmental Awareness",
    "Curiosity and Inquiry",
    "General Scientific Knowledge"
  ],
  "Social Studies": [
    "Concept Understanding",
    "Map Reading Skills",
    "Historical Awareness",
    "Civic Understanding",
    "Environmental Awareness",
    "Participation in Discussions",
    "General Knowledge",
    "Critical Thinking",
    "Respect for Diversity",
    "Project and Activity Participation"
  ],
  Default: ['General Performance', 'Participation', 'Behavior']
};

const gradeColors: Record<string, string> = {
  A: '#22c55e',
  B: '#3b82f6',
  C: '#eab308',
  D: '#f97316',
  E: '#ef4444'
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
  const [saved, setSaved] = useState(false);
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
    setSaved(false);
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
    setSaved(false);
    const scoresObj = scores;
    try {
      const payload = {
        student_id: selectedStudent.id,
        grade: gradeName,
        subject: subjectName,
        reporting_cycle: cycle,
        grade_value: scoresObj,
        teacher_remarks: remarks
      };
      
      const { data: existingData } = await supabase
        .from('evaluations')
        .select('id')
        .eq('student_id', selectedStudent.id)
        .eq('subject', subjectName)
        .eq('reporting_cycle', cycle)
        .single();
        
      let error;
      if (existingData) {
        const { error: updateError } = await supabase.from('evaluations').update(payload).eq('id', existingData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from('evaluations').insert([payload]);
        error = insertError;
      }

      if (error) throw error;
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
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
              {/* Grade Legend */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                {[
                  { letter: 'A', label: 'Excellent', color: '#22c55e' },
                  { letter: 'B', label: 'Good', color: '#3b82f6' },
                  { letter: 'C', label: 'Average', color: '#eab308' },
                  { letter: 'D', label: 'Needs Improvement', color: '#f97316' },
                  { letter: 'E', label: 'Poor', color: '#ef4444' }
                ].map(({ letter, label, color }) => (
                  <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 12 }}>{letter}</div>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{label}</span>
                  </div>
                ))}
              </div>

              <h4 style={{ marginBottom: 8 }}>{subjectName} Criteria</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {criteria.map((c) => (
                  <div
                    key={c}
                    style={{
                      padding: '16px',
                      borderRadius: 12,
                      border: '1px solid #e2e8f0',
                      background: 'white',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 10, color: '#1e293b', fontSize: 14 }}>
                      {c}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['A','B','C','D','E'].map(letter => (
                        <button
                          key={letter}
                          onClick={() => onSelectScore(c, letter)}
                          style={{
                            padding: '8px 14px',
                            borderRadius: 8,
                            border: scores[c] === letter
                              ? `2px solid ${gradeColors[letter]}`
                              : '1px solid #e2e8f0',
                            background: scores[c] === letter
                              ? gradeColors[letter]
                              : '#f8fafc',
                            color: scores[c] === letter ? 'white' : '#64748b',
                            fontWeight: scores[c] === letter ? 700 : 400,
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
              <h4 style={{ marginBottom: 8 }}>Remarks & Feedback</h4>
              <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder={`Write specific feedback for ${selectedStudent.name}...`} style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 8, border: '1px solid var(--color-border-tertiary)' }} />
            </div>

            {saved && (
              <div style={{ marginTop: 16, padding: '10px 16px', background: '#dcfce7', border: '1px solid #22c55e', borderRadius: 8, color: '#15803d', fontWeight: 600, marginBottom: 12 }}>
                ✅ Evaluation saved successfully!
              </div>
            )}

            <div style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button
                onClick={saveEvaluation}
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
                onClick={() => { setScores({}); setRemarks(''); }}
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
        )}
      </div>
    </div>
  );
}
