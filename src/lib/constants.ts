export const GRADES = [
  { value: "A+", label: "A+ (Excellent)", color: "text-brand-emerald bg-brand-emerald/10 border-brand-emerald/20" },
  { value: "A", label: "A (Very Good)", color: "text-green-600 bg-green-50 border-green-200" },
  { value: "B", label: "B (Good)", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "C", label: "C (Improving)", color: "text-orange-500 bg-orange-50 border-orange-200" },
  { value: "D", label: "D (Needs Attention)", color: "text-red-500 bg-red-50 border-red-200" },
];

export const SUBJECT_INDICATORS: Record<string, string[]> = {
  "English": [
    "Reading Fluency", "Pronunciation", "Vocabulary Usage", "Handwriting", 
    "Spellings", "Sentence Formation", "Listening Skills", "Speaking Confidence", 
    "Grammar Understanding", "Creative Writing"
  ],
  "Malayalam": [
    "Letter Recognition", "Reading Ability", "Pronunciation", "Vocabulary Understanding", 
    "Writing Neatness", "Dictation", "Sentence Reading", "Oral Communication"
  ],
  "Hindi": [
    "Letter Recognition", "Reading Ability", "Pronunciation", "Vocabulary Understanding", 
    "Writing Neatness", "Dictation", "Sentence Reading", "Oral Communication"
  ],
  "Arabic": [
    "Letter Recognition", "Reading Fluency", "Pronunciation", "Writing Skills", 
    "Vocabulary Understanding", "Recitation Skills", "Memorisation", "Listening Skills", 
    "Islamic Vocabulary Usage"
  ],
  "Quran": [
    "Letter Recognition", "Tajweed Basics", "Pronunciation Accuracy", "Fluency in Recitation", 
    "Memorisation Progress", "Listening and Repetition", "Surah Recitation Confidence", 
    "Dua Memorisation", "Daily Revision Consistency", "Respectful Quran Handling"
  ],
  "Islamic Studies": [
    "Understanding Islamic Values", "Daily Dua Knowledge", "Salah Awareness", 
    "Islamic Manners and Etiquettes", "Prophet Stories Understanding", 
    "Participation in Islamic Activities", "Moral Behaviour", "Classroom Discipline", 
    "Respect Towards Teachers and Friends", "Islamic Vocabulary Understanding"
  ],
  "Maths": [
    "Number Understanding", "Addition Skills", "Subtraction Skills", "Multiplication Skills", 
    "Division Skills", "Mental Maths", "Word Problem Solving", "Table Memorisation", 
    "Accuracy", "Logical Thinking"
  ],
  "EVS (Environmental Studies)": [
    "Concept Understanding", "Observation Skills", "Environmental Awareness", 
    "Activity Participation", "Diagram Understanding", "General Knowledge", 
    "Curiosity and Questioning", "Oral Responses"
  ],
  "Computer Science": [
    "Computer Parts Identification", "Mouse Control", "Keyboard Familiarity", 
    "Typing Basics", "Digital Confidence", "Creativity in Activities", 
    "Following Instructions", "Basic Software Usage"
  ],
  "Science": [
    "Concept Understanding", "Observation Skills", "Environmental Awareness", 
    "Activity Participation", "Diagram Understanding", "General Knowledge", 
    "Curiosity and Questioning", "Oral Responses"
  ],
  "Social Studies": [
    "Concept Understanding", "Observation Skills", "Environmental Awareness", 
    "Activity Participation", "Diagram Understanding", "General Knowledge", 
    "Curiosity and Questioning", "Oral Responses"
  ]
};

export const getIndicatorsForSubject = (subjectName: string): string[] => {
  return SUBJECT_INDICATORS[subjectName] || ["General Performance", "Participation", "Behavior"];
};
