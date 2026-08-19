// Synthesizer using Web Audio API for gun shot, reload, and interface feedback.
// Ensures 100% offline compatibility and zero-latency audio trigger.

let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Generate a 1-second white noise buffer
let noiseBuffer = null;
function getNoiseBuffer() {
  if (noiseBuffer) return noiseBuffer;
  
  initAudio();
  const bufferSize = audioCtx.sampleRate * 1.5; // 1.5 seconds of noise
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBuffer = buffer;
  return noiseBuffer;
}

export const playShotSound = (isSilenced = false) => {
  try {
    initAudio();
    const ctx = audioCtx;
    
    // 1. Noise component (for the gunpowder blast/crack)
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer();
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    
    const noiseGain = ctx.createGain();
    
    // 2. Bass thump component (sine wave for the heavy punch)
    const oscillator = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    oscillator.type = 'sine';
    
    // Connect noise path
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    // Connect osc path
    oscillator.connect(oscGain);
    oscGain.connect(ctx.destination);
    
    const now = ctx.currentTime;
    
    if (isSilenced) {
      // Silenced Shot Parameters
      // Quick, highly muffled crack
      noiseFilter.frequency.setValueAtTime(400, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(80, now + 0.12);
      
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      
      // Muffled bass thud
      oscillator.frequency.setValueAtTime(90, now);
      oscillator.frequency.exponentialRampToValueAtTime(30, now + 0.08);
      
      oscGain.gain.setValueAtTime(0.5, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      
      noise.start(now);
      oscillator.start(now);
      
      noise.stop(now + 0.15);
      oscillator.stop(now + 0.15);
    } else {
      // Normal Gunshot Parameters
      // Loud, bright crack that decays
      noiseFilter.frequency.setValueAtTime(1500, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(120, now + 0.35);
      
      noiseGain.gain.setValueAtTime(0.7, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      
      // Powerful bass kick
      oscillator.frequency.setValueAtTime(160, now);
      oscillator.frequency.exponentialRampToValueAtTime(40, now + 0.18);
      
      oscGain.gain.setValueAtTime(1.2, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      
      // Add slight metallic ring (comb filter effect using another high osc)
      const ringOsc = ctx.createOscillator();
      const ringGain = ctx.createGain();
      ringOsc.type = 'triangle';
      ringOsc.frequency.setValueAtTime(800, now);
      ringOsc.frequency.exponentialRampToValueAtTime(200, now + 0.25);
      
      ringGain.gain.setValueAtTime(0.12, now);
      ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      
      ringOsc.connect(ringGain);
      ringGain.connect(ctx.destination);
      
      noise.start(now);
      oscillator.start(now);
      ringOsc.start(now);
      
      noise.stop(now + 0.4);
      oscillator.stop(now + 0.4);
      ringOsc.stop(now + 0.4);
    }
  } catch (error) {
    console.warn("Audio failure:", error);
  }
};

export const playReloadSound = () => {
  try {
    initAudio();
    const ctx = audioCtx;
    const now = ctx.currentTime;
    
    // Simulate mechanical clicks and metallic slides using noise sweeps & quick envelopes
    
    // 1. Mag Out: Double metallic click
    playClick(now, 400, 0.05, 0.1);
    playClick(now + 0.08, 300, 0.03, 0.08);
    
    // 2. Mag In: Heavy insert snap (low frequencies + noise)
    const magInTime = now + 0.5;
    playClick(magInTime, 200, 0.08, 0.3);
    playClick(magInTime + 0.04, 500, 0.04, 0.15);
    
    // 3. Chamber slide: Metallic scrape (frequency sweep)
    const slideTime = now + 0.9;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, slideTime);
    osc.frequency.linearRampToValueAtTime(250, slideTime + 0.15);
    osc.frequency.linearRampToValueAtTime(450, slideTime + 0.3);
    
    gain.gain.setValueAtTime(0, slideTime);
    gain.gain.linearRampToValueAtTime(0.12, slideTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, slideTime + 0.3);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(slideTime);
    osc.stop(slideTime + 0.32);
    
    // Click at the end of chambering
    playClick(slideTime + 0.28, 800, 0.02, 0.1);
    
  } catch (error) {
    console.warn("Audio failure:", error);
  }
};

const playClick = (time, freq, duration, gainVal) => {
  const ctx = audioCtx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, time);
  osc.frequency.exponentialRampToValueAtTime(freq / 2, time + duration);
  
  gain.gain.setValueAtTime(gainVal, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(time);
  osc.stop(time + duration + 0.01);
};

export const playToggleSound = () => {
  try {
    initAudio();
    const ctx = audioCtx;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.setValueAtTime(1400, now + 0.03);
    
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.09);
  } catch (error) {
    console.warn("Audio failure:", error);
  }
};
