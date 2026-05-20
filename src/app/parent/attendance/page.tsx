"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';
import { Student } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function ParentAttendancePage() {
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

  if (!student) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Attendance Record</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col justify-center border-l-4 border-l-brand-emerald transform hover:-translate-y-1 transition-all duration-300">
          <p className="text-sm font-medium text-slate-500 mb-1">Present</p>
          <p className="text-3xl font-bold text-slate-800">{student.id === 's1' ? '44' : '20'}</p>
        </div>
        <div className="glass-card p-6 flex flex-col justify-center border-l-4 border-l-amber-500 transform hover:-translate-y-1 transition-all duration-300">
          <p className="text-sm font-medium text-slate-500 mb-1">Late</p>
          <p className="text-3xl font-bold text-slate-800">{student.id === 's1' ? '1' : '0'}</p>
        </div>
        <div className="glass-card p-6 flex flex-col justify-center border-l-4 border-l-red-500 transform hover:-translate-y-1 transition-all duration-300">
          <p className="text-sm font-medium text-slate-500 mb-1">Absent</p>
          <p className="text-3xl font-bold text-slate-800">{student.id === 's1' ? '0' : '2'}</p>
        </div>
      </div>
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent History</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0">
            <div>
              <p className="font-medium text-slate-800">October 12, 2026</p>
              <p className="text-xs text-slate-500">Regular Class Day</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-brand-emerald/10 px-2.5 py-0.5 text-xs font-medium text-brand-emerald">Present</span>
          </div>
          <div className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0">
            <div>
              <p className="font-medium text-slate-800">October 11, 2026</p>
              <p className="text-xs text-slate-500">Regular Class Day</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-brand-emerald/10 px-2.5 py-0.5 text-xs font-medium text-brand-emerald">Present</span>
          </div>
          {student.id === 's1' && (
            <div className="flex justify-between items-center p-3 border-b border-slate-100 last:border-0">
              <div>
                <p className="font-medium text-slate-800">October 10, 2026</p>
                <p className="text-xs text-slate-500">Arrived 15 mins late</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600">Late</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
