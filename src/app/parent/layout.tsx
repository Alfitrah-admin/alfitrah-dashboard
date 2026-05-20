"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Student } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/');
        setIsLoading(false);
        return;
      }
      
      const { data } = await supabase.from('students').select('*').limit(1);
      if (data && data.length > 0) {
        const dbStudent = data[0];
        setStudent({
          ...dbStudent,
          admissionId: dbStudent.admission_id || dbStudent.admissionId,
          parentName: dbStudent.parent_name || dbStudent.parentName,
          parentPhone: dbStudent.parent_phone || dbStudent.parentPhone,
        } as Student);
      } else {
        router.replace('/');
      }
      setIsLoading(false);
    };

    fetchStudent();
  }, [router, pathname]);



  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-slate-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">No student found for this login</h2>
          <p className="text-slate-500 mb-6 text-sm">Please log in again or check your admission ID.</p>
          <button 
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace('/');
            }}
            className="w-full bg-brand-emerald text-white font-medium py-3 rounded-xl hover:bg-emerald-600 transition-colors shadow-sm"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex bg-transparent">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-slate-200/50 flex flex-col hidden md:flex z-20">
        <div className="p-6 flex flex-col items-center border-b border-white/40">
          <div className="w-20 h-20 rounded-full bg-brand-soft-blue mb-3 border-4 border-white shadow-sm flex items-center justify-center overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-primary/40"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight text-center">{student.name}</h2>
          <span className="text-primary text-xs font-medium bg-primary/10 px-3 py-1 rounded-full mt-2">{student.grade}</span>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/parent" className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/parent' ? 'bg-white/60 text-primary shadow-sm border border-white/50' : 'text-slate-600 hover:bg-white/40'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>My Child</span>
          </Link>
          <Link href="/parent/reports" className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith('/parent/reports') ? 'bg-white/60 text-primary shadow-sm border border-white/50' : 'text-slate-600 hover:bg-white/40'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>Reports</span>
          </Link>
          <Link href="/parent/attendance" className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith('/parent/attendance') ? 'bg-white/60 text-primary shadow-sm border border-white/50' : 'text-slate-600 hover:bg-white/40'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
            <span>Attendance</span>
          </Link>
          <Link href="/parent/feedback" className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith('/parent/feedback') ? 'bg-white/60 text-primary shadow-sm border border-white/50' : 'text-slate-600 hover:bg-white/40'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>Feedback</span>
          </Link>
          <Link href="/parent/settings" className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith('/parent/settings') ? 'bg-white/60 text-primary shadow-sm border border-white/50' : 'text-slate-600 hover:bg-white/40'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Settings</span>
          </Link>
        </nav>
        <div className="p-4 mt-auto border-t border-white/40 pt-4">
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
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Student Overview</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-slate-600 hidden sm:block">Parent: {student.parentName || 'Parent'}</span>
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold shadow-sm border border-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
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
