import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

// 1. TIPAGEM DOS MATERIAIS
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
  hasRelatedTask?: boolean; // Se for true, mostra o atalho para as tarefas
};

// 2. MOCK: BANCO DE DADOS DE MATERIAIS DOS PROFESSORES
const MATERIALS_DB: Material[] = [
  { 
    id: 'm1', subject: 'Física', topic: 'Cinemática Escalar', teacher: 'Prof. Carlos', 
    type: 'pdf', title: 'Resumão: Fórmulas de Cinemática', description: 'PDF com 2 páginas resumindo MRU e MRUV.', 
    color: '#58CC02', folderIcon: 'atom', hasRelatedTask: true 
  },
  { 
    id: 'm2', subject: 'Física', topic: 'Leis de Newton', teacher: 'Prof. Carlos', 
    type: 'video', title: 'Videoaula: Aplicação de Forças', description: 'Revisão gravada da aula de terça-feira.', 
    color: '#58CC02', folderIcon: 'atom', hasRelatedTask: true 
  },
  { 
    id: 'm3', subject: 'Matemática', topic: 'Geometria Plana', teacher: 'Profª. Marta', 
    type: 'tip', title: 'Macete: Áreas de Triângulos', description: 'Dica rápida para não esquecer a fórmula de Herão.', 
    color: '#FF4B4B', folderIcon: 'calculator', hasRelatedTask: false 
  },
  { 
    id: 'm4', subject: 'História', topic: 'Era Vargas', teacher: 'Prof. Sérgio', 
    type: 'link', title: 'Artigo: O Estado Novo', description: 'Leitura complementar recomendada.', 
    color: '#F1C40F', folderIcon: 'monument', hasRelatedTask: false 
  },
];

export default function MaterialsScreen() {
  const router = useRouter();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // MÁGICA: Agrupa os materiais pela Matéria (Subject)
  const groupedMaterials = useMemo(() => {
    return MATERIALS_DB.reduce((acc, material) => {
      if (!acc[material.subject]) {
        acc[material.subject] = { materials: [], color: material.color, icon: material.folderIcon };
      }
      acc[material.subject].materials.push(material);
      return acc;
    }, {} as Record<string, { materials: Material[], color: string, icon: string }>);
  }, []);

  const toggleSubject = (subject: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSubject(prev => prev === subject ? null : subject);
  };

  // Função auxiliar para renderizar o ícone correto dependendo do tipo do material
  const getMaterialIcon = (type: string) => {
    switch(type) {
      case 'pdf': return { name: 'file-pdf', color: '#FF4B4B' };
      case 'video': return { name: 'play-circle', color: '#1CB0F6' };
      case 'link': return { name: 'link', color: '#8CA0B3' };
      case 'tip': return { name: 'lightbulb', color: '#F1C40F' };
      default: return { name: 'file', color: '#8CA0B3' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Material Didático</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 2. CONTEÚDO (PASTAS POR MATÉRIA) */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionSubtitle}>
          Arquivos, vídeos e dicas enviadas pelos seus professores, organizados por disciplina.
        </Text>

        {Object.keys(groupedMaterials).length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="folder-open" size={48} color="#E2E8F0" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Nenhum material foi postado para a sua turma ainda.</Text>
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
                      <FontAwesome5 name={data.icon} size={16} color="#FFF" />
                    </View>
                    <View>
                      <Text style={styles.folderSubjectName}>{subject}</Text>
                      <Text style={styles.folderSubjectCount}>
                        {data.materials.length} {data.materials.length === 1 ? 'arquivo' : 'arquivos'}
                      </Text>
                    </View>
                  </View>
                  <FontAwesome5 name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#8CA0B3" />
                </TouchableOpacity>

                {/* CONTEÚDO DA PASTA (Cartões de Material) */}
                {isExpanded && (
                  <View style={styles.expandedContent}>
                    {data.materials.map((mat) => {
                      const iconConfig = getMaterialIcon(mat.type);

                      return (
                        <View key={mat.id} style={styles.materialCard}>
                          
                          <View style={styles.cardHeader}>
                            <View style={styles.topicBadge}>
                              <Text style={styles.topicText}>{mat.topic}</Text>
                            </View>
                            <Text style={styles.teacherText}>{mat.teacher}</Text>
                          </View>

                          <View style={styles.materialContentRow}>
                            <View style={[styles.typeIconBox, { backgroundColor: iconConfig.color + '15' }]}>
                              <FontAwesome5 name={iconConfig.name} size={20} color={iconConfig.color} solid={mat.type === 'tip'} />
                            </View>
                            <View style={styles.materialInfo}>
                              <Text style={styles.materialTitle}>{mat.title}</Text>
                              <Text style={styles.materialDesc} numberOfLines={2}>{mat.description}</Text>
                            </View>
                          </View>

                          {/* Botões de Ação */}
                          <View style={styles.actionsRow}>
                            <TouchableOpacity style={styles.primaryActionButton} activeOpacity={0.7}>
                              <Text style={styles.primaryActionText}>
                                {mat.type === 'video' ? 'Assistir' : mat.type === 'pdf' ? 'Abrir PDF' : 'Acessar'}
                              </Text>
                            </TouchableOpacity>

                            {/* ATALHO PARA TAREFA: Só aparece se houver lista vinculada */}
                            {mat.hasRelatedTask && (
                              <TouchableOpacity 
                                style={styles.shortcutButton} 
                                activeOpacity={0.7}
                                onPress={() => router.replace('/classes/tasks' as any)} // Usa replace para não empilhar muitas telas
                              >
                                <FontAwesome5 name="tasks" size={12} color="#1CB0F6" style={{ marginRight: 6 }} />
                                <Text style={styles.shortcutText}>Praticar Assunto</Text>
                              </TouchableOpacity>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3A47' },
  
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

  // Estilos do Card de Material
  materialCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  topicBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  topicText: { fontSize: 11, color: '#4B5563', fontWeight: 'bold', textTransform: 'uppercase' },
  teacherText: { fontSize: 12, color: '#8CA0B3', fontWeight: 'bold' },
  
  materialContentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  typeIconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  materialInfo: { flex: 1 },
  materialTitle: { fontSize: 15, fontWeight: 'bold', color: '#2C3A47', marginBottom: 4 },
  materialDesc: { fontSize: 13, color: '#8CA0B3', lineHeight: 18 },
  
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12 },
  
  primaryActionButton: { backgroundColor: '#2C3A47', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  primaryActionText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  
  shortcutButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F9FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#BAE6FD' },
  shortcutText: { color: '#1CB0F6', fontWeight: 'bold', fontSize: 12 }
});