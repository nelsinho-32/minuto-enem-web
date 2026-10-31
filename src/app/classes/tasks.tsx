import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useUserStore } from '@/store/useUserStore';

type TaskComment = {
  id: string;
  author: string;
  role: 'STUDENT' | 'TEACHER';
  date: string;
  text: string;
};

type Task = {
  id: string;
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
};

const TASKS_DB: { pending: Task[]; completed: Task[] } = {
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

export default function TasksScreen() {
  const router = useRouter();
  const { subject: filterSubject, className } = useLocalSearchParams<{
    subject?: string;
    classId?: string;
    className?: string;
  }>();
  const user = useUserStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<'pendentes' | 'feitas'>('pendentes');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(filterSubject || 'Física');
  const [tasksState, setTasksState] = useState(TASKS_DB);
  const [expandedTaskComments, setExpandedTaskComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

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

    setTasksState((prev) => {
      const updateList = (list: Task[]) =>
        list.map((t) =>
          t.id === taskId ? { ...t, comments: [...t.comments, newComment] } : t
        );
      return {
        pending: updateList(prev.pending),
        completed: updateList(prev.completed),
      };
    });

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
            <Text style={{ fontSize: 11, color: '#8CA0B3', marginTop: 2 }}>{className}</Text>
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
              style={[styles.tabText, activeTab === 'pendentes' && styles.tabTextActive]}
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
              style={[styles.tabText, activeTab === 'feitas' && styles.tabTextActive]}
            >
              Feitas ({tasksState.completed.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. CONTEÚDO */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
            ? 'Organizamos suas listas pendentes por matéria com espaço para dúvidas.'
            : 'Histórico de listas que você já entregou aos professores.'}
        </Text>

        {Object.keys(groupedTasks).length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="glass-cheers" size={44} color="#E2E8F0" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>Tudo limpo por aqui! Você está em dia com a turma.</Text>
          </View>
        ) : (
          Object.entries(groupedTasks).map(([subject, data]) => {
            const isExpanded = expandedSubject === subject;

            return (
              <View key={subject} style={[styles.folderContainer, { borderColor: data.color }]}>
                {/* CAPA DA PASTA */}
                <TouchableOpacity
                  style={[styles.folderHeader, isExpanded && styles.folderHeaderActive]}
                  activeOpacity={0.8}
                  onPress={() => toggleSubject(subject)}
                >
                  <View style={styles.folderTitleRow}>
                    <View style={[styles.folderIconBox, { backgroundColor: data.color }]}>
                      <FontAwesome5 name={data.icon} size={15} color="#FFF" />
                    </View>
                    <View>
                      <Text style={styles.folderSubjectName}>{subject}</Text>
                      <Text style={styles.folderSubjectCount}>
                        {data.tasks.length} {data.tasks.length === 1 ? 'lista' : 'listas'}
                      </Text>
                    </View>
                  </View>
                  <FontAwesome5 name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} color="#8CA0B3" />
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
                              <Text style={styles.teacherText}>{task.teacher}</Text>
                            </View>
                          </View>

                          {task.instructions && (
                            <Text style={styles.taskInstructions}>{task.instructions}</Text>
                          )}

                          {activeTab === 'pendentes' ? (
                            <View style={styles.progressSection}>
                              <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>Progresso</Text>
                                <Text style={styles.progressValue}>
                                  {task.done}/{task.total} concl.
                                </Text>
                              </View>
                              <View style={styles.progressBarBg}>
                                <View
                                  style={[
                                    styles.progressBarFill,
                                    { width: `${progressPercent}%`, backgroundColor: task.color },
                                  ]}
                                />
                              </View>

                              <View style={styles.actionRow}>
                                <TouchableOpacity
                                  style={[styles.actionButton, { backgroundColor: task.color }]}
                                  onPress={() => router.push('/quiz' as any)}
                                >
                                  <Text style={styles.actionButtonText}>
                                    {task.done === 0 ? 'Começar' : 'Continuar'}
                                  </Text>
                                  <FontAwesome5 name="arrow-right" size={11} color="#FFF" />
                                </TouchableOpacity>
                              </View>
                            </View>
                          ) : (
                            <View style={styles.completedSection}>
                              <View style={styles.scoreBox}>
                                <FontAwesome5
                                  name="bullseye"
                                  size={13}
                                  color="#58CC02"
                                  style={{ marginRight: 6 }}
                                />
                                <Text style={styles.scoreText}>
                                  Acertos: {task.score}/{task.total}
                                </Text>
                              </View>
                              <TouchableOpacity onPress={() => router.push('/stats/errors')}>
                                <Text style={styles.reviewText}>Revisar Erros</Text>
                              </TouchableOpacity>
                            </View>
                          )}

                          {/* Seção de Dúvidas / Comentários da Tarefa (Google Classroom) */}
                          <View style={styles.taskCommentsWrapper}>
                            <TouchableOpacity
                              style={styles.taskCommentsToggle}
                              onPress={() => toggleTaskComments(task.id)}
                            >
                              <FontAwesome5 name="comment-dots" size={12} color="#1CB0F6" />
                              <Text style={styles.taskCommentsToggleText}>
                                {task.comments.length}{' '}
                                {task.comments.length === 1 ? 'dúvida/comentário' : 'dúvidas/comentários'}
                              </Text>
                              <FontAwesome5
                                name={isCommentsOpen ? 'chevron-up' : 'chevron-down'}
                                size={10}
                                color="#8CA0B3"
                              />
                            </TouchableOpacity>

                            {isCommentsOpen && (
                              <View style={styles.taskCommentsList}>
                                {task.comments.map((comm) => (
                                  <View key={comm.id} style={styles.commentBox}>
                                    <View style={styles.commentMetaRow}>
                                      <Text style={styles.commentAuthorName}>
                                        {comm.author}{' '}
                                        {comm.role === 'TEACHER' && (
                                          <Text style={styles.teacherBadgeInline}>(Professor)</Text>
                                        )}
                                      </Text>
                                      <Text style={styles.commentDateText}>{comm.date}</Text>
                                    </View>
                                    <Text style={styles.commentBodyText}>{comm.text}</Text>
                                  </View>
                                ))}

                                <View style={styles.inputCommentRow}>
                                  <TextInput
                                    style={styles.taskCommentInput}
                                    placeholder="Tirar dúvida sobre esta lista..."
                                    placeholderTextColor="#A0AEC0"
                                    value={commentInputs[task.id] || ''}
                                    onChangeText={(txt) =>
                                      setCommentInputs((prev) => ({ ...prev, [task.id]: txt }))
                                    }
                                  />
                                  <TouchableOpacity
                                    style={styles.taskCommentSendBtn}
                                    onPress={() => handleAddComment(task.id)}
                                  >
                                    <FontAwesome5 name="paper-plane" size={11} color="#FFF" />
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
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  backButton: { width: 38, height: 38, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#2C3A47' },
  teacherTrackerBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },

  tabContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBackground: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4 },
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { fontSize: 13, fontWeight: 'bold', color: '#8CA0B3' },
  tabTextActive: { color: '#2C3A47' },

  scrollContent: { padding: 18, paddingBottom: 60 },
  sectionSubtitle: { fontSize: 13, color: '#8CA0B3', marginBottom: 16, fontStyle: 'italic' },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText: { fontSize: 14, color: '#8CA0B3', textAlign: 'center', marginTop: 10 },

  teacherHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    gap: 10,
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
    color: '#0284C7',
  },
  teacherBannerSub: {
    fontSize: 11,
    color: '#4B5563',
    lineHeight: 15,
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
  folderHeaderActive: { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  folderTitleRow: { flexDirection: 'row', alignItems: 'center' },
  folderIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  folderSubjectName: { fontSize: 15, fontWeight: 'bold', color: '#2C3A47' },
  folderSubjectCount: { fontSize: 12, color: '#8CA0B3', marginTop: 2 },

  expandedContent: { padding: 14, backgroundColor: '#F7F9FC', gap: 12 },

  taskCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: { flexDirection: 'column', alignItems: 'flex-start', marginBottom: 8 },
  taskTitle: { fontSize: 15, fontWeight: 'bold', color: '#2C3A47', marginBottom: 4 },
  teacherBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  teacherText: { fontSize: 11, color: '#8CA0B3', fontWeight: 'bold' },
  taskInstructions: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 17,
    marginBottom: 10,
  },

  progressSection: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 10 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 11, color: '#8CA0B3', fontWeight: 'bold' },
  progressValue: { fontSize: 11, color: '#2C3A47', fontWeight: 'bold' },
  progressBarBg: { width: '100%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, marginBottom: 12 },
  progressBarFill: { height: '100%', borderRadius: 3 },

  actionRow: { alignItems: 'flex-end' },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 6,
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
