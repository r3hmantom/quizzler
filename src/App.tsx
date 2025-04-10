import { useEffect, useState } from 'react'
import { useQuiz } from './hooks/useQuiz'
import JsonInput from './components/JsonInput'
import Question from './components/Question'
import Results from './components/Results'
import QuizBrowser from './components/QuizBrowser'
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
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [showQuizBrowser, setShowQuizBrowser] = useState(true);

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

  // Listen for custom navigation events
  useEffect(() => {
    const handleNavigateToSubjects = () => {
      setShowQuizBrowser(true);
      setShowJsonInput(false);
      setShowSavedQuizzes(false);
    };
    
    window.addEventListener('navigate-to-subjects', handleNavigateToSubjects);
    
    return () => {
      window.removeEventListener('navigate-to-subjects', handleNavigateToSubjects);
    };
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
      startQuiz(
        [...state.questions], 
        nextIndex, 
        state.score, 
        false, 
        state.totalQuestions, 
        state.incorrectQuestions,
        state.problematicQuestions
      );
    } else if (state.incorrectQuestions.length > 0) {
      // Move to incorrect questions
      startQuiz(
        state.incorrectQuestions, 
        0, 
        state.score, 
        false, 
        state.totalQuestions,
        [],
        state.problematicQuestions
      );
    } else {
      // Complete the quiz
      startQuiz(
        [...state.questions], 
        state.questions.length, 
        state.score, 
        true, 
        state.totalQuestions,
        state.incorrectQuestions,
        state.problematicQuestions
      );
    }
  };

  // Handle quiz restart
  const onRestart = () => {
    clearQuizState();
    resetQuiz();
    setShowQuizBrowser(true);
    setShowJsonInput(false);
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
      startQuiz(
        savedQuizzes[index].questions,
        0,    // startIndex
        0,    // initialScore
        false, // isComplete
        undefined, // totalQuestionsCount - use default
        [],   // incorrectQuestionsOverride
        []    // problematicQuestionsOverride
      );
      setShowSavedQuizzes(false);
      setShowQuizBrowser(false);
      setShowJsonInput(false);
    }
  };

  // Delete a saved quiz
  const deleteSavedQuiz = (index: number) => {
    const updatedQuizzes = savedQuizzes.filter((_, i) => i !== index);
    setSavedQuizzes(updatedQuizzes);
    localStorage.setItem('quizzler-saved-quizzes', JSON.stringify(updatedQuizzes));
  };

  // Handle starting a new quiz
  const handleStartNewQuiz = () => {
    setShowJsonInput(true);
    setShowQuizBrowser(false);
  };

  // Handle starting a quiz from the browser
  const handleStartBrowserQuiz = (questions: QuizQuestion[]) => {
    startQuiz(
      questions,
      0,    // startIndex
      0,    // initialScore
      false, // isComplete
      undefined, // totalQuestionsCount - use default
      [],   // incorrectQuestionsOverride
      []    // problematicQuestionsOverride
    );
    setShowQuizBrowser(false);
  };

  // Render the appropriate component based on quiz state
  const renderContent = () => {
    if (!state.hasStarted) {
      if (showQuizBrowser) {
        // Show quiz browser
        return (
          <>
            <div className="top-bar">
              <button 
                className="neu-button secondary"
                onClick={handleStartNewQuiz}
                style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                Create Custom Quiz
              </button>
              
              {savedQuizzes.length > 0 && (
                <button 
                  className="neu-button secondary"
                  onClick={() => {
                    setShowSavedQuizzes(true);
                    setShowQuizBrowser(false);
                  }}
                  style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', marginLeft: '0.5rem' }}
                >
                  View My Quizzes
                </button>
              )}
            </div>
            <QuizBrowser onStartQuiz={handleStartBrowserQuiz} />
          </>
        );
      } else if (showJsonInput) {
        // Show JSON input for creating a custom quiz
        return (
          <JsonInput 
            onStart={(questions) => {
              startQuiz(
                questions,
                0,    // startIndex
                0,    // initialScore
                false, // isComplete
                undefined, // totalQuestionsCount
                [],   // incorrectQuestionsOverride
                []    // problematicQuestionsOverride
              );
              setShowJsonInput(false);
            }} 
            savedQuizzes={savedQuizzes}
            onLoadSavedQuiz={loadSavedQuiz}
            onDeleteSavedQuiz={deleteSavedQuiz}
            showSavedQuizzes={showSavedQuizzes}
            setShowSavedQuizzes={(show) => {
              setShowSavedQuizzes(show);
              if (!show && !state.hasStarted) {
                setShowQuizBrowser(true);
                setShowJsonInput(false);
              }
            }}
          />
        );
      } else if (showSavedQuizzes) {
        // Show saved quizzes
        return (
          <JsonInput 
            onStart={(questions) => {
              startQuiz(
                questions,
                0,    // startIndex
                0,    // initialScore
                false, // isComplete
                undefined, // totalQuestionsCount
                [],   // incorrectQuestionsOverride
                []    // problematicQuestionsOverride
              );
            }}
            savedQuizzes={savedQuizzes}
            onLoadSavedQuiz={loadSavedQuiz}
            onDeleteSavedQuiz={deleteSavedQuiz}
            showSavedQuizzes={true}
            setShowSavedQuizzes={(show) => {
              setShowSavedQuizzes(show);
              if (!show && !state.hasStarted) {
                setShowQuizBrowser(true);
              }
            }}
          />
        );
      }
    }

    if (state.isComplete) {
      // Show results if quiz is complete
      return (
        <Results 
          score={state.score} 
          totalQuestions={state.totalQuestions} 
          onRestart={onRestart}
          onSaveQuiz={saveCurrentQuiz}
          problematicQuestions={state.problematicQuestions}
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
