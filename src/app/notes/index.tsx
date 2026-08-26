import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

// MOCK: ANOTAÇÕES COM A NOVA PROPRIEDADE "isFavorite"
const INITIAL_QUESTION_NOTES = [
  {
    id: 'q1', subject: 'Matemática', color: '#FF4B4B', icon: 'calculator', isFavorite: false,
    questionSnippet: 'Se dobrarmos a aresta de um cubo, o que acontece com o seu volume?',
    noteText: 'CUIDADO: Volume é ao cubo (a³). Se a aresta dobra (2), o volume faz 2³ = 8. Multiplica por 8 e não por 2!',
    date: 'Hoje',
  },
  {
    id: 'q2', subject: 'Física', color: '#58CC02', icon: 'atom', isFavorite: false,
    questionSnippet: 'Qual é o trabalho realizado pelo motor, desconsiderando as perdas?',
    noteText: 'Se a questão não der a distância, não dá pra usar T = F*d. Tem que usar o Teorema da Energia Cinética (Trabalho = Variação da Energia).',
    date: 'Ontem',
  },
  {
    id: 'q3', subject: 'Matemática', color: '#FF4B4B', icon: 'calculator', isFavorite: true, // Já começa favoritado para teste!
    questionSnippet: 'Ao lançar dois dados perfeitos, qual a probabilidade de a soma ser 7?',
    noteText: 'Sempre desenhar a tabelinha 6x6 na prova para não esquecer que (3,4) é diferente de (4,3). Total de 36 combinações.',
    date: '15 Ago',
  }
];

const INITIAL_GENERAL_NOTES = [
  {
    id: 'g1', subject: 'Química', color: '#58CC02', icon: 'flask', isFavorite: false,
    title: 'Macete Pilhas (Eletroquímica)',
    noteText: 'CRAO: Cátodo Reduz, Ânodo Oxida.\nO Cátodo é o polo positivo (+) e ganha massa.\nO Ânodo é o polo negativo (-) e corrói.',
    date: '20 Ago',
  },
  {
    id: 'g2', subject: 'História', color: '#F1C40F', icon: 'monument', isFavorite: false,
    title: 'Fases da Era Vargas',
    noteText: '1. Governo Provisório (1930-1934)\n2. Governo Constitucional (1934-1937)\n3. Estado Novo (1937-1945) -> Ditadura.',
    date: '18 Ago',
  }
];

export default function NotesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab: 'questions' | 'general' }>();
  
  const [activeTab, setActiveTab] = useState<'questions' | 'general'>(params.tab || 'questions');
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  // Estados reais para conseguirmos favoritar e ver a mudança na tela
  const [questionNotes, setQuestionNotes] = useState(INITIAL_QUESTION_NOTES);
  const [generalNotes, setGeneralNotes] = useState(INITIAL_GENERAL_NOTES);

  useEffect(() => {
    if (params.tab) {
      setActiveTab(params.tab);
      setExpandedSubject(null); 
    }
  }, [params.tab]);

  // Função para favoritar/desfavoritar
  const toggleFavorite = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (activeTab === 'questions') {
      setQuestionNotes(prev => prev.map(note => note.id === id ? { ...note, isFavorite: !note.isFavorite } : note));
    } else {
      setGeneralNotes(prev => prev.map(note => note.id === id ? { ...note, isFavorite: !note.isFavorite } : note));
    }
  };

  // MÁGICA DA HIERARQUIA: Ordena e Agrupa
  const groupedNotes = useMemo(() => {
    const currentData = activeTab === 'questions' ? questionNotes : generalNotes;
    
    // 1. Primeiro ordenamos: Favoritos (true) vão para o topo
    const sortedData = [...currentData].sort((a, b) => {
      if (a.isFavorite === b.isFavorite) return 0;
      return a.isFavorite ? -1 : 1;
    });

    // 2. Depois agrupamos nas Pastas de Matéria
    return sortedData.reduce((acc, note) => {
      if (!acc[note.subject]) {
        acc[note.subject] = { notes: [], color: note.color, icon: note.icon };
      }
      acc[note.subject].notes.push(note);
      return acc;
    }, {} as Record<string, { notes: any[], color: string, icon: string }>);
  }, [activeTab, questionNotes, generalNotes]);

  const toggleSubject = (subject: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSubject(prev => prev === subject ? null : subject);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.title}>Meu Caderno</Text>
        <TouchableOpacity style={styles.searchButton}>
          <FontAwesome5 name="search" size={18} color="#8CA0B3" />
        </TouchableOpacity>
      </View>

      {/* ABAS */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBackground}>
          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'questions' && styles.tabActive]}
            onPress={() => { setActiveTab('questions'); setExpandedSubject(null); }}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="bookmark" size={14} color={activeTab === 'questions' ? '#2C3A47' : '#8CA0B3'} style={{marginRight: 6}} />
            <Text style={[styles.tabText, activeTab === 'questions' && styles.tabTextActive]}>Por Questão</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeTab === 'general' && styles.tabActive]}
            onPress={() => { setActiveTab('general'); setExpandedSubject(null); }}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="book-open" size={14} color={activeTab === 'general' ? '#2C3A47' : '#8CA0B3'} style={{marginRight: 6}} />
            <Text style={[styles.tabText, activeTab === 'general' && styles.tabTextActive]}>Gerais</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTEÚDO (Pastas) */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionSubtitle}>
          {activeTab === 'questions' 
            ? 'Macetes salvos, com seus favoritos fixados no topo de cada matéria.' 
            : 'Resumos teóricos organizados. Destaque os mais importantes!'}
        </Text>

        {Object.keys(groupedNotes).length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="folder-open" size={48} color="#E2E8F0" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Você ainda não possui anotações nesta seção.</Text>
          </View>
        ) : (
          Object.entries(groupedNotes).map(([subject, data]) => {
            const isExpanded = expandedSubject === subject;

            return (
              <View key={subject} style={[styles.folderContainer, { borderColor: data.color }]}>
                
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
                        {data.notes.length} {data.notes.length === 1 ? 'anotação' : 'anotações'}
                      </Text>
                    </View>
                  </View>
                  <FontAwesome5 name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#8CA0B3" />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    {data.notes.map((note) => (
                      <View key={note.id} style={[
                        activeTab === 'general' ? styles.generalNoteCard : styles.noteCard,
                        note.isFavorite && styles.favoriteHighlight // Borda amarela se for favorito
                      ]}>
                        
                        <View style={styles.noteHeader}>
                          <Text style={styles.dateText}>{note.date}</Text>
                          
                          {/* BOTÃO DE FAVORITAR (Estrela) */}
                          <TouchableOpacity onPress={() => toggleFavorite(note.id)} style={styles.favoriteButton}>
                            <FontAwesome5 
                              name="star" 
                              solid={note.isFavorite} // Pinta por dentro se for favorito
                              size={18} 
                              color={note.isFavorite ? '#F1C40F' : '#E2E8F0'} 
                            />
                          </TouchableOpacity>
                        </View>
                        
                        {activeTab === 'questions' ? (
                          <>
                            <View style={styles.questionRefBox}>
                              <FontAwesome5 name="quote-left" size={10} color="#8CA0B3" style={{marginRight: 6, marginTop: 2}} />
                              <Text style={styles.questionRefText} numberOfLines={2}>{note.questionSnippet}</Text>
                            </View>
                            <Text style={styles.userNoteText}>{note.noteText}</Text>
                          </>
                        ) : (
                          <>
                            <Text style={styles.generalNoteTitle}>{note.title}</Text>
                            <Text style={styles.userNoteText}>{note.noteText}</Text>
                          </>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* BOTÃO FLUTUANTE */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.8}
        onPress={() => router.push('/notes/new' as any)}
      >
        <FontAwesome5 name="plus" size={20} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', backgroundColor: '#FFF' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  searchButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2C3A47' },
  
  tabContainer: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  tabBackground: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 4 },
  tabButton: { flex: 1, flexDirection: 'row', paddingVertical: 10, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: 'bold', color: '#8CA0B3' },
  tabTextActive: { color: '#2C3A47' },

  scrollContent: { padding: 20, paddingBottom: 100 },
  sectionSubtitle: { fontSize: 14, color: '#8CA0B3', marginBottom: 20, fontStyle: 'italic' },

  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: '#8CA0B3', textAlign: 'center', marginTop: 12 },

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
  
  noteCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  generalNoteCard: {
    backgroundColor: '#FFFEF5', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#F1C40F40', 
  },
  
  // Destaque visual da borda se for favorito
  favoriteHighlight: {
    borderColor: '#F1C40F',
    borderWidth: 2,
  },
  
  noteHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dateText: { fontSize: 12, color: '#8CA0B3', fontWeight: 'bold' },
  favoriteButton: { padding: 4 },

  questionRefBox: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginBottom: 12,
    borderLeftWidth: 3, borderLeftColor: '#E2E8F0',
  },
  questionRefText: { flex: 1, fontSize: 13, color: '#4B5563', fontStyle: 'italic', lineHeight: 18 },
  
  generalNoteTitle: { fontSize: 16, fontWeight: 'bold', color: '#2C3A47', marginBottom: 8 },
  userNoteText: { fontSize: 15, color: '#2C3A47', lineHeight: 22 },

  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1CB0F6', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1CB0F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  }
});