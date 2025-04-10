import { useState, useEffect } from 'react';
import { QuizQuestion, AnswerOption } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionProps {
  question: QuizQuestion;
  onAnswer: (answer: AnswerOption) => { isCorrect: boolean };
  onNext: () => void;
  questionNumber: number;
  totalQuestions: number;
  onRestart: () => void;
}

export default function Question({ 
  question, 
  onAnswer, 
  onNext,
  questionNumber, 
  totalQuestions,
  onRestart
}: QuestionProps) {
  const [selectedOption, setSelectedOption] = useState<AnswerOption | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setShowResult(false);
    setIsCorrect(false);
    setIsDisabled(false);
  }, [question]);

  const handleOptionClick = (option: AnswerOption) => {
    if (isDisabled) return;
    
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || isDisabled) return;
    
    setIsDisabled(true);
    const result = onAnswer(selectedOption);
    setIsCorrect(result.isCorrect);
    setShowResult(true);
    
    // Play sound effect
    if (result.isCorrect) {
      const sound = new Audio('/sounds/correct.mp3');
      sound.volume = 0.5;
      sound.play().catch(() => {
        // Ignore audio play errors
      });
    } else {
      const sound = new Audio('/sounds/incorrect.mp3');
      sound.volume = 0.5;
      sound.play().catch(() => {
        // Ignore audio play errors
      });
    }
  };

  const handleNextQuestion = () => {
    setTimeout(() => {
      onNext();
    }, 300);
  };

  // Calculate progress percentage
  const progressPercentage = (questionNumber / totalQuestions) * 100;

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="neu-container"
        key={question.question}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
      >
        {/* Top navigation buttons */}
        <div className="quiz-controls mb-2">
          <button 
            className="neu-button secondary"
            onClick={onRestart}
            style={{ fontSize: '0.85rem', padding: '0.5em 1em' }}
          >
            New Quiz
          </button>
        </div>

        {/* Progress indicator */}
        <div className="mb-2">
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-center mb-3">
            Question {questionNumber} of {totalQuestions}
          </div>
        </div>
        
        {/* Question text */}
        <h2 className="mb-3">{question.question}</h2>
        
        {/* Options */}
        <div className="option-container">
          {(['a', 'b', 'c', 'd'] as AnswerOption[]).map((option) => {
            let optionClassName = "option-button";
            
            if (showResult) {
              if (option === question.correctAnswer) {
                optionClassName += " correct";
              } else if (option === selectedOption && option !== question.correctAnswer) {
                optionClassName += " incorrect";
              }
            } else if (option === selectedOption) {
              optionClassName += " selected";
            }
            
            return (
              <motion.button
                key={option}
                className={optionClassName}
                onClick={() => handleOptionClick(option)}
                disabled={isDisabled}
                whileTap={{ scale: 0.98 }}
                animate={
                  showResult && option === question.correctAnswer
                    ? { scale: [1, 1.05, 1] }
                    : showResult && option === selectedOption && !isCorrect
                    ? { x: [0, -5, 5, -5, 0] }
                    : {}
                }
                transition={{ duration: 0.5 }}
              >
                <span className="option-label">{option.toUpperCase()}</span>
                <span>{question[option]}</span>
              </motion.button>
            );
          })}
        </div>
        
        {/* Action buttons */}
        <div className="mt-4">
          {showResult && isCorrect ? (
            <motion.button 
              className="neu-button accent"
              onClick={handleNextQuestion}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Next Question
            </motion.button>
          ) : showResult && !isCorrect ? (
            <div className="text-center">
              <p className="mb-2">The correct answer was: {question.correctAnswer.toUpperCase()}</p>
              <motion.button 
                className="neu-button secondary"
                onClick={handleNextQuestion}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Next Question
              </motion.button>
            </div>
          ) : (
            <button 
              className="neu-button"
              onClick={handleCheckAnswer}
              disabled={!selectedOption || isDisabled}
            >
              Check Answer
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 