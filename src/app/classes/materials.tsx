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

type MaterialComment = {
  id: string;
  author: string;
  role: 'STUDENT' | 'TEACHER';
  date: string;
  text: string;
};

type Material = {
  id: string;
  subject: string;
  topic: string;
  teacher: string;
  type: 'pdf' | 'video' | 'link' | 'tip';
  title: string;
  description: string;
  color: string;
  folderIcon: string;
  hasRelatedTask?: boolean;
  comments: MaterialComment[];
};

const MATERIALS_DB: Material[] = [
  {
    id: 'm1',
    subject: 'Física',
    topic: 'Cinemática Escalar',
    teacher: 'Prof. Carlos',
    type: 'pdf',
    title: 'Resumão: Fórmulas de Cinemática',
    description: 'PDF com 2 páginas resumindo MRU e MRUV com gráficos explicativos.',
    color: '#58CC02',
    folderIcon: 'atom',
    hasRelatedTask: true,
    comments: [
      {
        id: 'c1',
        author: 'Beatriz Costa',
        role: 'STUDENT',
        date: 'Ontem',
        text: 'A tabela de fórmulas ficou muito prática!',
      },
    ],
  },
  {
    id: 'm2',
    subject: 'Física',
    topic: 'Leis de Newton',
    teacher: 'Prof. Carlos',
    type: 'video',
    title: 'Videoaula: Aplicação de Forças no Plano Inclinado',
    description: 'Revisão gravada com foco nas questões recorrentes do ENEM.',
    color: '#58CC02',
    folderIcon: 'atom',
    hasRelatedTask: true,
    comments: [],
  },
  {
    id: 'm3',
    subject: 'Matemática',
    topic: 'Geometria Plana',
    teacher: 'Profª. Marta',
    type: 'tip',
    title: 'Macete: Áreas de Triângulos e Fórmula de Herão',
    description: 'Dica rápida para economizar tempo no cálculo sem altura definida.',
    color: '#FF4B4B',
    folderIcon: 'calculator',
    hasRelatedTask: false,
    comments: [
      {
        id: 'c2',
        author: 'Lucas Silva',
        role: 'STUDENT',
        date: 'Hoje 10:00',
        text: 'Essa fórmula de Herão caiu no ENEM 2021!',
      },
    ],
  },
  {
    id: 'm4',
    subject: 'História',
    topic: 'Era Vargas',
    teacher: 'Prof. Sérgio',
    type: 'link',
    title: 'Artigo: O Estado Novo e a Propaganda Política',
    description: 'Leitura complementar com foco na criação do DIP.',
    color: '#F1C40F',
    folderIcon: 'monument',
    hasRelatedTask: false,
    comments: [],
  },
];

export default function MaterialsScreen() {
  const router = useRouter();
  const { subject: filterSubject, className } = useLocalSearchParams<{
    subject?: string;
    classId?: string;
    className?: string;
  }>();
  const user = useUserStore((state) => state.user);

  const [expandedSubject, setExpandedSubject] = useState<string | null>(filterSubject || 'Física');
  const [materialsState, setMaterialsState] = useState(MATERIALS_DB);
  const [expandedMaterialComments, setExpandedMaterialComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  const groupedMaterials = useMemo(() => {
    let mats = materialsState;

    if (filterSubject) {
      mats = mats.filter(
        (m) => m.subject.toLowerCase() === filterSubject.toLowerCase()
      );
    }

    return mats.reduce((acc, mat) => {
      if (!acc[mat.subject]) {
        acc[mat.subject] = { materials: [], color: mat.color, icon: mat.folderIcon };
      }
      acc[mat.subject].materials.push(mat);
      return acc;
    }, {} as Record<string, { materials: Material[]; color: string; icon: string }>);
  }, [materialsState, filterSubject]);

  const toggleSubject = (subject: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSubject((prev) => (prev === subject ? null : subject));
  };

  const toggleMaterialComments = (matId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMaterialComments((prev) => ({ ...prev, [matId]: !prev[matId] }));
  };

  const handleAddComment = (matId: string) => {
    const text = (commentInputs[matId] || '').trim();
    if (!text) return;

    const newComment: MaterialComment = {
      id: `mc_${Date.now()}`,
      author: user?.name || (user?.role === 'TEACHER' ? 'Professor' : 'Aluno'),
      role: (user?.role as 'STUDENT' | 'TEACHER') || 'STUDENT',
      date: 'Agora',
      text,
    };

    setMaterialsState((prev) =>
      prev.map((m) =>
        m.id === matId ? { ...m, comments: [...m.comments, newComment] } : m
      )
    );

    setCommentInputs((prev) => ({ ...prev, [matId]: '' }));
    setExpandedMaterialComments((prev) => ({ ...prev, [matId]: true }));
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return { icon: 'file-pdf', color: '#FF4B4B', label: 'PDF' };
      case 'video':
        return { icon: 'video', color: '#1CB0F6', label: 'VÍDEO' };
      case 'link':
        return { icon: 'link', color: '#58CC02', label: 'LINK' };
      case 'tip':
        return { icon: 'lightbulb', color: '#F1C40F', label: 'DICA' };
      default:
        return { icon: 'file-alt', color: '#8CA0B3', label: 'ARQUIVO' };
    }
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
            {filterSubject ? `Materiais: ${filterSubject}` : 'Materiais de Apoio'}
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner para Professor */}
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
              <Text style={styles.teacherBannerTitle}>Acompanhamento do Professor</Text>
              <Text style={styles.teacherBannerSub}>
                Veja downloads, visualizações e responda às dúvidas dos materiais.
              </Text>
            </View>
            <FontAwesome5 name="arrow-right" size={12} color="#1CB0F6" />
          </TouchableOpacity>
        )}

        <Text style={styles.sectionSubtitle}>
          Arquivos, vídeos e resumos enviados pelos professores, com espaço para perguntas estilo Classroom.
        </Text>

        {Object.keys(groupedMaterials).length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="folder-open" size={44} color="#E2E8F0" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyText}>Nenhum material foi postado ainda.</Text>
          </View>
        ) : (
          Object.entries(groupedMaterials).map(([subject, data]) => {
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
                        {data.materials.length} {data.materials.length === 1 ? 'arquivo' : 'arquivos'}
                      </Text>
                    </View>
                  </View>
                  <FontAwesome5 name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} color="#8CA0B3" />
                </TouchableOpacity>

                {/* CONTEÚDO DA PASTA */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    {data.materials.map((mat) => {
                      const iconConfig = getMaterialIcon(mat.type);
                      const isCommentsOpen = !!expandedMaterialComments[mat.id];

                      return (
                        <View key={mat.id} style={styles.materialCard}>
                          <View style={styles.cardHeader}>
                            <View style={styles.topicBadge}>
                              <Text style={styles.topicText}>{mat.topic}</Text>
                            </View>
                            <Text style={styles.teacherText}>{mat.teacher}</Text>
                          </View>

                          <View style={styles.mainInfoRow}>
                            <View style={[styles.typeIconBox, { backgroundColor: `${iconConfig.color}15` }]}>
                              <FontAwesome5 name={iconConfig.icon} size={18} color={iconConfig.color} />
                            </View>
                            <View style={styles.textDetails}>
                              <Text style={styles.materialTitle}>{mat.title}</Text>
                              <Text style={styles.materialDesc}>{mat.description}</Text>
                            </View>
                          </View>

                          <View style={styles.cardActionsRow}>
                            <TouchableOpacity style={styles.accessButton}>
                              <Text style={styles.accessButtonText}>Acessar Conteúdo</Text>
                              <FontAwesome5 name="external-link-alt" size={10} color="#1CB0F6" />
                            </TouchableOpacity>

                            {mat.hasRelatedTask && (
                              <TouchableOpacity
                                style={styles.taskLinkButton}
                                onPress={() => router.push('/classes/tasks' as any)}
                              >
                                <FontAwesome5 name="tasks" size={10} color="#58CC02" />
                                <Text style={styles.taskLinkText}>Ver Tarefa</Text>
                              </TouchableOpacity>
                            )}
                          </View>

                          {/* Seção de Dúvidas / Comentários no Material */}
                          <View style={styles.commentsWrapper}>
                            <TouchableOpacity
                              style={styles.commentsToggleBtn}
                              onPress={() => toggleMaterialComments(mat.id)}
                            >
                              <FontAwesome5 name="comment-alt" size={11} color="#1CB0F6" />
                              <Text style={styles.commentsToggleText}>
                                {mat.comments.length}{' '}
                                {mat.comments.length === 1 ? 'dúvida/comentário' : 'dúvidas/comentários'}
                              </Text>
                              <FontAwesome5
                                name={isCommentsOpen ? 'chevron-up' : 'chevron-down'}
                                size={10}
                                color="#8CA0B3"
                              />
                            </TouchableOpacity>

                            {isCommentsOpen && (
                              <View style={styles.commentsList}>
                                {mat.comments.map((comm) => (
                                  <View key={comm.id} style={styles.commentItem}>
                                    <View style={styles.commentHeaderMini}>
                                      <Text style={styles.commentAuthorText}>
                                        {comm.author}{' '}
                                        {comm.role === 'TEACHER' && (
                                          <Text style={styles.teacherTag}>(Professor)</Text>
                                        )}
                                      </Text>
                                      <Text style={styles.commentDateText}>{comm.date}</Text>
                                    </View>
                                    <Text style={styles.commentBodyText}>{comm.text}</Text>
                                  </View>
                                ))}

                                <View style={styles.commentInputRow}>
                                  <TextInput
                                    style={styles.commentInput}
                                    placeholder="Tirar dúvida sobre este material..."
                                    placeholderTextColor="#A0AEC0"
                                    value={commentInputs[mat.id] || ''}
                                    onChangeText={(txt) =>
                                      setCommentInputs((prev) => ({ ...prev, [mat.id]: txt }))
                                    }
                                  />
                                  <TouchableOpacity
                                    style={styles.commentSendBtn}
                                    onPress={() => handleAddComment(mat.id)}
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
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  backButton: { width: 38, height: 38, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#2C3A47' },
  teacherTrackerBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },

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

  materialCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  topicBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  topicText: { fontSize: 11, fontWeight: 'bold', color: '#4B5563' },
  teacherText: { fontSize: 11, color: '#8CA0B3', fontWeight: 'bold' },

  mainInfoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  typeIconBox: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  textDetails: { flex: 1 },
  materialTitle: { fontSize: 14, fontWeight: 'bold', color: '#2C3A47', marginBottom: 3 },
  materialDesc: { fontSize: 12, color: '#8CA0B3', lineHeight: 16 },

  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  accessButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  accessButtonText: { fontSize: 12, fontWeight: 'bold', color: '#1CB0F6' },
  taskLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  taskLinkText: { fontSize: 11, fontWeight: 'bold', color: '#3A8A00' },

  commentsWrapper: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  commentsToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentsToggleText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1CB0F6',
    flex: 1,
  },
  commentsList: {
    marginTop: 8,
    gap: 8,
  },
  commentItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commentHeaderMini: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  commentAuthorText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2C3A47',
  },
  teacherTag: {
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
  commentInputRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  commentInput: {
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
  commentSendBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1CB0F6',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
});
