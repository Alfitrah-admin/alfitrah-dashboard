"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Student } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

interface StudentContextType {
  student: Student | null;
  isLoading: boolean;
  logout: () => void;
}

const StudentContext = createContext<StudentContextType>({
  student: null,
  isLoading: true,
  logout: () => {},
});

export function useStudent() {
  return useContext(StudentContext);
}

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      const admissionId = localStorage.getItem('parentAdmissionId');
      if (!admissionId) {
        router.replace('/');
        setIsLoading(false);
        return;
      }
      
      const { data } = await supabase.from('students').select('*').eq('admission_id', admissionId).maybeSingle();
      if (data) {
        setStudent({
          ...data,
          id: data.id,
          name: data.name,
          grade: data.grade,
          admissionId: data.admission_id || data.admissionId,
          parentName: data.parent_name || data.parentName,
          parentPhone: data.parent_phone || data.parentPhone,
        } as Student);
      } else {
        router.replace('/');
      }
      setIsLoading(false);
    };

    fetchStudent();
  }, [router, pathname]);

  const logout = () => {
    localStorage.removeItem('parentAdmissionId');
    router.replace('/');
  };

  return (
    <StudentContext.Provider value={{ student, isLoading, logout }}>
      {children}
    </StudentContext.Provider>
  );
}
