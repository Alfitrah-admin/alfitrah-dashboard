"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDB, initDB } from '@/lib/store';

export default function ParentLoginPage() {
  const router = useRouter();
  const [admissionId, setAdmissionId] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    initDB();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const db = getDB();
    const students = db.students || [];
    
    console.log("Login attempt with Admission ID:", admissionId);
    
    const student = students.find(s => 
      s.admissionId === admissionId && 
      s.parentPhone === parentPhone && 
      s.parentPassword === password
    );

    if (student) {
      console.log("Student found:", student);
      localStorage.setItem('parent_logged_in_student_id', student.id);
      router.push('/parent');
    } else {
      console.log("No matching student found for these credentials.");
      setError('Invalid credentials. Please check your details and try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-brand-soft-blue rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" />
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-brand-emerald rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" style={{ animationDelay: '2000ms' }} />
        
        <div className="glass-card p-8 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-2">
              Parent <span className="text-brand-emerald">Portal</span>
            </h1>
            <p className="text-slate-500">Sign in to view your child's progress</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Student Admission ID</label>
              <input 
                type="text" 
                value={admissionId}
                onChange={e => setAdmissionId(e.target.value)}
                placeholder="e.g. ADM-2026-001"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald transition-all bg-white/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Parent Phone Number</label>
              <input 
                type="text" 
                value={parentPhone}
                onChange={e => setParentPhone(e.target.value)}
                placeholder="e.g. 0501234567"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald transition-all bg-white/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald transition-all bg-white/50"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 px-4 bg-brand-emerald hover:bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Use your child's admission ID and registered phone number to login.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
