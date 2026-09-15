# Quizzler

Interactive quiz app with a Neubrutalism look. Paste JSON questions, take the quiz with animated feedback, and pick up where you left off thanks to localStorage. Built for desktop and mobile.

**Live demo:** [r3-quizzler.netlify.app](https://r3-quizzler.netlify.app/)

## Features

- **JSON quizzes** - Import questions in a simple JSON format
- **Neubrutalism UI** - Bold type, hard edges, high-contrast controls
- **Animated feedback** - Framer Motion responses for correct and incorrect answers
- **Progress tracking** - Clear progress through the quiz
- **Re-attempt queue** - Missed questions come back until you get them right
- **localStorage** - Progress survives a refresh
- **Mobile-ready** - Responsive layout for small screens

## Stack

- React 19
- Vite
- TypeScript
- Framer Motion

## Getting started

**Prerequisites:** Node.js 18+ and npm (or yarn / pnpm)

```bash
git clone https://github.com/r3hmantom/quizzler.git
cd quizzler
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Quiz JSON format

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
  }
]
```

## How to use

1. Paste your JSON on the start screen.
2. Pick an answer and check it.
3. Review mistakes when they return in the re-attempt queue.
4. See your score when the quiz is done.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck and production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## License

MIT
