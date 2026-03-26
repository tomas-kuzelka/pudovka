const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

export let isMuted = JSON.parse(localStorage.getItem('gameMute')) || false;
export const toggleMute = () => {
  isMuted = !isMuted;
  localStorage.setItem('gameMute', JSON.stringify(isMuted));
  return isMuted;
};

const playTone = (type, startFreq, endFreq, duration, volume = 0.5, typeEndFreq) => {
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
  if (typeEndFreq) {
      osc.frequency.exponentialRampToValueAtTime(endFreq, audioCtx.currentTime + duration * 0.5);
      osc.frequency.exponentialRampToValueAtTime(typeEndFreq, audioCtx.currentTime + duration);
  } else {
      osc.frequency.exponentialRampToValueAtTime(endFreq, audioCtx.currentTime + (duration * 0.8));
  }

  gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + duration);
};

const correctSounds = [
  () => playTone('sine', 440, 880, 0.3), // Klasický ding up
  () => playTone('triangle', 523.25, 1046.50, 0.4), // C5 to C6
  () => playTone('sine', 659.25, 1318.51, 0.2), // E5 up (rychlé)
  () => playTone('square', 440, 659.25, 0.3, 0.2), // A4 to E5 hrubší
  () => playTone('sine', 880, 1760, 0.4) // Vysoký zvonek
];

const wrongSounds = [
  () => playTone('sawtooth', 150, 50, 1.2, 0.5), // Klasické dlouhé bzučení (1.2s)
  () => playTone('square', 200, 40, 1.5, 0.4), // Temný error (1.5s)
  () => playTone('sawtooth', 300, 100, 1.0, 0.4, 60), // Laciný buzzer s odrazem
  () => playTone('triangle', 180, 80, 1.4, 0.6), // Klesající gong
  () => playTone('square', 100, 50, 2.0, 0.5) // Velmi dlouhé fatální zabzučení (2.0s)
];

export const playCorrectSound = () => {
  if (isMuted) return;
  const variation = correctSounds[Math.floor(Math.random() * correctSounds.length)];
  variation();
};

export const playWrongSound = () => {
  if (isMuted) return;
  const variation = wrongSounds[Math.floor(Math.random() * wrongSounds.length)];
  variation();
};

export const playVictorySound = () => {
  if (isMuted) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc1.type = 'square';
  osc2.type = 'triangle';
  
  // Arpeggio C5 - E5 - G5 - C6
  osc1.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
  osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); 
  osc1.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3);
  osc1.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.45);
  
  osc2.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
  osc2.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); 
  osc2.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3);
  osc2.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.45);

  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.05);
  gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime + 0.7);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  osc1.start(audioCtx.currentTime);
  osc2.start(audioCtx.currentTime);
  osc1.stop(audioCtx.currentTime + 1.2);
  osc2.stop(audioCtx.currentTime + 1.2);
};
