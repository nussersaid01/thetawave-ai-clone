// Web Audio API Synthesizer for Organic Nature Soundscapes & Completion Bell
// 100% Offline, Zero external MP3 downloads, Zero latency, Zero robotic hum.

export type SoundScapeType = 'rain' | 'ocean' | 'brown' | 'binaural';

let audioCtx: AudioContext | null = null;
let activeAmbientNodes: {
  stop: () => void;
  setVolume: (v: number) => void;
} | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Creates continuous Brownian motion (brown noise) buffer.
 * Brown noise has a warm, deep waterfall/ocean rumble with zero sharp treble.
 */
function createBrownNoiseBuffer(ctx: AudioContext, seconds = 5): AudioBuffer {
  const bufferSize = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    lastOut = (lastOut + 0.02 * white) / 1.02;
    data[i] = lastOut * 3.5; // Normalized amplitude
  }
  return buffer;
}

/**
 * Creates continuous Pink noise buffer (balanced 1/f noise spectrum).
 */
function createPinkNoiseBuffer(ctx: AudioContext, seconds = 5): AudioBuffer {
  const bufferSize = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

/**
 * Plays a resonant Tibetan Singing Bowl / Zen crystal chime when a session finishes.
 */
export function playCompletionChime(): void {
  try {
    if (typeof window === 'undefined') return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const harmonics = [
      { freq: 528, gain: 0.35, decay: 3.5 },     // 528 Hz Fundamental
      { freq: 1056, gain: 0.15, decay: 2.2 },    // 1st overtone
      { freq: 1584, gain: 0.07, decay: 1.5 },    // 2nd overtone
      { freq: 2112, gain: 0.03, decay: 0.9 }     // Soft shimmer
    ];

    harmonics.forEach(h => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(h.freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(h.gain, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + h.decay);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + h.decay + 0.1);
    });
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}

/**
 * Starts continuous organic ambient sound (Rain, Ocean, Brown Noise, or Soft Binaural).
 */
export function startAmbientSound(soundType: SoundScapeType, initialVolume = 0.35): void {
  try {
    if (typeof window === 'undefined') return;
    stopAmbientSound();

    const ctx = getAudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(initialVolume, ctx.currentTime + 0.6); // Smooth 600ms fade-in
    masterGain.connect(ctx.destination);

    const cleanupFns: Array<() => void> = [];

    if (soundType === 'rain') {
      // 🌧️ COZY RAIN SOUNDSCAPE (Gentle rainfall on roof/window)
      // Layer 1: Steady rainfall base (filtered brown noise)
      const brownBuf = createBrownNoiseBuffer(ctx, 4);
      const rainBaseSource = ctx.createBufferSource();
      rainBaseSource.buffer = brownBuf;
      rainBaseSource.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(800, ctx.currentTime);

      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(0.45, ctx.currentTime);

      rainBaseSource.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(masterGain);
      rainBaseSource.start();

      // Layer 2: Subtle droplet patter (bandpass pink noise with random flutter)
      const pinkBuf = createPinkNoiseBuffer(ctx, 4);
      const dropletSource = ctx.createBufferSource();
      dropletSource.buffer = pinkBuf;
      dropletSource.loop = true;

      const dropletFilter = ctx.createBiquadFilter();
      dropletFilter.type = 'bandpass';
      dropletFilter.frequency.setValueAtTime(2400, ctx.currentTime);
      dropletFilter.Q.setValueAtTime(1.8, ctx.currentTime);

      const dropletGain = ctx.createGain();
      dropletGain.gain.setValueAtTime(0.18, ctx.currentTime);

      dropletSource.connect(dropletFilter);
      dropletFilter.connect(dropletGain);
      dropletGain.connect(masterGain);
      dropletSource.start();

      cleanupFns.push(() => {
        try {
          rainBaseSource.stop();
          dropletSource.stop();
          rainBaseSource.disconnect();
          dropletSource.disconnect();
        } catch {}
      });

    } else if (soundType === 'ocean') {
      // 🌊 CALM OCEAN WAVES (Natural rolling surf with rhythmic swells)
      const pinkBuf = createPinkNoiseBuffer(ctx, 6);
      const waveSource = ctx.createBufferSource();
      waveSource.buffer = pinkBuf;
      waveSource.loop = true;

      // Resonant Lowpass swept by an LFO to simulate rolling tides
      const waveFilter = ctx.createBiquadFilter();
      waveFilter.type = 'lowpass';
      waveFilter.frequency.setValueAtTime(320, ctx.currentTime);
      waveFilter.Q.setValueAtTime(2.5, ctx.currentTime);

      // 0.12 Hz LFO = ~8.3 seconds per full wave cycle (surging in & washing back)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
      lfoGain.gain.setValueAtTime(280, ctx.currentTime); // Sweeps cutoff between 320 +/- 280 (40Hz to 600Hz)

      lfo.connect(lfoGain);
      lfoGain.connect(waveFilter.frequency);
      lfo.start();

      const waveGain = ctx.createGain();
      waveGain.gain.setValueAtTime(0.5, ctx.currentTime);

      waveSource.connect(waveFilter);
      waveFilter.connect(waveGain);
      waveGain.connect(masterGain);
      waveSource.start();

      cleanupFns.push(() => {
        try {
          waveSource.stop();
          lfo.stop();
          waveSource.disconnect();
          lfo.disconnect();
        } catch {}
      });

    } else if (soundType === 'brown') {
      // ☕ DEEP BROWN NOISE (Warm, soft airflow/waterfall, deep focus masking)
      const brownBuf = createBrownNoiseBuffer(ctx, 4);
      const brownSource = ctx.createBufferSource();
      brownSource.buffer = brownBuf;
      brownSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.55, ctx.currentTime);

      brownSource.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      brownSource.start();

      cleanupFns.push(() => {
        try {
          brownSource.stop();
          brownSource.disconnect();
        } catch {}
      });

    } else {
      // 🎧 THETA BINAURAL WAVES (Warm organic pad with gentle 6Hz stereo pulse)
      const merger = ctx.createChannelMerger(2);

      const leftOsc = ctx.createOscillator();
      const leftGain = ctx.createGain();
      leftOsc.type = 'sine';
      leftOsc.frequency.setValueAtTime(194, ctx.currentTime);
      leftGain.gain.setValueAtTime(0.15, ctx.currentTime);
      leftOsc.connect(leftGain);
      leftGain.connect(merger, 0, 0);

      const rightOsc = ctx.createOscillator();
      const rightGain = ctx.createGain();
      rightOsc.type = 'sine';
      rightOsc.frequency.setValueAtTime(200, ctx.currentTime); // 6 Hz differential = Theta Wave
      rightGain.gain.setValueAtTime(0.15, ctx.currentTime);
      rightOsc.connect(rightGain);
      rightGain.connect(merger, 0, 1);

      // Embedded inside a soft brown noise floor so it sounds warm, not like a test tone
      const brownBuf = createBrownNoiseBuffer(ctx, 4);
      const brownSource = ctx.createBufferSource();
      brownSource.buffer = brownBuf;
      brownSource.loop = true;

      const brownFilter = ctx.createBiquadFilter();
      brownFilter.type = 'lowpass';
      brownFilter.frequency.setValueAtTime(280, ctx.currentTime);
      const brownGain = ctx.createGain();
      brownGain.gain.setValueAtTime(0.25, ctx.currentTime);

      brownSource.connect(brownFilter);
      brownFilter.connect(brownGain);

      merger.connect(masterGain);
      brownGain.connect(masterGain);

      leftOsc.start();
      rightOsc.start();
      brownSource.start();

      cleanupFns.push(() => {
        try {
          leftOsc.stop();
          rightOsc.stop();
          brownSource.stop();
          leftOsc.disconnect();
          rightOsc.disconnect();
          brownSource.disconnect();
        } catch {}
      });
    }

    activeAmbientNodes = {
      stop: () => {
        const now = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(0, now + 0.35); // Smooth 350ms fade-out
        setTimeout(() => {
          cleanupFns.forEach(fn => fn());
          try {
            masterGain.disconnect();
          } catch {}
        }, 380);
      },
      setVolume: (v: number) => {
        const now = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), now, 0.08);
      }
    };

  } catch (err) {
    console.warn('Failed to start ambient sound:', err);
  }
}

/**
 * Stops any playing ambient sound with a clean fade-out.
 */
export function stopAmbientSound(): void {
  if (activeAmbientNodes) {
    activeAmbientNodes.stop();
    activeAmbientNodes = null;
  }
}

/**
 * Adjusts volume of active ambient sound in real-time.
 */
export function setAmbientVolume(vol: number): void {
  if (activeAmbientNodes) {
    activeAmbientNodes.setVolume(vol);
  }
}
