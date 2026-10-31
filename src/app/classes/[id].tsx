import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Share,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useClassroomStore } from '@/store/useClassroomStore';
import { useUserStore } from '@/store/useUserStore';
import { ConfirmModal } from '@/components/ConfirmModal';

interface PostComment {
  id: string;
  author: string;
  role: 'STUDENT' | 'TEACHER';
  date: string;
  text: string;
}

interface ClassroomPost {
  id: string;
  author: string;
  role: 'STUDENT' | 'TEACHER';
  date: string;
  text: string;
  likes: number;
  comments: PostComment[];
}

export default function ClassroomDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const classrooms = useClassroomStore((state) => state.classrooms);
  const deleteClassroom = useClassroomStore((state) => state.deleteClassroom);
  const user = useUserStore((state) => state.user);

  const classroom = classrooms.find((c) => c.id === id) || classrooms[0];

  const [activeTab, setActiveTab] = useState<'geral' | 'alunos' | 'atividades'>('geral');
  const [newPostText, setNewPostText] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedPostComments, setExpandedPostComments] = useState<Record<string, boolean>>({
    p1: true,
  });

  const [posts, setPosts] = useState<ClassroomPost[]>([
    {
      id: 'p1',
      author: classroom?.teacherName || 'Prof. Responsável',
      role: 'TEACHER',
      date: 'Hoje às 10:30',
      text: 'Sejam bem-vindos! Já disponibilizamos a lista de exercícios da semana e o material teórico na aba de Tarefas.',
      likes: 12,
      comments: [
        {
          id: 'c1',
          author: 'Lucas Silva',
          role: 'STUDENT',
          date: 'Hoje às 10:45',
          text: 'Bom dia professor! Até que dia podemos enviar as respostas da lista?',
        },
        {
          id: 'c2',
          author: classroom?.teacherName || 'Prof. Responsável',
          role: 'TEACHER',
          date: 'Hoje às 11:00',
          text: 'Olá Lucas! O prazo oficial é até o próximo domingo às 23:59.',
        },
      ],
    },
  ]);

  // Pop-confirm states
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

  if (!classroom) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyCenter}>
          <Text style={styles.emptyTitle}>Turma não encontrada.</Text>
          <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.replace('/')}>
            <Text style={styles.backHomeBtnText}>Voltar ao Início</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Entre na turma "${classroom.name}" no Minuto ENEM usando o código: ${classroom.code}`,
      });
    } catch {
      // Ignora erro
    }
  };

  const handlePost = () => {
    if (!newPostText.trim()) return;
    const authorName = user?.name || classroom.teacherName;
    const authorRole = (user?.role as 'STUDENT' | 'TEACHER') || 'TEACHER';

    setPosts([
      {
        id: `post_${Date.now()}`,
        author: authorName,
        role: authorRole,
        date: 'Agora',
        text: newPostText.trim(),
        likes: 0,
        comments: [],
      },
      ...posts,
    ]);
    setNewPostText('');
  };

  const handleAddCommentToPost = (postId: string) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;

    const newComment: PostComment = {
      id: `comm_${Date.now()}`,
      author: user?.name || (user?.role === 'TEACHER' ? 'Professor' : 'Aluno'),
      role: (user?.role as 'STUDENT' | 'TEACHER') || 'STUDENT',
      date: 'Agora',
      text,
    };

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, comments: [...p.comments, newComment] }
          : p
      )
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    setExpandedPostComments((prev) => ({ ...prev, [postId]: true }));
  };

  const toggleComments = (postId: string) => {
    setExpandedPostComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Pop-confirm para excluir post
  const requestDeletePost = (postId: string) => {
    setConfirmModal({
      visible: true,
      title: 'Excluir Comunicado',
      message: 'Tem certeza de que deseja apagar este comunicado e todos os seus comentários?',
      confirmText: 'Excluir',
      confirmColor: '#FF4B4B',
      icon: 'trash-alt',
      action: () => {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setConfirmModal((prev) => ({ ...prev, visible: false }));
      },
    });
  };

  // Pop-confirm para excluir turma
  const requestDeleteClassroom = () => {
    setConfirmModal({
      visible: true,
      title: 'Encerrar Turma',
      message: `Tem certeza de que deseja encerrar a turma "${classroom.name}"? Alunos e materiais perderão o acesso associado.`,
      confirmText: 'Encerrar Turma',
      confirmColor: '#FF4B4B',
      icon: 'trash-alt',
      action: () => {
        deleteClassroom(classroom.id);
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        router.replace('/');
      },
    });
  };

  // Pop-confirm para sair da turma (caso aluno)
  const requestLeaveClassroom = () => {
    setConfirmModal({
      visible: true,
      title: 'Sair da Turma',
      message: `Deseja sair da turma "${classroom.name}"? Você precisará do código de acesso para retornar depois.`,
      confirmText: 'Sair da Turma',
      confirmColor: '#FF9600',
      icon: 'sign-out-alt',
      action: () => {
        setConfirmModal((prev) => ({ ...prev, visible: false }));
        router.replace('/');
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIconBtn}>
          <FontAwesome5 name="arrow-left" size={18} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {classroom.name}
        </Text>
        <TouchableOpacity onPress={handleShare} style={styles.headerIconBtn}>
          <FontAwesome5 name="share-alt" size={18} color="#1CB0F6" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Hero da Turma */}
        <View style={[styles.heroCard, { backgroundColor: classroom.themeColor }]}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconCircle}>
              <FontAwesome5 name={classroom.icon || 'chalkboard-teacher'} size={24} color="#FFF" />
            </View>
            <View style={styles.codeBadge}>
              <FontAwesome5 name="key" size={11} color="#FFF" />
              <Text style={styles.codeBadgeText}>{classroom.code}</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>{classroom.name}</Text>
          <Text style={styles.heroSub}>
            {classroom.subject} • {classroom.teacherName}
            {classroom.school ? ` • ${classroom.school}` : ''}
          </Text>

          {classroom.description && (
            <Text style={styles.heroDesc}>{classroom.description}</Text>
          )}

          {/* Atalho Especial do Professor para Acompanhamento - Visível APENAS para professores */}
          {user?.role === 'TEACHER' && (
            <TouchableOpacity
              style={styles.teacherDashboardButton}
              activeOpacity={0.85}
              onPress={() => router.push(`/classes/teacher-tracking?classId=${classroom.id}` as any)}
            >
              <FontAwesome5 name="chart-pie" size={14} color={classroom.themeColor} />
              <Text style={[styles.teacherDashboardText, { color: classroom.themeColor }]}>
                Acompanhar Listas & Materiais (Professor)
              </Text>
              <FontAwesome5 name="arrow-right" size={12} color={classroom.themeColor} />
            </TouchableOpacity>
          )}

          {/* Estatísticas Rápidas */}
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{classroom.studentsCount}</Text>
              <Text style={styles.heroStatLabel}>Alunos</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{classroom.tasksCount}</Text>
              <Text style={styles.heroStatLabel}>Listas</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatValue}>{classroom.materialsCount}</Text>
              <Text style={styles.heroStatLabel}>Materiais</Text>
            </View>
          </View>
        </View>

        {/* Abas */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'geral' && styles.tabButtonActive]}
            onPress={() => setActiveTab('geral')}
          >
            <Text style={[styles.tabText, activeTab === 'geral' && styles.tabTextActive]}>
              Mural & Avisos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'atividades' && styles.tabButtonActive]}
            onPress={() => setActiveTab('atividades')}
          >
            <Text style={[styles.tabText, activeTab === 'atividades' && styles.tabTextActive]}>
              Tarefas & Listas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'alunos' && styles.tabButtonActive]}
            onPress={() => setActiveTab('alunos')}
          >
            <Text style={[styles.tabText, activeTab === 'alunos' && styles.tabTextActive]}>
              Alunos ({classroom.studentsCount})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Conteúdo 1: Mural & Avisos com comentários estilo Classroom */}
        {activeTab === 'geral' && (
          <View style={styles.tabSection}>
            {/* Caixa de Novo Comunicado */}
            <View style={styles.postBoxCard}>
              <Text style={styles.postBoxTitle}>Compartilhar com a turma</Text>
              <TextInput
                style={styles.postInput}
                placeholder="Escreva um comunicado, aviso ou instrução para os alunos..."
                placeholderTextColor="#A0AEC0"
                multiline
                numberOfLines={3}
                value={newPostText}
                onChangeText={setNewPostText}
              />
              <View style={styles.postBoxActions}>
                <TouchableOpacity
                  style={[styles.postButton, !newPostText.trim() && { opacity: 0.5 }]}
                  disabled={!newPostText.trim()}
                  onPress={handlePost}
                >
                  <FontAwesome5 name="paper-plane" size={12} color="#FFF" />
                  <Text style={styles.postButtonText}>Publicar no Mural</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Lista de Publicações do Mural */}
            {posts.map((post) => {
              const isCommentsOpen = !!expandedPostComments[post.id];

              return (
                <View key={post.id} style={styles.feedCard}>
                  <View style={styles.feedHeader}>
                    <View
                      style={[
                        styles.feedAvatar,
                        { backgroundColor: post.role === 'TEACHER' ? '#1CB0F6' : '#58CC02' },
                      ]}
                    >
                      <FontAwesome5
                        name={post.role === 'TEACHER' ? 'chalkboard-teacher' : 'user'}
                        size={12}
                        color="#FFF"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.feedAuthor}>
                        {post.author}{' '}
                        {post.role === 'TEACHER' && (
                          <Text style={styles.teacherBadgeText}>• Professor</Text>
                        )}
                      </Text>
                      <Text style={styles.feedDate}>{post.date}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.feedOptionsBtn}
                      onPress={() => requestDeletePost(post.id)}
                    >
                      <FontAwesome5 name="trash-alt" size={12} color="#8CA0B3" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.feedText}>{post.text}</Text>

                  {/* Barra de Ações: Comentários da Turma */}
                  <View style={styles.feedActionRow}>
                    <TouchableOpacity
                      style={styles.toggleCommentsBtn}
                      onPress={() => toggleComments(post.id)}
                    >
                      <FontAwesome5 name="comment-alt" size={12} color="#1CB0F6" />
                      <Text style={styles.toggleCommentsText}>
                        {post.comments.length}{' '}
                        {post.comments.length === 1 ? 'comentário da turma' : 'comentários da turma'}
                      </Text>
                      <FontAwesome5
                        name={isCommentsOpen ? 'chevron-up' : 'chevron-down'}
                        size={10}
                        color="#8CA0B3"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Seção de Comentários do Post (Estilo Google Classroom) */}
                  {isCommentsOpen && (
                    <View style={styles.postCommentsSection}>
                      {post.comments.map((comm) => (
                        <View key={comm.id} style={styles.postCommentItem}>
                          <View style={styles.commentAvatarMini}>
                            <FontAwesome5
                              name={comm.role === 'TEACHER' ? 'chalkboard-teacher' : 'user'}
                              size={10}
                              color="#FFF"
                            />
                          </View>
                          <View style={styles.commentBubble}>
                            <View style={styles.commentHeaderMini}>
                              <Text style={styles.commentAuthorMini}>
                                {comm.author}{' '}
                                {comm.role === 'TEACHER' && (
                                  <Text style={styles.teacherMiniTag}>(Prof)</Text>
                                )}
                              </Text>
                              <Text style={styles.commentDateMini}>{comm.date}</Text>
                            </View>
                            <Text style={styles.commentTextMini}>{comm.text}</Text>
                          </View>
                        </View>
                      ))}

                      {/* Campo para Alunos/Professores Comentarem */}
                      <View style={styles.addCommentInputRow}>
                        <TextInput
                          style={styles.addCommentInput}
                          placeholder="Adicionar comentário para a turma..."
                          placeholderTextColor="#A0AEC0"
                          value={commentInputs[post.id] || ''}
                          onChangeText={(txt) =>
                            setCommentInputs((prev) => ({ ...prev, [post.id]: txt }))
                          }
                        />
                        <TouchableOpacity
                          style={styles.addCommentSendBtn}
                          onPress={() => handleAddCommentToPost(post.id)}
                        >
                          <FontAwesome5 name="paper-plane" size={11} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Conteúdo 2: Tarefas e Listas */}
        {activeTab === 'atividades' && (
          <View style={styles.tabSection}>
            {/* Banner de Direcionamento ao Painel de Acompanhamento do Professor (apenas para TEACHER) */}
            {user?.role === 'TEACHER' && (
              <TouchableOpacity
                style={styles.highlightBanner}
                activeOpacity={0.8}
                onPress={() => router.push(`/classes/teacher-tracking?classId=${classroom.id}` as any)}
              >
                <View style={[styles.actionIconBox, { backgroundColor: '#FFF0D4' }]}>
                  <FontAwesome5 name="chart-bar" size={18} color="#FF9600" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionCardTitle}>Painel de Acompanhamento das Listas</Text>
                  <Text style={styles.actionCardSub}>
                    Veja taxa de acertos, tempo gasto e quem já entregou cada exercício.
                  </Text>
                </View>
                <FontAwesome5 name="chevron-right" size={14} color="#8CA0B3" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.actionRowCard}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/classes/tasks',
                  params: {
                    subject: classroom.subject,
                    classId: classroom.id,
                    className: classroom.name,
                  },
                } as any)
              }
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#E0F2FE' }]}>
                <FontAwesome5 name="tasks" size={18} color="#1CB0F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionCardTitle}>Listas de Exercícios ({classroom.subject})</Text>
                <Text style={styles.actionCardSub}>Exercícios e simulados desta turma de {classroom.subject}.</Text>
              </View>
              <FontAwesome5 name="chevron-right" size={14} color="#8CA0B3" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionRowCard}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/classes/materials',
                  params: {
                    subject: classroom.subject,
                    classId: classroom.id,
                    className: classroom.name,
                  },
                } as any)
              }
            >
              <View style={[styles.actionIconBox, { backgroundColor: '#F0FDF4' }]}>
                <FontAwesome5 name="folder-open" size={18} color="#58CC02" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionCardTitle}>Materiais Didáticos ({classroom.subject})</Text>
                <Text style={styles.actionCardSub}>PDFs e resumos específicos desta turma de {classroom.subject}.</Text>
              </View>
              <FontAwesome5 name="chevron-right" size={14} color="#8CA0B3" />
            </TouchableOpacity>
          </View>
        )}

        {/* Conteúdo 3: Alunos */}
        {activeTab === 'alunos' && (
          <View style={styles.tabSection}>
            <View style={styles.inviteBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inviteTitle}>Convide mais participantes</Text>
                <Text style={styles.inviteSub}>Código: {classroom.code}</Text>
              </View>
              <TouchableOpacity style={styles.inviteBtn} onPress={handleShare}>
                <FontAwesome5 name="share-alt" size={12} color="#FFF" />
                <Text style={styles.inviteBtnText}>Convidar</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.studentsListCard}>
              {[
                { name: 'Lucas Silva', xp: 1420, tasksDone: '4/4' },
                { name: 'Beatriz Costa', xp: 1280, tasksDone: '3/4' },
                { name: 'Gabriel Santos', xp: 950, tasksDone: '2/4' },
                { name: 'Mariana Lima', xp: 820, tasksDone: '1/4' },
              ].map((student, idx) => (
                <View key={idx} style={styles.studentRow}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentAvatarText}>{student.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <Text style={styles.studentSub}>{student.tasksDone} listas entregues</Text>
                  </View>
                  <Text style={styles.studentXp}>{student.xp} XP</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Botões de Sair e Excluir Turma com Pop-confirm */}
        <View style={styles.bottomActionsCol}>
          <TouchableOpacity
            style={styles.leaveButton}
            activeOpacity={0.8}
            onPress={requestLeaveClassroom}
          >
            <FontAwesome5 name="sign-out-alt" size={14} color="#8CA0B3" />
            <Text style={styles.leaveButtonText}>Sair da Turma</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            activeOpacity={0.8}
            onPress={requestDeleteClassroom}
          >
            <FontAwesome5 name="trash-alt" size={14} color="#FF4B4B" />
            <Text style={styles.deleteButtonText}>Encerrar Turma (Professor)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Pop-confirm Modal */}
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
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerIconBtn: { width: 38, height: 38, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: 'bold', color: '#2C3A47', textAlign: 'center' },
  scrollContent: { padding: 18, paddingBottom: 60 },

  emptyCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3A47', marginBottom: 12 },
  backHomeBtn: { backgroundColor: '#1CB0F6', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12 },
  backHomeBtnText: { color: '#FFF', fontWeight: 'bold' },

  heroCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  codeBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  heroDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
    marginBottom: 14,
  },

  teacherDashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teacherDashboardText: {
    fontSize: 13,
    fontWeight: 'bold',
  },

  heroStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingVertical: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  heroStatItem: { alignItems: 'center' },
  heroStatValue: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)' },
  heroStatDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)' },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
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

  tabSection: { gap: 14 },

  postBoxCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  postBoxTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3A47',
  },
  postInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    fontSize: 14,
    color: '#2C3A47',
    minHeight: 60,
    textAlignVertical: 'top',
  },
  postBoxActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1CB0F6',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  postButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  feedCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  feedAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedAuthor: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2C3A47',
  },
  teacherBadgeText: {
    color: '#1CB0F6',
    fontSize: 11,
  },
  feedDate: {
    fontSize: 11,
    color: '#8CA0B3',
  },
  feedOptionsBtn: {
    padding: 4,
  },
  feedText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    marginBottom: 10,
  },
  feedActionRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  toggleCommentsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleCommentsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1CB0F6',
  },

  // Comentários do Post
  postCommentsSection: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 8,
  },
  postCommentItem: {
    flexDirection: 'row',
    gap: 8,
  },
  commentAvatarMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8CA0B3',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commentHeaderMini: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  commentAuthorMini: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2C3A47',
  },
  teacherMiniTag: {
    color: '#1CB0F6',
  },
  commentDateMini: {
    fontSize: 9,
    color: '#8CA0B3',
  },
  commentTextMini: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
  },
  addCommentInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  addCommentInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: '#2C3A47',
  },
  addCommentSendBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#1CB0F6',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },

  highlightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    gap: 12,
  },
  actionRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  actionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionCardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2C3A47',
  },
  actionCardSub: {
    fontSize: 12,
    color: '#8CA0B3',
    marginTop: 2,
  },

  inviteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  inviteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3A47',
  },
  inviteSub: {
    fontSize: 12,
    color: '#1CB0F6',
    fontWeight: 'bold',
    marginTop: 2,
  },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1CB0F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  inviteBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  studentsListCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  studentAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0284C7',
  },
  studentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3A47',
  },
  studentSub: {
    fontSize: 11,
    color: '#8CA0B3',
    marginTop: 2,
  },
  studentXp: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F1C40F',
  },

  bottomActionsCol: {
    gap: 10,
    marginTop: 24,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 14,
  },
  leaveButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8CA0B3',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE4E6',
    paddingVertical: 14,
    borderRadius: 14,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF4B4B',
  },
});
