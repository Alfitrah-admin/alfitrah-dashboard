"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-transparent">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-slate-200/50 flex flex-col hidden md:flex z-20">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Alfitrah<span className="text-primary block text-sm font-medium">Admin Portal</span></h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/admin" className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname === '/admin' ? 'bg-white/60 text-primary shadow-sm border border-white/50' : 'text-slate-600 hover:bg-white/40'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/students" className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith('/admin/students') ? 'bg-white/60 text-primary shadow-sm border border-white/50' : 'text-slate-600 hover:bg-white/40'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Students</span>
          </Link>
          <Link href="/admin/teachers" className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith('/admin/teachers') ? 'bg-white/60 text-primary shadow-sm border border-white/50' : 'text-slate-600 hover:bg-white/40'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            <span>Teachers</span>
          </Link>
          <Link href="/admin/subjects" className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith('/admin/subjects') ? 'bg-white/60 text-primary shadow-sm border border-white/50' : 'text-slate-600 hover:bg-white/40'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            <span>Subjects</span>
          </Link>
          <Link href="/admin/reports" className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith('/admin/reports') ? 'bg-white/60 text-primary shadow-sm border border-white/50' : 'text-slate-600 hover:bg-white/40'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>Reports</span>
          </Link>
          <Link href="/admin/analytics" className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${pathname.startsWith('/admin/analytics') ? 'bg-white/60 text-primary shadow-sm border border-white/50' : 'text-slate-600 hover:bg-white/40'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
            <span>Analytics</span>
          </Link>
        </nav>
        <div className="p-4 mt-auto">
          <Link href="/" replace className="flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
            <span>Log Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        <header className="h-20 glass-panel border-b border-slate-200/50 flex items-center justify-between px-8 z-20 sticky top-0">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Overview</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-full bg-brand-soft-blue flex items-center justify-center text-primary font-bold shadow-sm border border-white">
              AD
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-8 pb-20 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
