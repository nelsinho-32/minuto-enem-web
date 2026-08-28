import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

// Substitua pelo seu IP
const API_URL = 'http://192.168.1.12:3333/api/subjects';

export default function SubjectScreen() {
  const router = useRouter();
  // O 'id' aqui pode ser o ID do banco ou o slug (ex: 'lingua-portuguesa')
  const { id } = useLocalSearchParams<{ id: string }>();

  const [subject, setSubject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSubject() {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Falha ao carregar as matérias');
        
        const data = await response.json();
        
        // Procura a matéria específica pelo ID ou pelo Slug
        const foundSubject = data.find((sub: any) => sub.id === id || sub.slug === id);
        
        if (!foundSubject) throw new Error('Matéria não encontrada no banco de dados.');
        
        setSubject(foundSubject);
      } catch (err) {
        setError('Não foi possível carregar os módulos desta matéria.');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) fetchSubject();
  }, [id]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerAll]}>
        <ActivityIndicator size="large" color="#1CB0F6" />
        <Text style={styles.loadingText}>Carregando trilha de estudos...</Text>
      </SafeAreaView>
    );
  }

  if (error || !subject) {
    return (
      <SafeAreaView style={[styles.container, styles.centerAll]}>
        <FontAwesome5 name="exclamation-triangle" size={40} color="#FF4B4B" style={{marginBottom: 16}} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{subject.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introBox}>
          <View style={styles.iconCircle}>
            <FontAwesome5 name={subject.icon || "book"} size={28} color="#FFF" />
          </View>
          <Text style={styles.introTitle}>Módulos de Estudo</Text>
          <Text style={styles.introDesc}>
            Selecione uma aula abaixo para dominar os conceitos principais e as técnicas de prova.
          </Text>
        </View>

        <View style={styles.lessonsContainer}>
          {subject.lessons.map((lesson: any, index: number) => (
            <TouchableOpacity 
              key={lesson.id} 
              style={styles.lessonCard}
              activeOpacity={0.7}
              // Ao clicar, navega para a tela de Leitura passando o ID da Aula
              onPress={() => router.push(`/subject/lesson/${lesson.id}`)}
            >
              <View style={styles.lessonNumberBox}>
                <Text style={styles.lessonNumberText}>{index + 1}</Text>
              </View>
              
              <View style={styles.lessonContent}>
                <Text style={styles.lessonTitle}>{lesson.title}</Text>
                <Text style={styles.lessonAction}>Ler material</Text>
              </View>

              <FontAwesome5 name="chevron-right" size={16} color="#E2E8F0" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  centerAll: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#8CA0B3', fontWeight: 'bold' },
  errorText: { fontSize: 16, color: '#4B5563', textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  retryButton: { backgroundColor: '#2C3A47', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#2C3A47' },
  
  scrollContent: { padding: 20, paddingBottom: 40 },
  
  introBox: { alignItems: 'center', marginBottom: 32, backgroundColor: '#FFF', padding: 24, borderRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#1CB0F6', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  introTitle: { fontSize: 22, fontWeight: '900', color: '#2C3A47', marginBottom: 8 },
  introDesc: { fontSize: 14, color: '#8CA0B3', textAlign: 'center', lineHeight: 20 },

  lessonsContainer: { gap: 12 },
  lessonCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 20, borderWidth: 2, borderColor: '#E2E8F0' },
  lessonNumberBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  lessonNumberText: { fontSize: 16, fontWeight: '900', color: '#8CA0B3' },
  lessonContent: { flex: 1 },
  lessonTitle: { fontSize: 16, fontWeight: 'bold', color: '#4B5563', marginBottom: 4 },
  lessonAction: { fontSize: 13, fontWeight: 'bold', color: '#1CB0F6', textTransform: 'uppercase' }
});