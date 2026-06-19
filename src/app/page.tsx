"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'admin' | 'teacher' | 'parent'>('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleChange = (r: 'admin' | 'teacher' | 'parent') => {
    setRole(r);
    setEmail(r === 'parent' ? '' : `${r}@alfitrah.com`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (role === 'parent') {
        const admissionId = email; // For parent, 'email' state is actually 'admission_id'
        
        const { data: student, error: fetchError } = await supabase
          .from('students')
          .select('*')
          .eq('admission_id', admissionId)
          .maybeSingle();

        if (fetchError || !student) {
          throw new Error("Invalid Admission ID or Password");
        }

        const validPassword = student.parent_password || `parent${admissionId}`;

        if (password !== validPassword) {
          throw new Error("Invalid Admission ID or Password");
        }

        // Successfully authenticated as parent
        localStorage.setItem('parentAdmissionId', admissionId);
        router.push('/parent');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .ilike('email', email)
            .ilike('role', role)
            .maybeSingle();

          if (userError || !userData) {
            await supabase.auth.signOut();
            throw new Error("Invalid role selected for this account");
          }

          if (role === 'admin') router.push('/admin');
          else if (role === 'teacher') router.push('/teacher');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
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
                    onClick={() => handleRoleChange(r)}
                    className={`py-2 px-3 text-sm rounded-xl border font-medium transition-colors ${role === r
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
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {role === 'parent' ? 'Admission ID' : 'Email Address'}
              </label>
              <input
                type={role === 'parent' ? 'text' : 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white/50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white/50"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : 'Sign In'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
