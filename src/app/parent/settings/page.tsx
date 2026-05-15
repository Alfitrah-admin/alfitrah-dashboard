"use client";

import { useState, useEffect } from 'react';
import { getDB, setDB, Student } from '@/lib/store';

export default function ParentSettings() {
  const [student, setStudent] = useState<Student | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const db = getDB();
    const studentId = localStorage.getItem('parent_logged_in_student_id');
    if (studentId) {
      const loggedInStudent = db.students.find(s => s.id === studentId);
      if (loggedInStudent) setStudent(loggedInStudent);
    }
  }, []);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    if (password.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }

    if (student) {
      const db = getDB();
      const idx = db.students.findIndex(s => s.id === student.id);
      if (idx >= 0) {
        db.students[idx] = { ...db.students[idx], parentPassword: password };
        setDB(db);
        setMessage({ text: 'Password updated successfully.', type: 'success' });
        setPassword('');
        setConfirmPassword('');
      }
    }
  };

  if (!student) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="glass-card p-8 bg-gradient-to-br from-white to-brand-soft-blue/10">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-brand-emerald"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          Account Settings
        </h2>
        
        <div className="max-w-md">
          {message.text && (
            <div className={`mb-6 p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-100 pb-2 mb-4">Change Password</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">New Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald"
                required
              />
            </div>
            
            <button type="submit" className="mt-4 px-6 py-2 bg-brand-emerald hover:bg-emerald-600 text-white rounded-lg font-bold shadow-sm transition-colors">
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
