import { useState, useEffect } from 'react';
import { Question } from '@/types/quiz';

export function useQuiz(questions: Question[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  
  // Marca o momento em que a pergunta apareceu na tela
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [earnedXp, setEarnedXp] = useState(0);

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedOption === currentQuestion?.correctOptionId;

  // Reseta o cronômetro sempre que a questão muda
  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentIndex]);

  const selectOption = (optionId: string) => {
    if (!isAnswered) setSelectedOption(optionId);
  };

  const confirmAnswer = () => {
    if (selectedOption) {
      setIsAnswered(true);
      
      let xpToAward = 0;
      if (selectedOption === currentQuestion.correctOptionId) {
        // Cálculo estilo Kahoot: Base de 1000 pontos.
        // Perde pontos quanto mais tempo demorar (ex: 20 pontos a cada segundo)
        const timeTakenSeconds = (Date.now() - questionStartTime) / 1000;
        const speedDeduction = Math.floor(timeTakenSeconds * 20);
        
        // Garante que ganha no mínimo 500 pontos se acertar, mesmo demorando
        xpToAward = Math.max(500, 1000 - speedDeduction);
      }
      setEarnedXp(xpToAward);
      return xpToAward; // Retorna o XP para a tela principal atualizar o estado
    }
    return 0;
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setEarnedXp(0);
    }
  };

  return {
    currentQuestion,
    selectedOption,
    isAnswered,
    isCorrect,
    earnedXp,
    selectOption,
    confirmAnswer,
    nextQuestion,
  };
}