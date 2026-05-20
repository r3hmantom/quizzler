import { useEffect, useState } from 'react'
import { useQuiz } from './hooks/useQuiz'
import Question from './components/Question'
import Results from './components/Results'
import QuizBrowser from './components/QuizBrowser'
import { AnswerOption } from './types'
import {
  clearQuizState,
  clearSessionInfo,
  clearLastSelectedQuiz,
  loadQuizState,
  saveSessionInfo,
  saveLastSelectedQuiz,
  getPausedSessionDisplay,
} from './utils/quizUtils'
import { QuizQuestion, QuizSessionMeta } from './types'
import { migrateLegacyQuizzes } from './utils/userLibraryStorage'
import './App.css'

function App() {
  const {
    state,
    startQuiz,
    getCurrentQuestion,
    handleAnswer,
    resetQuiz,
    skipQuestion,
    resumeQuiz,
  } = useQuiz();

  const [showQuizBrowser, setShowQuizBrowser] = useState(() => {
    const saved = loadQuizState();
    return !(saved?.hasStarted && !saved.isComplete);
  });

  useEffect(() => {
    migrateLegacyQuizzes();
    // Hydrate resume banner labels for paused sessions missing metadata
    if (showQuizBrowser) getPausedSessionDisplay();
  }, []);

  useEffect(() => {
    if (state.hasStarted && !state.isComplete) {
      setShowQuizBrowser(false);
    }
  }, [state.hasStarted, state.isComplete]);

  useEffect(() => {
    const handleNavigateToSubjects = () => {
      setShowQuizBrowser(true);
    };

    window.addEventListener('navigate-to-subjects', handleNavigateToSubjects);
    return () => {
      window.removeEventListener('navigate-to-subjects', handleNavigateToSubjects);
    };
  }, []);

  useEffect(() => {
    const createSoundFiles = async () => {
      try {
        const response = await fetch('/sounds/correct.mp3');
        if (response.status === 404) {
          console.warn('Sound files not found. Add /public/sounds/correct.mp3 and incorrect.mp3');
        }
      } catch {
        // ignore
      }
    };
    createSoundFiles();
  }, []);

  const onAnswerQuestion = (answer: AnswerOption) => {
    return handleAnswer(answer) || { isCorrect: false };
  };

  const sessionMeta: QuizSessionMeta | undefined =
    state.subjectName && state.quizTitle
      ? {
          subjectName: state.subjectName,
          quizTitle: state.quizTitle,
          quizPath: state.quizPath,
        }
      : undefined;

  const advanceQuiz = () => {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      startQuiz(
        [...state.questions],
        state.currentQuestionIndex + 1,
        state.score,
        false,
        state.totalQuestions,
        state.incorrectQuestions,
        state.problematicQuestions,
        sessionMeta
      );
    } else if (state.incorrectQuestions.length > 0) {
      startQuiz(
        state.incorrectQuestions,
        0,
        state.score,
        false,
        state.totalQuestions,
        [],
        state.problematicQuestions,
        sessionMeta
      );
    } else {
      startQuiz(
        [...state.questions],
        state.questions.length,
        state.score,
        true,
        state.totalQuestions,
        state.incorrectQuestions,
        state.problematicQuestions,
        sessionMeta
      );
    }
  };

  const onNextQuestion = () => advanceQuiz();

  const onSkipQuestion = () => {
    skipQuestion();
  };

  const onExitQuiz = () => {
    setShowQuizBrowser(true);
  };

  const onRestart = () => {
    clearQuizState();
    clearSessionInfo();
    clearLastSelectedQuiz();
    resetQuiz();
    setShowQuizBrowser(true);
  };

  const handleStartBrowserQuiz = (
    questions: QuizQuestion[],
    meta: QuizSessionMeta
  ) => {
    saveSessionInfo(meta);
    saveLastSelectedQuiz(meta);
    clearQuizState();
    startQuiz(questions, 0, 0, false, undefined, [], [], meta);
    setShowQuizBrowser(false);
  };

  const handleResumeQuiz = () => {
    resumeQuiz();
    setShowQuizBrowser(false);
  };

  const pausedSession = showQuizBrowser ? getPausedSessionDisplay() : null;
  const hasPausedQuiz = !!pausedSession;

  const renderContent = () => {
    if (state.isComplete) {
      return (
        <Results
          score={state.score}
          totalQuestions={state.totalQuestions}
          onRestart={onRestart}
          problematicQuestions={state.problematicQuestions}
        />
      );
    }

    if (showQuizBrowser || !state.hasStarted) {
      return (
        <QuizBrowser
          onStartQuiz={handleStartBrowserQuiz}
          onResumeQuiz={handleResumeQuiz}
          hasPausedQuiz={hasPausedQuiz}
          pausedSubjectName={pausedSession?.subjectName}
          pausedQuizTitle={pausedSession?.quizTitle}
          pausedProgress={pausedSession?.progress}
        />
      );
    }

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) {
      return <div>Loading question...</div>;
    }

    const isRetryRound = state.questions.length < state.totalQuestions;

    return (
      <Question
        question={currentQuestion}
        onAnswer={onAnswerQuestion}
        onNext={onNextQuestion}
        onSkip={onSkipQuestion}
        onExit={onExitQuiz}
        questionNumber={state.currentQuestionIndex + 1}
        totalQuestions={state.questions.length}
        score={state.score}
        totalQuizQuestions={state.totalQuestions}
        isRetryRound={isRetryRound}
      />
    );
  };

  return (
    <div className="app-container">
      {renderContent()}
    </div>
  );
}

export default App;
