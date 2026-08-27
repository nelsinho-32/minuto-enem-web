import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function ChallengeScreen() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<'1' | '2'>('1');
  const [difficulty, setDifficulty] = useState<'facil' | 'medio' | 'dificil' | 'misto'>('misto');

  // Agora a função recebe o limite e o tempo em minutos
  const startChallenge = (limit: number, timeInMinutes: number) => {
    router.push({
      pathname: '/quiz',
      params: { mode: 'desafio', day: selectedDay, difficulty, limit, time: timeInMinutes }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Desafio contra o Tempo</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, selectedDay === '1' && styles.tabActive]} onPress={() => setSelectedDay('1')}>
          <Text style={[styles.tabText, selectedDay === '1' && styles.tabTextActive]}>1º Dia do ENEM</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, selectedDay === '2' && styles.tabActive]} onPress={() => setSelectedDay('2')}>
          <Text style={[styles.tabText, selectedDay === '2' && styles.tabTextActive]}>2º Dia do ENEM</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.difficultySection}>
        <Text style={styles.difficultyLabel}>Escolha a Dificuldade:</Text>
        <View style={styles.pillRow}>
          {['facil', 'medio', 'dificil', 'misto'].map((level) => (
            <TouchableOpacity 
              key={level} 
              style={[styles.pill, difficulty === level && styles.pillActive]}
              onPress={() => setDifficulty(level as any)}
            >
              <Text style={[styles.pillText, difficulty === level && styles.pillTextActive]}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.cardsContainer}>
        <TouchableOpacity style={[styles.card, { borderColor: '#1CB0F6' }]} onPress={() => startChallenge(1, 4)}>
          <View style={[styles.iconBox, { backgroundColor: '#1CB0F6' }]}><FontAwesome5 name="stopwatch" size={20} color="#FFF" /></View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Aquecimento</Text>
            <Text style={styles.cardDesc}>1 questão</Text>
          </View>
          <View style={styles.timeTag}><Text style={styles.timeTagText}>4 min</Text></View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { borderColor: '#58CC02' }]} onPress={() => startChallenge(5, 15)}>
          <View style={[styles.iconBox, { backgroundColor: '#58CC02' }]}><FontAwesome5 name="running" size={20} color="#FFF" /></View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Tiro Curto</Text>
            <Text style={styles.cardDesc}>5 questões</Text>
          </View>
          <View style={styles.timeTag}><Text style={styles.timeTagText}>15 min</Text></View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { borderColor: '#FF9600' }]} onPress={() => startChallenge(10, 30)}>
          <View style={[styles.iconBox, { backgroundColor: '#FF9600' }]}><FontAwesome5 name="dumbbell" size={20} color="#FFF" /></View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Resistência</Text>
            <Text style={styles.cardDesc}>10 questões</Text>
          </View>
          <View style={styles.timeTag}><Text style={styles.timeTagText}>30 min</Text></View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, { borderColor: '#FF4B4B' }]} onPress={() => startChallenge(15, 45)}>
          <View style={[styles.iconBox, { backgroundColor: '#FF4B4B' }]}><FontAwesome5 name="fire" size={20} color="#FFF" /></View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Simulação Real</Text>
            <Text style={styles.cardDesc}>15 questões</Text>
          </View>
          <View style={styles.timeTag}><Text style={styles.timeTagText}>45 min</Text></View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backButton: { width: 40 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#2C3A47' },
  tabContainer: { flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#E2E8F0', borderRadius: 16, padding: 4 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 15, fontWeight: 'bold', color: '#8CA0B3' },
  tabTextActive: { color: '#2C3A47' },
  difficultySection: { padding: 20 },
  difficultyLabel: { fontSize: 14, fontWeight: 'bold', color: '#8CA0B3', marginBottom: 12 },
  pillRow: { flexDirection: 'row', gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E2E8F0' },
  pillActive: { backgroundColor: '#CE82FF', borderColor: '#CE82FF' },
  pillText: { fontSize: 14, fontWeight: 'bold', color: '#8CA0B3' },
  pillTextActive: { color: '#FFF' },
  cardsContainer: { paddingHorizontal: 20, gap: 16 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 20, borderWidth: 2, alignItems: 'center' },
  iconBox: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3A47' },
  cardDesc: { fontSize: 14, color: '#8CA0B3' },
  timeTag: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  timeTagText: { fontSize: 12, fontWeight: 'bold', color: '#4B5563' }
});