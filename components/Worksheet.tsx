import React from 'react';
import { GeneratedTask, Exercise } from '../types';

interface WorksheetProps {
  task: GeneratedTask;
}

const HeaderLine: React.FC<{ label: string; full?: boolean }> = ({ label, full }) => (
  <div className={`flex items-end gap-2 ${full ? 'w-full' : ''}`}>
    <span className="font-bold text-sm font-comic whitespace-nowrap">{label}:</span>
    <div className="border-b border-black flex-grow border-dotted h-4"></div>
  </div>
);

const ColumnSortExercise: React.FC<{ exercise: Exercise }> = ({ exercise }) => {
  const { items, columns } = exercise.data || { items: [], columns: [] };
  
  return (
    <div className="w-full my-4 break-inside-avoid">
      {/* Word Bank */}
      <div className="border-2 border-black rounded-xl p-4 mb-4 bg-white relative">
        <div className="absolute -top-3 left-4 bg-white px-2 text-sm font-bold font-comic">Banco de Palavras</div>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-comic text-lg">
          {items.map((word: string, idx: number) => (
            <span key={idx}>{word}</span>
          ))}
        </div>
      </div>

      {/* Columns */}
      <div className={`grid grid-cols-${Math.min(columns.length, 4)} gap-0 border-2 border-black divide-x-2 divide-black rounded-lg overflow-hidden`}>
        {columns.map((col: string, idx: number) => (
          <div key={idx} className="flex flex-col">
            <div className="text-center font-bold border-b-2 border-black py-2 bg-gray-100 font-comic uppercase text-sm md:text-base">
              {col}
            </div>
            <div className="h-48 flex flex-col divide-y divide-gray-300">
               {[1,2,3,4,5,6].map(row => (
                 <div key={row} className="flex-grow"></div>
               ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MultipleChoiceExercise: React.FC<{ exercise: Exercise }> = ({ exercise }) => {
  return (
    <div className="my-2 font-comic break-inside-avoid">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pl-4">
        {exercise.data?.options?.map((opt: string, idx: number) => (
          <div key={idx} className="flex items-center gap-2">
             <div className="w-5 h-5 border-2 border-black rounded-full flex-shrink-0"></div>
             <span>{opt}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Worksheet: React.FC<WorksheetProps> = ({ task }) => {
  return (
    <div className="bg-white text-black p-8 w-full max-w-[210mm] mx-auto print-container relative">
      {/* Dashed Border Container */}
      <div className="border-2 border-dashed border-gray-800 p-6 min-h-[270mm] flex flex-col gap-6 rounded-sm">
        
        {/* Header Section */}
        <div className="flex flex-col gap-3 w-full">
          <HeaderLine label="Escola" full />
          <div className="flex gap-4 w-full">
            <div className="w-1/2"><HeaderLine label="Data" full /></div>
            <div className="w-1/2"><HeaderLine label="Turma" full /></div>
          </div>
          <HeaderLine label="Aluno" full />
        </div>

        {/* Title Banner */}
        <div className="relative w-full mt-2 mb-4">
          <div className="bg-white border-y-4 border-black py-2 text-center relative">
             <div className="absolute top-0 left-0 w-4 h-full border-l-4 border-black -skew-x-12 bg-white -ml-2"></div>
             <h1 className="text-2xl font-black uppercase tracking-widest font-comic">{task.title}</h1>
             <div className="absolute top-0 right-0 w-4 h-full border-r-4 border-black skew-x-12 bg-white -mr-2"></div>
          </div>
        </div>

        {/* Subject Tag (Optional display) */}
        <div className="flex justify-center gap-2 mb-2 no-print">
            <span className="border border-black rounded-full px-4 py-1 text-sm font-bold bg-gray-100 uppercase">{task.subject}</span>
            <span className="border border-black rounded-full px-4 py-1 text-sm font-bold bg-gray-100 uppercase">{task.grade}</span>
        </div>

        {/* Instruction Main */}
        <div className="font-comic text-lg font-medium text-center px-4 mb-4">
          {task.instruction}
        </div>

        {/* Exercises */}
        <div className="flex flex-col gap-6 flex-grow">
          {task.exercises.map((ex, idx) => (
            <div key={idx} className="flex flex-col gap-2 break-inside-avoid">
              <div className="flex gap-2 items-start">
                <span className="font-bold text-xl font-comic">{idx + 1})</span>
                <p className="font-comic text-lg pt-1">{ex.question}</p>
              </div>

              <div className="pl-6 w-full">
                {ex.type === 'column_sort' && <ColumnSortExercise exercise={ex} />}
                
                {ex.type === 'multiple_choice' && <MultipleChoiceExercise exercise={ex} />}

                {ex.type === 'fill_in_blanks' && (
                   <div className="p-4 border border-gray-300 rounded-lg bg-gray-50 font-comic text-lg leading-loose">
                      {/* Render text but replace ___ with underlines */}
                      {ex.data?.text?.split('___').map((part: string, i: number, arr: string[]) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < arr.length - 1 && <span className="inline-block border-b-2 border-black w-24 mx-1"></span>}
                        </React.Fragment>
                      )) || <div className="italic text-gray-500">(Conteúdo preencher lacunas não gerado corretamente)</div>}
                   </div>
                )}

                {ex.type === 'open_question' && (
                   <div className="mt-2 flex flex-col gap-4">
                      <div className="border-b border-black border-dotted h-8"></div>
                      <div className="border-b border-black border-dotted h-8"></div>
                      <div className="border-b border-black border-dotted h-8"></div>
                   </div>
                )}

                {ex.type === 'drawing_space' && (
                   <div className="border-2 border-black rounded-lg h-48 mt-2 relative bg-white">
                      <span className="absolute bottom-2 right-2 text-xs text-gray-400 font-comic">Espaço para desenho</span>
                   </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer decoration */}
        <div className="mt-auto flex justify-between items-end pt-4 opacity-50">
             <div className="text-[10px] font-sans">Gerado por EduTask</div>
             <div className="flex gap-2">
               <div className="w-2 h-2 bg-black rounded-full"></div>
               <div className="w-2 h-2 bg-black rounded-full"></div>
               <div className="w-2 h-2 bg-black rounded-full"></div>
             </div>
        </div>

      </div>
    </div>
  );
};