import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

// MOCK: Adicionada a propriedade isFavorite
const INITIAL_ERROR_QUESTIONS = [
  {
    id: '1', area: 'Natureza', subject: 'Física', topic: 'Cinemática', errorCategory: 'Erro de Fórmula', timeSpent: '3m 20s', isFavorite: false,
    text: 'Um carro de 1000 kg acelera de 0 a 20 m/s em 10 segundos. Qual é o trabalho realizado pelo motor?',
    userOption: 'A) 100.000 Joules', correctOption: 'C) 200.000 Joules',
    diagnosis: 'Você confundiu Força com Trabalho. Faltou usar o Teorema da Energia Cinética (E = m*v²/2).',
  },
  {
    id: '2', area: 'Matemática', subject: 'Matemática', topic: 'Geometria Espacial', errorCategory: 'Pegadinha', timeSpent: '1m 15s', isFavorite: false,
    text: 'Se dobrarmos a aresta de um cubo, o que acontece com o seu volume?',
    userOption: 'B) O volume dobra.', correctOption: 'D) O volume fica multiplicado por 8.',
    diagnosis: 'Como o volume é tridimensional (a³), se a aresta dobra (2a), o volume multiplica por 2³ (8).',
  },
  {
    id: '3', area: 'Matemática', subject: 'Matemática', topic: 'Probabilidade', errorCategory: 'Desatenção', timeSpent: '2m 10s', isFavorite: true, // Já favorita!
    text: 'Ao lançar dois dados perfeitos, qual a probabilidade de a soma ser 7?',
    userOption: 'C) 1/12', correctOption: 'A) 1/6',
    diagnosis: 'Você esqueceu de contar todas as permutações (ex: 3 e 4 é diferente de 4 e 3 no lançamento de dois dados distintos).',
  }
];

export default function ErrorsScreen() {
  const router = useRouter();
  const { area } = useLocalSearchParams<{ area: string }>();

  const [errorQuestions, setErrorQuestions] = useState(INITIAL_ERROR_QUESTIONS);
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  const toggleFavorite = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setErrorQuestions(prev => prev.map(q => q.id === id ? { ...q, isFavorite: !q.isFavorite } : q));
  };

  // MÁGICA: Filtra, Ordena as favoritas pro topo, e depois Agrupa!
  const { groupedErrors, worstSubject, worstSubjectCount } = useMemo(() => {
    // 1. Filtra
    let filtered = area ? errorQuestions.filter(q => q.area === area) : errorQuestions;
    
    // 2. Ordena (Favoritas primeiro)
    let sorted = filtered.sort((a, b) => {
      if (a.isFavorite === b.isFavorite) return 0;
      return a.isFavorite ? -1 : 1;
    });

    // 3. Agrupa por Matéria
    const groups = sorted.reduce((acc, question) => {
      if (!acc[question.subject]) acc[question.subject] = [];
      acc[question.subject].push(question);
      return acc;
    }, {} as Record<string, typeof INITIAL_ERROR_QUESTIONS>);

    // Lógica para descobrir a pior matéria
    let worst = '';
    let maxCount = 0;
    Object.entries(groups).forEach(([sub, questions]) => {
      if (questions.length > maxCount) {
        maxCount = questions.length;
        worst = sub;
      }
    });

    return { groupedErrors: groups, worstSubject: worst, worstSubjectCount: maxCount };
  }, [errorQuestions, area]);

  const pageTitle = area ? `Raio-X: ${area}` : 'Raio-X de Erros';

  const toggleSubject = (subject: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSubject(prev => prev === subject ? null : subject);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.title}>{pageTitle}</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {Object.keys(groupedErrors).length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="medal" size={48} color="#E2E8F0" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Sem erros por aqui! Você está dominando o conteúdo.</Text>
          </View>
        ) : (
          <>
            <View style={styles.actionPlanHero}>
              <View style={styles.heroHeader}>
                <View style={styles.heroIconBox}>
                  <FontAwesome5 name="crosshairs" size={20} color="#FFF" />
                </View>
                <Text style={styles.heroTitle}>Plano de Ação Direcionado</Text>
              </View>
              <Text style={styles.heroDescription}>
                Sua maior dificuldade atual é em <Text style={{fontWeight: 'bold', color: '#FFF'}}>{worstSubject}</Text> (com {worstSubjectCount} erros).
              </Text>
              <View style={styles.heroTaskBox}>
                <FontAwesome5 name="tasks" size={14} color="#2C3A47" style={{ marginRight: 10 }} />
                <Text style={styles.heroTaskText}>Revise a teoria e resolva 10 questões de nível Fácil para resgatar a confiança.</Text>
              </View>
            </View>

            <Text style={styles.listTitle}>Seus Erros por Matéria</Text>

            {Object.entries(groupedErrors).map(([subject, questions]) => {
              const isExpanded = expandedSubject === subject;

              return (
                <View key={subject} style={styles.accordionContainer}>
                  <TouchableOpacity 
                    style={[styles.accordionHeader, isExpanded && styles.accordionHeaderActive]}
                    activeOpacity={0.8}
                    onPress={() => toggleSubject(subject)}
                  >
                    <View style={styles.accordionTitleRow}>
                      <View style={styles.subjectIconBox}>
                        <FontAwesome5 name={subject === 'Matemática' ? 'calculator' : 'atom'} size={16} color="#FF4B4B" />
                      </View>
                      <View>
                        <Text style={styles.accordionSubjectName}>{subject}</Text>
                        <Text style={styles.accordionSubjectCount}>{questions.length} {questions.length === 1 ? 'erro registrado' : 'erros registrados'}</Text>
                      </View>
                    </View>
                    <FontAwesome5 name={isExpanded ? "chevron-up" : "chevron-down"} size={16} color="#8CA0B3" />
                  </TouchableOpacity>

                  {isExpanded && (
                    <ScrollView style={styles.internalScrollArea} nestedScrollEnabled={true}>
                      {questions.map((question) => (
                        <View key={question.id} style={[styles.questionCard, question.isFavorite && styles.favoriteHighlight]}>
                          
                          <View style={styles.cardHeader}>
                            <View style={styles.tagBadge}>
                              <FontAwesome5 name="bug" size={10} color="#FF4B4B" />
                              <Text style={styles.tagText}>{question.errorCategory}</Text>
                            </View>
                            
                            <View style={styles.headerRightActions}>
                              <View style={styles.timeBadge}>
                                <FontAwesome5 name="stopwatch" size={12} color="#C40000" />
                                <Text style={styles.timeText}>{question.timeSpent}</Text>
                              </View>
                              
                              {/* BOTÃO DE FAVORITAR */}
                              <TouchableOpacity onPress={() => toggleFavorite(question.id)} style={styles.favoriteButton}>
                                <FontAwesome5 
                                  name="star" 
                                  solid={question.isFavorite} 
                                  size={18} 
                                  color={question.isFavorite ? '#F1C40F' : '#E2E8F0'} 
                                />
                              </TouchableOpacity>
                            </View>
                          </View>

                          <Text style={styles.questionText}>{question.text}</Text>

                          <View style={styles.contrastContainer}>
                            <View style={styles.contrastRow}>
                              <FontAwesome5 name="times" size={12} color="#FF4B4B" style={{width: 20}} />
                              <Text style={styles.contrastTextError}>{question.userOption}</Text>
                            </View>
                            <View style={styles.contrastDivider} />
                            <View style={styles.contrastRow}>
                              <FontAwesome5 name="check" size={12} color="#58CC02" style={{width: 20}} />
                              <Text style={styles.contrastTextSuccess}>{question.correctOption}</Text>
                            </View>
                          </View>

                          <View style={styles.diagnosisBox}>
                            <Text style={styles.diagnosisTitle}>Diagnóstico:</Text>
                            <Text style={styles.diagnosisText}>{question.diagnosis}</Text>
                          </View>
                          
                          <TouchableOpacity style={styles.saveNotesButton}>
                            <FontAwesome5 name="bookmark" size={12} color="#1CB0F6" />
                            <Text style={styles.saveNotesText}>Salvar Anotação</Text>
                          </TouchableOpacity>

                        </View>
                      ))}
                    </ScrollView>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', backgroundColor: '#FFF', borderBottomWidth: 1, borderColor: '#E2E8F0' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2C3A47' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: '#8CA0B3', textAlign: 'center' },

  actionPlanHero: { backgroundColor: '#FF4B4B', borderRadius: 20, padding: 20, marginBottom: 32, shadowColor: '#FF4B4B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  heroHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  heroIconBox: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  heroTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  heroDescription: { fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 22, marginBottom: 16 },
  heroTaskBox: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 12, padding: 16, alignItems: 'flex-start' },
  heroTaskText: { flex: 1, fontSize: 13, color: '#2C3A47', fontWeight: 'bold', lineHeight: 18 },

  listTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3A47', marginBottom: 16 },

  accordionContainer: { backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 12, overflow: 'hidden' },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF' },
  accordionHeaderActive: { borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#F8FAFC' },
  accordionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  subjectIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFF5F5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  accordionSubjectName: { fontSize: 16, fontWeight: 'bold', color: '#2C3A47' },
  accordionSubjectCount: { fontSize: 12, color: '#8CA0B3', marginTop: 2 },
  
  internalScrollArea: { maxHeight: 450, padding: 16, backgroundColor: '#F7F9FC' },
  
  questionCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  favoriteHighlight: { borderColor: '#F1C40F', borderWidth: 2 }, // Borda amarela se favorito

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' },
  tagBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#FFE4E6' },
  tagText: { fontSize: 11, fontWeight: 'bold', color: '#C40000' },
  
  headerRightActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF5F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#FFE4E6' },
  timeText: { fontSize: 12, fontWeight: 'bold', color: '#C40000' },
  favoriteButton: { padding: 4 },
  
  questionText: { fontSize: 14, fontWeight: '600', color: '#2C3A47', marginBottom: 16, lineHeight: 20 },
  contrastContainer: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  contrastRow: { flexDirection: 'row', alignItems: 'center' },
  contrastTextError: { fontSize: 13, color: '#4B5563', textDecorationLine: 'line-through' },
  contrastTextSuccess: { fontSize: 13, fontWeight: 'bold', color: '#3A8A00' },
  contrastDivider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 8 },
  diagnosisBox: { backgroundColor: '#FFF9E6', padding: 12, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#F1C40F', marginBottom: 16 },
  diagnosisTitle: { fontSize: 12, fontWeight: 'bold', color: '#D4A017', marginBottom: 4 },
  diagnosisText: { fontSize: 13, color: '#4B5563', lineHeight: 18 },
  saveNotesButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, backgroundColor: '#F0F9FF', borderRadius: 12, borderWidth: 1, borderColor: '#BAE6FD' },
  saveNotesText: { fontSize: 13, fontWeight: 'bold', color: '#1CB0F6' }
});