import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

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
};

// MOCK: Adicionei mais tarefas para vermos o agrupamento funcionando
const TASKS_DB: { pending: Task[], completed: Task[] } = {
  pending: [
    { id: 't1', subject: 'Física', topic: 'Cinemática Escalar', teacher: 'Prof. Carlos', total: 15, done: 0, color: '#58CC02', icon: 'atom' },
    { id: 't2', subject: 'Física', topic: 'Leis de Newton', teacher: 'Prof. Carlos', total: 20, done: 5, color: '#58CC02', icon: 'atom' },
    { id: 't3', subject: 'Matemática', topic: 'Geometria Plana', teacher: 'Profª. Marta', total: 10, done: 4, color: '#FF4B4B', icon: 'calculator' },
  ],
  completed: [
    { id: 't4', subject: 'História', topic: 'Era Vargas', teacher: 'Prof. Sérgio', total: 20, done: 20, color: '#F1C40F', icon: 'monument', score: 18 },
    { id: 't5', subject: 'História', topic: 'Segunda Guerra', teacher: 'Prof. Sérgio', total: 15, done: 15, color: '#F1C40F', icon: 'monument', score: 12 },
  ]
};

export default function TasksScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pendentes' | 'feitas'>('pendentes');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // MÁGICA: Agrupa as tarefas pela Matéria (Subject)
  const groupedTasks = useMemo(() => {
    const tasks = activeTab === 'pendentes' ? TASKS_DB.pending : TASKS_DB.completed;
    
    return tasks.reduce((acc, task) => {
      if (!acc[task.subject]) {
        acc[task.subject] = { tasks: [], color: task.color, icon: task.icon };
      }
      acc[task.subject].tasks.push(task);
      return acc;
    }, {} as Record<string, { tasks: Task[], color: string, icon: string }>);
  }, [activeTab]);

  const toggleSubject = (subject: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSubject(prev => prev === subject ? null : subject);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tarefas da Turma</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 2. ABAS */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBackground}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'pendentes' && styles.tabActive]}
            onPress={() => { setActiveTab('pendentes'); setExpandedSubject(null); }}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="clock" size={14} color={activeTab === 'pendentes' ? '#2C3A47' : '#8CA0B3'} style={{marginRight: 6}} />
            <Text style={[styles.tabText, activeTab === 'pendentes' && styles.tabTextActive]}>Pendentes</Text>
            {TASKS_DB.pending.length > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'feitas' && styles.tabActive]}
            onPress={() => { setActiveTab('feitas'); setExpandedSubject(null); }}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="check-double" size={14} color={activeTab === 'feitas' ? '#2C3A47' : '#8CA0B3'} style={{marginRight: 6}} />
            <Text style={[styles.tabText, activeTab === 'feitas' && styles.tabTextActive]}>Feitas</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. CONTEÚDO (PASTAS POR MATÉRIA) */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionSubtitle}>
          {activeTab === 'pendentes' 
            ? 'Organizamos suas listas pendentes por matéria para facilitar.' 
            : 'Histórico de listas que você já entregou aos professores.'}
        </Text>

        {Object.keys(groupedTasks).length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="glass-cheers" size={48} color="#E2E8F0" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Tudo limpo por aqui! Você está em dia com a turma.</Text>
          </View>
        ) : (
          Object.entries(groupedTasks).map(([subject, data]) => {
            const isExpanded = expandedSubject === subject;

            return (
              <View key={subject} style={[styles.folderContainer, { borderColor: data.color }]}>
                
                {/* CAPA DA PASTA (Clicável) */}
                <TouchableOpacity 
                  style={[styles.folderHeader, isExpanded && styles.folderHeaderActive]}
                  activeOpacity={0.8}
                  onPress={() => toggleSubject(subject)}
                >
                  <View style={styles.folderTitleRow}>
                    <View style={[styles.folderIconBox, { backgroundColor: data.color }]}>
                      <FontAwesome5 name={data.icon} size={16} color="#FFF" />
                    </View>
                    <View>
                      <Text style={styles.folderSubjectName}>{subject}</Text>
                      <Text style={styles.folderSubjectCount}>
                        {data.tasks.length} {data.tasks.length === 1 ? 'lista' : 'listas'}
                      </Text>
                    </View>
                  </View>
                  <FontAwesome5 name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#8CA0B3" />
                </TouchableOpacity>

                {/* CONTEÚDO DA PASTA (As listas daquela matéria) */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    {data.tasks.map((task) => {
                      const progressPercent = (task.done / task.total) * 100;

                      return (
                        <TouchableOpacity 
                          key={task.id} 
                          style={styles.taskCard} 
                          activeOpacity={0.8}
                          onPress={() => router.push('/quiz' as any)} 
                        >
                          <View style={styles.cardHeader}>
                            <Text style={styles.taskTitle}>{task.topic}</Text>
                            <View style={styles.teacherBadge}>
                              <FontAwesome5 name="chalkboard-teacher" size={10} color="#8CA0B3" style={{marginRight: 4}} />
                              <Text style={styles.teacherText}>{task.teacher}</Text>
                            </View>
                          </View>

                          {activeTab === 'pendentes' ? (
                            <View style={styles.progressSection}>
                              <View style={styles.progressHeader}>
                                <Text style={styles.progressLabel}>Progresso</Text>
                                <Text style={styles.progressValue}>{task.done}/{task.total} concl.</Text>
                              </View>
                              <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: task.color }]} />
                              </View>
                              
                              <View style={styles.actionRow}>
                                <View style={[styles.actionButton, { backgroundColor: task.color }]}>
                                  <Text style={styles.actionButtonText}>
                                    {task.done === 0 ? 'Começar' : 'Continuar'}
                                  </Text>
                                  <FontAwesome5 name="arrow-right" size={12} color="#FFF" />
                                </View>
                              </View>
                            </View>
                          ) : (
                            <View style={styles.completedSection}>
                              <View style={styles.scoreBox}>
                                <FontAwesome5 name="bullseye" size={14} color="#58CC02" style={{ marginRight: 8 }} />
                                <Text style={styles.scoreText}>Acertos: {task.score}/{task.total}</Text>
                              </View>
                              <Text style={styles.reviewText}>Revisar Erros</Text>
                            </View>
                          )}
                        </TouchableOpacity>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', backgroundColor: '#FFF' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3A47' },
  
  tabContainer: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  tabBackground: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4 },
  tabButton: { flex: 1, flexDirection: 'row', paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: 'bold', color: '#8CA0B3' },
  tabTextActive: { color: '#2C3A47' },
  notificationDot: { position: 'absolute', top: 8, right: '20%', width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4B4B' },

  scrollContent: { padding: 20, paddingBottom: 60 },
  sectionSubtitle: { fontSize: 14, color: '#8CA0B3', marginBottom: 20, fontStyle: 'italic' },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: '#8CA0B3', textAlign: 'center', marginTop: 12 },

  // Estilos da Pasta por Matéria
  folderContainer: {
    backgroundColor: '#FFF', borderRadius: 16, marginBottom: 16, overflow: 'hidden',
    borderWidth: 1, borderLeftWidth: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  folderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF' },
  folderHeaderActive: { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  folderTitleRow: { flexDirection: 'row', alignItems: 'center' },
  folderIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  folderSubjectName: { fontSize: 16, fontWeight: 'bold', color: '#2C3A47' },
  folderSubjectCount: { fontSize: 13, color: '#8CA0B3', marginTop: 2 },
  
  expandedContent: { padding: 16, backgroundColor: '#F7F9FC' },

  // Estilos dos Cards de Tarefas (dentro da pasta)
  taskCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'column', alignItems: 'flex-start', marginBottom: 12 },
  taskTitle: { fontSize: 16, fontWeight: 'bold', color: '#2C3A47', marginBottom: 6 },
  teacherBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  teacherText: { fontSize: 11, color: '#8CA0B3', fontWeight: 'bold' },
  
  progressSection: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 12, color: '#8CA0B3', fontWeight: 'bold' },
  progressValue: { fontSize: 12, color: '#2C3A47', fontWeight: 'bold' },
  progressBarBg: { width: '100%', height: 6, backgroundColor: '#E2E8F0', borderRadius: 3, marginBottom: 16 },
  progressBarFill: { height: '100%', borderRadius: 3 },
  
  actionRow: { alignItems: 'flex-end' },
  actionButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, gap: 8 },
  actionButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  completedSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  scoreBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#DCFCE7' },
  scoreText: { fontSize: 13, fontWeight: 'bold', color: '#3A8A00' },
  reviewText: { fontSize: 13, fontWeight: 'bold', color: '#1CB0F6' }
});