import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TrailsScreen() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<'1' | '2'>('1');

  // Nova função inteligente que recebe os 3 parâmetros da regra de negócio
  const startTrail = (difficulty: string, limit: number, timeInMinutes: number) => {
    router.push({
      pathname: '/quiz',
      params: { mode: 'trilha', day: selectedDay, difficulty, limit, time: timeInMinutes }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trilhas de Questões</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, selectedDay === '1' && styles.tabActive]}
          onPress={() => setSelectedDay('1')}
        >
          <Text style={[styles.tabText, selectedDay === '1' && styles.tabTextActive]}>1º Dia do ENEM</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, selectedDay === '2' && styles.tabActive]}
          onPress={() => setSelectedDay('2')}
        >
          <Text style={[styles.tabText, selectedDay === '2' && styles.tabTextActive]}>2º Dia do ENEM</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        {selectedDay === '1' ? 'Linguagens, Ciências Humanas e Redação.' : 'Matemática e Ciências da Natureza.'}
      </Text>

      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {/* NÍVEL FÁCIL: 10 Questões / 60 Minutos */}
        <TouchableOpacity style={[styles.card, { borderColor: '#58CC02' }]} onPress={() => startTrail('facil', 10, 60)}>
          <View style={[styles.iconBox, { backgroundColor: '#58CC02' }]}>
            <FontAwesome5 name="smile" size={24} color="#FFF" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Nível Fácil</Text>
            <Text style={styles.cardDesc}>10 questões • 60 min</Text>
          </View>
        </TouchableOpacity>

        {/* NÍVEL MÉDIO: 20 Questões / 90 Minutos */}
        <TouchableOpacity style={[styles.card, { borderColor: '#FF9600' }]} onPress={() => startTrail('medio', 20, 90)}>
          <View style={[styles.iconBox, { backgroundColor: '#FF9600' }]}>
            <FontAwesome5 name="brain" size={24} color="#FFF" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Nível Médio</Text>
            <Text style={styles.cardDesc}>20 questões • 90 min</Text>
          </View>
        </TouchableOpacity>

        {/* NÍVEL DIFÍCIL: 45 Questões / 150 Minutos */}
        <TouchableOpacity style={[styles.card, { borderColor: '#FF4B4B' }]} onPress={() => startTrail('dificil', 45, 150)}>
          <View style={[styles.iconBox, { backgroundColor: '#FF4B4B' }]}>
            <FontAwesome5 name="fire" size={24} color="#FFF" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Nível Difícil</Text>
            <Text style={styles.cardDesc}>45 questões • 150 min</Text>
          </View>
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
  subtitle: { textAlign: 'center', color: '#8CA0B3', marginTop: 12, fontStyle: 'italic', marginBottom: 8 },
  cardsContainer: { paddingHorizontal: 20, gap: 16 },
  card: { flexDirection: 'row', backgroundColor: '#FFF', padding: 16, borderRadius: 20, borderWidth: 2, alignItems: 'center' },
  iconBox: { width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3A47', marginBottom: 4 },
  cardDesc: { fontSize: 14, fontWeight: 'bold', color: '#8CA0B3' }
});