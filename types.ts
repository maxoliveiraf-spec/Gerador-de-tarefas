export enum Grade {
  FIRST = '1º Ano',
  SECOND = '2º Ano',
  THIRD = '3º Ano',
  FOURTH = '4º Ano',
  FIFTH = '5º Ano',
}

export enum Subject {
  PORTUGUESE = 'Língua Portuguesa',
  MATH = 'Matemática',
  SCIENCE = 'Ciências',
  HISTORY = 'História',
  GEOGRAPHY = 'Geografia',
  ARTS = 'Artes'
}

export interface GeneratedTask {
  title: string;
  topic: string;
  grade: string;
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
