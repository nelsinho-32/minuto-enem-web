import { create } from 'zustand';

interface UserState {
  xp: number;
  streak: number;
  lastPlayedDate: string | null;
  avatar: string | null;
  setAvatar: (url: string) => void;
  addXp: (amount: number) => void;
  registerDailyPlay: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  xp: 0,
  streak: 0,
  lastPlayedDate: null,
  avatar: null, // Começa sem foto (mostrando ícone/iniciais)
  setAvatar: (url) => set({ avatar: url }),
  
  addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
  
  registerDailyPlay: () => set((state) => {
    // Pega a data de hoje no formato YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];
    
    if (state.lastPlayedDate === today) {
      return state; // Já jogou hoje, não altera a ofensiva
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Se jogou ontem, aumenta 1. Se não, perdeu a ofensiva (volta para 1).
    if (state.lastPlayedDate === yesterdayStr) {
      return { streak: state.streak + 1, lastPlayedDate: today };
    }
    
    return { streak: 1, lastPlayedDate: today };
  }),
}));