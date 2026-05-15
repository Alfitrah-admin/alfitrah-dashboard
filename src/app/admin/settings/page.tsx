"use client";

import { useState, useEffect } from 'react';
import { getDB, initDB } from '@/lib/store';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'teachers' | 'students' | 'classes'>('teachers');
  const [data, setData] = useState({ teachers: [], students: [], classes: [] });

  useEffect(() => {
    initDB();
    const db = getDB();
    setData({
      teachers: db.teachers,
      students: db.students,
      classes: db.classes
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
        <button className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm hover:bg-primary/90 transition-colors">
          Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="flex border-b border-slate-200/50 bg-white/30">
          {(['teachers', 'students', 'classes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-primary text-primary bg-white/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
              }`}
            >
              Manage {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'teachers' && (
            <div className="space-y-4">
              {data.teachers.map((t: any) => (
                <div key={t.id} className="p-4 border border-slate-200/50 rounded-xl bg-white/40 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800">{t.name}</h4>
                    <p className="text-sm text-slate-500">{t.subject}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-sm text-slate-500 hover:text-primary">Edit</button>
                    <button className="text-sm text-slate-500 hover:text-red-500">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'students' && (
            <div className="space-y-4">
              {data.students.map((s: any) => (
                <div key={s.id} className="p-4 border border-slate-200/50 rounded-xl bg-white/40 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800">{s.name}</h4>
                    <p className="text-sm text-slate-500">{s.grade}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-sm text-slate-500 hover:text-primary">Edit</button>
                    <button className="text-sm text-slate-500 hover:text-red-500">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="space-y-4">
              {data.classes.map((c: any) => (
                <div key={c.id} className="p-4 border border-slate-200/50 rounded-xl bg-white/40 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800">{c.name}</h4>
                    <p className="text-sm text-slate-500">{c.studentsCount} Students</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="text-sm text-slate-500 hover:text-primary">Edit</button>
                    <button className="text-sm text-slate-500 hover:text-red-500">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
