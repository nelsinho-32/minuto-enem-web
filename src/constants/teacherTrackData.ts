export interface CommentItem {
  id: string;
  author: string;
  role: 'STUDENT' | 'TEACHER';
  date: string;
  text: string;
}

export interface TeacherAssignment {
  id: string;
  classId?: string;
  subject: string;
  topic: string;
  title: string;
  dueDate: string;
  totalStudents: number;
  submittedCount: number;
  gradedCount: number;
  averageScore: number; // ex: 8.2 de 10
  color: string;
  icon: string;
  instructions: string;
  comments: CommentItem[];
  submissions: {
    studentId: string;
    studentName: string;
    submittedAt: string;
    status: 'ENTREGUE' | 'PENDENTE' | 'CORRIGIDO';
    score?: number;
    timeSpent: string;
  }[];
}

export interface TeacherMaterial {
  id: string;
  classId?: string;
  subject: string;
  topic: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'tip';
  dateAdded: string;
  viewsCount: number;
  downloadsCount: number;
  color: string;
  icon: string;
  description: string;
  url?: string;
  comments: CommentItem[];
}

export const INITIAL_TEACHER_ASSIGNMENTS: TeacherAssignment[] = [
  {
    id: 'as1',
    classId: 'c1',
    subject: 'Física',
    topic: 'Cinemática Escalar',
    title: 'Lista 01: Movimento Uniforme e Acelerado',
    dueDate: '2026-11-05',
    totalStudents: 34,
    submittedCount: 28,
    gradedCount: 24,
    averageScore: 7.8,
    color: '#58CC02',
    icon: 'atom',
    instructions: 'Resolver as 15 questões com resolução passo a passo.',
    comments: [
      {
        id: 'c1',
        author: 'Lucas Silva',
        role: 'STUDENT',
        date: 'Ontem às 14:20',
        text: 'Professor, na questão 4 devemos considerar a gravidade como 10 m/s²?',
      },
      {
        id: 'c2',
        author: 'Prof. Carlos',
        role: 'TEACHER',
        date: 'Ontem às 15:05',
        text: 'Isso mesmo, Lucas! Pode adotar g = 10 m/s² conforme o padrão ENEM.',
      },
    ],
    submissions: [
      { studentId: 's1', studentName: 'Lucas Silva', submittedAt: 'Hoje 09:12', status: 'CORRIGIDO', score: 9.0, timeSpent: '28m' },
      { studentId: 's2', studentName: 'Beatriz Costa', submittedAt: 'Ontem 18:40', status: 'CORRIGIDO', score: 8.5, timeSpent: '32m' },
      { studentId: 's3', studentName: 'Gabriel Santos', submittedAt: 'Hoje 11:00', status: 'ENTREGUE', timeSpent: '40m' },
      { studentId: 's4', studentName: 'Mariana Lima', submittedAt: '-', status: 'PENDENTE', timeSpent: '-' },
    ],
  },
  {
    id: 'as2',
    classId: 'c1',
    subject: 'Física',
    topic: 'Leis de Newton',
    title: 'Simulado Rápido: Dinâmica e Atrito',
    dueDate: '2026-11-12',
    totalStudents: 34,
    submittedCount: 15,
    gradedCount: 10,
    averageScore: 6.9,
    color: '#58CC02',
    icon: 'atom',
    instructions: '10 questões cronometradas nível médio/difícil.',
    comments: [
      {
        id: 'c3',
        author: 'Mariana Lima',
        role: 'STUDENT',
        date: 'Hoje às 08:30',
        text: 'Muito boa essa lista! Os gráficos ajudaram bastante.',
      },
    ],
    submissions: [
      { studentId: 's1', studentName: 'Lucas Silva', submittedAt: 'Hoje 10:30', status: 'CORRIGIDO', score: 8.0, timeSpent: '25m' },
      { studentId: 's2', studentName: 'Beatriz Costa', submittedAt: 'Hoje 14:10', status: 'ENTREGUE', timeSpent: '29m' },
    ],
  },
  {
    id: 'as3',
    classId: 'c2',
    subject: 'Matemática',
    topic: 'Geometria Plana',
    title: 'Lista 03: Áreas e Teorema de Pitágoras',
    dueDate: '2026-11-08',
    totalStudents: 42,
    submittedCount: 38,
    gradedCount: 38,
    averageScore: 8.4,
    color: '#FF4B4B',
    icon: 'calculator',
    instructions: 'Foco em figuras inscritas e trigonometria no triângulo retângulo.',
    comments: [],
    submissions: [
      { studentId: 's5', studentName: 'Arthur Souza', submittedAt: 'Ontem 17:00', status: 'CORRIGIDO', score: 9.5, timeSpent: '20m' },
    ],
  },
];

export const INITIAL_TEACHER_MATERIALS: TeacherMaterial[] = [
  {
    id: 'tm1',
    classId: 'c1',
    subject: 'Física',
    topic: 'Cinemática Escalar',
    title: 'Resumão Ilustrado: Fórmulas de Cinemática',
    type: 'pdf',
    dateAdded: '2026-10-25',
    viewsCount: 31,
    downloadsCount: 26,
    color: '#58CC02',
    icon: 'file-pdf',
    description: 'Guia visual com mapa mental de MRU, MRUV e queda livre.',
    comments: [
      {
        id: 'cm1',
        author: 'Gabriel Santos',
        role: 'STUDENT',
        date: 'Há 2 dias',
        text: 'Esse mapa mental facilitou muito a revisão, obrigado prof!',
      },
    ],
  },
  {
    id: 'tm2',
    classId: 'c1',
    subject: 'Física',
    topic: 'Leis de Newton',
    title: 'Videoaula Gravada: Aplicação de Forças no Plano Inclinado',
    type: 'video',
    dateAdded: '2026-10-28',
    viewsCount: 29,
    downloadsCount: 0,
    color: '#58CC02',
    icon: 'video',
    description: 'Resolução detalhada dos 3 exercícios mais difíceis da aula.',
    comments: [],
  },
  {
    id: 'tm3',
    classId: 'c2',
    subject: 'Matemática',
    topic: 'Geometria Plana',
    title: 'Macete: Fórmulas de Áreas de Triângulos e Herão',
    type: 'tip',
    dateAdded: '2026-10-22',
    viewsCount: 40,
    downloadsCount: 18,
    color: '#FF4B4B',
    icon: 'lightbulb',
    description: 'Tabela comparativa para nunca mais esquecer as relações trigonométricas.',
    comments: [],
  },
];

