"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Student } from '@/lib/store';

export default function StudentsAdmin() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Partial<Student>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  const fetchStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (data) {
      // Map db fields to our local type if needed, but assuming they match for now
      setStudents(data as Student[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const openModal = (student: Student | null = null) => {
    setEditingStudent(student);
    if (student) {
      setFormData(student);
    } else {
      setFormData({
        id: `s${Date.now()}`, // auto-generated
        admissionId: `ADM-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        status: 'Active',
        grade: 'Grade 1: The Pioneers'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({});
  };

  const handleSave = async () => {
    if (!formData.name) return alert("Full Name is required");
    if (!formData.admissionId) return alert("Admission ID is required");
    if (!formData.parentPhone) return alert("Parent Phone Number is required");
    
    setSaving(true);
    
    // Format for DB
    const studentData = {
      admission_id: formData.admissionId,
      name: formData.name,
      grade: formData.grade,
      parent_name: formData.parentName,
      parent_phone: formData.parentPhone,
      status: formData.status
    };

    let error;

    if (editingStudent) {
      const { error: updateError } = await supabase
        .from('students')
        .update(studentData)
        .eq('id', editingStudent.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('students')
        .insert([studentData]);
      error = insertError;
    }

    setSaving(false);

    if (error) {
      setActionMessage({ type: 'error', text: error.message || 'Failed to save student' });
    } else {
      setActionMessage({ type: 'success', text: `Student ${editingStudent ? 'updated' : 'added'} successfully` });
      fetchStudents();
      closeModal();
      
      setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this student?")) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) {
        setActionMessage({ type: 'error', text: 'Failed to delete student' });
      } else {
        setActionMessage({ type: 'success', text: 'Student deleted successfully' });
        fetchStudents();
        setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin" className="text-slate-500 hover:text-primary font-medium flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="m15 18-6-6 6-6"/></svg>
            Back to Admin
          </Link>
          <h2 className="text-2xl font-bold text-slate-800">Manage Students</h2>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-brand-emerald hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Add Student
        </button>
      </div>

      {actionMessage.text && (
        <div className={`p-4 rounded-xl border ${actionMessage.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          {actionMessage.text}
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-semibold">Admission ID</th>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Grade</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  <div className="flex justify-center items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading students...
                  </div>
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No students found. Click "Add Student" to create one.
                </td>
              </tr>
            ) : students.map(s => (
              <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-slate-500">{s.admissionId || (s as any).admission_id}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                <td className="px-6 py-4 text-slate-600">{s.grade}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.status === 'Inactive' ? 'bg-slate-100 text-slate-600' : 'bg-brand-emerald/10 text-brand-emerald'}`}>
                    {s.status || 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-3">
                  <button onClick={() => openModal({
                    ...s,
                    admissionId: (s as any).admission_id,
                    parentName: (s as any).parent_name,
                    parentPhone: (s as any).parent_phone
                  })} className="text-primary hover:text-indigo-700 font-medium transition-colors">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 font-medium transition-colors">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Admission ID <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.admissionId || ''} onChange={e => setFormData({...formData, admissionId: e.target.value})} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald" placeholder="e.g. ADM-2026-001" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald"
                  placeholder="e.g. Ahmed Ali"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Grade / Class</label>
                <select 
                  value={formData.grade || ''} 
                  onChange={e => setFormData({...formData, grade: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald"
                >
                  <option value="Grade 1: The Pioneers">Grade 1: The Pioneers</option>
                  <option value="Grade 1: The Visionaries">Grade 1: The Visionaries</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Parent Name</label>
                  <input 
                    type="text" 
                    value={formData.parentName || ''} 
                    onChange={e => setFormData({...formData, parentName: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Parent Phone Number <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.parentPhone || ''} 
                    onChange={e => setFormData({...formData, parentPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Parent Initial Password <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={formData.parentPassword || ''} 
                  onChange={e => setFormData({...formData, parentPassword: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-emerald focus:border-brand-emerald"
                  placeholder="Set an initial password"
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
              <button onClick={closeModal} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">Cancel</button>
              <button disabled={saving} onClick={handleSave} className="bg-brand-emerald hover:bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center disabled:opacity-70">
                {saving && <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                {saving ? 'Saving...' : 'Save Student'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
