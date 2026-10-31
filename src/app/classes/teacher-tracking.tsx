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
import {
  TeacherAssignment,
  TeacherMaterial,
  INITIAL_TEACHER_ASSIGNMENTS,
  INITIAL_TEACHER_MATERIALS,
} from '@/constants/teacherTrackData';
import { useUserStore } from '@/store/useUserStore';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function TeacherTrackingScreen() {
  const router = useRouter();
  const { classId } = useLocalSearchParams<{ classId?: string }>();
  const user = useUserStore((state) => state.user);

  const [activeTab, setActiveTab] = useState<'exercicios' | 'materiais'>('exercicios');
  const [selectedSubject, setSelectedSubject] = useState<string>('TODAS');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Estados de dados
  const [assignments, setAssignments] = useState<TeacherAssignment[]>(INITIAL_TEACHER_ASSIGNMENTS);
  const [materials, setMaterials] = useState<TeacherMaterial[]>(INITIAL_TEACHER_MATERIALS);

  // Estados para comentários
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Estados para Modal de Confirmação (Pop-confirm)
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmColor?: string;
    icon?: string;
    action: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    action: () => {},
  });

  // Filtra por disciplina
  const subjectsList = useMemo(() => {
    const list = new Set<string>();
    assignments.forEach((a) => list.add(a.subject));
    materials.forEach((m) => list.add(m.subject));
    return ['TODAS', ...Array.from(list)];
  }, [assignments, materials]);

  const filteredAssignments = useMemo(() => {
    let list = assignments;
    if (classId) {
      list = list.filter((a) => a.classId === classId || !a.classId);
    }
    if (selectedSubject !== 'TODAS') {
      list = list.filter((a) => a.subject === selectedSubject);
    }
    return list;
  }, [assignments, classId, selectedSubject]);

  const filteredMaterials = useMemo(() => {
    let list = materials;
    if (classId) {
      list = list.filter((m) => m.classId === classId || !m.classId);
    }
    if (selectedSubject !== 'TODAS') {
      list = list.filter((m) => m.subject === selectedSubject);
    }
    return list;
  }, [materials, classId, selectedSubject]);

  const toggleExpand = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItemId((prev) => (prev === id ? null : id));
  };

  const handleAddComment = (itemId: string, isAssignment: boolean) => {
    const text = (commentInputs[itemId] || '').trim();
    if (!text) return;

    const newComment = {
      id: `comm_${Date.now()}`,
      author: user?.name || (user?.role === 'TEACHER' ? 'Professor' : 'Aluno'),
      role: (user?.role as 'STUDENT' | 'TEACHER') || 'TEACHER',
      date: 'Agora mesmo',
      text,
    };

    if (isAssignment) {
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === itemId
            ? { ...a, comments: [...a.comments, newComment] }
            : a
        )
      );
    } else {
      setMaterials((prev) =>
        prev.map((m) =>
          m.id === itemId
            ? { ...m, comments: [...m.comments, newComment] }
            : m
        )
      );
    }

    setCommentInputs((prev) => ({ ...prev, [itemId]: '' }));
  };

  // Pop-confirm para excluir lista ou material
  const requestDeleteAssignment = (item: TeacherAssignment) => {
    setConfirmModal({
      visible: true,
      title: 'Excluir Lista de Exercícios',
      message: `Deseja remover "${item.title}"? O histórico de entregas dos alunos nesta lista será apagado.`,
      confirmText: 'Excluir Lista',
      confirmColor: '#FF4B4B',
      icon: 'trash-alt',
      action: () => {
        setAssignments((prev) => prev.filter((a) => a.id !== item.id));
        setConfirmModal((prev) => ({ ...prev, visible: false }));
      },
    });
  };

  const requestDeleteMaterial = (item: TeacherMaterial) => {
    setConfirmModal({
      visible: true,
      title: 'Excluir Material Didático',
      message: `Deseja remover "${item.title}"? O arquivo e os comentários ficarão indisponíveis.`,
      confirmText: 'Excluir Material',
      confirmColor: '#FF4B4B',
      icon: 'trash-alt',
      action: () => {
        setMaterials((prev) => prev.filter((m) => m.id !== item.id));
        setConfirmModal((prev) => ({ ...prev, visible: false }));
      },
    });
  };

  // Pop-confirm para sair da tela caso queira confirmação
  const requestExit = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={requestExit} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={18} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.title}>Painel do Professor</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageSubtitle}>
          Acompanhe o rendimento da turma nas listas entregues, taxa de envio e interação nos materiais didáticos.
        </Text>

        {/* Abas Superiores: Exercícios vs Materiais */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'exercicios' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('exercicios');
              setExpandedItemId(null);
            }}
          >
            <FontAwesome5
              name="tasks"
              size={13}
              color={activeTab === 'exercicios' ? '#1CB0F6' : '#8CA0B3'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[styles.tabText, activeTab === 'exercicios' && styles.tabTextActive]}
            >
              Listas de Exercícios ({assignments.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'materiais' && styles.tabButtonActive]}
            onPress={() => {
              setActiveTab('materiais');
              setExpandedItemId(null);
            }}
          >
            <FontAwesome5
              name="folder-open"
              size={13}
              color={activeTab === 'materiais' ? '#1CB0F6' : '#8CA0B3'}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[styles.tabText, activeTab === 'materiais' && styles.tabTextActive]}
            >
              Materiais Passados ({materials.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Filtro Rápido de Disciplinas */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {subjectsList.map((sub) => {
            const isSelected = selectedSubject === sub;
            return (
              <TouchableOpacity
                key={sub}
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedSubject(sub)}
              >
                <Text
                  style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}
                >
                  {sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ========================================== */}
        {/* CONTEÚDO 1: LISTAS DE EXERCÍCIOS           */}
        {/* ========================================== */}
        {activeTab === 'exercicios' && (
          <View style={styles.itemsList}>
            {filteredAssignments.length === 0 ? (
              <View style={styles.emptyCard}>
                <FontAwesome5 name="check-circle" size={40} color="#E2E8F0" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyText}>Nenhuma lista encontrada para este filtro.</Text>
              </View>
            ) : (
              filteredAssignments.map((assignment) => {
                const isExpanded = expandedItemId === assignment.id;
                const submissionRate = Math.round(
                  (assignment.submittedCount / assignment.totalStudents) * 100
                );

                return (
                  <View
                    key={assignment.id}
                    style={[styles.itemCard, { borderLeftColor: assignment.color }]}
                  >
                    {/* Cabeçalho do Card */}
                    <TouchableOpacity
                      style={styles.itemHeader}
                      activeOpacity={0.8}
                      onPress={() => toggleExpand(assignment.id)}
                    >
                      <View style={styles.itemHeaderLeft}>
                        <View
                          style={[
                            styles.itemIconCircle,
                            { backgroundColor: `${assignment.color}20` },
                          ]}
                        >
                          <FontAwesome5
                            name={assignment.icon}
                            size={16}
                            color={assignment.color}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.badgeRow}>
                            <Text style={[styles.subjectTag, { color: assignment.color }]}>
                              {assignment.subject}
                            </Text>
                            <Text style={styles.topicTag}>• {assignment.topic}</Text>
                          </View>
                          <Text style={styles.itemTitle}>{assignment.title}</Text>
                        </View>
                      </View>

                      <FontAwesome5
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={14}
                        color="#8CA0B3"
                        style={{ marginLeft: 8 }}
                      />
                    </TouchableOpacity>

                    {/* Barra de Progresso de Entregas */}
                    <View style={styles.progressContainer}>
                      <View style={styles.progressHeaderRow}>
                        <Text style={styles.progressLabel}>
                          Taxa de Entregas da Turma
                        </Text>
                        <Text style={styles.progressValue}>
                          {assignment.submittedCount}/{assignment.totalStudents} ({submissionRate}%)
                        </Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${submissionRate}%`, backgroundColor: assignment.color },
                          ]}
                        />
                      </View>
                    </View>

                    {/* Métricas Rápidas */}
                    <View style={styles.metricsRow}>
                      <View style={styles.metricItem}>
                        <Text style={styles.metricValue}>{assignment.submittedCount}</Text>
                        <Text style={styles.metricLabel}>Entregaram</Text>
                      </View>
                      <View style={styles.metricDivider} />
                      <View style={styles.metricItem}>
                        <Text style={styles.metricValue}>{assignment.gradedCount}</Text>
                        <Text style={styles.metricLabel}>Corrigidos</Text>
                      </View>
                      <View style={styles.metricDivider} />
                      <View style={styles.metricItem}>
                        <Text style={[styles.metricValue, { color: '#58CC02' }]}>
                          {assignment.averageScore}
                        </Text>
                        <Text style={styles.metricLabel}>Média Geral</Text>
                      </View>
                    </View>

                    {/* CONTEÚDO EXPANDIDO: Detalhes, Submissões e Comentários estilo Google Classroom */}
                    {isExpanded && (
                      <View style={styles.expandedArea}>
                        {/* Instruções */}
                        <View style={styles.instructionBox}>
                          <Text style={styles.instructionTitle}>Instruções aos Alunos:</Text>
                          <Text style={styles.instructionText}>{assignment.instructions}</Text>
                        </View>

                        {/* Tabela / Relação de Alunos */}
                        <Text style={styles.subSectionTitle}>
                          Entregas Individuais dos Alunos
                        </Text>
                        <View style={styles.submissionsCard}>
                          {assignment.submissions.map((sub, idx) => (
                            <View key={idx} style={styles.submissionRow}>
                              <View style={styles.studentAvatar}>
                                <Text style={styles.studentAvatarText}>
                                  {sub.studentName.charAt(0)}
                                </Text>
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.studentNameText}>{sub.studentName}</Text>
                                <Text style={styles.studentSubTime}>
                                  {sub.submittedAt !== '-' ? `Entregue: ${sub.submittedAt} (${sub.timeSpent})` : 'Ainda não entregou'}
                                </Text>
                              </View>
                              <View style={styles.statusBadge}>
                                <Text
                                  style={[
                                    styles.statusText,
                                    sub.status === 'CORRIGIDO' && styles.statusCorrect,
                                    sub.status === 'ENTREGUE' && styles.statusDelivered,
                                    sub.status === 'PENDENTE' && styles.statusPending,
                                  ]}
                                >
                                  {sub.status === 'CORRIGIDO' ? `Nota: ${sub.score}` : sub.status}
                                </Text>
                              </View>
                            </View>
                          ))}
                        </View>

                        {/* COMENTÁRIOS DA ATIVIDADE (Estilo Classroom) */}
                        <Text style={styles.subSectionTitle}>
                          Comentários da Atividade ({assignment.comments.length})
                        </Text>
                        <View style={styles.commentsCard}>
                          {assignment.comments.length === 0 ? (
                            <Text style={styles.noCommentsText}>
                              Nenhum comentário nesta atividade ainda. Alunos e professores podem tirar dúvidas aqui.
                            </Text>
                          ) : (
                            assignment.comments.map((comment) => (
                              <View key={comment.id} style={styles.commentItem}>
                                <View style={styles.commentHeader}>
                                  <View style={styles.commentAvatar}>
                                    <FontAwesome5
                                      name={comment.role === 'TEACHER' ? 'chalkboard-teacher' : 'user'}
                                      size={11}
                                      color="#FFF"
                                    />
                                  </View>
                                  <Text style={styles.commentAuthor}>
                                    {comment.author}{' '}
                                    {comment.role === 'TEACHER' && (
                                      <Text style={styles.teacherTag}>(Professor)</Text>
                                    )}
                                  </Text>
                                  <Text style={styles.commentDate}>{comment.date}</Text>
                                </View>
                                <Text style={styles.commentBody}>{comment.text}</Text>
                              </View>
                            ))
                          )}

                          {/* Campo de Entrada de Comentário */}
                          <View style={styles.commentInputRow}>
                            <TextInput
                              style={styles.commentInput}
                              placeholder="Adicionar comentário à atividade..."
                              placeholderTextColor="#A0AEC0"
                              value={commentInputs[assignment.id] || ''}
                              onChangeText={(txt) =>
                                setCommentInputs((prev) => ({ ...prev, [assignment.id]: txt }))
                              }
                            />
                            <TouchableOpacity
                              style={styles.sendCommentBtn}
                              onPress={() => handleAddComment(assignment.id, true)}
                            >
                              <FontAwesome5 name="paper-plane" size={12} color="#FFF" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Ações do Professor */}
                        <View style={styles.cardActionsRow}>
                          <TouchableOpacity
                            style={styles.deleteActionBtn}
                            onPress={() => requestDeleteAssignment(assignment)}
                          >
                            <FontAwesome5 name="trash-alt" size={12} color="#FF4B4B" />
                            <Text style={styles.deleteActionText}>Excluir Lista</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ========================================== */}
        {/* CONTEÚDO 2: MATERIAIS PASSADOS             */}
        {/* ========================================== */}
        {activeTab === 'materiais' && (
          <View style={styles.itemsList}>
            {filteredMaterials.length === 0 ? (
              <View style={styles.emptyCard}>
                <FontAwesome5 name="folder-open" size={40} color="#E2E8F0" style={{ marginBottom: 12 }} />
                <Text style={styles.emptyText}>Nenhum material didático encontrado.</Text>
              </View>
            ) : (
              filteredMaterials.map((material) => {
                const isExpanded = expandedItemId === material.id;

                return (
                  <View
                    key={material.id}
                    style={[styles.itemCard, { borderLeftColor: material.color }]}
                  >
                    <TouchableOpacity
                      style={styles.itemHeader}
                      activeOpacity={0.8}
                      onPress={() => toggleExpand(material.id)}
                    >
                      <View style={styles.itemHeaderLeft}>
                        <View
                          style={[
                            styles.itemIconCircle,
                            { backgroundColor: `${material.color}20` },
                          ]}
                        >
                          <FontAwesome5
                            name={material.icon}
                            size={16}
                            color={material.color}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={styles.badgeRow}>
                            <Text style={[styles.subjectTag, { color: material.color }]}>
                              {material.subject}
                            </Text>
                            <Text style={styles.topicTag}>• {material.topic}</Text>
                          </View>
                          <Text style={styles.itemTitle}>{material.title}</Text>
                        </View>
                      </View>

                      <FontAwesome5
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={14}
                        color="#8CA0B3"
                        style={{ marginLeft: 8 }}
                      />
                    </TouchableOpacity>

                    {/* Estatísticas de Acesso ao Material */}
                    <View style={styles.materialMetricsRow}>
                      <View style={styles.matMetric}>
                        <FontAwesome5 name="eye" size={12} color="#8CA0B3" />
                        <Text style={styles.matMetricText}>{material.viewsCount} visualizações</Text>
                      </View>
                      <View style={styles.matMetric}>
                        <FontAwesome5 name="download" size={12} color="#8CA0B3" />
                        <Text style={styles.matMetricText}>{material.downloadsCount} downloads</Text>
                      </View>
                      <View style={styles.matMetric}>
                        <FontAwesome5 name="comments" size={12} color="#8CA0B3" />
                        <Text style={styles.matMetricText}>{material.comments.length} comentários</Text>
                      </View>
                    </View>

                    {/* EXPANDIDO: Descrição e Comentários */}
                    {isExpanded && (
                      <View style={styles.expandedArea}>
                        <View style={styles.instructionBox}>
                          <Text style={styles.instructionTitle}>Descrição do Conteúdo:</Text>
                          <Text style={styles.instructionText}>{material.description}</Text>
                        </View>

                        {/* COMENTÁRIOS DO MATERIAL (Estilo Classroom) */}
                        <Text style={styles.subSectionTitle}>
                          Comentários e Dúvidas ({material.comments.length})
                        </Text>
                        <View style={styles.commentsCard}>
                          {material.comments.length === 0 ? (
                            <Text style={styles.noCommentsText}>
                              Nenhum comentário sobre este material ainda.
                            </Text>
                          ) : (
                            material.comments.map((comment) => (
                              <View key={comment.id} style={styles.commentItem}>
                                <View style={styles.commentHeader}>
                                  <View style={styles.commentAvatar}>
                                    <FontAwesome5
                                      name={comment.role === 'TEACHER' ? 'chalkboard-teacher' : 'user'}
                                      size={11}
                                      color="#FFF"
                                    />
                                  </View>
                                  <Text style={styles.commentAuthor}>
                                    {comment.author}{' '}
                                    {comment.role === 'TEACHER' && (
                                      <Text style={styles.teacherTag}>(Professor)</Text>
                                    )}
                                  </Text>
                                  <Text style={styles.commentDate}>{comment.date}</Text>
                                </View>
                                <Text style={styles.commentBody}>{comment.text}</Text>
                              </View>
                            ))
                          )}

                          <View style={styles.commentInputRow}>
                            <TextInput
                              style={styles.commentInput}
                              placeholder="Fazer um comentário ou pergunta..."
                              placeholderTextColor="#A0AEC0"
                              value={commentInputs[material.id] || ''}
                              onChangeText={(txt) =>
                                setCommentInputs((prev) => ({ ...prev, [material.id]: txt }))
                              }
                            />
                            <TouchableOpacity
                              style={styles.sendCommentBtn}
                              onPress={() => handleAddComment(material.id, false)}
                            >
                              <FontAwesome5 name="paper-plane" size={12} color="#FFF" />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <View style={styles.cardActionsRow}>
                          <TouchableOpacity
                            style={styles.deleteActionBtn}
                            onPress={() => requestDeleteMaterial(material)}
                          >
                            <FontAwesome5 name="trash-alt" size={12} color="#FF4B4B" />
                            <Text style={styles.deleteActionText}>Excluir Material</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* POP-CONFIRM GLOBAL */}
      <ConfirmModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        confirmColor={confirmModal.confirmColor}
        icon={confirmModal.icon}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
      />
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
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#2C3A47' },
  scrollContent: { padding: 18, paddingBottom: 60 },
  pageSubtitle: { fontSize: 13, color: '#8CA0B3', marginBottom: 16, lineHeight: 18 },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8CA0B3',
  },
  tabTextActive: {
    color: '#2C3A47',
  },

  filterScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#1CB0F6',
    borderColor: '#1CB0F6',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8CA0B3',
  },
  filterChipTextActive: {
    color: '#FFF',
  },

  itemsList: { gap: 14 },
  emptyCard: {
    backgroundColor: '#FFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyText: {
    fontSize: 14,
    color: '#8CA0B3',
    textAlign: 'center',
  },

  itemCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemHeaderLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  itemIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  subjectTag: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  topicTag: {
    fontSize: 11,
    color: '#8CA0B3',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C3A47',
    lineHeight: 20,
  },

  progressContainer: {
    marginBottom: 12,
  },
  progressHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: '#8CA0B3',
    fontWeight: 'bold',
  },
  progressValue: {
    fontSize: 11,
    color: '#2C3A47',
    fontWeight: 'bold',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  metricsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  metricItem: { alignItems: 'center' },
  metricValue: { fontSize: 15, fontWeight: 'bold', color: '#2C3A47' },
  metricLabel: { fontSize: 10, color: '#8CA0B3', marginTop: 2 },
  metricDivider: { width: 1, height: 20, backgroundColor: '#E2E8F0' },

  materialMetricsRow: {
    flexDirection: 'row',
    gap: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  matMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  matMetricText: {
    fontSize: 11,
    color: '#8CA0B3',
    fontWeight: '600',
  },

  // Conteúdo Expandido
  expandedArea: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },
  instructionBox: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  instructionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3A47',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2C3A47',
    marginTop: 4,
  },
  submissionsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  submissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 10,
  },
  studentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1CB0F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentAvatarText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  studentNameText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2C3A47',
  },
  studentSubTime: {
    fontSize: 11,
    color: '#8CA0B3',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusCorrect: {
    color: '#58CC02',
  },
  statusDelivered: {
    color: '#1CB0F6',
  },
  statusPending: {
    color: '#FF9600',
  },

  // Comentários (Estilo Google Classroom)
  commentsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  noCommentsText: {
    fontSize: 12,
    color: '#8CA0B3',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 6,
  },
  commentItem: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  commentAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1CB0F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3A47',
    flex: 1,
  },
  teacherTag: {
    color: '#58CC02',
    fontWeight: 'bold',
  },
  commentDate: {
    fontSize: 10,
    color: '#8CA0B3',
  },
  commentBody: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 18,
  },
  commentInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#2C3A47',
  },
  sendCommentBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#1CB0F6',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },

  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  deleteActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  deleteActionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF4B4B',
  },
});

