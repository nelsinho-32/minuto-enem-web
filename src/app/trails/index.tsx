import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

// DADOS MOCKADOS: Separados por Dia do ENEM e por Dificuldade
const DAY_1_DATA = {
  description: "Linguagens, Ciências Humanas e Redação.",
  trails: [
    {
      id: 'd1_easy',
      title: 'Nível Fácil',
      description: 'Interpretação de textos, figuras de linguagem, ética e conceitos básicos de geografia.',
      icon: 'smile',
      color: '#58CC02', // Verde
      progress: 45,
    },
    {
      id: 'd1_med',
      title: 'Nível Médio',
      description: 'Escolas literárias, sociologia, filosofia clássica e História do Brasil.',
      icon: 'brain',
      color: '#FF9600', // Laranja
      progress: 15,
    },
    {
      id: 'd1_hard',
      title: 'Nível Difícil',
      description: 'Textos complexos, vanguarda artística, geopolítica e história geral aprofundada.',
      icon: 'fire-alt',
      color: '#FF4B4B', // Vermelho
      progress: 0,
    }
  ]
};

const DAY_2_DATA = {
  description: "Matemática e Ciências da Natureza.",
  trails: [
    {
      id: 'd2_easy',
      title: 'Nível Fácil',
      description: 'Regra de três, porcentagem, ecologia e conceitos básicos de física e química.',
      icon: 'smile',
      color: '#58CC02',
      progress: 80,
    },
    {
      id: 'd2_med',
      title: 'Nível Médio',
      description: 'Geometria, funções, genética, dinâmica e química inorgânica.',
      icon: 'brain',
      color: '#FF9600',
      progress: 30,
    },
    {
      id: 'd2_hard',
      title: 'Nível Difícil',
      description: 'Logaritmos, trigonometria, eletromagnetismo e química orgânica.',
      icon: 'fire-alt',
      color: '#FF4B4B',
      progress: 5,
    }
  ]
};

export default function TrailsScreen() {
  const router = useRouter();
  // Estado para controlar qual aba está ativa (1 para o 1º Dia, 2 para o 2º Dia)
  const [activeDay, setActiveDay] = useState<1 | 2>(1);

  // Define os dados atuais baseados na aba selecionada
  const currentData = activeDay === 1 ? DAY_1_DATA : DAY_2_DATA;

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.title}>Trilhas de Questões</Text>
        <View style={{ width: 40 }} /> 
      </View>

      {/* 2. SELETOR DE DIAS (TABS) */}
      <View style={styles.tabContainer}>
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
        <Text style={styles.dayDescription}>{currentData.description}</Text>
      </View>

      {/* 3. LISTA DE DIFICULDADES */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {currentData.trails.map((trail) => (
          <TouchableOpacity 
            key={trail.id} 
            style={[styles.card, { borderLeftColor: trail.color }]}
            activeOpacity={0.8}
            onPress={() => router.push('/quiz')} // Futuramente, enviará o nível de dificuldade como parâmetro
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: trail.color }]}>
                <FontAwesome5 name={trail.icon} size={24} color="#FFF" />
              </View>
              <View style={styles.cardTextContent}>
                <Text style={styles.cardTitle}>{trail.title}</Text>
                <Text style={styles.cardDescription}>{trail.description}</Text>
              </View>
            </View>

            {/* Barra de Progresso */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBackground}>
                <View style={[styles.progressFill, { width: `${trail.progress}%`, backgroundColor: trail.color }]} />
              </View>
              <Text style={styles.progressText}>{trail.progress}% concluído</Text>
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
  
  tabContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#8CA0B3',
  },
  tabTextActive: {
    color: '#2C3A47',
  },
  dayDescription: {
    fontSize: 14,
    color: '#8CA0B3',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  scrollContent: { padding: 20, paddingBottom: 60, gap: 16 },
  
  card: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderLeftWidth: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3A47',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#8CA0B3',
    lineHeight: 20,
  },
  
  progressContainer: {
    marginTop: 8,
  },
  progressBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#8CA0B3',
    textAlign: 'right',
  }
});