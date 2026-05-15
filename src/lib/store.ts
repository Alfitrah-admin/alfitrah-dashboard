"use client";

// Define some types for our mock database
export interface Student {
  id: string;
  admissionId: string;
  name: string;
  grade: string;
  parentName?: string;
  parentPhone: string;
  parentPassword?: string;
  status?: 'Active' | 'Inactive';
}

export interface Evaluation {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  grade: string;
  reportingCycle: string;
  grades: Record<string, string>;
  comments: string;
  status: 'draft' | 'submitted';
  date: string;
}

export interface Teacher {
  id: string;
  name: string;
  subjectsAssigned: string[];
  gradesAssigned: string[];
  employeeId: string;
  contactNumber: string;
  password?: string;
}

export interface Subject {
  id: string;
  name: string;
  category: 'Core' | 'Language' | 'Science' | 'Islamic';
  applicableGrades: string[];
}

export interface ReportingCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  gradesIncluded: string[];
  status: 'Active' | 'Completed';
}

export interface DatabaseSchema {
  students: Student[];
  evaluations: Evaluation[];
  teachers: Teacher[];
  subjects: Subject[];
  reportingCycles: ReportingCycle[];
  classes: any[];
  admins: { id: string, name: string, email: string, password: string }[];
}

const defaultData: DatabaseSchema = {
  students: [
    { id: "s1", admissionId: "ADM-2026-001", name: "Ahmed Ali", grade: "Grade 1: The Pioneers", parentName: "Ali Hassan", parentPhone: "0501234567", parentPassword: "password123", status: "Active" },
    { id: "s2", admissionId: "ADM-2026-002", name: "Fatima Zahra", grade: "Grade 1: The Pioneers", parentName: "Omar Zahra", parentPhone: "0507654321", parentPassword: "password123", status: "Active" },
    { id: "s3", admissionId: "ADM-2026-003", name: "Omar Farooq", grade: "Grade 3", parentName: "Farooq Abdullah", parentPhone: "0501112222", parentPassword: "password123", status: "Active" },
    { id: "s4", admissionId: "ADM-2026-004", name: "Aisha Khan", grade: "Grade 3", parentName: "Tariq Khan", parentPhone: "0503334444", parentPassword: "password123", status: "Active" },
  ],
  evaluations: [],
  teachers: [
    { id: "t1", name: "Ustadh Youssef", subjectsAssigned: ["Quran", "Islamic Studies"], gradesAssigned: ["Grade 1: The Pioneers", "Grade 2", "Grade 3"], employeeId: "EMP001", contactNumber: "0501234567", password: "password123" },
    { id: "t2", name: "Ustadha Maryam", subjectsAssigned: ["Maths", "Science"], gradesAssigned: ["Grade 3", "Grade 4"], employeeId: "EMP002", contactNumber: "0507654321", password: "password123" },
    { id: "t3", name: "Ustadh Khalid", subjectsAssigned: ["Arabic", "Quran"], gradesAssigned: ["Grade 1: The Visionaries", "Grade 4"], employeeId: "EMP003", contactNumber: "0501112233", password: "password123" },
    { id: "t4", name: "Ustadha Aisha", subjectsAssigned: ["English", "Social Studies"], gradesAssigned: ["Grade 1: The Pioneers", "Grade 2"], employeeId: "EMP004", contactNumber: "0502223344", password: "password123" },
    { id: "t5", name: "Ustadh Tariq", subjectsAssigned: ["Computer Science", "Maths"], gradesAssigned: ["Grade 2", "Grade 3"], employeeId: "EMP005", contactNumber: "0503334455", password: "password123" },
    { id: "t6", name: "Ustadha Fatima", subjectsAssigned: ["Malayalam", "Hindi"], gradesAssigned: ["Grade 1: The Visionaries", "Grade 3"], employeeId: "EMP006", contactNumber: "0504445566", password: "password123" },
    { id: "t7", name: "Ustadh Omar", subjectsAssigned: ["Science", "EVS (Environmental Studies)"], gradesAssigned: ["Grade 1: The Pioneers", "Grade 4"], employeeId: "EMP007", contactNumber: "0505556677", password: "password123" },
    { id: "t8", name: "Ustadha Zainab", subjectsAssigned: ["Islamic Studies", "Arabic"], gradesAssigned: ["Grade 2", "Grade 3"], employeeId: "EMP008", contactNumber: "0506667788", password: "password123" },
    { id: "t9", name: "Ustadh Hassan", subjectsAssigned: ["Quran", "Malayalam"], gradesAssigned: ["Grade 1: The Pioneers", "Grade 1: The Visionaries"], employeeId: "EMP009", contactNumber: "0507778899", password: "password123" },
    { id: "t10", name: "Ustadha Khadija", subjectsAssigned: ["English", "Maths"], gradesAssigned: ["Grade 4"], employeeId: "EMP010", contactNumber: "0508889900", password: "password123" }
  ],
  subjects: [
    { id: "sub1", name: "Quran", category: "Islamic", applicableGrades: ["Grade 1: The Pioneers", "Grade 1: The Visionaries", "Grade 2", "Grade 3", "Grade 4"] },
    { id: "sub2", name: "Islamic Studies", category: "Islamic", applicableGrades: ["Grade 1: The Pioneers", "Grade 1: The Visionaries", "Grade 2", "Grade 3", "Grade 4"] },
    { id: "sub3", name: "Malayalam", category: "Language", applicableGrades: ["Grade 1: The Pioneers", "Grade 1: The Visionaries", "Grade 2", "Grade 3", "Grade 4"] },
    { id: "sub4", name: "Hindi", category: "Language", applicableGrades: ["Grade 1: The Pioneers", "Grade 1: The Visionaries", "Grade 2", "Grade 3", "Grade 4"] },
    { id: "sub5", name: "Arabic", category: "Language", applicableGrades: ["Grade 1: The Pioneers", "Grade 1: The Visionaries", "Grade 2", "Grade 3", "Grade 4"] },
    { id: "sub6", name: "English", category: "Language", applicableGrades: ["Grade 1: The Pioneers", "Grade 1: The Visionaries", "Grade 2", "Grade 3", "Grade 4"] },
    { id: "sub7", name: "Maths", category: "Core", applicableGrades: ["Grade 1: The Pioneers", "Grade 1: The Visionaries", "Grade 2", "Grade 3", "Grade 4"] },
    { id: "sub8", name: "EVS (Environmental Studies)", category: "Science", applicableGrades: ["Grade 1: The Pioneers", "Grade 1: The Visionaries", "Grade 2"] },
    { id: "sub9", name: "Science", category: "Science", applicableGrades: ["Grade 3", "Grade 4"] },
    { id: "sub10", name: "Social Studies", category: "Core", applicableGrades: ["Grade 3", "Grade 4"] },
    { id: "sub11", name: "Computer Science", category: "Core", applicableGrades: ["Grade 1: The Pioneers", "Grade 1: The Visionaries", "Grade 2", "Grade 3", "Grade 4"] }
  ],
  reportingCycles: [
    { id: "rc1", name: "Jun-Jul 2026", startDate: "2026-06-01", endDate: "2026-07-31", gradesIncluded: ["Grade 1: The Pioneers", "Grade 1: The Visionaries", "Grade 2", "Grade 3", "Grade 4"], status: "Completed" },
    { id: "rc2", name: "Aug-Sep 2026", startDate: "2026-08-01", endDate: "2026-09-30", gradesIncluded: ["Grade 1: The Pioneers", "Grade 1: The Visionaries", "Grade 2", "Grade 3", "Grade 4"], status: "Active" },
    { id: "rc3", name: "Oct-Nov 2026", startDate: "2026-10-01", endDate: "2026-11-30", gradesIncluded: ["Grade 1: The Pioneers", "Grade 1: The Visionaries", "Grade 2", "Grade 3", "Grade 4"], status: "Active" },
    { id: "rc4", name: "Dec-Jan 2026-27", startDate: "2026-12-01", endDate: "2027-01-31", gradesIncluded: ["Grade 1: The Pioneers", "Grade 1: The Visionaries", "Grade 2", "Grade 3", "Grade 4"], status: "Active" },
    { id: "rc5", name: "Feb-Mar 2027", startDate: "2027-02-01", endDate: "2027-03-31", gradesIncluded: ["Grade 1: The Pioneers", "Grade 1: The Visionaries", "Grade 2", "Grade 3", "Grade 4"], status: "Active" }
  ],
  classes: [
    { id: "c1", name: "Grade 1: The Pioneers", studentsCount: 2 },
    { id: "c2", name: "Grade 3", studentsCount: 2 }
  ],
  admins: [
    { id: "a1", name: "Master Admin", email: "admin@alfitrah.edu", password: "admin" }
  ]
};

export const getSubjectsForGrade = (gradeName: string) => {
  const isLowerGrade = gradeName.includes("Grade 1") || gradeName.includes("Grade 2");
  
  const commonSubjects = [
    "Quran", "Islamic Studies", "Malayalam", "Hindi", 
    "Arabic", "English", "Maths", "Computer Science"
  ];

  if (isLowerGrade) {
    return [...commonSubjects, "EVS (Environmental Studies)"];
  } else {
    return [...commonSubjects, "Science", "Social Studies"];
  }
};

// Initialize DB in localStorage if it doesn't exist
export const initDB = () => {
  if (typeof window === 'undefined') return;
  const existingData = localStorage.getItem('alfitrah_db');
  if (!existingData) {
    localStorage.setItem('alfitrah_db', JSON.stringify(defaultData));
  } else {
    // Migration logic
    try {
      const db = JSON.parse(existingData);
      let needsUpdate = false;
      
      const renameGrade = (g: string) => {
        if (g === "Grade 1A") return "Grade 1: The Pioneers";
        if (g === "Grade 1B") return "Grade 1: The Visionaries";
        if (g === "Grade 2A") return "Grade 2";
        if (g === "Grade 3A") return "Grade 3";
        if (g === "Grade 4A") return "Grade 4";
        return g;
      };

      if (db.students) {
        db.students.forEach((s: any) => {
          const newG = renameGrade(s.grade);
          if (newG !== s.grade) { s.grade = newG; needsUpdate = true; }
        });
      }
      
      if (db.evaluations) {
        db.evaluations.forEach((e: any) => {
          const newG = renameGrade(e.grade);
          if (newG !== e.grade) { e.grade = newG; needsUpdate = true; }
        });
      }

      if (db.teachers) {
        db.teachers.forEach((t: any) => {
          const oldGrades = t.gradesAssigned || [];
          const newGrades = oldGrades.map(renameGrade);
          if (JSON.stringify(oldGrades) !== JSON.stringify(newGrades)) {
            t.gradesAssigned = newGrades;
            needsUpdate = true;
          }
        });
      }

      if (db.subjects) {
        db.subjects.forEach((sub: any) => {
          const oldGrades = sub.applicableGrades || [];
          const newGrades = oldGrades.map(renameGrade);
          if (JSON.stringify(oldGrades) !== JSON.stringify(newGrades)) {
            sub.applicableGrades = newGrades;
            needsUpdate = true;
          }
        });
      }

      if (db.reportingCycles) {
        db.reportingCycles.forEach((rc: any) => {
          const oldGrades = rc.gradesIncluded || [];
          const newGrades = oldGrades.map(renameGrade);
          if (JSON.stringify(oldGrades) !== JSON.stringify(newGrades)) {
            rc.gradesIncluded = newGrades;
            needsUpdate = true;
          }
        });
      }

      if (db.classes) {
        db.classes.forEach((c: any) => {
          const newG = renameGrade(c.name);
          if (newG !== c.name) { c.name = newG; needsUpdate = true; }
        });
      }
      
      if (needsUpdate) {
        localStorage.setItem('alfitrah_db', JSON.stringify(db));
      }
    } catch (e) {
      console.error("Failed to migrate DB", e);
    }
  }
};

// Get the entire database
export const getDB = (): DatabaseSchema => {
  if (typeof window === 'undefined') return defaultData;
  const data = localStorage.getItem('alfitrah_db');
  if (data) {
    const parsed = JSON.parse(data);
    // Merge with defaultData to prevent undefined arrays for old local storage states
    return {
      students: parsed.students || defaultData.students,
      evaluations: parsed.evaluations || defaultData.evaluations,
      teachers: parsed.teachers || defaultData.teachers,
      subjects: parsed.subjects || defaultData.subjects,
      reportingCycles: parsed.reportingCycles || defaultData.reportingCycles,
      classes: parsed.classes || defaultData.classes,
      admins: parsed.admins || defaultData.admins
    };
  }
  return defaultData;
};

// Save an evaluation
export const saveEvaluation = (evaluation: Omit<Evaluation, 'id' | 'date'>) => {
  if (typeof window === 'undefined') return;
  const db = getDB();
  
  const existingIndex = db.evaluations.findIndex(e => 
    e.studentId === evaluation.studentId && 
    e.subject === evaluation.subject && 
    e.grade === evaluation.grade && 
    e.reportingCycle === evaluation.reportingCycle
  );

  if (existingIndex >= 0) {
    db.evaluations[existingIndex] = {
      ...db.evaluations[existingIndex],
      ...evaluation,
      date: new Date().toISOString()
    };
  } else {
    const newEvaluation: Evaluation = {
      ...evaluation,
      id: `e${Date.now()}`,
      date: new Date().toISOString()
    };
    db.evaluations.unshift(newEvaluation);
  }
  
  localStorage.setItem('alfitrah_db', JSON.stringify(db));
};

export const getStudentEvaluations = (studentId: string) => {
  const db = getDB();
  return db.evaluations.filter(e => e.studentId === studentId);
};

export const setDB = (newDb: DatabaseSchema) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('alfitrah_db', JSON.stringify(newDb));
};
