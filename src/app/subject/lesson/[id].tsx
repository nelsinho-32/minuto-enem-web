import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

// MOCK: BANCO DE DADOS DA AULA
const LESSON_DB: Record<string, any> = {
  "1": {
    title: "Matemática Básica",
    subject: "Matemática",
    color: "#FF4B4B",
    videos: [
      {
        id: "v1",
        title: "Regra de Três Simples e Composta",
        duration: "15:20",
        thumbColor: "#2C3A47",
      },
      {
        id: "v2",
        title: "Porcentagem do Zero",
        duration: "22:10",
        thumbColor: "#34495E",
      },
      {
        id: "v3",
        title: "Frações e Decimais",
        duration: "18:45",
        thumbColor: "#1A252F",
      },
    ],
    theory:
      'A Matemática Básica é o alicerce para todas as outras áreas cobradas no ENEM. O domínio de frações, porcentagens e proporções não apenas garante acertos fáceis, mas acelera a resolução de questões de Química e Física.\n\nPorcentagem significa "por cento" (dividido por 100). É uma razão onde o denominador é sempre 100. Compreender que 20% é o mesmo que 0,2 ou 1/5 salva um tempo precioso no segundo dia de prova.',
    examples: [
      {
        question:
          "Se um produto custa R$ 120 e tem 15% de desconto, qual o valor final?",
        resolution:
          "1. Calcule 10% de 120 = 12\n2. Calcule 5% (metade de 10%) = 6\n3. Desconto total = 12 + 6 = 18\n4. Valor final = 120 - 18 = R$ 102,00.",
      },
    ],
    references: [
      "IEZZI, Gelson. Fundamentos de Matemática Elementar. Volume 11.",
      "BRASIL. Ministério da Educação. Matriz de Referência ENEM.",
    ],
  },
  // O fallback caso não encontre
  fallback: {
    title: "Cinemática",
    subject: "Física",
    color: "#58CC02",
    videos: [
      {
        id: "v1",
        title: "Movimento Retilíneo Uniforme",
        duration: "12:00",
        thumbColor: "#2C3A47",
      },
    ],
    theory: "Estudo do movimento dos corpos sem se preocupar com suas causas.",
    examples: [
      { question: "Fórmula da Velocidade?", resolution: "V = ΔS / Δt" },
    ],
    references: ["Referência Genérica"],
  },
};

export default function LessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  // Pega a aula pelo ID (ou usa o fallback para evitar erros)
  const lesson = LESSON_DB[id || "1"] || LESSON_DB["fallback"];

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#2C3A47" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {lesson.subject}
        </Text>
        <TouchableOpacity
          style={styles.notesButton}
          onPress={() => router.push("/notes/new" as any)}
        >
          <FontAwesome5 name="pen" size={16} color={lesson.color} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TÍTULO DA AULA */}
        <Text style={styles.lessonTitle}>{lesson.title}</Text>

        {/* 2. CARROSSEL DE VÍDEOS */}
        <Text style={styles.sectionLabel}>Videoaulas Recomendadas</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.videoScroll}
        >
          {lesson.videos.map((video: any) => (
            <TouchableOpacity
              key={video.id}
              style={styles.videoCard}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.videoThumbnail,
                  { backgroundColor: video.thumbColor },
                ]}
              >
                <FontAwesome5 name="play" size={24} color="#FFF" />
                <View style={styles.durationBadge}>
                  <Text style={styles.durationText}>{video.duration}</Text>
                </View>
              </View>
              <Text style={styles.videoTitle} numberOfLines={2}>
                {video.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.divider} />

        {/* 3. TEORIA (CONTEÚDO ESCRITO) */}
        <Text style={styles.sectionLabel}>Teoria Completa</Text>
        <Text style={styles.theoryText}>{lesson.theory}</Text>

        {/* 4. EXEMPLOS RESOLVIDOS */}
        {lesson.examples.length > 0 && (
          <View style={styles.examplesContainer}>
            <View style={styles.examplesHeader}>
              <FontAwesome5 name="lightbulb" size={18} color="#F1C40F" solid />
              <Text style={styles.examplesTitle}>Exemplo Prático</Text>
            </View>

            {lesson.examples.map((ex: any, idx: number) => (
              <View key={idx} style={styles.exampleBlock}>
                <Text style={styles.exampleQuestion}>Q: {ex.question}</Text>
                <View style={styles.exampleResolutionBox}>
                  <Text style={styles.exampleResolutionLabel}>Resolução:</Text>
                  <Text style={styles.exampleResolutionText}>
                    {ex.resolution}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.divider} />

        {/* 5. REFERÊNCIAS */}
        <View style={styles.referencesContainer}>
          <Text style={styles.referencesTitle}>
            Referências Bibliográficas:
          </Text>
          {lesson.references.map((ref: string, idx: number) => (
            <Text key={idx} style={styles.referenceItem}>
              • {ref}
            </Text>
          ))}
        </View>

        {/* 6. BOTÃO DE PRÁTICA */}
        <TouchableOpacity
          style={[styles.practiceButton, { backgroundColor: lesson.color }]}
          activeOpacity={0.8}
          onPress={() => router.push("/quiz" as any)}
        >
          <FontAwesome5 name="dumbbell" size={16} color="#FFF" />
          <Text style={styles.practiceButtonText}>Treinar este Assunto</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" }, // Fundo branco para leitura agradável

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#8CA0B3",
    textTransform: "uppercase",
    flex: 1,
    textAlign: "center",
  },
  notesButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },

  scrollContent: { padding: 20, paddingBottom: 60 },

  lessonTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3A47",
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3A47",
    marginBottom: 16,
  },

  // VÍDEOS
  videoScroll: { gap: 16, paddingBottom: 10 },
  videoCard: { width: 220 },
  videoThumbnail: {
    height: 120,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  durationBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: { color: "#FFF", fontSize: 11, fontWeight: "bold" },
  videoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4B5563",
    lineHeight: 20,
  },

  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 32 },

  // TEORIA
  theoryText: {
    fontSize: 16,
    color: "#4B5563",
    lineHeight: 26,
    textAlign: "justify",
  },

  // EXEMPLOS
  examplesContainer: {
    marginTop: 32,
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  examplesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  examplesTitle: { fontSize: 16, fontWeight: "bold", color: "#2C3A47" },
  exampleBlock: { marginBottom: 16 },
  exampleQuestion: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2C3A47",
    marginBottom: 12,
    lineHeight: 22,
  },
  exampleResolutionBox: {
    borderLeftWidth: 3,
    borderLeftColor: "#F1C40F",
    paddingLeft: 12,
  },
  exampleResolutionLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#8CA0B3",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  exampleResolutionText: { fontSize: 14, color: "#4B5563", lineHeight: 22 },

  // REFERÊNCIAS
  referencesContainer: {
    backgroundColor: "#F7F9FC",
    padding: 16,
    borderRadius: 12,
  },
  referencesTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#8CA0B3",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  referenceItem: {
    fontSize: 12,
    color: "#8CA0B3",
    fontStyle: "italic",
    marginBottom: 4,
    lineHeight: 18,
  },

  // BOTÃO PRÁTICA
  practiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 40,
  },
  practiceButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    textTransform: "uppercase",
  },
});
