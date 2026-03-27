import { useState, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import TurnTransitionScreen from './components/TurnTransitionScreen';
import './App.css';

function App() {
  const [gameState, setGameState] = useState('setup'); // 'setup', 'playing', 'end'
  const [players, setPlayers] = useState([]);
  const [targetScore, setTargetScore] = useState(100);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  useEffect(() => {
    fetch('/pudovka/data/questions.json')
      .then((res) => res.json())
      .then((data) => {
        // Pre-process questions to pick exactly 5 correct and 5 wrong
        const processed = data.map(q => {
          const pickedCorrect = [...q.correct].sort(() => Math.random() - 0.5).slice(0, 5);
          const pickedWrong = [...q.wrong].sort(() => Math.random() - 0.5).slice(0, 5);
          return {
            ...q,
            originalCorrect: q.correct,
            originalWrong: q.wrong,
            correct: pickedCorrect,
            wrong: pickedWrong
          };
        });
        // Shuffle questions initially
        setQuestions(processed.sort(() => Math.random() - 0.5));
      })
      .catch((err) => console.error('Failed to load questions:', err));
  }, []);

  const startGame = (playersList, target) => {
    if (playersList.length === 0) return;
    setPlayers(playersList.map((name, i) => ({ id: i, name, score: 0 })));
    setTargetScore(target);
    setGameState('transition');
    setCurrentQuestionIndex(0);
    setCurrentPlayerIndex(0);
  };

  const endTurn = (pointsEarned) => {
    setPlayers(prevPlayers => {
      return prevPlayers.map((p, idx) => 
        idx === currentPlayerIndex ? { ...p, score: p.score + pointsEarned } : p
      );
    });

    // Check if anyone reached target score (wait until end of round)
    const isRoundEnd = currentPlayerIndex === players.length - 1;

    if (isRoundEnd) {
      setTimeout(() => {
        setPlayers((latestPlayers) => {
          const hasWinner = latestPlayers.some(p => p.score >= targetScore);
          if (hasWinner) {
            setGameState('end');
            return latestPlayers;
          }

          if (currentQuestionIndex + 1 < questions.length) {
            setCurrentQuestionIndex(prev => prev + 1);
            setCurrentPlayerIndex(0);
            setGameState('transition');
          } else {
            console.log("No more questions. Ending game.");
            setGameState('end');
          }
          return latestPlayers;
        });
      }, 500); // Small delay to let user see points before swapping screen
    } else {
      setTimeout(() => {
        setCurrentPlayerIndex(prev => prev + 1);
        setGameState('transition');
      }, 500);
    }
  };

  const resetGame = () => {
    setPlayers([]);
    // Pre-process and reshuffle questions again
    const reProcessed = questions.map(q => {
      const pickedCorrect = [...q.originalCorrect].sort(() => Math.random() - 0.5).slice(0, 5);
      const pickedWrong = [...q.originalWrong].sort(() => Math.random() - 0.5).slice(0, 5);
      return { ...q, correct: pickedCorrect, wrong: pickedWrong };
    });
    setQuestions(reProcessed.sort(() => Math.random() - 0.5));
    setGameState('setup');
  };

  if (gameState === 'setup') {
    return <SetupScreen onStart={startGame} />;
  }

  if (questions.length === 0) {
    return <div className="loading">Načítám hru...</div>;
  }

  if (gameState === 'transition') {
    return (
      <TurnTransitionScreen 
        nextPlayer={players[currentPlayerIndex]} 
        onReady={() => setGameState('playing')} 
      />
    );
  }

  if (gameState === 'playing') {
    return (
      <GameScreen 
        players={players}
        currentPlayerIndex={currentPlayerIndex}
        question={questions[currentQuestionIndex]}
        onEndTurn={endTurn}
      />
    );
  }

  if (gameState === 'end') {
    return <GameOverScreen players={players} onReset={resetGame} targetScore={targetScore} />;
  }

  return null;
}

export default App;
