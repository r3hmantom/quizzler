# Quizzler - Interactive Quiz App

A modern interactive quiz application with a Neubrutalism design that accepts JSON input and features smooth animations, engaging feedback, and local storage persistence.

## Features

- **JSON Input:** Easily import quiz questions using standard JSON format
- **Neubrutalism Design:** Bold typography, sharp edges, and visible UI elements
- **Interactive Feedback:** Engaging animations and feedback for correct and incorrect answers
- **Progress Indicator:** Clear visual indication of quiz progress
- **Re-attempt Mechanism:** Incorrectly answered questions get added to a queue for re-attempt
- **Local Storage:** Quiz progress is saved to allow resuming after page refresh
- **Responsive UI:** Works well on both desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v16.0.0 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/quizzler.git
   cd quizzler
   ```

2. Install dependencies:
   ```
   npm install
   # or 
   yarn
   ```

3. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

### JSON Format

Provide your quiz questions in the following JSON format:

```json
[
  {
    "question": "What is the capital of France?",
    "a": "London",
    "b": "Berlin",
    "c": "Paris",
    "d": "Madrid",
    "correctAnswer": "c"
  },
  {
    "question": "Which planet is known as the Red Planet?",
    "a": "Venus",
    "b": "Mars",
    "c": "Jupiter",
    "d": "Saturn",
    "correctAnswer": "b"
  },
  // ... more questions
]
```

### Using the App

1. **Start Screen:** Paste your JSON-formatted questions in the input field.
2. **Take the Quiz:** Answer each question by selecting an option and clicking "Check Answer".
3. **Get Feedback:** Receive immediate feedback on your answers with visual and auditory cues.
4. **Review Mistakes:** Incorrectly answered questions will be presented again later.
5. **See Results:** View your final score and performance after completing the quiz.

## Technology Stack

- React 19.0
- TypeScript
- Framer Motion for animations
- Local Storage API for persistence

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Design inspired by Neubrutalism design principles
- Quiz flow inspired by educational platforms like Duolingo
