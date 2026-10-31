import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

const OFFLINE_QUESTIONS_STORAGE_KEY = '@minuto_enem:offline_questions_v1';
const OFFLINE_SYNC_QUEUE_STORAGE_KEY = '@minuto_enem:offline_quiz_sync_queue_v1';

export interface QuizQuestion {
  id: string | number;
  subject: string;
  area: string;
  year?: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  errorRate?: number;
}

export interface PendingQuizAnswerPayload {
  id: string;
  userId: string;
  questionId: string | number;
  selectedOption: number;
  isCorrect: boolean;
  xpEarned: number;
  answeredAt: string;
}

export interface QuestionsQueryFilters {
  day?: string;
  difficulty?: string;
  limit?: number;
}

async function getStoredQuestions(): Promise<QuizQuestion[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUESTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveQuestionsLocally(questions: QuizQuestion[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      OFFLINE_QUESTIONS_STORAGE_KEY,
      JSON.stringify(questions)
    );
  } catch {
    // Falha silenciosa ao gravar no AsyncStorage
  }
}

export async function getPendingQuizSyncQueue(): Promise<PendingQuizAnswerPayload[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_SYNC_QUEUE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function enqueueOfflineQuizAnswer(
  payload: Omit<PendingQuizAnswerPayload, 'id' | 'answeredAt'>
): Promise<PendingQuizAnswerPayload[]> {
  const queue = await getPendingQuizSyncQueue();
  const item: PendingQuizAnswerPayload = {
    ...payload,
    id: `sync_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    answeredAt: new Date().toISOString(),
  };
  const updated = [...queue, item];
  await AsyncStorage.setItem(
    OFFLINE_SYNC_QUEUE_STORAGE_KEY,
    JSON.stringify(updated)
  );
  return updated;
}

export async function syncPendingQuizResults(): Promise<{
  syncedCount: number;
  remainingCount: number;
}> {
  const queue = await getPendingQuizSyncQueue();
  if (queue.length === 0) {
    return { syncedCount: 0, remainingCount: 0 };
  }

  const remaining: PendingQuizAnswerPayload[] = [];
  let syncedCount = 0;

  for (const item of queue) {
    try {
      await api.post('/questions/answer', {
        userId: item.userId,
        questionId: item.questionId,
        selectedOption: item.selectedOption,
        answeredAt: item.answeredAt,
      });
      syncedCount += 1;
    } catch {
      try {
        // Fallback para rota de ofensiva caso o backend utilize /streak/complete-lesson
        await api.post('/streak/complete-lesson', { userId: item.userId });
        syncedCount += 1;
      } catch {
        // Permanece na fila para nova tentativa quando a conexão estabilizar
        remaining.push(item);
      }
    }
  }

  await AsyncStorage.setItem(
    OFFLINE_SYNC_QUEUE_STORAGE_KEY,
    JSON.stringify(remaining)
  );

  return {
    syncedCount,
    remainingCount: remaining.length,
  };
}

function applyQuestionFilters(
  questions: QuizQuestion[],
  filters?: QuestionsQueryFilters
): QuizQuestion[] {
  if (!filters) return questions;

  let data = [...questions];
  const { day, difficulty, limit } = filters;

  if (day === '1') {
    data = data.filter(
      (q) =>
        q.area?.toLowerCase().includes('humanas') ||
        q.area?.toLowerCase().includes('linguagens') ||
        q.area?.toLowerCase().includes('ch') ||
        q.area?.toLowerCase().includes('lc')
    );
  } else if (day === '2') {
    data = data.filter(
      (q) =>
        q.area?.toLowerCase().includes('natureza') ||
        q.area?.toLowerCase().includes('matemática') ||
        q.area?.toLowerCase().includes('cn') ||
        q.area?.toLowerCase().includes('mt')
    );
  }

  if (difficulty === 'facil') {
    data = data.filter((q) => q.errorRate !== undefined && q.errorRate < 45);
  } else if (difficulty === 'medio') {
    data = data.filter(
      (q) => q.errorRate !== undefined && q.errorRate >= 45 && q.errorRate <= 65
    );
  } else if (difficulty === 'dificil') {
    data = data.filter((q) => q.errorRate !== undefined && q.errorRate > 65);
  }

  if (limit && limit > 0) {
    return data.slice(0, limit);
  }

  return data;
}

/**
 * Hook Offline-First para busca, download local e sincronização de quizzes.
 * - Busca da API real (`/questions`) via `api.get` e persiste automaticamente no AsyncStorage.
 * - Se o dispositivo estiver sem conexão, retorna o banco de questões salvo localmente.
 * - Gerencia a fila de respostas feitas offline para sincronização posterior.
 */
export function useQuestionsQuery(filters?: QuestionsQueryFilters) {
  const queryClient = useQueryClient();
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOfflineData, setIsOfflineData] = useState(false);

  const refreshQueueCount = useCallback(async () => {
    const queue = await getPendingQuizSyncQueue();
    setPendingSyncCount(queue.length);
  }, []);

  useEffect(() => {
    refreshQueueCount();
  }, [refreshQueueCount]);

  const query = useQuery<QuizQuestion[], Error>({
    queryKey: ['questions', filters?.day ?? 'all', filters?.difficulty ?? 'all', filters?.limit ?? 'all'],
    networkMode: 'offlineFirst',
    queryFn: async () => {
      try {
        const remoteData = await api.get<QuizQuestion[]>('/questions');
        if (Array.isArray(remoteData) && remoteData.length > 0) {
          await saveQuestionsLocally(remoteData);
          setIsOfflineData(false);
          return applyQuestionFilters(remoteData, filters);
        }
        throw new Error('Nenhum dado retornado pela API');
      } catch (err) {
        const cachedLocal = await getStoredQuestions();
        if (cachedLocal.length > 0) {
          setIsOfflineData(true);
          return applyQuestionFilters(cachedLocal, filters);
        }
        throw err instanceof Error
          ? err
          : new Error('Não foi possível carregar as questões e não há pacote salvo offline.');
      }
    },
  });

  const downloadQuizzesLocally = useCallback(async () => {
    const remoteData = await api.get<QuizQuestion[]>('/questions');
    if (Array.isArray(remoteData)) {
      await saveQuestionsLocally(remoteData);
      queryClient.setQueryData(['questions', 'all', 'all', 'all'], remoteData);
      setIsOfflineData(false);
    }
    return remoteData;
  }, [queryClient]);

  const queueAnswerOffline = useCallback(
    async (payload: Omit<PendingQuizAnswerPayload, 'id' | 'answeredAt'>) => {
      const updated = await enqueueOfflineQuizAnswer(payload);
      setPendingSyncCount(updated.length);
      return updated;
    },
    []
  );

  const syncPendingResults = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await syncPendingQuizResults();
      setPendingSyncCount(result.remainingCount);
      if (result.syncedCount > 0) {
        queryClient.invalidateQueries({ queryKey: ['error-stats'] });
        queryClient.invalidateQueries({ queryKey: ['teacher-tracking'] });
      }
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, [queryClient]);

  // Tenta sincronizar automaticamente quando o app volta ao primeiro plano
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        syncPendingResults().catch(() => {});
      }
    });
    return () => subscription.remove();
  }, [syncPendingResults]);

  return {
    ...query,
    questions: query.data ?? [],
    isOfflineData,
    pendingSyncCount,
    isSyncing,
    downloadQuizzesLocally,
    queueAnswerOffline,
    syncPendingResults,
    refreshQueueCount,
  };
}

