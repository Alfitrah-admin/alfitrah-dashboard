"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDB, initDB, setDB, Subject } from '@/lib/store';

export default function SubjectsAdmin() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState<Partial<Subject>>({ applicableGrades: [] });

  const ALL_GRADES = ["Grade 1: The Pioneers", "Grade 1: The Visionaries", "Grade 2", "Grade 3", "Grade 4"];

  useEffect(() => {
    initDB();
    const db = getDB();
    setSubjects(db.subjects);
  }, []);

  const openModal = (subject: Subject | null = null) => {
    setEditingSubject(subject);
    if (subject) {
      setFormData({...subject});
    } else {
      setFormData({
        id: `sub${Date.now()}`,
        category: 'Core',
        applicableGrades: ALL_GRADES
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    setFormData({ applicableGrades: [] });
  };

  const handleSave = () => {
    if (!formData.name) return alert("Subject Name is required");
    
    const db = getDB();
    if (editingSubject) {
      const idx = db.subjects.findIndex(s => s.id === editingSubject.id);
      if (idx >= 0) db.subjects[idx] = formData as Subject;
    } else {
      db.subjects.push(formData as Subject);
    }
    setDB(db);
    setSubjects(db.subjects);
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      const db = getDB();
      db.subjects = db.subjects.filter(s => s.id !== id);
      setDB(db);
      setSubjects(db.subjects);
    }
  };

  const toggleGrade = (grade: string) => {
    setFormData(prev => {
      const list = prev.applicableGrades || [];
      if (list.includes(grade)) {
        return { ...prev, applicableGrades: list.filter(g => g !== grade) };
      } else {
        return { ...prev, applicableGrades: [...list, grade] };
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
          <h2 className="text-2xl font-bold text-slate-800">Manage Subjects</h2>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-brand-emerald hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          Add Subject
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold">Subject Name</th>
              <th className="px-6 py-4 font-semibold">Category</th>
              <th className="px-6 py-4 font-semibold">Applicable Grades</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(subjects || []).map(s => (
              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-800">{s.name}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold ${
                    s.category === 'Islamic' ? 'bg-emerald-100 text-emerald-700' :
                    s.category === 'Science' ? 'bg-blue-100 text-blue-700' :
                    s.category === 'Language' ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {s.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  <div className="flex flex-wrap gap-1">
                    {s.applicableGrades?.map(gr => (
                      <span key={gr} className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded">{gr}</span>
                    ))}
                    {(!s.applicableGrades || s.applicableGrades.length === 0) && <span className="text-xs text-slate-400">None</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => openModal(s)} className="text-primary hover:text-indigo-700 font-medium transition-colors">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 font-medium transition-colors">Delete</button>
                </td>
              </tr>
            ))}
            {(!subjects || subjects.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No subjects found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subject Name</label>
                <input 
                  type="text" 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald"
                  placeholder="e.g. Science"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
                <select 
                  value={formData.category || 'Core'} 
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald"
                >
                  <option value="Core">Core</option>
                  <option value="Language">Language</option>
                  <option value="Science">Science</option>
                  <option value="Islamic">Islamic</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-600 mb-2">Applicable Grades</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GRADES.map(gr => (
                    <label key={gr} className={`px-4 py-2 border rounded-xl text-sm font-medium cursor-pointer transition-colors ${formData.applicableGrades?.includes(gr) ? 'bg-brand-emerald/10 border-brand-emerald/30 text-brand-emerald' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={formData.applicableGrades?.includes(gr)}
                        onChange={() => toggleGrade(gr)}
                      />
                      {gr}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">Cancel</button>
              <button onClick={handleSave} className="bg-brand-emerald hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors">Save Subject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
