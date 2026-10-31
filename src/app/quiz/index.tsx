import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { api } from "@/services/api";
import { useUserStore } from "@/store/useUserStore";
import { StreakBadge } from "@/components/StreakBadge";
import { useQuestionsQuery, QuizQuestion } from "@/hooks/useQuestionsQuery";

const { width, height } = Dimensions.get("window");

export default function QuizScreen() {
  const router = useRouter();
  const { userId, addXp, incrementAnsweredQuestions, completeQuestionStreakUpdate } = useUserStore();

  const params = useLocalSearchParams();
  const day = params.day as string | undefined;
  const difficulty = params.difficulty as string | undefined;

  const parsedLimit = params.limit ? Number(params.limit) : 10;
  const initialTimeInSeconds = params.time
    ? Number(params.time) * 60
    : parsedLimit * 180;

  const {
    questions: fetchedQuestions,
    isLoading,
    error: queryError,
    isOfflineData,
    queueAnswerOffline,
  } = useQuestionsQuery({
    day,
    difficulty,
  });

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const [timeLeft, setTimeLeft] = useState(initialTimeInSeconds);
  const [totalTime] = useState(initialTimeInSeconds);

  useEffect(() => {
    if (fetchedQuestions && fetchedQuestions.length > 0 && quizQuestions.length === 0) {
      const shuffled = [...fetchedQuestions].sort(() => 0.5 - Math.random());
      setQuizQuestions(shuffled.slice(0, parsedLimit));
    }
  }, [fetchedQuestions, parsedLimit, quizQuestions.length]);

  // CRONÔMETRO OFICIAL: Roda solto e não pausa por nada, até chegar a zero!
  useEffect(() => {
    if (isLoading || timeLeft <= 0 || quizQuestions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0; // Para no zero exato
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, quizQuestions.length, timeLeft]);

  const handleSelectOption = (index: number) => {
    if (isAnswered || isSubmitting || timeLeft === 0) return;
    setSelectedOption(index);
  };

  /**
   * Envia a alternativa selecionada para a API.
   * Caso esteja offline, enfileira a resposta localmente via `queueAnswerOffline`
   * para ser sincronizada na tela de resultados (`src/app/quiz/result.tsx`) quando a conexão voltar.
   */
  const handleSubmitAnswer = async () => {
    const currentQuestion = quizQuestions[currentQuestionIdx];
    if (selectedOption === null || isAnswered || isSubmitting || !currentQuestion) {
      return;
    }

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    const xpEarned = isCorrect ? 100 : 0;

    setIsSubmitting(true);
    try {
      const response = await api.post("/questions/answer", {
        userId,
        questionId: currentQuestion.id,
        selectedOption,
      });

      completeQuestionStreakUpdate(response?.streak);
      if (isCorrect) addXp(xpEarned);
      incrementAnsweredQuestions();
      setIsAnswered(true);
    } catch {
      // Se falhar a conexão com a API, salva na fila offline para sincronização posterior
      await queueAnswerOffline({
        userId,
        questionId: currentQuestion.id,
        selectedOption,
        isCorrect,
        xpEarned,
      });

      completeQuestionStreakUpdate();
      if (isCorrect) addXp(xpEarned);
      incrementAnsweredQuestions();
      setIsAnswered(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (timeLeft === 0 || currentQuestionIdx === quizQuestions.length - 1) {
      router.replace("/quiz/result" as any);
      return;
    }
    setCurrentQuestionIdx((prev) => prev + 1);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  // Botão "Responder Depois"
  const handleSkipLater = () => {
    setSelectedOption(null);
    setQuizQuestions((prev) => {
      const updatedArray = [...prev];
      const skippedQuestion = updatedArray.splice(currentQuestionIdx, 1)[0];
      updatedArray.push(skippedQuestion);
      return updatedArray;
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerAll]}>
        <ActivityIndicator size="large" color="#1CB0F6" />
        <Text style={styles.loadingText}>Preparando sua prova...</Text>
      </SafeAreaView>
    );
  }

  if (queryError || quizQuestions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centerAll]}>
        <FontAwesome5
          name="exclamation-triangle"
          size={40}
          color="#FF4B4B"
          style={{ marginBottom: 16 }}
        />
        <Text style={styles.errorText}>
          {queryError?.message || "Nenhuma questão encontrada para estes filtros."}
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.retryText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const question = quizQuestions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === quizQuestions.length - 1;

  if (!question) return null;

  const timePercentage = (timeLeft / totalTime) * 100;

  let timerColor = "#58CC02";
  if (timePercentage < 25) timerColor = "#F1C40F";
  if (timeLeft === 0 || timePercentage < 10) timerColor = "#FF4B4B";

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
        >
          <FontAwesome5 name="times" size={20} color="#8CA0B3" />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${((currentQuestionIdx + 1) / quizQuestions.length) * 100}%`,
              },
            ]}
          />
        </View>

        <StreakBadge />
      </View>

      {isOfflineData && (
        <View style={styles.offlineBanner}>
          <FontAwesome5 name="cloud-download-alt" size={12} color="#D97706" />
          <Text style={styles.offlineBannerText}>
            Modo Offline ativo — Suas respostas serão sincronizadas ao concluir.
          </Text>
        </View>
      )}

      <View style={styles.timerWrapper}>
        <View style={styles.timerHeader}>
          <FontAwesome5 name="stopwatch" size={16} color={timerColor} />
          <Text style={[styles.timerText, { color: timerColor }]}>
            {timeString}
          </Text>
          <Text style={styles.progressText}>
            ({currentQuestionIdx + 1}/{quizQuestions.length})
          </Text>
        </View>
        <View style={styles.timerBarBg}>
          <Animated.View
            style={[
              styles.timerBarFill,
              { width: `${timePercentage}%`, backgroundColor: timerColor },
            ]}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.questionBox}>
          <View style={styles.tagsRow}>
            <Text style={styles.subjectLabel}>{question.subject}</Text>
            {question.year && (
              <Text style={styles.yearLabel}>ENEM {question.year}</Text>
            )}
          </View>

          <Markdown
            style={markdownStyles as any}
            rules={{
              image: (node) => {
                return (
                  <Image
                    key={node.key}
                    source={{ uri: node.attributes.src }}
                    style={{
                      width: width - 40,
                      height: height * 0.35,
                      marginVertical: 16,
                    }}
                    resizeMode="contain"
                  />
                );
              },
            }}
          >
            {(question.text || " ").replace(/\]\(\/\//g, "](https://")}
          </Markdown>
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((opt: string, index: number) => {
            const isSelected = selectedOption === index;
            const isCorrect = index === question.correctAnswer;

            let optionStyle: StyleProp<ViewStyle> = styles.optionButton;
            let optionTextStyle: StyleProp<TextStyle> = styles.optionText;

            if (!isAnswered && isSelected) {
              optionStyle = [styles.optionButton, styles.optionSelected];
              optionTextStyle = [styles.optionText, styles.optionTextSelected];
            } else if (isAnswered) {
              if (isCorrect) {
                optionStyle = [styles.optionButton, styles.optionCorrect];
                optionTextStyle = [styles.optionText, styles.optionTextCorrect];
              } else if (isSelected) {
                optionStyle = [styles.optionButton, styles.optionWrong];
                optionTextStyle = [styles.optionText, styles.optionTextWrong];
              } else {
                optionStyle = [styles.optionButton, { opacity: 0.5 }];
              }
            }

            return (
              <TouchableOpacity
                key={index}
                style={optionStyle}
                activeOpacity={0.7}
                onPress={() => handleSelectOption(index)}
                disabled={isAnswered || isSubmitting || timeLeft === 0}
              >
                <Text style={optionTextStyle}>{opt}</Text>

                {isAnswered && isCorrect && (
                  <FontAwesome5 name="check-circle" size={20} color="#58CC02" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <FontAwesome5 name="times-circle" size={20} color="#FF4B4B" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* BOTÃO DE ENVIAR RESPOSTA PARA A API */}
        {!isAnswered && timeLeft > 0 && (
          <TouchableOpacity
            style={[
              styles.submitAnswerButton,
              selectedOption === null && styles.submitAnswerButtonDisabled,
            ]}
            activeOpacity={0.8}
            disabled={selectedOption === null || isSubmitting}
            onPress={handleSubmitAnswer}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitAnswerText}>Confirmar Resposta</Text>
            )}
          </TouchableOpacity>
        )}

        {/* BOTÃO RESPONDER DEPOIS - Some se o tempo acabar */}
        {!isAnswered && !isLastQuestion && timeLeft > 0 && (
          <TouchableOpacity style={styles.skipButton} onPress={handleSkipLater}>
            <Text style={styles.skipButtonText}>Responder depois</Text>
            <FontAwesome5 name="angle-double-right" size={14} color="#8CA0B3" />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* EVENTO DO FISCAL: Tempo Esgotado */}
      {timeLeft === 0 && !isAnswered && (
        <View style={[styles.feedbackBottomSheet, styles.feedbackWrongBg]}>
          <View style={styles.feedbackHeader}>
            <View style={styles.feedbackTitleRow}>
              <FontAwesome5 name="clock" size={24} color="#FF4B4B" />
              <Text style={[styles.feedbackTitle, { color: "#FF4B4B" }]}>
                O Fiscal recolheu a prova!
              </Text>
            </View>
          </View>
          <Text style={styles.feedbackExplanation}>
            Seu tempo oficial esgotou. A gestão de tempo é um dos maiores
            desafios do ENEM, continue treinando sua agilidade!
          </Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.replace("/quiz/result" as any)}
          >
            <Text style={styles.continueButtonText}>Finalizar Treino</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* FEEDBACK NORMAL DA QUESTÃO */}
      {isAnswered && timeLeft > 0 && (
        <View
          style={[
            styles.feedbackBottomSheet,
            selectedOption === question.correctAnswer
              ? styles.feedbackCorrectBg
              : styles.feedbackWrongBg,
          ]}
        >
          <View style={styles.feedbackHeader}>
            <View style={styles.feedbackTitleRow}>
              <FontAwesome5
                name={
                  selectedOption === question.correctAnswer
                    ? "check-circle"
                    : "times-circle"
                }
                size={24}
                color={
                  selectedOption === question.correctAnswer
                    ? "#58CC02"
                    : "#FF4B4B"
                }
              />
              <Text
                style={[
                  styles.feedbackTitle,
                  {
                    color:
                      selectedOption === question.correctAnswer
                        ? "#58CC02"
                        : "#FF4B4B",
                  },
                ]}
              >
                {selectedOption === question.correctAnswer
                  ? "Mandou Bem!"
                  : "Acontece, vamos revisar!"}
              </Text>
            </View>
          </View>

          {selectedOption !== question.correctAnswer && question.errorRate && (
            <View style={styles.inepStatBox}>
              <FontAwesome5 name="chart-pie" size={14} color="#8CA0B3" />
              <Text style={styles.inepStatText}>
                <Text style={{ fontWeight: "bold" }}>Não desanime! </Text>
                {question.errorRate}% dos candidatos também erraram essa questão
                no ENEM oficial.
              </Text>
            </View>
          )}

          <Text style={styles.feedbackExplanation}>{question.explanation}</Text>

          <TouchableOpacity style={styles.continueButton} onPress={handleNext}>
            <Text style={styles.continueButtonText}>
              {isLastQuestion ? "Finalizar Treino" : "Próxima Questão"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const markdownStyles = StyleSheet.create({
  body: { fontSize: 16, color: "#2C3A47", lineHeight: 24 },
  p: { marginBottom: 12 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F9FC" },
  centerAll: { justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8CA0B3",
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: "#2C3A47",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  closeButton: { width: 40, height: 40, justifyContent: "center" },
  progressContainer: {
    flex: 1,
    height: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
    marginHorizontal: 12,
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#1CB0F6", borderRadius: 6 },
  progressText: { fontSize: 14, fontWeight: "bold", color: "#8CA0B3" },

  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderColor: "#FDE68A",
  },
  offlineBannerText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#B45309",
  },

  timerWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFF",
  },
  timerHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  timerText: { fontSize: 24, fontWeight: "bold" },
  timerBarBg: {
    width: "100%",
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
  },
  timerBarFill: { height: "100%", borderRadius: 4 },

  content: { flex: 1, padding: 20 },

  questionBox: { marginBottom: 30 },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  subjectLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#8CA0B3",
    textTransform: "uppercase",
  },
  yearLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#FFF",
    backgroundColor: "#1CB0F6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },

  optionsContainer: { gap: 12 },
  optionButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4B5563",
    flex: 1,
    paddingRight: 10,
  },

  optionSelected: {
    backgroundColor: "#F0F9FF",
    borderColor: "#1CB0F6",
  },
  optionTextSelected: {
    color: "#0284C7",
  },
  optionCorrect: { backgroundColor: "#F0FDF4", borderColor: "#58CC02" },
  optionTextCorrect: { color: "#3A8A00" },
  optionWrong: { backgroundColor: "#FFF5F5", borderColor: "#FF4B4B" },
  optionTextWrong: { color: "#C40000" },

  submitAnswerButton: {
    backgroundColor: "#58CC02",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#58CC02",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  submitAnswerButtonDisabled: {
    backgroundColor: "#CBD5E1",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitAnswerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  skipButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 12,
    gap: 8,
  },
  skipButtonText: { color: "#8CA0B3", fontSize: 15, fontWeight: "bold" },

  feedbackBottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 40,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  feedbackCorrectBg: {
    backgroundColor: "#F0FDF4",
    borderWidth: 2,
    borderColor: "#DCFCE7",
  },
  feedbackWrongBg: {
    backgroundColor: "#FFF5F5",
    borderWidth: 2,
    borderColor: "#FFE4E6",
  },

  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  feedbackTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  feedbackTitle: { fontSize: 20, fontWeight: "bold" },

  inepStatBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inepStatText: { flex: 1, fontSize: 13, color: "#4B5563", lineHeight: 18 },

  feedbackExplanation: {
    fontSize: 15,
    color: "#4B5563",
    lineHeight: 22,
    marginBottom: 24,
  },

  continueButton: {
    backgroundColor: "#1CB0F6",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    textTransform: "uppercase",
  },
});
