import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ChatCategory = 'MACETE' | 'QUESTAO' | 'DUVIDA' | 'GERAL';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  isMe?: boolean;
  category: ChatCategory;
  subjectTag?: string; // ex: 'Matemática', 'Literatura'
  content: string;
  timestamp: string; // '14:32' ou data formatada
  likes: number;
  likedByMe?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderId: 'user-carlos',
    senderName: 'Carlos Eduardo',
    category: 'MACETE',
    subjectTag: 'Matemática',
    content: 'Macete para Bhaskara e Vértice da Parábola: Xv = -b / (2a) e Yv = -Δ / (4a). Sempre cai para achar ponto máximo ou mínimo de lucro!',
    timestamp: '14:20',
    likes: 5,
    likedByMe: true,
  },
  {
    id: 'msg-2',
    senderId: 'user-ana',
    senderName: 'Ana Beatriz',
    category: 'QUESTAO',
    subjectTag: 'Física',
    content: 'Alguém conseguiu resolver a questão 14 de Termodinâmica da lista do Prof. Roberto? Aquela sobre rendimento do ciclo de Carnot.',
    timestamp: '15:05',
    likes: 3,
  },
  {
    id: 'msg-3',
    senderId: 'user-lucas',
    senderName: 'Lucas Silva',
    category: 'DUVIDA',
    subjectTag: 'Literatura',
    content: 'Qual a diferença crucial entre a 1ª fase e a 2ª fase do Modernismo no Brasil para o ENEM?',
    timestamp: '16:12',
    likes: 2,
  },
];

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp' | 'likes'>) => void;
  toggleLike: (id: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: INITIAL_MESSAGES,
      addMessage: (newMsg) => {
        const now = new Date();
        const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const message: ChatMessage = {
          ...newMsg,
          id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp,
          likes: 0,
          likedByMe: false,
          isMe: true,
        };

        set((state) => ({
          messages: [message, ...state.messages],
        }));
      },
      toggleLike: (id: string) => {
        set((state) => ({
          messages: state.messages.map((m) => {
            if (m.id !== id) return m;
            const liked = !m.likedByMe;
            return {
              ...m,
              likedByMe: liked,
              likes: liked ? m.likes + 1 : Math.max(0, m.likes - 1),
            };
          }),
        }));
      },
    }),
    {
      name: '@minuto_enem:friends_chat',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

