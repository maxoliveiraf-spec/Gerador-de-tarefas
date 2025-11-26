import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Subject, GeneratedTask, EducationLevel } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const taskSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "A fun, catchy title for the worksheet" },
    instruction: { type: Type.STRING, description: "General instruction for the student" },
    exercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: { 
            type: Type.STRING, 
            enum: ['fill_in_blanks', 'column_sort', 'open_question', 'multiple_choice', 'drawing_space'],
            description: "The type of exercise. 'column_sort' is best for categorization. 'drawing_space' is for drawing tasks."
          },
          question: { type: Type.STRING, description: "The text of the question or instruction for this specific exercise" },
          data: { 
            type: Type.OBJECT, 
            description: "Data required for the exercise. For 'column_sort', provide 'items' (array of strings) and 'columns' (array of category names). For 'multiple_choice', provide 'options' array.",
            properties: {
              items: { type: Type.ARRAY, items: { type: Type.STRING } },
              columns: { type: Type.ARRAY, items: { type: Type.STRING } },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              text: { type: Type.STRING }
            }
          }
        },
        required: ["type", "question"]
      }
    }
  },
  required: ["title", "instruction", "exercises"]
};

export const generateSchoolTask = async (
  subject: Subject,
  level: EducationLevel,
  grade: string,
  topic: string
): Promise<GeneratedTask> => {
  
  const prompt = `
    Você é um pedagogo especialista em educação no Brasil (BNCC).
    Crie uma atividade escolar pronta para imprimir.
    
    Nível de Ensino: ${level}
    Disciplina: ${subject}
    Ano/Série: ${grade}
    Tópico: ${topic}
    
    Diretrizes:
    1. A atividade deve ser adequada para a faixa etária e nível cognitivo selecionado.
    2. Para Educação Infantil: Use linguagem simples, lúdica e foque em desenho ou identificação visual.
    3. Para Ensino Médio: Use linguagem mais formal, questões mais complexas e conteudistas (vestibular/ENEM).
    4. Para Ensino Fundamental: Equilibre o lúdico com o conteúdo.
    
    Para exercícios do tipo 'column_sort' (separar em colunas), forneça uma lista de palavras misturadas em 'items' e os nomes das categorias em 'columns'.
    Para exercícios de 'fill_in_blanks', use '___' para o espaço.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: taskSchema,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");

    const data = JSON.parse(text);
    
    return {
      ...data,
      grade,
      level,
      subject,
      topic
    };

  } catch (error) {
    console.error("Error generating task:", error);
    throw new Error("Falha ao gerar a tarefa. Tente novamente.");
  }
};