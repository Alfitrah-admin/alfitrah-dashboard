"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDB, initDB } from '@/lib/store';

export default function TeacherLoginPage() {
  const router = useRouter();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    initDB();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const db = getDB();
    const teachers = db.teachers || [];
    
    console.log("Login attempt with Employee ID:", employeeId);
    
    const teacher = teachers.find(t => 
      t.employeeId === employeeId && 
      t.password === password
    );

    if (teacher) {
      console.log("Teacher found:", teacher);
      localStorage.setItem('teacher_logged_in_id', teacher.id);
      router.push('/teacher');
    } else {
      console.log("No matching teacher found for these credentials.");
      setError('Invalid credentials. Please check your details and try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-primary rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" />
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-indigo-500 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" style={{ animationDelay: '2000ms' }} />
        
        <div className="glass-card p-8 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-2">
              Teacher <span className="text-primary">Portal</span>
            </h1>
            <p className="text-slate-500">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Employee ID</label>
              <input 
                type="text" 
                value={employeeId}
                onChange={e => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP001"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white/50"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 px-4 bg-primary hover:bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Use your Employee ID and password to login.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
