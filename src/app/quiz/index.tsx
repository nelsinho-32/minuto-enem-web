import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions, 
  StyleProp, ViewStyle, TextStyle, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Adicionamos useLocalSearchParams
import { FontAwesome5 } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

const { width } = Dimensions.get('window');
const TIME_PER_QUESTION = 180; 

// SEU IP AQUI: Mantenha o que estava funcionando para você!
const API_URL = 'http://192.168.1.15:3333/api/questions';

export default function QuizScreen() {
  const router = useRouter();
  // MÁGICA 1: Pega o parâmetro de modo de jogo da URL (ex: ?mode=tiro_curto)
  const { limit, difficulty, day } = useLocalSearchParams<{ limit: string, difficulty: string, day: string }>();

  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Falha ao conectar na API');
        
        const data = await response.json();
        
        // 2. Aplicando o Filtro do Dia do ENEM
        let filteredData = data;
        
        if (day === '1') {
          // 1º Dia: Linguagens e Humanas
          filteredData = filteredData.filter((q: any) => 
            q.area.toLowerCase().includes('humanas') || 
            q.area.toLowerCase().includes('linguagens')
          );
        } else if (day === '2') {
          // 2º Dia: Natureza e Matemática
          filteredData = filteredData.filter((q: any) => 
            q.area.toLowerCase().includes('natureza') || 
            q.area.toLowerCase().includes('matemática') || 
            q.area.toLowerCase().includes('matematica')
          );
        }

        // 3. Aplicando o Filtro de Dificuldade baseado na Taxa de Erro (TRI)
        if (difficulty === 'facil') {
          // Menos de 40% de erro
          filteredData = filteredData.filter((q: any) => q.errorRate < 40);
        } else if (difficulty === 'medio') {
          // Entre 40% e 70% de erro
          filteredData = filteredData.filter((q: any) => q.errorRate >= 40 && q.errorRate <= 70);
        } else if (difficulty === 'dificil') {
          // Mais de 70% de erro
          filteredData = filteredData.filter((q: any) => q.errorRate > 70);
        }
        // Se for 'misto', ignora esse bloco e traz tudo!

        // 4. Embaralha o resultado filtrado
        const shuffled = filteredData.sort(() => 0.5 - Math.random());
        
        // 5. Aplica a quantidade limite do botão clicado
        const questionLimit = limit ? parseInt(limit, 10) : 10;
        setQuizQuestions(shuffled.slice(0, questionLimit));

      } catch (err) {
        setError('Não foi possível carregar as questões.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuestions();
  }, [limit, difficulty, day]);
  
  useEffect(() => {
    if (isLoading || isAnswered || isTimeUp || quizQuestions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, isAnswered, isTimeUp, quizQuestions]);

  const handleTimeOut = () => {
    setIsTimeUp(true);
    setIsAnswered(true);
    setTimeSpent(TIME_PER_QUESTION);
  };

  const handleSelectOption = (index: number) => {
    if (isAnswered) return; 
    setSelectedOption(index);
    setIsAnswered(true);
    setTimeSpent(TIME_PER_QUESTION - timeLeft); 
  };

  const handleNext = () => {
    if (currentQuestionIdx === quizQuestions.length - 1) {
      router.replace('/');
      return;
    }
    setCurrentQuestionIdx((prev) => prev + 1);
    setSelectedOption(null);
    setIsAnswered(false);
    setIsTimeUp(false);
    setTimeLeft(TIME_PER_QUESTION);
    setTimeSpent(0);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerAll]}>
        <ActivityIndicator size="large" color="#1CB0F6" />
        <Text style={styles.loadingText}>Preparando seu treino...</Text>
      </SafeAreaView>
    );
  }

  if (error || quizQuestions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, styles.centerAll]}>
        <FontAwesome5 name="exclamation-triangle" size={40} color="#FF4B4B" style={{marginBottom: 16}} />
        <Text style={styles.errorText}>{error || 'Nenhuma questão encontrada.'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const question = quizQuestions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === quizQuestions.length - 1;

  const timePercentage = (timeLeft / TIME_PER_QUESTION) * 100;
  let timerColor = '#58CC02'; 
  if (timeLeft < 60) timerColor = '#F1C40F'; 
  if (timeLeft < 15) timerColor = '#FF4B4B'; 

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <FontAwesome5 name="times" size={20} color="#8CA0B3" />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={[styles.progressFill, { width: `${((currentQuestionIdx + 1) / quizQuestions.length) * 100}%` }]} />
        </View>
        
        <Text style={styles.progressText}>
          {currentQuestionIdx + 1}/{quizQuestions.length}
        </Text>
      </View>

      <View style={styles.timerWrapper}>
        <View style={styles.timerHeader}>
          <FontAwesome5 name="stopwatch" size={16} color={timerColor} />
          <Text style={[styles.timerText, { color: timerColor }]}>{timeString}</Text>
        </View>
        <View style={styles.timerBarBg}>
          <Animated.View style={[styles.timerBarFill, { width: `${timePercentage}%`, backgroundColor: timerColor }]} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.questionBox}>
          <View style={styles.tagsRow}>
            <Text style={styles.subjectLabel}>{question.subject}</Text>
            <Text style={styles.yearLabel}>ENEM {question.year}</Text>
          </View>
          
          {/* MÁGICA 4: O "|| ' '" garante que nunca será undefined, evitando o travamento da tela! */}
          <Markdown style={markdownStyles as any}>
            {question.text || ' '}
          </Markdown>
        </View>

        <View style={styles.optionsContainer}>
          {question.options.map((opt: string, index: number) => {
            const isSelected = selectedOption === index;
            const isCorrect = index === question.correctAnswer;
            
            let optionStyle: StyleProp<ViewStyle> = styles.optionButton;
            let optionTextStyle: StyleProp<TextStyle> = styles.optionText;
            
            if (isAnswered) {
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
                disabled={isAnswered}
              >
                <Text style={optionTextStyle}>{opt}</Text>
                
                {isAnswered && isCorrect && <FontAwesome5 name="check-circle" size={20} color="#58CC02" />}
                {isAnswered && isSelected && !isCorrect && <FontAwesome5 name="times-circle" size={20} color="#FF4B4B" />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isAnswered && (
        <View style={[
          styles.feedbackBottomSheet, 
          isTimeUp ? styles.feedbackWrongBg : (selectedOption === question.correctAnswer ? styles.feedbackCorrectBg : styles.feedbackWrongBg)
        ]}>
          <View style={styles.feedbackHeader}>
            <View style={styles.feedbackTitleRow}>
              <FontAwesome5 
                name={isTimeUp ? "clock" : (selectedOption === question.correctAnswer ? "check-circle" : "times-circle")} 
                size={24} 
                color={isTimeUp ? "#FF4B4B" : (selectedOption === question.correctAnswer ? "#58CC02" : "#FF4B4B")} 
              />
              <Text style={[
                styles.feedbackTitle, 
                { color: isTimeUp ? "#FF4B4B" : (selectedOption === question.correctAnswer ? "#58CC02" : "#FF4B4B") }
              ]}>
                {isTimeUp ? 'Tempo Esgotado!' : (selectedOption === question.correctAnswer ? 'Mandou Bem!' : 'Acontece, vamos revisar!')}
              </Text>
            </View>
          </View>

          {(!isTimeUp && selectedOption !== question.correctAnswer && question.errorRate) && (
            <View style={styles.inepStatBox}>
              <FontAwesome5 name="chart-pie" size={14} color="#8CA0B3" />
              <Text style={styles.inepStatText}>
                <Text style={{fontWeight: 'bold'}}>Não desanime! </Text> 
                {question.errorRate}% dos candidatos também erraram essa questão no ENEM oficial.
              </Text>
            </View>
          )}

          <Text style={styles.feedbackExplanation}>{question.explanation}</Text>

          <TouchableOpacity style={styles.continueButton} onPress={handleNext}>
            <Text style={styles.continueButtonText}>
              {isLastQuestion ? 'Finalizar Treino' : 'Continuar'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

    </SafeAreaView>
  );
}

const markdownStyles = StyleSheet.create({
  body: { fontSize: 17, color: '#2C3A47', lineHeight: 26 },
  image: { width: '100%', height: 250, resizeMode: 'contain', marginTop: 10, marginBottom: 10 },
  p: { marginBottom: 10 }
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  centerAll: { justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 16, fontSize: 16, color: '#8CA0B3', fontWeight: 'bold' },
  errorText: { fontSize: 16, color: '#4B5563', textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  retryButton: { backgroundColor: '#2C3A47', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  closeButton: { width: 40, height: 40, justifyContent: 'center' },
  progressContainer: { flex: 1, height: 12, backgroundColor: '#E2E8F0', borderRadius: 6, marginHorizontal: 16, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#1CB0F6', borderRadius: 6 },
  progressText: { fontSize: 14, fontWeight: 'bold', color: '#8CA0B3' },

  timerWrapper: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderColor: '#E2E8F0', backgroundColor: '#FFF' },
  timerHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 8, gap: 8 },
  timerText: { fontSize: 24, fontWeight: 'bold' },
  timerBarBg: { width: '100%', height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  timerBarFill: { height: '100%', borderRadius: 4 },

  content: { flex: 1, padding: 20 },
  
  questionBox: { marginBottom: 30 },
  tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  subjectLabel: { fontSize: 13, fontWeight: 'bold', color: '#8CA0B3', textTransform: 'uppercase' },
  yearLabel: { fontSize: 11, fontWeight: 'bold', color: '#FFF', backgroundColor: '#1CB0F6', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },

  optionsContainer: { gap: 12 },
  optionButton: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderWidth: 2, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  optionText: { fontSize: 16, fontWeight: 'bold', color: '#4B5563', flex: 1, paddingRight: 10 },
  
  optionCorrect: { backgroundColor: '#F0FDF4', borderColor: '#58CC02' },
  optionTextCorrect: { color: '#3A8A00' },
  optionWrong: { backgroundColor: '#FFF5F5', borderColor: '#FF4B4B' },
  optionTextWrong: { color: '#C40000' },

  feedbackBottomSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 24, paddingBottom: 40,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10,
  },
  feedbackCorrectBg: { backgroundColor: '#F0FDF4', borderWidth: 2, borderColor: '#DCFCE7' },
  feedbackWrongBg: { backgroundColor: '#FFF5F5', borderWidth: 2, borderColor: '#FFE4E6' },
  
  feedbackHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  feedbackTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  feedbackTitle: { fontSize: 20, fontWeight: 'bold' },

  inepStatBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', 
    padding: 12, borderRadius: 12, marginBottom: 12, gap: 10,
    borderWidth: 1, borderColor: '#E2E8F0'
  },
  inepStatText: { flex: 1, fontSize: 13, color: '#4B5563', lineHeight: 18 },

  feedbackExplanation: { fontSize: 15, color: '#4B5563', lineHeight: 22, marginBottom: 24 },

  continueButton: { backgroundColor: '#1CB0F6', paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  continueButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFF', textTransform: 'uppercase' }
});