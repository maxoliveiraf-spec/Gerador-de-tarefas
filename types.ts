export enum EducationLevel {
  INFANTIL = 'Educação Infantil',
  FUNDAMENTAL = 'Ensino Fundamental',
  MEDIO = 'Ensino Médio'
}

export const EDUCATION_STRUCTURE: Record<EducationLevel, string[]> = {
  [EducationLevel.INFANTIL]: [
    'Berçário',
    'Maternal I',
    'Maternal II',
    'Pré-escola I',
    'Pré-escola II'
  ],
  [EducationLevel.FUNDAMENTAL]: [
    '1º Ano', 
    '2º Ano', 
    '3º Ano', 
    '4º Ano', 
    '5º Ano',
    '6º Ano',
    '7º Ano',
    '8º Ano',
    '9º Ano'
  ],
  [EducationLevel.MEDIO]: [
    '1º Ano (Ensino Médio)',
    '2º Ano (Ensino Médio)',
    '3º Ano (Ensino Médio)'
  ]
};

export type Grade = string;

export enum Subject {
  PORTUGUESE = 'Língua Portuguesa',
  MATH = 'Matemática',
  SCIENCE = 'Ciências/Natureza',
  HISTORY = 'História',
  GEOGRAPHY = 'Geografia',
  ARTS = 'Artes',
  ENGLISH = 'Inglês',
  BIOLOGY = 'Biologia',
  PHYSICS = 'Física',
  CHEMISTRY = 'Química',
  SOCIOLOGY = 'Sociologia',
  PHILOSOPHY = 'Filosofia',
  PE = 'Educação Física'
}

export interface GeneratedTask {
  title: string;
  topic: string;
  grade: string;
  level: string; // Added level to task data
  subject: string;
  instruction: string;
  exercises: Exercise[];
}

export type ExerciseType = 'fill_in_blanks' | 'column_sort' | 'drawing_space' | 'multiple_choice' | 'open_question';

export interface Exercise {
  type: ExerciseType;
  question: string;
  data?: any; // Specific data for the exercise type (e.g., words to sort, options)
}

export interface PaymentState {
  isPremium: boolean;
  premiumUntil: number | null; // Timestamp
  lastFreeGeneration: string | null; // Date string YYYY-MM-DD
}