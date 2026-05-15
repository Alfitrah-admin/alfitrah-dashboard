"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'admin' | 'teacher' | 'parent'>('admin');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock login based on selected role
    if (role === 'admin') router.push('/admin');
    if (role === 'teacher') router.push('/teacher/login');
    if (role === 'parent') router.push('/parent/login');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-brand-soft-blue rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" />
        <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-brand-muted-teal rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-pulse" style={{ animationDelay: '2000ms' }} />
        
        <div className="glass-card p-8 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 mb-2">
              Alfitrah <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-slate-500">Sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['admin', 'teacher', 'parent'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-2 px-3 text-sm rounded-xl border font-medium transition-colors ${
                      role === r 
                        ? 'bg-primary text-white border-primary shadow-md' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <input 
                type="email" 
                defaultValue={`${role}@alfitrah.edu`}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input 
                type="password" 
                defaultValue="password123"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white/50"
                required
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Mock login: Any password works.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
