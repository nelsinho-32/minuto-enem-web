export interface ErrorQuestionItem {
  id: string;
  area: string;
  subject: string;
  topic: string;
  errorCategory: string;
  timeSpent: string;
  timeSeconds: number;
  isFavorite: boolean;
  text: string;
  userOption: string;
  correctOption: string;
  diagnosis: string;
}

export interface SubjectErrorStats {
  subject: string;
  area: string;
  icon: string;
  color: string;
  totalAttempted: number;
  errorsCount: number;
  errorRate: number; // porcentagem (0-100)
  averageTime: string;
}

export const GENERAL_ERROR_STATS = {
  totalAnswered: 150,
  totalErrors: 33,
  errorRate: 22,
  averageErrorTime: '2m 35s',
};

export const SUBJECT_ERROR_META: Record<
  string,
  { area: string; icon: string; color: string; totalAttempted: number; errorRate: number; averageTime: string }
> = {
  Matemática: {
    area: 'Matemática',
    icon: 'calculator',
    color: '#FF4B4B',
    totalAttempted: 42,
    errorRate: 36,
    averageTime: '2m 50s',
  },
  Física: {
    area: 'Natureza',
    icon: 'atom',
    color: '#FF9600',
    totalAttempted: 28,
    errorRate: 29,
    averageTime: '3m 05s',
  },
  Química: {
    area: 'Natureza',
    icon: 'flask',
    color: '#CE82FF',
    totalAttempted: 25,
    errorRate: 20,
    averageTime: '2m 15s',
  },
  Português: {
    area: 'Linguagens',
    icon: 'book-open',
    color: '#1CB0F6',
    totalAttempted: 30,
    errorRate: 13,
    averageTime: '1m 55s',
  },
};

export const INITIAL_ERROR_QUESTIONS: ErrorQuestionItem[] = [
  {
    id: '1',
    area: 'Matemática',
    subject: 'Matemática',
    topic: 'Geometria Espacial',
    errorCategory: 'Pegadinha',
    timeSpent: '2m 40s',
    timeSeconds: 160,
    isFavorite: false,
    text: 'Se dobrarmos a aresta de um cubo, o que acontece com o seu volume?',
    userOption: 'B) O volume dobra.',
    correctOption: 'D) O volume fica multiplicado por 8.',
    diagnosis:
      'Como o volume é tridimensional (a³), se a aresta dobra (2a), o volume multiplica por 2³ (8).',
  },
  {
    id: '2',
    area: 'Matemática',
    subject: 'Matemática',
    topic: 'Geometria Espacial',
    errorCategory: 'Erro de Fórmula',
    timeSpent: '3m 15s',
    timeSeconds: 195,
    isFavorite: false,
    text: 'Um cilindro reto possui raio da base igual a 3 cm e altura de 10 cm. Qual é o seu volume em função de π?',
    userOption: 'A) 30π cm³',
    correctOption: 'C) 90π cm³',
    diagnosis:
      'O volume do cilindro é V = π · r² · h. Você multiplicou apenas por r (3) em vez de elevar o raio ao quadrado (3² = 9).',
  },
  {
    id: '3',
    area: 'Matemática',
    subject: 'Matemática',
    topic: 'Probabilidade',
    errorCategory: 'Desatenção',
    timeSpent: '2m 10s',
    timeSeconds: 130,
    isFavorite: true,
    text: 'Ao lançar dois dados perfeitos, qual a probabilidade de a soma ser 7?',
    userOption: 'C) 1/12',
    correctOption: 'A) 1/6',
    diagnosis:
      'Você esqueceu de contar todas as permutações (ex: 3 e 4 é diferente de 4 e 3 no lançamento de dois dados distintos).',
  },
  {
    id: '4',
    area: 'Matemática',
    subject: 'Matemática',
    topic: 'Funções e Gráficos',
    errorCategory: 'Interpretação',
    timeSpent: '3m 15s',
    timeSeconds: 195,
    isFavorite: false,
    text: 'O lucro mensal de uma fábrica é dado por L(x) = -x² + 12x - 20, onde x é a quantidade em milhares. Para qual valor de x o lucro é máximo?',
    userOption: 'D) x = 12',
    correctOption: 'B) x = 6',
    diagnosis:
      'O ponto de máximo usa o x do vértice: Xv = -b / (2a) = -12 / (2 · -1) = 6. Faltou dividir por 2a.',
  },
  {
    id: '5',
    area: 'Natureza',
    subject: 'Física',
    topic: 'Cinemática',
    errorCategory: 'Erro de Fórmula',
    timeSpent: '3m 20s',
    timeSeconds: 200,
    isFavorite: false,
    text: 'Um carro de 1000 kg acelera de 0 a 20 m/s em 10 segundos. Qual é o trabalho realizado pelo motor?',
    userOption: 'A) 100.000 Joules',
    correctOption: 'C) 200.000 Joules',
    diagnosis:
      'Você confundiu Força com Trabalho. Faltou usar o Teorema da Energia Cinética (E = m·v²/2).',
  },
  {
    id: '6',
    area: 'Natureza',
    subject: 'Física',
    topic: 'Eletrodinâmica',
    errorCategory: 'Conversão de Unidade',
    timeSpent: '2m 50s',
    timeSeconds: 170,
    isFavorite: false,
    text: 'Um chuveiro elétrico de 4400 W ligado em 220 V permanece ligado por 15 minutos diários. Qual a corrente elétrica que o atravessa?',
    userOption: 'B) 10 A',
    correctOption: 'D) 20 A',
    diagnosis:
      'Pela relação P = U · i, temos i = 4400 / 220 = 20 A. O tempo de 15 minutos era um distrator para cálculo de energia.',
  },
  {
    id: '7',
    area: 'Natureza',
    subject: 'Química',
    topic: 'Estequiometria',
    errorCategory: 'Proporção Molar',
    timeSpent: '2m 15s',
    timeSeconds: 135,
    isFavorite: false,
    text: 'Na combustão completa de 1 mol de metano (CH4 + 2O2 → CO2 + 2H2O), quantos mols de água são formados?',
    userOption: 'A) 1 mol',
    correctOption: 'B) 2 mols',
    diagnosis:
      'É necessário observar o balanceamento da equação química: para cada 1 mol de CH4 consumido, formam-se 2 mols de H2O.',
  },
  {
    id: '8',
    area: 'Linguagens',
    subject: 'Português',
    topic: 'Funções da Linguagem',
    errorCategory: 'Interpretação',
    timeSpent: '1m 55s',
    timeSeconds: 115,
    isFavorite: false,
    text: 'Quando um poema explica o próprio ato de escrever poesia, qual função da linguagem predomina?',
    userOption: 'C) Função Poética',
    correctOption: 'E) Função Metalinguística',
    diagnosis:
      'Quando o código explica o próprio código (poema falando sobre fazer poema), predomina a função metalinguística.',
  },
];

