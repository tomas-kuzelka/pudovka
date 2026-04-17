import { useState } from 'react';
import { isMuted, toggleMute } from '../utils/audio';

const SetupScreen = ({ onStart }) => {
  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('gamePlayers');
    return saved ? JSON.parse(saved) : ['Hráč 1', 'Hráč 2'];
  });
  const [targetScore, setTargetScore] = useState(() => {
    const saved = localStorage.getItem('gameTargetScore');
    return saved ? Number(saved) : 100;
  });
  const [newName, setNewName] = useState('');
  const [muted, setMuted] = useState(isMuted);

  const handleMuteToggle = () => {
    setMuted(toggleMute());
  };

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (newName.trim() !== '') {
      setPlayers([...players, newName.trim()]);
      setNewName('');
    }
  };

  const handleRemovePlayer = (index) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const handleStart = () => {
    if (players.length >= 2) {
      localStorage.setItem('gamePlayers', JSON.stringify(players));
      localStorage.setItem('gameTargetScore', targetScore.toString());
      onStart(players, targetScore);
    } else {
      alert("Pro hru jsou potřeba alespoň 2 hráči.");
    }
  };

  return (
    <div className="setup-screen card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className="title" style={{ margin: 0 }}>Pudovka</h1>
        <button 
          onClick={handleMuteToggle} 
          className="btn-add" 
          style={{ padding: '8px 16px', fontSize: '0.9rem', background: muted ? '#ef4444' : 'var(--glass-bg)' }}
        >
          {muted ? 'Zvuky: VYP' : 'Zvuky: ZAP'}
        </button>
      </div>
      
      <div className="settings-section" style={{ marginTop: '2rem' }}>
        <h2>Nastavení hry</h2>
        <div className="input-group">
          <label>Cílové skóre pro vítězství:</label>
          <input 
            type="number" 
            value={targetScore} 
            onChange={(e) => setTargetScore(Number(e.target.value))} 
            min="10" 
            step="10"
          />
        </div>
      </div>

      <div className="players-section">
        <h2>Hráči</h2>
        <form onSubmit={handleAddPlayer} className="add-player-form">
          <input 
            type="text" 
            placeholder="Jméno hráče..." 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
          />
          <button type="submit" className="btn-add">Přidat</button>
        </form>

        <ul className="players-list">
          {players.map((player, idx) => (
            <li key={idx} className="player-badge">
              {player}
              <button className="btn-remove" onClick={() => handleRemovePlayer(idx)} aria-label="Odstranit">
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button className="btn-start" onClick={handleStart} disabled={players.length < 2}>
        Spustit hru
      </button>
    </div>
  );
};

export default SetupScreen;
