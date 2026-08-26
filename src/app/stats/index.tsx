import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Href, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

// DADOS MOCKADOS DE ESTATÍSTICAS
const GENERAL_STATS = {
  totalAnswered: 150,
  correctAnswers: 117,
  accuracyRate: 78,
  averageTime: '2m 12s',
};

const AREA_STATS = [
  { id: 1, name: 'Matemática', icon: 'calculator', color: '#FF4B4B', accuracy: 85, time: '3m 10s' },
  { id: 2, name: 'Natureza', icon: 'flask', color: '#58CC02', accuracy: 65, time: '2m 45s' },
  { id: 3, name: 'Humanas', icon: 'globe-americas', color: '#F1C40F', accuracy: 82, time: '1m 50s' },
  { id: 4, name: 'Linguagens', icon: 'book', color: '#CE82FF', accuracy: 75, time: '2m 05s' },
];

export default function StatsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.title}>Estatísticas de Acertos</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 2. VISÃO GERAL (HERO SECTION) */}
        <Text style={styles.sectionTitle}>Visão Geral</Text>
        <View style={styles.overviewContainer}>
          {/* Card de Precisão */}
          <TouchableOpacity 
            style={[styles.overviewCard, { borderBottomColor: '#1CB0F6', borderBottomWidth: 4 }]}
            activeOpacity={0.7}
            onPress={() => router.push('/stats/correct' as Href)}
          >
            <View style={styles.overviewIconHeader}>
              <FontAwesome5 name="bullseye" size={24} color="#1CB0F6" />
              <Text style={styles.overviewValue}>{GENERAL_STATS.accuracyRate}%</Text>
            </View>
            <Text style={styles.overviewLabel}>Taxa de Acertos</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.overviewSub}>{GENERAL_STATS.correctAnswers} de {GENERAL_STATS.totalAnswered} questões</Text>
              <FontAwesome5 name="chevron-right" size={12} color="#1CB0F6" />
            </View>
          </TouchableOpacity>

          {/* Card de Tempo */}
          <View style={[styles.overviewCard, { borderBottomColor: '#FF9600', borderBottomWidth: 4 }]}>
            <View style={styles.overviewIconHeader}>
              <FontAwesome5 name="bolt" size={24} color="#FF9600" />
              <Text style={styles.overviewValue}>{GENERAL_STATS.averageTime}</Text>
            </View>
            <Text style={styles.overviewLabel}>Tempo Médio</Text>
            <Text style={styles.overviewSub}>Por resposta correta</Text>
          </View>
        </View>

        {/* 3. DESEMPENHO POR ÁREA DO ENEM */}
        <Text style={styles.sectionTitle}>Desempenho por Área</Text>
        <View style={styles.areasContainer}>
          {AREA_STATS.map((area) => (
            <TouchableOpacity 
              key={area.id} 
              style={styles.areaCard}
              activeOpacity={0.7}
              // Aqui enviamos o nome da área como parâmetro para a próxima tela!
              onPress={() => router.push({ pathname: '/stats/correct', params: { area: area.name } })}
            >
              <View style={styles.areaHeader}>
                <View style={[styles.areaIconBox, { backgroundColor: area.color }]}>
                  <FontAwesome5 name={area.icon} size={16} color="#FFF" />
                </View>
                <Text style={styles.areaName}>{area.name}</Text>
                <Text style={[styles.areaAccuracyText, { color: area.color }]}>{area.accuracy}%</Text>
                
                {/* Adicionei uma setinha para mostrar que é clicável */}
                <FontAwesome5 name="chevron-right" size={12} color="#E2E8F0" style={{ marginLeft: 12 }} />
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${area.accuracy}%`, backgroundColor: area.color }]} />
              </View>

              <View style={styles.areaFooter}>
                <View style={styles.timeBadge}>
                  <FontAwesome5 name="clock" size={12} color="#8CA0B3" />
                  <Text style={styles.timeText}>Média: {area.time}</Text>
                </View>
                
                {area.accuracy < 70 ? (
                  <Text style={styles.feedbackTextWarning}>Atenção necessária</Text>
                ) : (
                  <Text style={styles.feedbackTextGood}>Ótimo ritmo</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 4. INSIGHT DO SISTEMA */}
        <View style={styles.insightCard}>
          <FontAwesome5 name="lightbulb" size={24} color="#F1C40F" style={{ marginRight: 16 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.insightTitle}>Dica Estratégica</Text>
            <Text style={styles.insightText}>
              Você está excelente em Matemática (85%), mas seu tempo médio (3m10s) está perigoso para o dia da prova. Tente pular as questões difíceis e focar nas fáceis primeiro!
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    padding: 20, alignItems: 'center', backgroundColor: '#FFF',
    borderBottomWidth: 1, borderColor: '#E2E8F0'
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2C3A47' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3A47', marginBottom: 16, marginTop: 8 },

  // Estilos da Visão Geral
  overviewContainer: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  overviewCard: {
    flex: 1, backgroundColor: '#FFF', padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  overviewIconHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  overviewValue: { fontSize: 24, fontWeight: 'bold', color: '#2C3A47' },
  overviewLabel: { fontSize: 14, fontWeight: 'bold', color: '#4B5563', marginBottom: 4 },
  overviewSub: { fontSize: 12, color: '#8CA0B3' },

  // Estilos do Desempenho por Área
  areasContainer: { gap: 16, marginBottom: 32 },
  areaCard: {
    backgroundColor: '#FFF', padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  areaHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  areaIconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  areaName: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#2C3A47' },
  areaAccuracyText: { fontSize: 18, fontWeight: 'bold' },
  
  progressBarBg: { width: '100%', height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  
  areaFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  timeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  timeText: { fontSize: 12, fontWeight: 'bold', color: '#8CA0B3' },
  feedbackTextWarning: { fontSize: 12, fontWeight: 'bold', color: '#FF4B4B' },
  feedbackTextGood: { fontSize: 12, fontWeight: 'bold', color: '#58CC02' },

  // Estilos do Insight
  insightCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF9E6', padding: 16, borderRadius: 16,
    borderWidth: 1, borderColor: '#F1C40F',
  },
  insightTitle: { fontSize: 14, fontWeight: 'bold', color: '#D4A017', marginBottom: 4 },
  insightText: { fontSize: 13, color: '#4B5563', lineHeight: 20 },
});