import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

// MOCK: Adicionada a propriedade isFavorite
const INITIAL_CORRECT_QUESTIONS = [
  {
    id: '1', area: 'Matemática', subject: 'Matemática e suas Tecnologias', timeSpent: '1m 45s', isFavorite: false,
    text: 'Um produto custava R$ 200,00 e sofreu um acréscimo de 15%. Qual é o novo valor do produto?',
    correctOption: 'C) R$ 230,00',
    explanation: '15% de 200 = (15/100) * 200 = 30. O novo valor é o valor antigo mais o acréscimo: 200 + 30 = R$ 230,00.'
  },
  {
    id: '2', area: 'Humanas', subject: 'Ciências Humanas', timeSpent: '45s', isFavorite: true, // Começa favorita!
    text: 'No contexto da Revolução Francesa, qual evento é considerado o marco inicial da queda do absolutismo?',
    correctOption: 'B) A Queda da Bastilha.',
    explanation: 'A Queda da Bastilha, em 14 de julho de 1789, é o marco simbólico da Revolução Francesa.'
  },
  {
    id: '3', area: 'Natureza', subject: 'Biologia Celular', timeSpent: '1m 10s', isFavorite: false,
    text: 'Qual organela citoplasmática é a principal responsável pela produção de ATP em células eucarióticas?',
    correctOption: 'D) Mitocôndria.',
    explanation: 'A mitocôndria é a organela onde ocorre a respiração celular, gerando a maior parte do ATP para a célula.'
  }
];

export default function CorrectAnswersScreen() {
  const router = useRouter();
  const { area } = useLocalSearchParams<{ area: string }>();

  const [questions, setQuestions] = useState(INITIAL_CORRECT_QUESTIONS);

  const toggleFavorite = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, isFavorite: !q.isFavorite } : q));
  };

  // MÁGICA: Filtra por área (se existir) e ordena os favoritos para o topo
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = area ? questions.filter(q => q.area === area) : questions;
    return filtered.sort((a, b) => {
      if (a.isFavorite === b.isFavorite) return 0;
      return a.isFavorite ? -1 : 1;
    });
  }, [questions, area]);

  const pageTitle = area ? `Acertos em ${area}` : 'Todos os Acertos';

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
        
        {filteredAndSortedQuestions.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome5 name="box-open" size={48} color="#E2E8F0" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Você ainda não possui acertos registrados em {area}.</Text>
          </View>
        ) : (
          <>
            <Text style={styles.pageSubtitle}>
              Revise suas respostas corretas. Suas favoritas ficam fixadas no topo!
            </Text>

            {filteredAndSortedQuestions.map((question) => (
              <View key={question.id} style={[styles.questionCard, question.isFavorite && styles.favoriteHighlight]}>
                
                <View style={styles.cardHeader}>
                  <Text style={styles.subjectText}>{question.subject}</Text>
                  
                  <View style={styles.headerRightActions}>
                    <View style={styles.timeBadge}>
                      <FontAwesome5 name="clock" size={12} color="#58CC02" />
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

                <View style={styles.correctOptionBox}>
                  <FontAwesome5 name="check-circle" size={16} color="#58CC02" style={{ marginRight: 8 }} />
                  <Text style={styles.correctOptionText}>{question.correctOption}</Text>
                </View>

                <View style={styles.explanationBox}>
                  <Text style={styles.explanationTitle}>Resolução Passo a Passo:</Text>
                  <Text style={styles.explanationText}>{question.explanation}</Text>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.actionButton}>
                    <FontAwesome5 name="bookmark" size={14} color="#8CA0B3" />
                    <Text style={styles.actionText}>Salvar no Caderno</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.actionButton}>
                    <FontAwesome5 name="share-alt" size={14} color="#1CB0F6" />
                    <Text style={[styles.actionText, { color: '#1CB0F6' }]}>Compartilhar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
  scrollContent: { padding: 20, paddingBottom: 40 },
  pageSubtitle: { fontSize: 14, color: '#8CA0B3', marginBottom: 20 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60, padding: 20 },
  emptyText: { fontSize: 16, color: '#8CA0B3', textAlign: 'center', lineHeight: 24 },

  questionCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 20,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  favoriteHighlight: { borderColor: '#F1C40F', borderWidth: 2 }, // Borda amarela se favorito
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  subjectText: { fontSize: 12, fontWeight: 'bold', color: '#8CA0B3', textTransform: 'uppercase', flex: 1 },
  headerRightActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#F0FDF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#DCFCE7' },
  timeText: { fontSize: 12, fontWeight: 'bold', color: '#3A8A00' },
  favoriteButton: { padding: 4 },
  
  questionText: { fontSize: 16, fontWeight: 'bold', color: '#2C3A47', marginBottom: 16, lineHeight: 22 },
  correctOptionBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#58CC02', marginBottom: 16 },
  correctOptionText: { fontSize: 14, fontWeight: 'bold', color: '#3A8A00', flex: 1 },
  explanationBox: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: '#1CB0F6', marginBottom: 20 },
  explanationTitle: { fontSize: 14, fontWeight: 'bold', color: '#1CB0F6', marginBottom: 6 },
  explanationText: { fontSize: 14, color: '#4B5563', lineHeight: 20 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderColor: '#E2E8F0', paddingTop: 16 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, paddingHorizontal: 8 },
  actionText: { fontSize: 14, fontWeight: 'bold', color: '#8CA0B3' }
});