import { useEffect, useState } from 'react'
import { useQuiz } from './hooks/useQuiz'
import JsonInput from './components/JsonInput'
import Question from './components/Question'
import Results from './components/Results'
import { QuizQuestion, AnswerOption } from './types'
import { clearQuizState } from './utils/quizUtils'
import './App.css'

function App() {
  const { 
    state, 
    startQuiz, 
    getCurrentQuestion, 
    handleAnswer, 
    resetQuiz 
  } = useQuiz();
  
  const [savedQuizzes, setSavedQuizzes] = useState<{ name: string, questions: QuizQuestion[] }[]>([]);
  const [showSavedQuizzes, setShowSavedQuizzes] = useState(false);

  // Load saved quizzes on mount
  useEffect(() => {
    const loadSavedQuizzes = () => {
      const saved = localStorage.getItem('quizzler-saved-quizzes');
      if (saved) {
        try {
          setSavedQuizzes(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved quizzes', e);
        }
      }
    };
    
    loadSavedQuizzes();
  }, []);

  // Create the sounds directory and add sound files
  useEffect(() => {
    const createSoundFiles = async () => {
      try {
        const response = await fetch('/sounds/correct.mp3');
        if (response.status === 404) {
          console.warn('Sound files not found. Please create the /public/sounds directory with correct.mp3 and incorrect.mp3');
        }
      } catch (error) {
        // Ignore errors
      }
    };
    
    createSoundFiles();
  }, []);

  // Handle answer selection
  const onAnswerQuestion = (answer: AnswerOption) => {
    return handleAnswer(answer) || { isCorrect: false };
  };

  // Handle manual navigation to next question
  const onNextQuestion = () => {
    if (state.currentQuestionIndex < state.questions.length - 1) {
      // Move to next question
      const nextIndex = state.currentQuestionIndex + 1;
      startQuiz([...state.questions], nextIndex);
    } else if (state.incorrectQuestions.length > 0) {
      // Move to incorrect questions
      startQuiz(state.incorrectQuestions, 0, state.score);
    } else {
      // Complete the quiz
      startQuiz([...state.questions], state.questions.length, state.score, true);
    }
  };

  // Handle quiz restart
  const onRestart = () => {
    clearQuizState();
    resetQuiz();
  };

  // Save current quiz
  const saveCurrentQuiz = (name: string) => {
    if (!state.questions.length) return;
    
    const newQuiz = {
      name,
      questions: state.questions
    };
    
    const updatedQuizzes = [...savedQuizzes, newQuiz];
    setSavedQuizzes(updatedQuizzes);
    localStorage.setItem('quizzler-saved-quizzes', JSON.stringify(updatedQuizzes));
  };

  // Load a saved quiz
  const loadSavedQuiz = (index: number) => {
    if (index >= 0 && index < savedQuizzes.length) {
      startQuiz(savedQuizzes[index].questions);
      setShowSavedQuizzes(false);
    }
  };

  // Delete a saved quiz
  const deleteSavedQuiz = (index: number) => {
    const updatedQuizzes = savedQuizzes.filter((_, i) => i !== index);
    setSavedQuizzes(updatedQuizzes);
    localStorage.setItem('quizzler-saved-quizzes', JSON.stringify(updatedQuizzes));
  };

  // Render the appropriate component based on quiz state
  const renderContent = () => {
    if (!state.hasStarted) {
      // Show JSON input if quiz hasn't started
      return (
        <>
          <JsonInput 
            onStart={startQuiz} 
            savedQuizzes={savedQuizzes}
            onLoadSavedQuiz={loadSavedQuiz}
            onDeleteSavedQuiz={deleteSavedQuiz}
            showSavedQuizzes={showSavedQuizzes}
            setShowSavedQuizzes={setShowSavedQuizzes}
          />
        </>
      );
    }

    if (state.isComplete) {
      // Show results if quiz is complete
      return (
        <Results 
          score={state.score} 
          totalQuestions={state.totalQuestions} 
          onRestart={onRestart}
          onSaveQuiz={saveCurrentQuiz}
        />
      );
    }

    // Show current question
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) {
      return <div>Loading question...</div>;
    }

    return (
      <Question 
        question={currentQuestion}
        onAnswer={onAnswerQuestion}
        onNext={onNextQuestion}
        questionNumber={state.currentQuestionIndex + 1}
        totalQuestions={state.questions.length}
        onRestart={onRestart}
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
