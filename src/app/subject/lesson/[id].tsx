import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Dimensions, 
  ActivityIndicator, ScrollView, Image, Linking 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { useUserStore } from '@/store/useUserStore';
import { API_BASE_URL } from '@/constants/api';

const { width, height } = Dimensions.get('window');

const API_URL = `${API_BASE_URL}/lessons`;

export default function LessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { registerDailyPlay } = useUserStore();

  const [lesson, setLesson] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLesson() {
      try {
        const response = await fetch(`${API_URL}/${id}`);
        if (response.ok) {
          const data = await response.json();
          setLesson(data);
        }
      } catch (err) {
        console.error("Erro ao buscar aula:", err);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchLesson();
  }, [id]);

  if (isLoading || !lesson) {
    return (
      <SafeAreaView style={[styles.container, styles.centerAll]}>
        <ActivityIndicator size="large" color="#CE82FF" />
      </SafeAreaView>
    );
  }

  // Função para abrir o vídeo direto no app do YouTube do celular
  const openYouTube = (query: string) => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    Linking.openURL(url).catch(err => console.error("Erro ao abrir YouTube:", err));
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* ========================================== */}
      {/* 1. CABEÇALHO SUPERIOR */}
      {/* ========================================== */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <FontAwesome5 name="arrow-left" size={20} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {lesson.subject?.name || 'Aula'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.titleContainer}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <View style={styles.divider} />
        </View>

        {/* ========================================== */}
        {/* 2. ONDE ASSISTIR (CARROSSEL DE VÍDEOS) */}
        {/* ========================================== */}
        {lesson.videos && lesson.videos.length > 0 && (
          <View style={styles.carouselSection}>
            <Text style={styles.sectionSubtitle}>Onde Assistir</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContainer}>
              {lesson.videos.map((video: string, idx: number) => (
                <TouchableOpacity key={idx} style={styles.videoCard} activeOpacity={0.8} onPress={() => openYouTube(video)}>
                  <View style={styles.videoThumbnail}>
                    <FontAwesome5 name="youtube" size={32} color="#FF0000" />
                  </View>
                  <Text style={styles.videoTitle} numberOfLines={3}>{video}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ========================================== */}
        {/* 3. ASSUNTO DO CONTEÚDO (MARKDOWN) */}
        {/* ========================================== */}
        <View style={styles.markdownWrapper}>
          <Markdown 
            style={markdownStyles as any}
            rules={{
              image: (node) => (
                <View key={node.key} style={styles.imageContainer}>
                  <Image source={{ uri: node.attributes.src }} style={{ width: width - 48, height: height * 0.25 }} resizeMode="cover" />
                </View>
              )
            }}
          >
            {lesson.content}
          </Markdown>
        </View>

        {/* ========================================== */}
        {/* 4. OPÇÃO DE PRÁTICA (DIRETO PRO QUIZ) */}
        {/* ========================================== */}
        <TouchableOpacity 
          style={styles.practiceButton} 
          activeOpacity={0.8}
          onPress={async () => {
            await registerDailyPlay();
            router.push({
              pathname: '/quiz',
              params: { mode: 'pratica', subject: lesson.subject?.slug, limit: 10 }
            });
          }}
        >
          <FontAwesome5 name="dumbbell" size={20} color="#FFF" />
          <Text style={styles.practiceButtonText}>Concluir Aula e Praticar</Text>
        </TouchableOpacity>

        {/* ========================================== */}
        {/* 5. REFERÊNCIAS BIBLIOGRÁFICAS */}
        {/* ========================================== */}
        {lesson.references && lesson.references.length > 0 && (
          <View style={styles.referencesSection}>
            <Text style={styles.sectionSubtitle}>Referências</Text>
            {lesson.references.map((ref: string, idx: number) => (
              <View key={idx} style={styles.refItem}>
                <FontAwesome5 name="book" size={14} color="#8CA0B3" style={{ marginTop: 4 }} />
                <Text style={styles.refText}>{ref}</Text>
              </View>
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const markdownStyles = StyleSheet.create({
  body: { fontSize: 16, color: '#4B5563', lineHeight: 26 },
  heading2: { fontSize: 20, fontWeight: 'bold', color: '#2C3A47', marginTop: 24, marginBottom: 12 },
  strong: { color: '#2C3A47', fontWeight: '900' },
  em: { fontStyle: 'italic', color: '#8CA0B3' },
  bullet_list: { marginTop: 10, marginBottom: 10 },
  list_item: { marginBottom: 8, lineHeight: 24 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  centerAll: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: 'bold', color: '#8CA0B3', textTransform: 'uppercase' },
  
  scrollContent: { padding: 24, paddingBottom: 60 },
  
  titleContainer: { marginBottom: 24 },
  lessonTitle: { fontSize: 26, fontWeight: '900', color: '#2C3A47', lineHeight: 32 },
  divider: { height: 4, width: 40, backgroundColor: '#CE82FF', borderRadius: 2, marginTop: 16 },

  sectionSubtitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3A47', marginBottom: 12, marginTop: 8 },

  carouselSection: { marginBottom: 24, marginHorizontal: -24 },
  carouselContainer: { paddingHorizontal: 24, gap: 16 },
  videoCard: { width: 150, backgroundColor: '#F8FAFC', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  videoThumbnail: { height: 85, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  videoTitle: { padding: 12, fontSize: 13, fontWeight: 'bold', color: '#4B5563', lineHeight: 18 },

  markdownWrapper: { flex: 1, marginBottom: 32 },
  imageContainer: { marginVertical: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },

  practiceButton: { flexDirection: 'row', backgroundColor: '#1CB0F6', paddingVertical: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 12, marginBottom: 32, shadowColor: '#1CB0F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  practiceButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFF', textTransform: 'uppercase' },

  referencesSection: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  refItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  refText: { flex: 1, fontSize: 14, color: '#4B5563', lineHeight: 22 }
});
