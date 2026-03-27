import { useState, useEffect } from 'react';
import { playCorrectSound, playWrongSound, playVictorySound } from '../utils/audio';

const pointMultiplier = [1, 2, 3, 4, 5]; // up to 5 correct answers

const GameScreen = ({ players, currentPlayerIndex, question, onEndTurn }) => {
  const [shuffledAnswers, setShuffledAnswers] = useState([]);
  const [clickedAnswers, setClickedAnswers] = useState([]); // Array of string answers
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0); // 0 to 5
  const [turnPoints, setTurnPoints] = useState(0);
  const [hasFailed, setHasFailed] = useState(false);

  const currentPlayer = players[currentPlayerIndex];

  useEffect(() => {
    // Reset state for the new turn (each player gets a fresh turn state, even if same question)
    setClickedAnswers([]);
    setConsecutiveCorrect(0);
    setTurnPoints(0);
    setHasFailed(false);

    // Shuffle the exact same 10 answers differently for this player
    const allAnswers = [...question.correct, ...question.wrong];
    const shuffled = allAnswers.sort(() => Math.random() - 0.5);
    setShuffledAnswers(shuffled);
  }, [currentPlayerIndex, question]);

  const handleAnswerClick = (ans) => {
    // Prevent clicking if failed, or already clicked
    if (hasFailed || clickedAnswers.includes(ans)) return;

    const isCorrect = question.correct.includes(ans);
    
    setClickedAnswers((prev) => [...prev, ans]);

    if (isCorrect) {
      if (consecutiveCorrect + 1 === 5) {
        playVictorySound();
      } else {
        playCorrectSound();
      }

      const earned = pointMultiplier[consecutiveCorrect] || 0; // safe fallback
      setTurnPoints((prev) => prev + earned);
      setConsecutiveCorrect((prev) => prev + 1);

      // If they answered all 5 correct, force end turn automatically
      if (consecutiveCorrect + 1 === 5) {
        setTimeout(() => {
           onEndTurn(turnPoints + earned);
        }, 1500); // Let them see they won this turn
      }
    } else {
      // Failed!
      playWrongSound();

      setHasFailed(true);
      setTurnPoints(0); // lose ALL turn points
      
      // Auto end turn after 2 seconds so they see their mistake
      setTimeout(() => {
        onEndTurn(0);
      }, 2000);
    }
  };

  const handleEndTurnManually = () => {
    onEndTurn(turnPoints);
  };

  return (
    <div className="game-screen">
      <div className="top-dashboard">
        {/* All Players Scoreboard */}
        <div className="scoreboard glass">
          <h3>Skóre hráčů</h3>
          <ul>
            {players.map((p, i) => (
              <li key={i} className={i === currentPlayerIndex ? 'active-player-score' : ''}>
                <span>{p.name}</span>
                <span>
                  {p.score} b
                  {i === currentPlayerIndex && turnPoints > 0 && !hasFailed && (
                    <span className="live-points" title="Nahráno v tomto tahu">(+{turnPoints})</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Current Turn Status */}
        <div className="turn-status glass highlight-neon">
          <h2>Na řadě: <span className="player-highlight">{currentPlayer.name}</span></h2>
          <div className="points-accumulator">
            <span className="label">Získáno tento tah:</span>
            <span className={`points ${hasFailed ? 'failed' : 'earning'}`}>
              {turnPoints} b
            </span>
            {!hasFailed && consecutiveCorrect < 5 && consecutiveCorrect > 0 && (
              <span className="next-reward">Další správná = +{pointMultiplier[consecutiveCorrect]} b</span>
            )}
          </div>
        </div>
      </div>

      <div className="main-play-area">
        <div className="question-card glass">
          <h1>{question.question}</h1>
        </div>

        <div className="answers-grid">
          {shuffledAnswers.map((ans, idx) => {
            let className = "answer-btn";
            if (clickedAnswers.includes(ans)) {
              if (question.correct.includes(ans)) {
                className += " correct pulse";
              } else {
                className += " wrong shake";
              }
            } else if (hasFailed) {
              // If failed, disable others but optionally show which were correct
              className += " disabled";
            }

            return (
              <button 
                key={idx} 
                className={className} 
                disabled={clickedAnswers.includes(ans) || hasFailed || consecutiveCorrect >= 5}
                onClick={() => handleAnswerClick(ans)}
              >
                {ans}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="actions">
          {consecutiveCorrect > 0 && consecutiveCorrect < 5 && !hasFailed && (
            <button className="btn-bank" onClick={handleEndTurnManually}>
              Ukončit tah a zapsat {turnPoints} {turnPoints === 1 ? 'bod' : turnPoints >= 2 && turnPoints <= 4 ? 'body' : 'bodů'}
            </button>
          )}
          {hasFailed && (
             <div className="fail-message slide-up">
               Špatně! Ztrácíš rozehrané body. Následuje další hráč...
             </div>
          )}
          {consecutiveCorrect === 5 && !hasFailed && (
             <div className="success-message pulse">
               Skvělé! Odhalil jsi všechny správné odpovědi. Zapisují se body...
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameScreen;
