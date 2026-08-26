import { Question } from '@/types/quiz';

export const MOCK_QUESTIONS: Question[] = [
  {
    id: '1',
    subject: "Matemática e suas Tecnologias",
    text: "Um produto custava R$ 200,00 e sofreu um acréscimo de 15%. Qual é o novo valor do produto?",
    options: [
      { id: 'A', text: "R$ 215,00" },
      { id: 'B', text: "R$ 220,00" },
      { id: 'C', text: "R$ 230,00" },
      { id: 'D', text: "R$ 245,00" }
    ],
    correctOptionId: 'C',
    explanation: "15% de 200 = (15/100) * 200 = 30. O novo valor é o valor antigo mais o acréscimo: 200 + 30 = R$ 230,00."
  },
  {
    id: '2',
    subject: "Ciências Humanas",
    text: "No contexto da Revolução Francesa, qual evento é considerado o marco inicial da queda do absolutismo?",
    options: [
      { id: 'A', text: "A execução de Luís XVI." },
      { id: 'B', text: "A Queda da Bastilha." },
      { id: 'C', text: "A coroação de Napoleão." },
      { id: 'D', text: "A assinatura da Declaração dos Direitos do Homem." }
    ],
    correctOptionId: 'B',
    explanation: "A Queda da Bastilha, em 14 de julho de 1789, é o marco simbólico da Revolução Francesa, pois a prisão representava o poder autoritário e absoluto do rei."
  }
];