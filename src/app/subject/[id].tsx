import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// MOCK: BANCO DE DADOS DINÂMICO DAS MATÉRIAS
const SUBJECT_DB: Record<string, any> = {
  matematica: {
    name: "Matemática",
    color: "#FF4B4B",
    icon: "calculator",
    progress: 45, // % de domínio
    topics: [
      { id: 1, title: "Matemática Básica", videos: 5, completed: true },
      { id: 2, title: "Geometria Plana", videos: 8, completed: false },
      { id: 3, title: "Análise Combinatória", videos: 4, completed: false },
    ],
    references: [
      {
        id: 1,
        type: "book",
        title: "Fundamentos de Matemática Elementar - Vol 1",
        author: "Gelson Iezzi",
      },
      {
        id: 2,
        type: "link",
        title: "Resumão: Fórmulas de Geometria",
        author: "Equipe App",
      },
    ],
  },
  fisica: {
    name: "Física",
    color: "#58CC02",
    icon: "atom",
    progress: 20,
    topics: [
      { id: 1, title: "Cinemática", videos: 6, completed: true },
      {
        id: 2,
        title: "Dinâmica e Leis de Newton",
        videos: 7,
        completed: false,
      },
    ],
    references: [
      {
        id: 1,
        type: "book",
        title: "Tópicos de Física - Vol 1",
        author: "Gualter, Newton, Helou",
      },
    ],
  },
};

export default function SubjectHubScreen() {
  const router = useRouter();
  // Pega o ID da matéria vindo da URL
  const { id } = useLocalSearchParams<{ id: string }>();

  // Se o ID não existir no mock, usa um genérico para não quebrar a tela
  const subjectData =
    SUBJECT_DB[id || "matematica"] || SUBJECT_DB["matematica"];

  // Controle de Abas Internas
  const [activeTab, setActiveTab] = useState<"aulas" | "pratica" | "materiais">(
    "aulas",
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: subjectData.color }]}
    >
      {/* 1. HEADER COLORIDO (Muda de acordo com a matéria) */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <FontAwesome5 name="arrow-left" size={20} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Módulo de Estudo</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.heroSection}>
        <View style={styles.heroIconBox}>
          <FontAwesome5
            name={subjectData.icon}
            size={32}
            color={subjectData.color}
          />
        </View>
        <Text style={styles.heroSubjectName}>{subjectData.name}</Text>

        {/* Barra de Domínio (Progresso Geral) */}
        <View style={styles.domainContainer}>
          <View style={styles.domainHeader}>
            <Text style={styles.domainText}>Seu domínio</Text>
            <Text style={styles.domainValue}>{subjectData.progress}%</Text>
          </View>
          <View style={styles.domainBarBg}>
            <View
              style={[
                styles.domainBarFill,
                { width: `${subjectData.progress}%` },
              ]}
            />
          </View>
        </View>
      </View>

      {/* 2. CORPO BRANCO ARREDONDADO (Estilo premium EdTech) */}
      <View style={styles.contentSheet}>
        {/* NAVEGAÇÃO DE ABAS */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "aulas" && {
                borderBottomColor: subjectData.color,
                borderBottomWidth: 3,
              },
            ]}
            onPress={() => setActiveTab("aulas")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "aulas" && {
                  color: subjectData.color,
                  fontWeight: "bold",
                },
              ]}
            >
              Trilha de Aulas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "pratica" && {
                borderBottomColor: subjectData.color,
                borderBottomWidth: 3,
              },
            ]}
            onPress={() => setActiveTab("pratica")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "pratica" && {
                  color: subjectData.color,
                  fontWeight: "bold",
                },
              ]}
            >
              Prática
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "materiais" && {
                borderBottomColor: subjectData.color,
                borderBottomWidth: 3,
              },
            ]}
            onPress={() => setActiveTab("materiais")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "materiais" && {
                  color: subjectData.color,
                  fontWeight: "bold",
                },
              ]}
            >
              Materiais
            </Text>
          </TouchableOpacity>
        </View>

        {/* CONTEÚDO DAS ABAS */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ABA: TRILHA DE AULAS */}
          {activeTab === "aulas" && (
            <View>
              <Text style={styles.sectionSubtitle}>
                Assuntos cobrados no ENEM organizados por incidência.
              </Text>

              {subjectData.topics.map((topic: any, index: number) => (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.topicCard}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push(`/subject/lesson/${topic.id}` as any)
                  }
                >
                  <View
                    style={[
                      styles.topicIndexBox,
                      topic.completed && { backgroundColor: subjectData.color },
                    ]}
                  >
                    {topic.completed ? (
                      <FontAwesome5 name="check" size={14} color="#FFF" />
                    ) : (
                      <Text style={styles.topicIndexText}>{index + 1}</Text>
                    )}
                  </View>

                  <View style={styles.topicInfo}>
                    <Text style={styles.topicTitle}>{topic.title}</Text>
                    <Text style={styles.topicSub}>
                      {topic.videos} videoaulas • Teoria completa
                    </Text>
                  </View>

                  <FontAwesome5
                    name="play-circle"
                    size={24}
                    color={topic.completed ? subjectData.color : "#E2E8F0"}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ABA: PRÁTICA (Onde o jogo acontece) */}
          {activeTab === "pratica" && (
            <View>
              <Text style={styles.sectionSubtitle}>
                Gere simulados apenas com questões de {subjectData.name}.
              </Text>

              <View style={styles.practiceGrid}>
                {/* Fácil */}
                <TouchableOpacity
                  style={[styles.practiceCard, { borderColor: "#58CC02" }]}
                >
                  <View
                    style={[
                      styles.practiceIconBox,
                      { backgroundColor: "#F0FDF4" },
                    ]}
                  >
                    <FontAwesome5 name="leaf" size={20} color="#58CC02" />
                  </View>
                  <Text style={styles.practiceTitle}>Nível Fácil</Text>
                  <Text style={styles.practiceSub}>Fixação básica</Text>
                </TouchableOpacity>

                {/* Médio */}
                <TouchableOpacity
                  style={[styles.practiceCard, { borderColor: "#FF9600" }]}
                >
                  <View
                    style={[
                      styles.practiceIconBox,
                      { backgroundColor: "#FFF9E6" },
                    ]}
                  >
                    <FontAwesome5 name="fire" size={20} color="#FF9600" />
                  </View>
                  <Text style={styles.practiceTitle}>Nível Médio</Text>
                  <Text style={styles.practiceSub}>Padrão ENEM</Text>
                </TouchableOpacity>

                {/* Difícil */}
                <TouchableOpacity
                  style={[styles.practiceCard, { borderColor: "#FF4B4B" }]}
                >
                  <View
                    style={[
                      styles.practiceIconBox,
                      { backgroundColor: "#FFF5F5" },
                    ]}
                  >
                    <FontAwesome5 name="skull" size={20} color="#FF4B4B" />
                  </View>
                  <Text style={styles.practiceTitle}>Nível Difícil</Text>
                  <Text style={styles.practiceSub}>Para gabaritar</Text>
                </TouchableOpacity>

                {/* Tudo */}
                <TouchableOpacity
                  style={[
                    styles.practiceCard,
                    {
                      borderColor: subjectData.color,
                      backgroundColor: subjectData.color,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.practiceIconBox,
                      { backgroundColor: "rgba(255,255,255,0.2)" },
                    ]}
                  >
                    <FontAwesome5 name="random" size={20} color="#FFF" />
                  </View>
                  <Text style={[styles.practiceTitle, { color: "#FFF" }]}>
                    Misto (Simulado)
                  </Text>
                  <Text
                    style={[
                      styles.practiceSub,
                      { color: "rgba(255,255,255,0.8)" },
                    ]}
                  >
                    30 Questões
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Atalhos para Raio-X e Caderno */}
              <Text style={[styles.sectionSubtitle, { marginTop: 24 }]}>
                Ferramentas da Matéria
              </Text>

              <TouchableOpacity
                style={styles.toolCard}
                onPress={() =>
                  router.push({
                    pathname: "/stats/errors",
                    params: { area: subjectData.name },
                  } as any)
                }
              >
                <FontAwesome5
                  name="microscope"
                  size={20}
                  color="#FF4B4B"
                  style={{ width: 30 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.toolTitle}>Raio-X de Erros</Text>
                  <Text style={styles.toolSub}>
                    Ver onde estou errando em {subjectData.name}
                  </Text>
                </View>
                <FontAwesome5 name="chevron-right" size={14} color="#E2E8F0" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.toolCard}
                onPress={() =>
                  router.push({
                    pathname: "/notes/index",
                    params: { tab: "questions" },
                  } as any)
                }
              >
                <FontAwesome5
                  name="book-open"
                  size={20}
                  color="#F1C40F"
                  style={{ width: 30 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.toolTitle}>Meu Caderno</Text>
                  <Text style={styles.toolSub}>
                    Acessar minhas anotações desta matéria
                  </Text>
                </View>
                <FontAwesome5 name="chevron-right" size={14} color="#E2E8F0" />
              </TouchableOpacity>
            </View>
          )}

          {/* ABA: MATERIAIS / REFERÊNCIAS */}
          {activeTab === "materiais" && (
            <View>
              <Text style={styles.sectionSubtitle}>
                Livros base, apostilas e links úteis.
              </Text>

              {subjectData.references.map((ref: any) => (
                <View key={ref.id} style={styles.refCard}>
                  <View style={styles.refIconBox}>
                    <FontAwesome5
                      name={ref.type === "book" ? "book" : "link"}
                      size={18}
                      color="#8CA0B3"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.refTitle}>{ref.title}</Text>
                    <Text style={styles.refAuthor}>{ref.author}</Text>
                  </View>
                  <TouchableOpacity style={styles.refActionBtn}>
                    <Text style={styles.refActionText}>
                      {ref.type === "book" ? "Comprar" : "Acessar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, // A cor de fundo vem dinâmica inline

  // HEADER COLORIDO
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  backButton: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    textTransform: "uppercase",
    opacity: 0.9,
  },

  heroSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  heroSubjectName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
  },

  domainContainer: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 16,
    borderRadius: 16,
  },
  domainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  domainText: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  domainValue: { color: "#FFF", fontWeight: "bold", fontSize: 14 },
  domainBarBg: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  domainBarFill: { height: "100%", backgroundColor: "#FFF", borderRadius: 3 },

  // CORPO BRANCO
  contentSheet: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -20,
  },

  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
  },
  tabButton: { flex: 1, paddingVertical: 16, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "bold", color: "#8CA0B3" },

  scrollContent: { padding: 20, paddingBottom: 60 },
  sectionSubtitle: {
    fontSize: 14,
    color: "#8CA0B3",
    marginBottom: 20,
    lineHeight: 20,
  },

  // ABA AULAS
  topicCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  topicIndexBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  topicIndexText: { fontSize: 14, fontWeight: "bold", color: "#8CA0B3" },
  topicInfo: { flex: 1, paddingRight: 12 },
  topicTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2C3A47",
    marginBottom: 4,
  },
  topicSub: { fontSize: 12, color: "#8CA0B3" },

  // ABA PRÁTICA
  practiceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  practiceCard: {
    width: "48%",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "flex-start",
  },
  practiceIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  practiceTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2C3A47",
    marginBottom: 2,
  },
  practiceSub: { fontSize: 12, color: "#8CA0B3" },

  toolCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  toolTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2C3A47",
    marginBottom: 2,
  },
  toolSub: { fontSize: 12, color: "#8CA0B3" },

  // ABA MATERIAIS
  refCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  refIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  refTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2C3A47",
    marginBottom: 2,
  },
  refAuthor: { fontSize: 12, color: "#8CA0B3" },
  refActionBtn: {
    backgroundColor: "#F0F9FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  refActionText: { fontSize: 12, fontWeight: "bold", color: "#1CB0F6" },
});
