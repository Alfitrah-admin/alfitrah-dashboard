"use client";

import { useEffect, useState } from 'react';
import { Student } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function ParentFeedbackPage() {
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      const { data } = await supabase.from('students').select('*').limit(1);
      if (data && data.length > 0) {
        const dbStudent = data[0];
        setStudent({
          ...dbStudent,
          admissionId: dbStudent.admission_id || dbStudent.admissionId,
          parentName: dbStudent.parent_name || dbStudent.parentName,
          parentPhone: dbStudent.parent_phone || dbStudent.parentPhone,
        } as Student);
      }
    };
    fetchStudent();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Teacher Feedback</h2>
      </div>
      <div className="glass-card p-6">
        <div className="space-y-6">
          {student?.id === 's1' ? (
            <>
              <div className="p-5 border border-slate-200/50 rounded-xl bg-white/40">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-brand-emerald/20 flex items-center justify-center text-brand-emerald font-bold text-sm">
                      FZ
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Fatima Zahra</h4>
                      <p className="text-xs text-slate-500">Quran Teacher</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">2 days ago</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Yusuf has been reciting beautifully this week. His memorization of Surah Al-Mulk is progressing very well. Keep encouraging him to practice for 15 minutes every evening at home!
                </p>
              </div>
              
              <div className="p-5 border border-slate-200/50 rounded-xl bg-white/40">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-brand-deep-teal/20 flex items-center justify-center text-brand-deep-teal font-bold text-sm">
                      MA
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">Mohammed Ali</h4>
                      <p className="text-xs text-slate-500">Islamic Studies</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-full">Last week</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  Active participation in class discussions regarding the Prophets. He shows great enthusiasm and asks very insightful questions.
                </p>
              </div>
            </>
          ) : (
            <p className="text-slate-500 text-center py-6">No recent feedback available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
