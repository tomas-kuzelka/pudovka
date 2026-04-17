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

  const cumulativePoints = [1, 3, 6, 10, 15];

  return (
    <div className="game-screen-mobile">
      <div className="gsm-top">
        <div className="gsm-players">
          {players.map((p, i) => (
            <div 
              key={i} 
              className={`gsm-player-card ${i === currentPlayerIndex ? 'active' : ''}`}
            >
              <div className="gsm-pname">{p.name}</div>
              <div className="gsm-pscore">{p.score}</div>
            </div>
          ))}
        </div>
        
        <h2 className="gsm-question">{question.question}</h2>
      </div>

      <div className="gsm-tracker-box">
        <div className="thermometer">
          <div className="thermometer-fill" style={{ width: `${(consecutiveCorrect / 5) * 100}%` }}></div>
          <div className="thermometer-steps">
            {cumulativePoints.map((pts, idx) => {
              const isAchieved = consecutiveCorrect > idx;
              return (
                <div key={idx} className={`thermometer-step ${isAchieved ? 'achieved' : ''}`}>
                  {pts}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="gsm-bottom">
        <div className="gsm-answers">
          {shuffledAnswers.map((ans, idx) => {
            let className = "gsm-btn";
            if (clickedAnswers.includes(ans)) {
              if (question.correct.includes(ans)) {
                className += " correct pulse";
              } else {
                className += " wrong shake";
              }
            } else if (hasFailed) {
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

        <div className="gsm-actions">
          <button 
            className="gsm-konec-btn" 
            onClick={handleEndTurnManually}
            disabled={hasFailed || consecutiveCorrect >= 5}
          >
            Ukončit tah a zapsat {turnPoints} {turnPoints === 1 ? 'bod' : turnPoints >= 2 && turnPoints <= 4 ? 'body' : 'bodů'}
          </button>
          {hasFailed && (
             <div className="gsm-message fail slide-up">
               Špatně! Následuje další hráč...
             </div>
          )}
          {consecutiveCorrect === 5 && !hasFailed && (
             <div className="gsm-message success pulse">
               Vše správně! Skvělé.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GameScreen;
