export const GRADES = [
  { value: "A", label: "A (Excellent)", color: "text-brand-emerald bg-brand-emerald/10 border-brand-emerald/20" },
  { value: "B", label: "B (Very Good)", color: "text-green-600 bg-green-50 border-green-200" },
  { value: "C", label: "C (Good)", color: "text-blue-600 bg-blue-50 border-blue-200" },
  { value: "D", label: "D (Improving)", color: "text-orange-500 bg-orange-50 border-orange-200" },
  { value: "E", label: "E (Needs Attention)", color: "text-red-500 bg-red-50 border-red-200" },
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
    "Number Understanding", "Addition", "Subtraction", "Multiplication", 
    "Division", "Mental Maths", "Word Problems", "Table Memorisation", 
    "Accuracy", "Logical Thinking", "Geometry/Shapes", "Fractions/Decimals"
  ],
  "EVS (Environmental Studies)": [
    "Concept Understanding", "Observation Skills", "Environmental Awareness", 
    "Activity Participation", "Diagram Understanding", "General Knowledge", 
    "Curiosity and Questioning", "Oral Responses"
  ],
  "Computer Science": [
    "Parts Identification", "Mouse Control", "Keyboard Familiarity", 
    "Typing Basics", "Digital Confidence", "Creativity", 
    "Following Instructions", "Understanding AI", "Software Usage", "Online Safety", "Basic Logic"
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
