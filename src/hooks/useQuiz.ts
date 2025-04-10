import { useState, useEffect, useCallback } from 'react';
import { QuizQuestion, QuizState, AnswerOption } from '../types';
import { saveQuizState, loadQuizState, shuffleArray } from '../utils/quizUtils';

const initialState: QuizState = {
  questions: [],
  currentQuestionIndex: 0,
  incorrectQuestions: [],
  score: 0,
  totalQuestions: 0,
  isComplete: false,
  hasStarted: false
};

export function useQuiz() {
  const [state, setState] = useState<QuizState>(initialState);

  // Initialize from local storage on mount
  useEffect(() => {
    const savedState = loadQuizState();
    if (savedState) {
      setState(savedState);
    }
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    if (state.hasStarted) {
      saveQuizState(state);
    }
  }, [state]);

  const startQuiz = useCallback((
    questions: QuizQuestion[], 
    startIndex: number = 0, 
    initialScore: number = 0, 
    isComplete: boolean = false,
    totalQuestionsCount?: number,
    incorrectQuestionsOverride?: QuizQuestion[]
  ) => {
    const shuffledQuestions = startIndex === 0 ? shuffleArray(questions) : questions;
    setState({
      questions: shuffledQuestions,
      currentQuestionIndex: startIndex,
      incorrectQuestions: incorrectQuestionsOverride || [],
      score: initialScore,
      totalQuestions: totalQuestionsCount || questions.length,
      isComplete: isComplete,
      hasStarted: true
    });
  }, []);

  const getCurrentQuestion = useCallback(() => {
    if (!state.hasStarted || state.questions.length === 0) {
      return null;
    }
    return state.questions[state.currentQuestionIndex];
  }, [state.hasStarted, state.questions, state.currentQuestionIndex]);

  const checkAnswer = useCallback((selectedOption: AnswerOption) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return { isCorrect: false, correctAnswer: null };

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    return {
      isCorrect,
      correctAnswer: currentQuestion.correctAnswer
    };
  }, [getCurrentQuestion]);

  const handleAnswer = useCallback((selectedOption: AnswerOption) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;

    const { isCorrect } = checkAnswer(selectedOption);
    
    if (isCorrect) {
      setState(prev => ({
        ...prev,
        score: prev.score + 1
      }));
    } else {
      setState(prev => ({
        ...prev,
        incorrectQuestions: [...prev.incorrectQuestions, currentQuestion]
      }));
    }

    return { isCorrect };
  }, [getCurrentQuestion, checkAnswer]);

  const resetQuiz = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    state,
    startQuiz,
    getCurrentQuestion,
    handleAnswer,
    checkAnswer,
    resetQuiz
  };
} 