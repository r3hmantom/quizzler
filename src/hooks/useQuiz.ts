import { useState, useEffect, useCallback } from 'react';
import { QuizQuestion, QuizState, AnswerOption, QuizSessionMeta } from '../types';
import { saveQuizState, loadQuizState, loadSessionInfo, shuffleArray, saveSessionInfo } from '../utils/quizUtils';

const initialState: QuizState = {
  questions: [],
  currentQuestionIndex: 0,
  incorrectQuestions: [],
  problematicQuestions: [],
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
      const sessionInfo = loadSessionInfo();
      setState({
        ...savedState,
        problematicQuestions: savedState.problematicQuestions || [],
        subjectName: savedState.subjectName ?? sessionInfo?.subjectName,
        quizTitle: savedState.quizTitle ?? sessionInfo?.quizTitle,
        quizPath: savedState.quizPath ?? sessionInfo?.quizPath,
      });
    }
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    if (state.hasStarted) {
      saveQuizState(state);
      if (state.subjectName && state.quizTitle) {
        saveSessionInfo({
          subjectName: state.subjectName,
          quizTitle: state.quizTitle,
          quizPath: state.quizPath,
        });
      }
    }
  }, [state]);

  const startQuiz = useCallback((
    questions: QuizQuestion[], 
    startIndex: number = 0, 
    initialScore: number = 0, 
    isComplete: boolean = false,
    totalQuestionsCount?: number,
    incorrectQuestionsOverride?: QuizQuestion[],
    problematicQuestionsOverride?: { question: QuizQuestion; incorrectCount: number }[],
    sessionMeta?: QuizSessionMeta
  ) => {
    const shuffledQuestions = startIndex === 0 ? shuffleArray(questions) : questions;
    setState((prev) => {
      const nextSubject = sessionMeta?.subjectName ?? prev.subjectName;
      const nextTitle = sessionMeta?.quizTitle ?? prev.quizTitle;
      const nextPath = sessionMeta?.quizPath ?? prev.quizPath;
      const next = {
        questions: shuffledQuestions,
        currentQuestionIndex: startIndex,
        incorrectQuestions: incorrectQuestionsOverride || [],
        problematicQuestions: problematicQuestionsOverride || [],
        score: initialScore,
        totalQuestions: totalQuestionsCount || questions.length,
        isComplete: isComplete,
        hasStarted: true,
        subjectName: nextSubject,
        quizTitle: nextTitle,
        quizPath: nextPath,
      };
      if (nextSubject && nextTitle) {
        saveSessionInfo({
          subjectName: nextSubject,
          quizTitle: nextTitle,
          quizPath: nextPath,
        });
      }
      return next;
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
      setState(prev => {
        // Check if the question is already in incorrectQuestions
        const isAlreadyIncorrect = prev.incorrectQuestions.some(q => 
          q.question === currentQuestion.question
        );
        
        // Update problematicQuestions
        let updatedProblematicQuestions = [...prev.problematicQuestions];
        const existingIndex = updatedProblematicQuestions.findIndex(
          pq => pq.question.question === currentQuestion.question
        );
        
        if (existingIndex >= 0) {
          // Increment count for existing problematic question
          updatedProblematicQuestions[existingIndex] = {
            ...updatedProblematicQuestions[existingIndex],
            incorrectCount: updatedProblematicQuestions[existingIndex].incorrectCount + 1
          };
        } else if (isAlreadyIncorrect) {
          // Add as new problematic question if it's the second time incorrect
          updatedProblematicQuestions.push({
            question: currentQuestion,
            incorrectCount: 2
          });
        }
        
        return {
          ...prev,
          incorrectQuestions: [...prev.incorrectQuestions, currentQuestion],
          problematicQuestions: updatedProblematicQuestions
        };
      });
    }

    return { isCorrect };
  }, [getCurrentQuestion, checkAnswer]);

  const resetQuiz = useCallback(() => {
    setState(initialState);
  }, []);

  const skipQuestion = useCallback(() => {
    setState((prev) => {
      if (!prev.hasStarted || prev.isComplete) return prev;

      const nextIndex = prev.currentQuestionIndex + 1;

      if (nextIndex < prev.questions.length) {
        return { ...prev, currentQuestionIndex: nextIndex };
      }

      if (prev.incorrectQuestions.length > 0) {
        return {
          ...prev,
          questions: prev.incorrectQuestions,
          currentQuestionIndex: 0,
          incorrectQuestions: [],
        };
      }

      return { ...prev, isComplete: true };
    });
  }, []);

  const resumeQuiz = useCallback(() => {
    const savedState = loadQuizState();
    const sessionInfo = loadSessionInfo();
    if (savedState?.hasStarted && !savedState.isComplete) {
      setState({
        ...savedState,
        problematicQuestions: savedState.problematicQuestions || [],
        subjectName: savedState.subjectName ?? sessionInfo?.subjectName,
        quizTitle: savedState.quizTitle ?? sessionInfo?.quizTitle,
        quizPath: savedState.quizPath ?? sessionInfo?.quizPath,
      });
    }
  }, []);

  return {
    state,
    startQuiz,
    getCurrentQuestion,
    handleAnswer,
    checkAnswer,
    resetQuiz,
    skipQuestion,
    resumeQuiz,
  };
} 