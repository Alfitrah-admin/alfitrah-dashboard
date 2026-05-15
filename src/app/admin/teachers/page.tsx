"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDB, initDB, setDB, Teacher } from '@/lib/store';

export default function TeachersAdmin() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState<Partial<Teacher>>({ subjectsAssigned: [], gradesAssigned: [] });

  const ALL_SUBJECTS = ["Quran", "Islamic Studies", "Malayalam", "Hindi", "Arabic", "English", "Maths", "EVS (Environmental Studies)", "Science", "Social Studies", "Computer Science"];
  const ALL_GRADES = ["Grade 1: The Pioneers", "Grade 1: The Visionaries", "Grade 2", "Grade 3", "Grade 4"];

  useEffect(() => {
    initDB();
    const db = getDB();
    setTeachers(db.teachers);
  }, []);

  const openModal = (teacher: Teacher | null = null) => {
    setEditingTeacher(teacher);
    if (teacher) {
      setFormData({...teacher});
    } else {
      setFormData({
        id: `t${Date.now()}`,
        employeeId: `EMP${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        subjectsAssigned: [],
        gradesAssigned: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
    setFormData({ subjectsAssigned: [], gradesAssigned: [] });
  };

  const handleSave = () => {
    if (!formData.name) return alert("Full Name is required");
    if (!formData.password) return alert("Password is required");
    
    const db = getDB();
    if (editingTeacher) {
      const idx = db.teachers.findIndex(t => t.id === editingTeacher.id);
      if (idx >= 0) db.teachers[idx] = formData as Teacher;
    } else {
      db.teachers.push(formData as Teacher);
    }
    setDB(db);
    setTeachers(db.teachers);
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      const db = getDB();
      db.teachers = db.teachers.filter(t => t.id !== id);
      setDB(db);
      setTeachers(db.teachers);
    }
  };

  const toggleSelection = (field: 'subjectsAssigned' | 'gradesAssigned', value: string) => {
    setFormData(prev => {
      const list = prev[field] || [];
      if (list.includes(value)) {
        return { ...prev, [field]: list.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...list, value] };
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin" className="text-slate-500 hover:text-primary font-medium flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
            Back to Admin
          </Link>
          <h2 className="text-2xl font-bold text-slate-800">Manage Teachers</h2>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-primary hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>
          Add Teacher
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map(t => (
          <div key={t.id} className="glass-card p-6 flex flex-col hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{t.name}</h3>
                  <p className="text-xs text-slate-500">ID: {t.employeeId}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={() => openModal(t)} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                </button>
                <button onClick={() => handleDelete(t.id)} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-red-50 flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </div>

            <div className="space-y-3 mt-auto">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Subjects Assigned</p>
                <div className="flex flex-wrap gap-1.5">
                  {t.subjectsAssigned?.map(sub => (
                    <span key={sub} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">{sub}</span>
                  ))}
                  {(!t.subjectsAssigned || t.subjectsAssigned.length === 0) && <span className="text-xs text-slate-400">None</span>}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Grades</p>
                <div className="flex flex-wrap gap-1.5">
                  {t.gradesAssigned?.map(gr => (
                    <span key={gr} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">{gr}</span>
                  ))}
                  {(!t.gradesAssigned || t.gradesAssigned.length === 0) && <span className="text-xs text-slate-400">None</span>}
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-500 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  {t.contactNumber || 'No contact provided'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="text-lg font-bold text-slate-800">{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name || ''} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="e.g. Ustadh Youssef"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Employee ID (Auto)</label>
                  <input type="text" value={formData.employeeId} disabled className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Number</label>
                <input 
                  type="text" 
                  value={formData.contactNumber || ''} 
                  onChange={e => setFormData({...formData, contactNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Login Password <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.password || ''} 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Set teacher's initial password"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-800 mb-3">Assign Subjects</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ALL_SUBJECTS.map(sub => (
                    <label key={sub} className="flex items-center space-x-2 p-2 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.subjectsAssigned?.includes(sub)}
                        onChange={() => toggleSelection('subjectsAssigned', sub)}
                        className="rounded text-primary focus:ring-primary w-4 h-4"
                      />
                      <span className="text-sm text-slate-700">{sub}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-bold text-slate-800 mb-3">Assign Grades / Classes</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GRADES.map(gr => (
                    <label key={gr} className={`px-4 py-2 border rounded-xl text-sm font-medium cursor-pointer transition-colors ${formData.gradesAssigned?.includes(gr) ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={formData.gradesAssigned?.includes(gr)}
                        onChange={() => toggleSelection('gradesAssigned', gr)}
                      />
                      {gr}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3 shrink-0">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">Cancel</button>
              <button onClick={handleSave} className="bg-primary hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">Save Teacher</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
