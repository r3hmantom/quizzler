import { useState, useEffect } from 'react';
import { QuizQuestion, AnswerOption } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface QuestionProps {
  question: QuizQuestion;
  onAnswer: (answer: AnswerOption) => { isCorrect: boolean };
  onNext: () => void;
  onSkip: () => void;
  onExit: () => void;
  questionNumber: number;
  totalQuestions: number;
  score: number;
  totalQuizQuestions: number;
  isRetryRound?: boolean;
}

export default function Question({
  question,
  onAnswer,
  onNext,
  onSkip,
  onExit,
  questionNumber,
  totalQuestions,
  score,
  totalQuizQuestions,
  isRetryRound = false,
}: QuestionProps) {
  const [selectedOption, setSelectedOption] = useState<AnswerOption | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    setSelectedOption(null);
    setShowResult(false);
    setIsCorrect(false);
    setHasAnswered(false);
  }, [question]);

  const canSkip = !hasAnswered;

  const handleOptionClick = (option: AnswerOption) => {
    if (hasAnswered) return;
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption || hasAnswered) return;

    setHasAnswered(true);
    const result = onAnswer(selectedOption);
    setIsCorrect(result.isCorrect);
    setShowResult(true);

    if (result.isCorrect) {
      const sound = new Audio('/sounds/correct.mp3');
      sound.volume = 0.5;
      sound.play().catch(() => {});
    } else {
      const sound = new Audio('/sounds/incorrect.mp3');
      sound.volume = 0.5;
      sound.play().catch(() => {});
    }
  };

  const handleNextQuestion = () => {
    setTimeout(() => {
      onNext();
    }, 300);
  };

  const roundProgress =
    totalQuestions > 0 ? (questionNumber / totalQuestions) * 100 : 0;

  const roundLabel = isRetryRound
    ? 'Practice round (questions you missed)'
    : 'Main round';

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
        <div className="quiz-controls mb-3">
          <button
            className="neu-button secondary"
            onClick={onExit}
            style={{ fontSize: '0.85rem', padding: '0.5em 1em' }}
          >
            Exit Quiz
          </button>

          {canSkip ? (
            <button
              className="neu-button secondary"
              onClick={onSkip}
              style={{ fontSize: '0.85rem', padding: '0.5em 1em' }}
              title="Skip this question without answering (won't count as correct)"
            >
              Skip question
            </button>
          ) : (
            <span className="skip-hint" role="status">
              Answer saved — use <strong>Next question</strong> below
            </span>
          )}
        </div>

        <section className="quiz-status mb-3" aria-label="Quiz progress">
          <div className="quiz-status-row">
            <div className="quiz-status-block">
              <span className="quiz-status-label">Where you are</span>
              <span className="quiz-status-value">
                Question {questionNumber} of {totalQuestions}
              </span>
              <span className="quiz-status-sublabel">{roundLabel}</span>
            </div>
            <div className="quiz-status-block quiz-status-score">
              <span className="quiz-status-label">Your score</span>
              <span className="quiz-status-value">
                {score} of {totalQuizQuestions} correct
              </span>
              <span className="quiz-status-sublabel">Updates when you get one right</span>
            </div>
          </div>

          <div className="progress-labeled">
            <div className="progress-header">
              <span className="progress-title">Progress this round</span>
              <span className="progress-fraction">
                {questionNumber} / {totalQuestions}
              </span>
            </div>
            <div
              className="progress-container"
              role="progressbar"
              aria-valuenow={questionNumber}
              aria-valuemin={1}
              aria-valuemax={totalQuestions}
              aria-label={`Question ${questionNumber} of ${totalQuestions} in this round`}
            >
              <div
                className="progress-bar"
                style={{ width: `${roundProgress}%` }}
              />
            </div>
          </div>
        </section>

        <h2 className="mb-3">{question.question}</h2>

        <div className="option-container">
          {(['a', 'b', 'c', 'd'] as AnswerOption[]).map((option) => {
            let optionClassName = 'option-button';

            if (showResult) {
              if (option === question.correctAnswer) {
                optionClassName += ' correct';
              } else if (
                option === selectedOption &&
                option !== question.correctAnswer
              ) {
                optionClassName += ' incorrect';
              }
            } else if (option === selectedOption) {
              optionClassName += ' selected';
            }

            return (
              <motion.button
                key={option}
                className={optionClassName}
                onClick={() => handleOptionClick(option)}
                disabled={hasAnswered}
                whileTap={{ scale: 0.98 }}
                animate={
                  showResult && option === question.correctAnswer
                    ? { scale: [1, 1.05, 1] }
                    : showResult &&
                        option === selectedOption &&
                        !isCorrect
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

        <div className="mt-4 question-actions">
          {showResult && isCorrect ? (
            <motion.div
              className="action-block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="result-message correct-msg">Correct!</p>
              <button className="neu-button accent" onClick={handleNextQuestion}>
                Next question
              </button>
            </motion.div>
          ) : showResult && !isCorrect ? (
            <motion.div
              className="action-block text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="result-message incorrect-msg mb-2">
                Not quite — the correct answer was{' '}
                <strong>{question.correctAnswer.toUpperCase()}</strong>
              </p>
              <p className="action-hint mb-2">
                This question may come back later. Continue when you&apos;re ready.
              </p>
              <button className="neu-button accent" onClick={handleNextQuestion}>
                Next question
              </button>
            </motion.div>
          ) : (
            <button
              className="neu-button"
              onClick={handleCheckAnswer}
              disabled={!selectedOption}
            >
              Check answer
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
