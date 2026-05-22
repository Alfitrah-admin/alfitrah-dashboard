"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Teacher } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (pathname === '/teacher/login') {
      setIsLoading(false);
      return;
    }

    const fetchTeacher = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        setIsLoading(false);
        return;
      }
      
      const parseStringArray = (val: any) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') {
          if (val.startsWith('[')) {
            try { return JSON.parse(val); } catch(e) {}
          }
          return val.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [];
      };

      const { data } = await supabase.from('teachers').select('*').eq('email', session.user.email).limit(1);
      if (data && data.length > 0) {
        const dbTeacher = data[0];
        setTeacher({
          ...dbTeacher,
          subjectsAssigned: parseStringArray(dbTeacher.subjects),
          gradesAssigned: parseStringArray(dbTeacher.grades),
          employeeId: dbTeacher.employee_id || dbTeacher.employeeId,
          contactNumber: dbTeacher.phone || dbTeacher.contactNumber,
        } as Teacher);
      } else {
        router.replace('/');
      }
      setIsLoading(false);
    };

    fetchTeacher();
  }, [router, pathname]);

  if (pathname === '/teacher/login') return <>{children}</>;

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!teacher) {
    return <div className="p-8">No teacher found.</div>;
  }
  return (
    <div className="min-h-screen flex bg-transparent">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-slate-200/50 flex flex-col hidden md:flex z-20">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Alfitrah<span className="text-brand-emerald block text-sm font-medium">Teacher Portal</span></h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/teacher" className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/teacher' ? 'bg-white/60 text-brand-emerald shadow-sm border border-white/50' : 'text-slate-600 hover:bg-white/40'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            <span>My Classes</span>
          </Link>
          <Link href="/teacher/evaluations" className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith('/teacher/evaluations') ? 'bg-white/60 text-brand-emerald shadow-sm border border-white/50' : 'text-slate-600 hover:bg-white/40'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/></svg>
            <span>Evaluations</span>
          </Link>
          <Link href="/teacher/students" className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith('/teacher/students') ? 'bg-white/60 text-brand-emerald shadow-sm border border-white/50' : 'text-slate-600 hover:bg-white/40'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Students</span>
          </Link>
        </nav>
        <div className="p-4 mt-auto">
          <button onClick={async () => {
            await supabase.auth.signOut();
            router.replace('/');
          }} className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <header className="h-20 glass-panel border-b border-slate-200/50 flex items-center justify-between px-8 z-20 sticky top-0">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Overview</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-brand-emerald/20 flex items-center justify-center text-brand-emerald font-bold shadow-sm border border-white">
              {teacher.name.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8 pb-20 relative">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
