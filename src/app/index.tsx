import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Href, useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { useUserStore } from "@/store/useUserStore";

export default function HomeScreen() {
  const router = useRouter();
  const { xp, streak, avatar } = useUserStore();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]),
    ).start();
  }, []);

  const weekDays = [
    { label: "D", active: false },
    { label: "S", active: true },
    { label: "T", active: true },
    { label: "Q", active: false },
    { label: "Q", active: true },
    { label: "S", active: true },
    { label: "S", active: true, isToday: true },
  ];

  const enemSubjects = [
    {
      id: "lingua-portuguesa",
      name: "Português",
      icon: "book-open",
      color: "#FF4B4B",
    },
    { id: "literatura", name: "Literatura", icon: "book", color: "#FF4B4B" },
    { id: "artes", name: "Artes", icon: "palette", color: "#FF4B4B" },
    {
      id: "ingles-ou-espanhou",
      name: "Idiomas",
      icon: "globe",
      color: "#FF4B4B",
    },
    {
      id: "educacao-fisica",
      name: "Ed. Física",
      icon: "running",
      color: "#FF4B4B",
    },

    {
      id: "matematica",
      name: "Matemática",
      icon: "calculator",
      color: "#1CB0F6",
    },

    { id: "historia", name: "História", icon: "landmark", color: "#FF9600" },
    { id: "geografia", name: "Geografia", icon: "map", color: "#FF9600" },
    { id: "filosofia", name: "Filosofia", icon: "brain", color: "#FF9600" },
    { id: "sociologia", name: "Sociologia", icon: "users", color: "#FF9600" },

    { id: "biologia", name: "Biologia", icon: "leaf", color: "#58CC02" },
    { id: "quimica", name: "Química", icon: "flask", color: "#58CC02" },
    { id: "fisica", name: "Física", icon: "atom", color: "#58CC02" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Olá, Futuro Federal!</Text>
          <Text style={styles.subtitle}>O que vamos estudar hoje?</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Badge de XP */}
          <View style={styles.xpBadge}>
            <FontAwesome5 name="star" size={14} color="#F1C40F" solid />
            <Text style={styles.xpText}>{xp}</Text>
          </View>

          {/* Atalho para o Perfil com Foto Dinâmica */}
          <TouchableOpacity
            style={styles.profileButton}
            activeOpacity={0.8}
            onPress={() => router.push("/profile" as any)}
          >
            {avatar ? (
              <Image
                source={{ uri: avatar }}
                style={styles.headerAvatarImage}
              />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <FontAwesome5 name="user" size={14} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. CALENDÁRIO DE OFENSIVA */}
        <TouchableOpacity
          style={styles.section}
          activeOpacity={0.7}
          onPress={() => router.push("/streak")}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sua Ofensiva</Text>
            <View style={styles.streakBadge}>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <FontAwesome5 name="fire-alt" size={16} color="#FF9600" />
              </Animated.View>
              <Text style={styles.streakText}>{streak} dias</Text>
            </View>
          </View>
          <View style={styles.calendarCard}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.dayContainer}>
                <View
                  style={[
                    styles.dayCircle,
                    day.active && styles.dayActive,
                    day.isToday && styles.dayToday,
                  ]}
                >
                  {day.active && (
                    <Animated.View
                      style={{ transform: [{ scale: pulseAnim }] }}
                    >
                      <FontAwesome5 name="fire-alt" size={14} color="#FF9600" />
                    </Animated.View>
                  )}
                </View>
                <Text
                  style={[styles.dayLabel, day.isToday && styles.dayLabelToday]}
                >
                  {day.label}
                </Text>
              </View>
            ))}
          </View>
        </TouchableOpacity>

        {/* ========================================== */}
        {/* NOVA SEÇÃO: MINHA TURMA                    */}
        {/* ========================================== */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Minha Turma</Text>
            <TouchableOpacity>
              <Text style={styles.addClassText}>+ Código da Turma</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            {/* Vai para a Tela de Tarefas (Questões) */}
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: "#F0F9FF", borderColor: "#BAE6FD" },
              ]}
              activeOpacity={0.7}
              onPress={() => router.push("/classes/tasks" as any)}
            >
              <FontAwesome5 name="tasks" size={24} color="#1CB0F6" />
              <Text style={styles.cardTitle}>Tarefas</Text>
              <Text style={styles.cardSub}>2 listas pendentes</Text>
            </TouchableOpacity>

            {/* Vai para a Tela de Materiais (Teoria/Vídeos) */}
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: "#F8FAFC", borderColor: "#E2E8F0" },
              ]}
              activeOpacity={0.7}
              onPress={() => router.push("/classes/materials" as any)}
            >
              <FontAwesome5 name="folder-open" size={24} color="#8CA0B3" />
              <Text style={styles.cardTitle}>Materiais</Text>
              <Text style={styles.cardSub}>Resumos e vídeos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. MODOS DE JOGO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Modos de Estudo</Text>

          <TouchableOpacity
            style={[
              styles.mainActionCard,
              { backgroundColor: "#58CC02", shadowColor: "#58CC02" },
            ]}
            activeOpacity={0.8}
            onPress={() => router.push("/quiz")}
          >
            <View style={styles.mainActionIcon}>
              <FontAwesome5 name="dice" size={24} color="#FFF" />
            </View>
            <View style={styles.mainActionText}>
              <Text style={styles.mainActionTitle}>Treino Aleatório</Text>
              <Text style={styles.mainActionSub}>
                Questões variadas de todas as áreas
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.secondaryActionCard,
                { backgroundColor: "#CE82FF", shadowColor: "#CE82FF" },
              ]}
              activeOpacity={0.8}
              onPress={() => router.push("/trails" as Href)}
            >
              <FontAwesome5
                name="route"
                size={20}
                color="#FFF"
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.secondaryActionTitle}>
                Trilhas de{"\n"}Questões
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryActionCard,
                { backgroundColor: "#FF9600", shadowColor: "#FF9600" },
              ]}
              activeOpacity={0.8}
              onPress={() => router.push("/challenge" as Href)}
            >
              <FontAwesome5
                name="bolt"
                size={20}
                color="#FFF"
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.secondaryActionTitle}>
                Desafio{"\n"}Diário
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 4. DISCIPLINAS DO ENEM */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Matérias do ENEM</Text>
          <View style={styles.gridContainer}>
            {enemSubjects.map((subject, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.gridItem, { borderLeftColor: subject.color }]}
                activeOpacity={0.7}
                onPress={() => router.push(`/subject/${subject.id}` as any)}
              >
                <FontAwesome5
                  name={subject.icon}
                  size={16}
                  color={subject.color}
                  style={{ marginRight: 10 }}
                />
                <Text style={styles.gridItemText}>{subject.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 5. ANÁLISE DE DESEMPENHO (NOVO FORMATO LISTA) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desempenho e Evolução</Text>

          <TouchableOpacity
            style={[styles.analysisCard, { borderLeftColor: "#1CB0F6" }]}
            activeOpacity={0.7}
            onPress={() => router.push("/stats" as Href)}
          >
            <View style={[styles.analysisIcon, { backgroundColor: "#E0F2FE" }]}>
              <FontAwesome5 name="chart-line" size={20} color="#1CB0F6" />
            </View>
            <View style={styles.analysisTextContent}>
              <Text style={styles.analysisTitle}>Estatísticas de Acertos</Text>
              <Text style={styles.analysisSub}>
                Taxa de precisão geral e média de tempo (ex: 2m15s) para cada
                acerto.
              </Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color="#E2E8F0" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.analysisCard, { borderLeftColor: "#FF4B4B" }]}
            activeOpacity={0.7}
            onPress={() => router.push("/stats/errors")}
          >
            <View style={[styles.analysisIcon, { backgroundColor: "#FFE4E6" }]}>
              <FontAwesome5 name="microscope" size={20} color="#FF4B4B" />
            </View>
            <View style={styles.analysisTextContent}>
              <Text style={styles.analysisTitle}>Raio-X de Erros</Text>
              <Text style={styles.analysisSub}>
                Veja o que melhorar, o tempo gasto nas falhas e as soluções
                comentadas.
              </Text>
            </View>
            <FontAwesome5 name="chevron-right" size={16} color="#E2E8F0" />
          </TouchableOpacity>
        </View>

        {/* 6. CADERNO DE ANOTAÇÕES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Meu Caderno</Text>
          <View style={styles.row}>
            {/* Vai para o Caderno na aba de Questões */}
            <TouchableOpacity
              style={[styles.card, styles.notesCard]}
              activeOpacity={0.7}
              onPress={() => router.push("/notes?tab=questions" as any)}
            >
              <FontAwesome5 name="bookmark" size={24} color="#F1C40F" />
              <Text style={styles.cardTitle}>Por Questão</Text>
              <Text style={styles.cardSub}>
                Macetes salvos direto na resolução.
              </Text>
            </TouchableOpacity>

            {/* Vai para o Caderno na aba de Resumos Gerais */}
            <TouchableOpacity
              style={[styles.card, styles.notesCard]}
              activeOpacity={0.7}
              onPress={() => router.push("/notes?tab=general" as any)}
            >
              <FontAwesome5 name="book-open" size={24} color="#8CA0B3" />
              <Text style={styles.cardTitle}>Gerais</Text>
              <Text style={styles.cardSub}>
                Resumos teóricos e fórmulas exatas.
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  greeting: { fontSize: 22, fontWeight: "bold", color: "#2C3A47" },
  subtitle: { fontSize: 14, color: "#8CA0B3", marginTop: 4 },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1C40F",
  },
  xpText: { fontSize: 16, fontWeight: "bold", color: "#D4A017" },
  scrollContent: { padding: 20, paddingBottom: 40 },

  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3A47",
    marginBottom: 12,
  },

  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  streakText: { fontSize: 14, fontWeight: "bold", color: "#FF9600" },

  calendarCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dayContainer: { alignItems: "center", gap: 8 },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F7F9FC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  dayActive: { backgroundColor: "#FFF0D4", borderColor: "#FFB84D" },
  dayToday: { borderColor: "#2C3A47", borderWidth: 2 },
  dayLabel: { fontSize: 12, color: "#8CA0B3", fontWeight: "bold" },
  dayLabelToday: { color: "#2C3A47" },

  mainActionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  mainActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  mainActionText: { flex: 1 },
  mainActionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 4,
  },
  mainActionSub: { fontSize: 13, color: "rgba(255,255,255,0.9)" },

  secondaryActionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: "flex-start",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  secondaryActionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    lineHeight: 22,
  },

  row: { flexDirection: "row", gap: 12 },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderLeftWidth: 4,
  },
  gridItemText: { fontSize: 14, fontWeight: "bold", color: "#4B5563", flex: 1 },

  // Estilos da Nova Seção de Análise
  analysisCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderLeftWidth: 6,
    marginBottom: 12,
  },
  analysisIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  analysisTextContent: { flex: 1, paddingRight: 10 },
  analysisTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3A47",
    marginBottom: 4,
  },
  analysisSub: { fontSize: 13, color: "#8CA0B3", lineHeight: 18 },

  // Estilos da Nova Seção de Anotações
  card: {
    flex: 1,
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "flex-start",
  },
  notesCard: { backgroundColor: "#F8FAFC" },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3A47",
    marginTop: 12,
    marginBottom: 4,
  },
  cardSub: { fontSize: 12, color: "#8CA0B3", lineHeight: 16 },

  // NOVOS ESTILOS: SALA DE AULA
  addClassText: { fontSize: 14, fontWeight: "bold", color: "#1CB0F6" },
  assignmentCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  assignmentIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FF4B4B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  assignmentInfo: { flex: 1, paddingRight: 10 },
  assignmentTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2C3A47",
    marginBottom: 2,
  },
  assignmentSub: { fontSize: 12, color: "#8CA0B3" },
  assignmentAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1CB0F6",
  },
  assignmentActionText: { fontSize: 12, fontWeight: "bold", color: "#1CB0F6" },

  headerLeft: { flex: 1 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#1CB0F6",
  },
  headerAvatarImage: { width: "100%", height: "100%" },
  headerAvatarPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1CB0F6",
    justifyContent: "center",
    alignItems: "center",
  },
});
