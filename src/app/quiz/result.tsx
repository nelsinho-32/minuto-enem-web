import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useUserStore } from '@/store/useUserStore';

export default function ResultScreen() {
  const router = useRouter();
  const { xp, streak } = useUserStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <FontAwesome5 name="trophy" size={80} color="#F1C40F" style={styles.icon} />
        
        <Text style={styles.title}>Sessão Concluída!</Text>
        <Text style={styles.subtitle}>Você está ficando cada vez mais preparado para o ENEM.</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <FontAwesome5 name="star" size={24} color="#F1C40F" solid />
            <Text style={styles.statLabel}>XP Total</Text>
            <Text style={styles.statValue}>{xp}</Text>
          </View>

          <View style={styles.statBox}>
            <FontAwesome5 name="fire-alt" size={24} color="#FF9600" />
            <Text style={styles.statLabel}>Ofensiva</Text>
            <Text style={styles.statValue}>{streak}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.mainButton} 
          onPress={() => router.replace('/')} // Volta para a Home
        >
          <Text style={styles.mainButtonText}>Voltar ao Início</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3A47',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8CA0B3',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 20,
    width: '100%',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 14,
    color: '#8CA0B3',
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3A47',
  },
  footer: {
    padding: 20,
  },
  mainButton: {
    backgroundColor: '#1CB0F6', // Azul estilo Duolingo para finalizar
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#1CB0F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  mainButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});