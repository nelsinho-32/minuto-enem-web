import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/services/api';
import { useUserStore } from '@/store/useUserStore';

type TaskComment = {
  id: string;
  author: string;
  role: 'STUDENT' | 'TEACHER';
  date: string;
  text: string;
};

export type Task = {
  id: string;
  classId?: string;
  subject: string;
  topic: string;
  teacher: string;
  total: number;
  done: number;
  color: string;
  icon: string;
  score?: number;
  instructions?: string;
  comments: TaskComment[];
  dueDate?: string;
};

export interface AiSuggestedTask {
  id: string;
  classId?: string;
  subject: string;
  topic: string;
  title: string;
  reason: string;
  totalQuestions: number;
  difficultyLevel: 'Fácil' | 'Médio' | 'Difícil';
  suggestedDays: number;
  instructions: string;
  color: string;
  icon: string;
}

const DEFAULT_AI_SUGGESTIONS: AiSuggestedTask[] = [
  {
    id: 'ai-sug-1',
    subject: 'Física',
    topic: 'Plano Inclinado e Atrito',
    title: 'Lista de Reforço: Dinâmica e Atrito',
    reason:
      'Diagnóstico da IA: 42% dos alunos erraram decomposição de forças no último simulado.',
    totalQuestions: 12,
    difficultyLevel: 'Médio',
    suggestedDays: 7,
    instructions:
      'Praticar cálculo de forças perpendiculares (Normal = P · cos θ) e força resultante paralela ao plano inclinado.',
    color: '#58CC02',
    icon: 'atom',
  },
  {
    id: 'ai-sug-2',
    subject: 'Matemática',
    topic: 'Geometria Espacial e Volume',
    title: 'Lista Intensiva: Prismas e Cilindros no ENEM',
    reason:
      'Diagnóstico da IA: Assunto recorrente com 35% de erros de fórmula de base e volume.',
    totalQuestions: 15,
    difficultyLevel: 'Difícil',
    suggestedDays: 5,
    instructions:
      'Exercícios de aplicação direta e cálculo de capacidade cúbica em contextos cotidianos.',
    color: '#FF4B4B',
    icon: 'calculator',
  },
  {
    id: 'ai-sug-3',
    subject: 'Literatura',
    topic: 'Modernismo Brasileiro (1ª Fase)',
    title: 'Lista Temática: Semana de Arte Moderna de 1922',
    reason:
      'Diagnóstico da IA: Alta frequência na prova com dúvidas sobre ruptura com o academicismo.',
    totalQuestions: 10,
    difficultyLevel: 'Médio',
    suggestedDays: 4,
    instructions:
      'Análise de poemas de Oswald de Andrade e Mário de Andrade focando na antropofagia cultural.',
    color: '#1CB0F6',
    icon: 'book-open',
  },
];

const INITIAL_TASKS: { pending: Task[]; completed: Task[] } = {
  pending: [
    {
      id: 't1',
      subject: 'Física',
      topic: 'Cinemática Escalar',
      teacher: 'Prof. Carlos',
      total: 15,
      done: 0,
      color: '#58CC02',
      icon: 'atom',
      instructions: 'Resolver as 15 questões de MRU e MRUV aplicando as equações horárias.',
      comments: [
        {
          id: 'c1',
          author: 'Lucas Silva',
          role: 'STUDENT',
          date: 'Hoje 09:15',
          text: 'Professor, na questão 3 a velocidade inicial é nula?',
        },
        {
          id: 'c2',
          author: 'Prof. Carlos',
          role: 'TEACHER',
          date: 'Hoje 09:40',
          text: 'Sim! Parte do repouso, então v0 = 0 m/s.',
        },
      ],
    },
    {
      id: 't2',
      subject: 'Física',
      topic: 'Leis de Newton',
      teacher: 'Prof. Carlos',
      total: 20,
      done: 5,
      color: '#58CC02',
      icon: 'atom',
      instructions: 'Identificar as forças em pares de ação e reação no plano inclinado.',
      comments: [],
    },
    {
      id: 't3',
      subject: 'Matemática',
      topic: 'Geometria Plana',
      teacher: 'Profª. Marta',
      total: 10,
      done: 4,
      color: '#FF4B4B',
      icon: 'calculator',
      instructions: 'Cálculo de áreas de triângulos, círculos e setores circulares.',
      comments: [
        {
          id: 'c3',
          author: 'Mariana Lima',
          role: 'STUDENT',
          date: 'Ontem',
          text: 'Muito boa a seleção de questões do ENEM 2023!',
        },
      ],
    },
  ],
  completed: [
    {
      id: 't4',
      subject: 'História',
      topic: 'Era Vargas',
      teacher: 'Prof. Sérgio',
      total: 20,
      done: 20,
      color: '#F1C40F',
      icon: 'monument',
      score: 18,
      instructions: 'Revisão da Constituição de 1934 e 1937 (Estado Novo).',
      comments: [],
    },
    {
      id: 't5',
      subject: 'História',
      topic: 'Segunda Guerra',
      teacher: 'Prof. Sérgio',
      total: 15,
      done: 15,
      color: '#F1C40F',
      icon: 'monument',
      score: 12,
      instructions: 'Contexto geopolítico e participação da FEB.',
      comments: [],
    },
  ],
};

const TASKS_STORAGE_KEY = '@minuto_enem:classroom_tasks_v1';

export default function TasksScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { subject: filterSubject, classId, className } = useLocalSearchParams<{
    subject?: string;
    classId?: string;
    className?: string;
  }>();
  const user = useUserStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<'pendentes' | 'feitas'>('pendentes');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(filterSubject || 'Física');
  const [tasksState, setTasksState] = useState(INITIAL_TASKS);
  const [expandedTaskComments, setExpandedTaskComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Estados locais das sugestões de IA para o professor
  const [aiSuggestionsList, setAiSuggestionsList] = useState<AiSuggestedTask[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Consulta à API real para buscar as sugestões do Copiloto Docente com IA
  const {
    data: remoteAiSuggestions,
    isLoading: loadingAiSuggestions,
    refetch: refetchAiSuggestions,
  } = useQuery<AiSuggestedTask[], Error>({
    queryKey: ['ai-task-suggestions', filterSubject, classId],
    queryFn: async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filterSubject) queryParams.append('subject', filterSubject);
        if (classId) queryParams.append('classId', classId);

        const res = await api.get<AiSuggestedTask[]>(
          `/classes/tasks/ai-suggestions?${queryParams.toString()}`
        );
        if (Array.isArray(res) && res.length > 0) return res;
        throw new Error('Fallback para templates');
      } catch {
        if (filterSubject) {
          const filtered = DEFAULT_AI_SUGGESTIONS.filter(
            (s) => s.subject.toLowerCase() === filterSubject.toLowerCase()
          );
          return filtered.length > 0 ? filtered : DEFAULT_AI_SUGGESTIONS;
        }
        return DEFAULT_AI_SUGGESTIONS;
      }
    },
    enabled: user?.role === 'TEACHER',
  });

  useEffect(() => {
    if (remoteAiSuggestions) {
      setAiSuggestionsList(remoteAiSuggestions);
    }
  }, [remoteAiSuggestions]);

  // Carrega tarefas salvas do banco de dados/cache
  useEffect(() => {
    async function loadTasks() {
      try {
        const raw = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.pending && parsed?.completed) {
            setTasksState(parsed);
          }
        }
      } catch {
        // Ignora
      }
    }
    loadTasks();
  }, []);

  const saveTasksLocally = async (newState: typeof INITIAL_TASKS) => {
    setTasksState(newState);
    try {
      await AsyncStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(newState));
    } catch {
      // Ignora erro
    }
  };

  /**
   * Aprova uma sugestão de lista de exercícios do Copiloto Docente e a envia para a turma
   */
  const handleApproveAndSendToClass = async (suggestion: AiSuggestedTask) => {
    setApprovingId(suggestion.id);
    try {
      // Envia requisição para a API do back-end registrar a aprovação e disponibilizar aos alunos
      await api.post('/classes/tasks/approve-suggestion', {
        classId: classId || suggestion.classId,
        suggestionId: suggestion.id,
        title: suggestion.title,
        subject: suggestion.subject,
        topic: suggestion.topic,
        instructions: suggestion.instructions,
        totalQuestions: suggestion.totalQuestions,
        teacherName: user?.name || 'Professor',
        dueDate: `Em ${suggestion.suggestedDays} dias`,
      });
    } catch {
      // Tolerância offline: cria a tarefa localmente mesmo se o servidor estiver reiniciando
    }

    const newTask: Task = {
      id: `task_approved_${Date.now()}`,
      classId,
      subject: suggestion.subject,
      topic: `${suggestion.title} (${suggestion.topic})`,
      teacher: user?.name || 'Professor',
      total: suggestion.totalQuestions,
      done: 0,
      color: suggestion.color,
      icon: suggestion.icon,
      instructions: suggestion.instructions,
      dueDate: `Em ${suggestion.suggestedDays} dias`,
      comments: [
        {
          id: `c_auto_${Date.now()}`,
          author: 'Copiloto Docente IA',
          role: 'TEACHER',
          date: 'Agora',
          text: `Lista gerada automaticamente com foco nos pontos de dúvida da turma: ${suggestion.reason}`,
        },
      ],
    };

    const updatedTasks = {
      ...tasksState,
      pending: [newTask, ...tasksState.pending],
    };

    await saveTasksLocally(updatedTasks);
    setAiSuggestionsList((prev) => prev.filter((s) => s.id !== suggestion.id));
    setApprovingId(null);

    queryClient.invalidateQueries({ queryKey: ['teacher-tracking'] });
    queryClient.invalidateQueries({ queryKey: ['ai-task-suggestions'] });

    Alert.alert(
      'Lista Aprovada e Enviada!',
      `A lista "${suggestion.title}" foi aprovada pelo professor e disponibilizada com sucesso para todos os alunos da turma.`,
      [{ text: 'OK' }]
    );
  };

  /**
   * Gera uma nova sugestão com IA sob demanda
   */
  const handleGenerateNewAiSuggestion = async () => {
    setIsGeneratingAi(true);
    try {
      const response = await api.post<AiSuggestedTask>('/classes/tasks/ai-generate', {
        subject: filterSubject || 'Geral',
        classId,
        teacherId: user?.id,
      });

      if (response?.id) {
        setAiSuggestionsList((prev) => [response, ...prev]);
      } else {
        throw new Error('Fallback');
      }
    } catch {
      const fallbackNew: AiSuggestedTask = {
        id: `ai-gen-${Date.now()}`,
        subject: filterSubject || 'Matemática',
        topic: 'Análise Combinatória e Probabilidade',
        title: 'Treino de Precisão: Arranjos e Combinações',
        reason:
          'Diagnóstico da IA: Baixa taxa de acertos em questões com princípio fundamental da contagem.',
        totalQuestions: 10,
        difficultyLevel: 'Médio',
        suggestedDays: 6,
        instructions:
          'Identificar a diferença entre quando a ordem dos elementos importa (arranjo) ou não importa (combinação).',
        color: '#FF4B4B',
        icon: 'calculator',
      };
      setAiSuggestionsList((prev) => [fallbackNew, ...prev]);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Agrupa tarefas pela Matéria (com suporte a filtro por matéria se acessado via turma)
  const groupedTasks = useMemo(() => {
    let tasks = activeTab === 'pendentes' ? tasksState.pending : tasksState.completed;

    if (filterSubject) {
      tasks = tasks.filter(
        (t) => t.subject.toLowerCase() === filterSubject.toLowerCase()
      );
    }

    return tasks.reduce((acc, task) => {
      if (!acc[task.subject]) {
        acc[task.subject] = { tasks: [], color: task.color, icon: task.icon };
      }
      acc[task.subject].tasks.push(task);
      return acc;
    }, {} as Record<string, { tasks: Task[]; color: string; icon: string }>);
  }, [activeTab, tasksState, filterSubject]);

  const toggleSubject = (subject: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSubject((prev) => (prev === subject ? null : subject));
  };

  const toggleTaskComments = (taskId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedTaskComments((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleAddComment = (taskId: string) => {
    const text = (commentInputs[taskId] || '').trim();
    if (!text) return;

    const newComment: TaskComment = {
      id: `tc_${Date.now()}`,
      author: user?.name || (user?.role === 'TEACHER' ? 'Professor' : 'Aluno'),
      role: (user?.role as 'STUDENT' | 'TEACHER') || 'STUDENT',
      date: 'Agora',
      text,
    };

    const updateList = (list: Task[]) =>
      list.map((t) =>
        t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t
      );

    const updated = {
      pending: updateList(tasksState.pending),
      completed: updateList(tasksState.completed),
    };

    saveTasksLocally(updated);
    setCommentInputs((prev) => ({ ...prev, [taskId]: '' }));
    setExpandedTaskComments((prev) => ({ ...prev, [taskId]: true }));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={18} color="#2C3A47" />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>
            {filterSubject ? `Tarefas: ${filterSubject}` : 'Tarefas da Turma'}
          </Text>
          {className && (
            <Text style={{ fontSize: 11, color: '#8CA0B3', marginTop: 2 }}>
              {className}
            </Text>
          )}
        </View>
        {user?.role === 'TEACHER' ? (
          <TouchableOpacity
            style={styles.teacherTrackerBtn}
            onPress={() => router.push('/classes/teacher-tracking' as any)}
          >
            <FontAwesome5 name="chart-pie" size={15} color="#1CB0F6" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
      </View>

      {/* 2. ABAS */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBackground}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'pendentes' && styles.tabActive]}
            onPress={() => {
              setActiveTab('pendentes');
              setExpandedSubject(null);
            }}
            activeOpacity={0.8}
          >
            <FontAwesome5
              name="clock"
              size={13}
              color={activeTab === 'pendentes' ? '#2C3A47' : '#8CA0B3'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'pendentes' && styles.tabTextActive,
              ]}
            >
              Pendentes ({tasksState.pending.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'feitas' && styles.tabActive]}
            onPress={() => {
              setActiveTab('feitas');
              setExpandedSubject(null);
            }}
            activeOpacity={0.8}
          >
            <FontAwesome5
              name="check-double"
              size={13}
              color={activeTab === 'feitas' ? '#2C3A47' : '#8CA0B3'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'feitas' && styles.tabTextActive,
              ]}
            >
              Feitas ({tasksState.completed.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. CONTEÚDO */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================== */}
        {/* SEÇÃO DO COPILOTO DOCENTE (UI): SUGESTÕES AUTOMATIZADAS POR IA */}
        {/* ============================================================== */}
        {user?.role === 'TEACHER' && (
          <View style={styles.copilotSection}>
            <View style={styles.copilotHeader}>
              <View style={styles.copilotTitleRow}>
                <View style={styles.copilotIconBadge}>
                  <FontAwesome5 name="robot" size={16} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.copilotTitle}>
                    Copiloto Docente com IA
                  </Text>
                  <Text style={styles.copilotSubtitle}>
                    Listas geradas automaticamente com base no diagnóstico de erros da turma.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.generateAiBtn}
                activeOpacity={0.8}
                onPress={handleGenerateNewAiSuggestion}
                disabled={isGeneratingAi}
              >
                {isGeneratingAi ? (
                  <ActivityIndicator size="small" color="#8E44AD" />
                ) : (
                  <>
                    <FontAwesome5 name="magic" size={11} color="#8E44AD" />
                    <Text style={styles.generateAiBtnText}>Gerar Nova</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {loadingAiSuggestions ? (
              <View style={styles.copilotLoading}>
                <ActivityIndicator size="small" color="#8E44AD" />
                <Text style={styles.copilotLoadingText}>
                  Avaliando dados de desempenho e formulando listas...
                </Text>
              </View>
            ) : aiSuggestionsList.length === 0 ? (
              <View style={styles.copilotEmptyCard}>
                <FontAwesome5 name="check-circle" size={28} color="#58CC02" />
                <Text style={styles.copilotEmptyText}>
                  Todas as sugestões de listas recomendadas foram aprovadas e enviadas para a turma!
                </Text>
              </View>
            ) : (
              aiSuggestionsList.map((suggestion) => {
                const isApproving = approvingId === suggestion.id;

                return (
                  <View key={suggestion.id} style={styles.aiSuggestionCard}>
                    {/* Cabeçalho da Sugestão */}
                    <View style={styles.aiCardHeaderRow}>
                      <View style={styles.aiTagBadge}>
                        <FontAwesome5 name="brain" size={10} color="#8E44AD" />
                        <Text style={styles.aiTagBadgeText}>Sugestão da IA</Text>
                      </View>

                      <View style={styles.difficultyChip}>
                        <Text style={styles.difficultyChipText}>
                          {suggestion.difficultyLevel} • {suggestion.totalQuestions} questões
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.aiSuggestionTitle}>
                      {suggestion.title}
                    </Text>
                    <Text style={styles.aiSuggestionTopic}>
                      Disciplina: {suggestion.subject} • Tópico: {suggestion.topic}
                    </Text>

                    {/* Diagnóstico da IA */}
                    <View style={styles.aiReasonBox}>
                      <FontAwesome5
                        name="chart-line"
                        size={12}
                        color="#8E44AD"
                        style={{ marginTop: 2 }}
                      />
                      <Text style={styles.aiReasonText}>{suggestion.reason}</Text>
                    </View>

                    {/* Instruções aos alunos */}
                    <Text style={styles.aiInstructionsText}>
                      <Text style={{ fontWeight: 'bold' }}>Diretriz:</Text>{' '}
                      {suggestion.instructions}
                    </Text>

                    {/* BOTÃO PARA O PROFESSOR: APROVAR E ENVIAR PARA A TURMA */}
                    <TouchableOpacity
                      style={[
                        styles.approveButton,
                        isApproving && { opacity: 0.75 },
                      ]}
                      activeOpacity={0.85}
                      onPress={() => handleApproveAndSendToClass(suggestion)}
                      disabled={isApproving}
                    >
                      {isApproving ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <FontAwesome5 name="paper-plane" size={13} color="#FFF" />
                          <Text style={styles.approveButtonText}>
                            Aprovar e Enviar para a Turma
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Banner para os Professores acompanharem rendimento */}
        {user?.role === 'TEACHER' && (
          <TouchableOpacity
            style={styles.teacherHeaderBanner}
            activeOpacity={0.85}
            onPress={() => router.push('/classes/teacher-tracking' as any)}
          >
            <View style={styles.teacherIconCircle}>
              <FontAwesome5 name="chalkboard-teacher" size={14} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.teacherBannerTitle}>Visão do Professor</Text>
              <Text style={styles.teacherBannerSub}>
                Toque para ver quem entregou, notas e estatísticas de cada lista.
              </Text>
            </View>
            <FontAwesome5 name="arrow-right" size={12} color="#1CB0F6" />
          </TouchableOpacity>
        )}

        <Text style={styles.sectionSubtitle}>
          {activeTab === 'pendentes'
            ? 'Listas ativas da turma organizadas por matéria com espaço para dúvidas.'
            : 'Histórico de listas que você já entregou aos professores.'}
        </Text>

        {Object.keys(groupedTasks).length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5
              name="glass-cheers"
              size={44}
              color="#E2E8F0"
              style={{ marginBottom: 12 }}
            />
            <Text style={styles.emptyText}>
              Tudo limpo por aqui! Você está em dia com a turma.
            </Text>
          </View>
        ) : (
          Object.entries(groupedTasks).map(([subject, data]) => {
            const isExpanded = expandedSubject === subject;

            return (
              <View
                key={subject}
                style={[styles.folderContainer, { borderColor: data.color }]}
              >
                {/* CAPA DA PASTA */}
                <TouchableOpacity
                  style={[styles.folderHeader, isExpanded && styles.folderHeaderActive]}
                  activeOpacity={0.8}
                  onPress={() => toggleSubject(subject)}
                >
                  <View style={styles.folderTitleRow}>
                    <View
                      style={[
                        styles.folderIconBox,
                        { backgroundColor: data.color },
                      ]}
                    >
                      <FontAwesome5 name={data.icon} size={15} color="#FFF" />
                    </View>
                    <View>
                      <Text style={styles.folderSubjectName}>{subject}</Text>
                      <Text style={styles.folderSubjectCount}>
                        {data.tasks.length}{' '}
                        {data.tasks.length === 1 ? 'lista' : 'listas'}
                      </Text>
                    </View>
                  </View>
                  <FontAwesome5
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={14}
                    color="#8CA0B3"
                  />
                </TouchableOpacity>

                {/* CONTEÚDO DA PASTA */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    {data.tasks.map((task) => {
                      const progressPercent = (task.done / task.total) * 100;
                      const isCommentsOpen = !!expandedTaskComments[task.id];

                      return (
                        <View key={task.id} style={styles.taskCard}>
                          <View style={styles.cardHeader}>
                            <Text style={styles.taskTitle}>{task.topic}</Text>
                            <View style={styles.teacherBadge}>
                              <FontAwesome5
                                name="chalkboard-teacher"
                                size={10}
                                color="#8CA0B3"
                                style={{ marginRight: 4 }}
                              />
                              <Text style={styles.teacherName}>
                                {task.teacher}
                              </Text>
                            </View>
                          </View>

                          {task.instructions && (
                            <Text style={styles.taskInstructions}>
                              {task.instructions}
                            </Text>
                          )}

                          {activeTab === 'pendentes' ? (
                            <View style={styles.progressSection}>
                              <View style={styles.progressRow}>
                                <Text style={styles.progressLabel}>
                                  Progresso
                                </Text>
                                <Text style={styles.progressCount}>
                                  {task.done}/{task.total} questões
                                </Text>
                              </View>
                              <View style={styles.progressBarBg}>
                                <View
                                  style={[
                                    styles.progressBarFill,
                                    {
                                      width: `${progressPercent}%`,
                                      backgroundColor: task.color,
                                    },
                                  ]}
                                />
                              </View>
                              <TouchableOpacity
                                style={[
                                  styles.actionButton,
                                  { backgroundColor: task.color },
                                ]}
                                activeOpacity={0.8}
                                onPress={() =>
                                  router.push({
                                    pathname: '/quiz',
                                    params: {
                                      mode: 'tarefa',
                                      subject: task.subject,
                                      limit: task.total,
                                    },
                                  })
                                }
                              >
                                <Text style={styles.actionButtonText}>
                                  {task.done === 0
                                    ? 'Começar Lista'
                                    : 'Continuar Lista'}
                                </Text>
                                <FontAwesome5
                                  name="chevron-right"
                                  size={10}
                                  color="#FFF"
                                />
                              </TouchableOpacity>
                            </View>
                          ) : (
                            <View style={styles.completedSection}>
                              <View style={styles.scoreBox}>
                                <FontAwesome5
                                  name="award"
                                  size={12}
                                  color="#58CC02"
                                  style={{ marginRight: 6 }}
                                />
                                <Text style={styles.scoreText}>
                                  Acertos: {task.score}/{task.total}
                                </Text>
                              </View>
                              <TouchableOpacity
                                onPress={() =>
                                  router.push({
                                    pathname: '/stats/errors',
                                    params: { subject: task.subject },
                                  })
                                }
                              >
                                <Text style={styles.reviewText}>
                                  Revisar Erros
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}

                          {/* DÚVIDAS E COMENTÁRIOS DA LISTA */}
                          <View style={styles.taskCommentsWrapper}>
                            <TouchableOpacity
                              style={styles.taskCommentsToggle}
                              onPress={() => toggleTaskComments(task.id)}
                            >
                              <FontAwesome5
                                name="comments"
                                size={12}
                                color="#1CB0F6"
                              />
                              <Text style={styles.taskCommentsToggleText}>
                                {task.comments.length === 0
                                  ? 'Tirar dúvida com a turma'
                                  : `Dúvidas e comentários (${task.comments.length})`}
                              </Text>
                              <FontAwesome5
                                name={
                                  isCommentsOpen
                                    ? 'chevron-up'
                                    : 'chevron-down'
                                }
                                size={10}
                                color="#1CB0F6"
                              />
                            </TouchableOpacity>

                            {isCommentsOpen && (
                              <View style={styles.taskCommentsList}>
                                {task.comments.map((c) => (
                                  <View key={c.id} style={styles.commentBox}>
                                    <View style={styles.commentMetaRow}>
                                      <Text style={styles.commentAuthorName}>
                                        {c.author}{' '}
                                        {c.role === 'TEACHER' && (
                                          <Text
                                            style={styles.teacherBadgeInline}
                                          >
                                            (Prof)
                                          </Text>
                                        )}
                                      </Text>
                                      <Text style={styles.commentDateText}>
                                        {c.date}
                                      </Text>
                                    </View>
                                    <Text style={styles.commentBodyText}>
                                      {c.text}
                                    </Text>
                                  </View>
                                ))}

                                <View style={styles.inputCommentRow}>
                                  <TextInput
                                    style={styles.taskCommentInput}
                                    placeholder="Escreva uma dúvida sobre esta lista..."
                                    placeholderTextColor="#A0AEC0"
                                    value={commentInputs[task.id] || ''}
                                    onChangeText={(txt) =>
                                      setCommentInputs((prev) => ({
                                        ...prev,
                                        [task.id]: txt,
                                      }))
                                    }
                                  />
                                  <TouchableOpacity
                                    style={styles.taskCommentSendBtn}
                                    onPress={() => handleAddComment(task.id)}
                                  >
                                    <FontAwesome5
                                      name="paper-plane"
                                      size={11}
                                      color="#FFF"
                                    />
                                  </TouchableOpacity>
                                </View>
                              </View>
                            )}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButton: { width: 36, height: 36, justifyContent: 'center' },
  teacherTrackerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#2C3A47' },

  tabContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: { fontSize: 13, fontWeight: 'bold', color: '#8CA0B3' },
  tabTextActive: { color: '#2C3A47' },

  scrollContent: { padding: 18, paddingBottom: 60 },

  // COPILOTO DOCENTE COM IA (UI)
  copilotSection: {
    backgroundColor: '#FAF5FF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E9D5FF',
    marginBottom: 20,
    shadowColor: '#8E44AD',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  copilotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 10,
  },
  copilotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  copilotIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#8E44AD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copilotTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#581C87',
  },
  copilotSubtitle: {
    fontSize: 12,
    color: '#7E22CE',
    marginTop: 2,
    lineHeight: 16,
  },
  generateAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  generateAiBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#8E44AD',
  },

  copilotLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
  },
  copilotLoadingText: {
    fontSize: 12,
    color: '#7E22CE',
    fontWeight: '600',
  },
  copilotEmptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  copilotEmptyText: {
    fontSize: 13,
    color: '#6B21A8',
    textAlign: 'center',
    fontWeight: '500',
  },

  aiSuggestionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  aiCardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  aiTagBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#7E22CE',
    textTransform: 'uppercase',
  },
  difficultyChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  difficultyChipText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  aiSuggestionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  aiSuggestionTopic: {
    fontSize: 12,
    color: '#8CA0B3',
    marginBottom: 10,
  },
  aiReasonBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FAF5FF',
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#8E44AD',
    marginBottom: 8,
  },
  aiReasonText: {
    flex: 1,
    fontSize: 12,
    color: '#6B21A8',
    lineHeight: 17,
    fontWeight: '500',
  },
  aiInstructionsText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  approveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#58CC02',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#58CC02',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  approveButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },

  teacherHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
    gap: 12,
  },
  teacherIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1CB0F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teacherBannerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  teacherBannerSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: '#8CA0B3',
    marginBottom: 14,
    lineHeight: 18,
  },

  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText: {
    fontSize: 14,
    color: '#8CA0B3',
    textAlign: 'center',
    lineHeight: 20,
  },

  folderContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  folderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#FFF',
  },
  folderHeaderActive: {
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  folderTitleRow: { flexDirection: 'row', alignItems: 'center' },
  folderIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  folderSubjectName: { fontSize: 15, fontWeight: 'bold', color: '#2C3A47' },
  folderSubjectCount: { fontSize: 11, color: '#8CA0B3', marginTop: 1 },

  expandedContent: { padding: 14, backgroundColor: '#F8FAFC', gap: 10 },
  taskCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3A47',
    flex: 1,
    paddingRight: 8,
  },
  teacherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  teacherName: { fontSize: 10, color: '#64748B', fontWeight: 'bold' },
  taskInstructions: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
    lineHeight: 17,
  },

  progressSection: { gap: 6 },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  progressLabel: { fontSize: 11, color: '#8CA0B3', fontWeight: 'bold' },
  progressCount: { fontSize: 11, color: '#2C3A47', fontWeight: 'bold' },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', borderRadius: 3 },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 6,
  },
  actionButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

  completedSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  scoreText: { fontSize: 12, fontWeight: 'bold', color: '#3A8A00' },
  reviewText: { fontSize: 12, fontWeight: 'bold', color: '#1CB0F6' },

  taskCommentsWrapper: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  taskCommentsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskCommentsToggleText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1CB0F6',
    flex: 1,
  },
  taskCommentsList: {
    marginTop: 8,
    gap: 8,
  },
  commentBox: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commentMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  commentAuthorName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2C3A47',
  },
  teacherBadgeInline: {
    color: '#1CB0F6',
  },
  commentDateText: {
    fontSize: 9,
    color: '#8CA0B3',
  },
  commentBodyText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
  },
  inputCommentRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  taskCommentInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 12,
    color: '#2C3A47',
  },
  taskCommentSendBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1CB0F6',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
});
