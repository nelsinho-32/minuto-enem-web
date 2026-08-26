import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

// DADOS DOS BLOCOS DE DESAFIO (Conforme sua regra de tempo)
const CHALLENGE_BLOCKS = [
  { id: 1, qQtd: 1, time: '4 min', title: 'Aquecimento', icon: 'stopwatch', color: '#1CB0F6' },
  { id: 2, qQtd: 5, time: '15 min', title: 'Tiro Curto', icon: 'running', color: '#58CC02' },
  { id: 3, qQtd: 10, time: '25 min', title: 'Resistência', icon: 'dumbbell', color: '#FF9600' },
  { id: 4, qQtd: 15, time: '37 min', title: 'Simulação Real', icon: 'fire-alt', color: '#FF4B4B' },
];

const DIFFICULTIES = [
  { id: 'facil', label: 'Fácil', color: '#58CC02' },
  { id: 'medio', label: 'Médio', color: '#FF9600' },
  { id: 'dificil', label: 'Difícil', color: '#FF4B4B' },
  { id: 'misto', label: 'Misto', color: '#CE82FF' },
];

export default function ChallengeScreen() {
  const router = useRouter();
  
  // Estados para os filtros
  const [activeDay, setActiveDay] = useState<1 | 2>(1);
  const [activeDifficulty, setActiveDifficulty] = useState('misto');

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.title}>Desafio contra o Tempo</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <View style={styles.filtersContainer}>
        {/* 2. SELETOR DE DIAS (TABS) */}
        <View style={styles.tabBackground}>
          <TouchableOpacity 
            style={[styles.tabButton, activeDay === 1 && styles.tabActive]}
            onPress={() => setActiveDay(1)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeDay === 1 && styles.tabTextActive]}>
              1º Dia do ENEM
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.tabButton, activeDay === 2 && styles.tabActive]}
            onPress={() => setActiveDay(2)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeDay === 2 && styles.tabTextActive]}>
              2º Dia do ENEM
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. SELETOR DE DIFICULDADE (PILLS) */}
        <Text style={styles.filterLabel}>Escolha a Dificuldade:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.difficultyScroll}>
          {DIFFICULTIES.map((diff) => {
            const isSelected = activeDifficulty === diff.id;
            return (
              <TouchableOpacity
                key={diff.id}
                style={[
                  styles.difficultyPill,
                  isSelected && { backgroundColor: diff.color, borderColor: diff.color }
                ]}
                onPress={() => setActiveDifficulty(diff.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.difficultyText, isSelected && styles.difficultyTextSelected]}>
                  {diff.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. BLOCOS DE MISSÃO */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {CHALLENGE_BLOCKS.map((block) => (
          <TouchableOpacity 
            key={block.id} 
            style={[styles.card, { borderColor: block.color }]}
            activeOpacity={0.8}
            onPress={() => {
              // No futuro, passaremos 'activeDay', 'activeDifficulty' e 'block.qQtd' como parâmetros para o Quiz
              router.push('/quiz');
            }}
          >
            <View style={[styles.iconBox, { backgroundColor: block.color }]}>
              <FontAwesome5 name={block.icon} size={24} color="#FFF" />
            </View>
            
            <View style={styles.cardTextContent}>
              <Text style={styles.cardTitle}>{block.title}</Text>
              <Text style={styles.cardSub}>
                {block.qQtd} {block.qQtd === 1 ? 'questão' : 'questões'}
              </Text>
            </View>

            <View style={styles.timeBadge}>
              <FontAwesome5 name="clock" size={14} color="#2C3A47" />
              <Text style={styles.timeText}>{block.time}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    padding: 20, alignItems: 'center', backgroundColor: '#FFF',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2C3A47' },
  
  filtersContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBackground: {
    flexDirection: 'row', backgroundColor: '#F1F5F9',
    borderRadius: 16, padding: 4, marginBottom: 20,
  },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: 'bold', color: '#8CA0B3' },
  tabTextActive: { color: '#2C3A47' },

  filterLabel: { fontSize: 14, fontWeight: 'bold', color: '#8CA0B3', marginBottom: 10 },
  difficultyScroll: { gap: 10, paddingBottom: 4 },
  difficultyPill: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 2, borderColor: '#E2E8F0',
    backgroundColor: '#FFF',
  },
  difficultyText: { fontSize: 14, fontWeight: 'bold', color: '#8CA0B3' },
  difficultyTextSelected: { color: '#FFF' },

  scrollContent: { padding: 20, paddingBottom: 60, gap: 16 },
  
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 20, padding: 16,
    borderWidth: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  iconBox: {
    width: 56, height: 56, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginRight: 16,
  },
  cardTextContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3A47', marginBottom: 4 },
  cardSub: { fontSize: 14, color: '#8CA0B3', fontWeight: '600' },
  
  timeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12,
  },
  timeText: { fontSize: 14, fontWeight: 'bold', color: '#2C3A47' }
});