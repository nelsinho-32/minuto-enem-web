import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Classroom {
  id: string;
  name: string;
  subject: string;
  description?: string;
  code: string; // Ex: ENEM-8492
  school?: string;
  themeColor: string;
  icon: string;
  createdAt: string;
  teacherName: string;
  studentsCount: number;
  tasksCount: number;
  materialsCount: number;
}

interface ClassroomState {
  classrooms: Classroom[];
  addClassroom: (classroom: Omit<Classroom, 'id' | 'createdAt' | 'studentsCount' | 'tasksCount' | 'materialsCount'>) => Classroom;
  joinClassroomByCode: (code: string) => { success: boolean; message: string; classroom?: Classroom };
  deleteClassroom: (id: string) => void;
}

const DEFAULT_CLASSROOMS: Classroom[] = [
  {
    id: 'c1',
    name: 'Extensivo ENEM 2026 - Turma Alpha',
    subject: 'Física',
    description: 'Preparatório focado em Mecânica, Ondulatória e Termologia para o ENEM.',
    code: 'FIS-2026',
    school: 'Colégio Estadual Central',
    themeColor: '#58CC02',
    icon: 'atom',
    createdAt: '2026-08-10',
    teacherName: 'Prof. Carlos',
    studentsCount: 34,
    tasksCount: 2,
    materialsCount: 2,
  },
  {
    id: 'c2',
    name: 'Gabaritando Matemática',
    subject: 'Matemática',
    description: 'Resolução de listas semanais e técnicas de TRI para atingir 800+.',
    code: 'MAT-800',
    school: 'IFPB',
    themeColor: '#FF4B4B',
    icon: 'calculator',
    createdAt: '2026-08-15',
    teacherName: 'Profª. Marta',
    studentsCount: 42,
    tasksCount: 1,
    materialsCount: 1,
  },
];

export const useClassroomStore = create<ClassroomState>()(
  persist(
    (set, get) => ({
      classrooms: DEFAULT_CLASSROOMS,

      addClassroom: (data) => {
        const newClassroom: Classroom = {
          ...data,
          id: `room_${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0],
          studentsCount: 1, // Começa com o criador ou 1 aluno
          tasksCount: 0,
          materialsCount: 0,
        };

        set((state) => ({
          classrooms: [newClassroom, ...state.classrooms],
        }));

        return newClassroom;
      },

      joinClassroomByCode: (code) => {
        const cleanCode = code.trim().toUpperCase();
        const existing = get().classrooms.find(
          (c) => c.code.toUpperCase() === cleanCode
        );

        if (!existing) {
          return {
            success: false,
            message: 'Código de turma não encontrado. Verifique se digitou corretamente.',
          };
        }

        return {
          success: true,
          message: `Você entrou na turma ${existing.name}!`,
          classroom: existing,
        };
      },

      deleteClassroom: (id) => {
        set((state) => ({
          classrooms: state.classrooms.filter((c) => c.id !== id),
        }));
      },
    }),
    {
      name: '@minuto-enem:classrooms-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

