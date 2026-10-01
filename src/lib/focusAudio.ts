// Web Audio API Synthesizer for ThetaWave Focus & Rest Sessions
// Zero external files, 100% offline, zero latency, ultra-lightweight.

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
 * Plays a resonant Zen singing bowl / bell chime when a session finishes.
 */
export function playCompletionChime(): void {
  try {
    if (typeof window === 'undefined') return;
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // Harmonic frequencies for Tibetan / Zen Singing Bowl sound
    const harmonics = [
      { freq: 528, gain: 0.35, decay: 3.5 },     // Fundamental (528 Hz Solfeggio "Transformation")
      { freq: 1056, gain: 0.15, decay: 2.5 },    // 1st overtone
      { freq: 1584, gain: 0.08, decay: 1.8 },    // 2nd overtone
      { freq: 2112, gain: 0.03, decay: 1.2 }     // Shimmer
    ];

    harmonics.forEach(h => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(h.freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(h.gain, now + 0.02); // 20ms gentle strike
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
 * Starts ambient background audio for study (Theta binaural beats + pink noise) or break (calming Zen harmonic waves).
 */
export function startAmbientSound(mode: 'study' | 'break', initialVolume = 0.3): void {
  try {
    if (typeof window === 'undefined') return;
    stopAmbientSound();

    const ctx = getAudioContext();
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(initialVolume, ctx.currentTime + 1.2); // Smooth 1.2s fade-in
    masterGain.connect(ctx.destination);

    const cleanupFns: Array<() => void> = [];

    if (mode === 'study') {
      // 1. Binaural Theta Wave (6.0 Hz differential between left and right ear)
      // Left: 216 Hz, Right: 222 Hz -> Creates perceived 6 Hz Theta brainwave (Deep Focus & Flow)
      try {
        const merger = ctx.createChannelMerger(2);

        const leftOsc = ctx.createOscillator();
        const leftGain = ctx.createGain();
        leftOsc.type = 'sine';
        leftOsc.frequency.setValueAtTime(216, ctx.currentTime);
        leftGain.gain.setValueAtTime(0.25, ctx.currentTime);
        leftOsc.connect(leftGain);
        leftGain.connect(merger, 0, 0); // Left channel

        const rightOsc = ctx.createOscillator();
        const rightGain = ctx.createGain();
        rightOsc.type = 'sine';
        rightOsc.frequency.setValueAtTime(222, ctx.currentTime);
        rightGain.gain.setValueAtTime(0.25, ctx.currentTime);
        rightOsc.connect(rightGain);
        rightGain.connect(merger, 0, 1); // Right channel

        merger.connect(masterGain);

        leftOsc.start();
        rightOsc.start();

        cleanupFns.push(() => {
          try {
            leftOsc.stop();
            rightOsc.stop();
            leftOsc.disconnect();
            rightOsc.disconnect();
          } catch {}
        });
      } catch (stereoErr) {
        console.warn('Stereo binaural fallback to mono:', stereoErr);
      }

      // 2. Soothing Filtered Pink Noise (Gentle waterfall / deep airflow)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Filter noise so it's warm and non-intrusive
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.18, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterGain);

      noiseSource.start();
      cleanupFns.push(() => {
        try {
          noiseSource.stop();
          noiseSource.disconnect();
        } catch {}
      });

    } else {
      // BREAK MODE: Zen Relaxation Chord (432 Hz Healing Frequency + Sub Harmonics + Slow Breath LFO)
      const frequencies = [216, 324, 432, 648]; // Harmonic fifths and octaves
      const oscNodes: OscillatorNode[] = [];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Lower gain for higher harmonics
        const weight = 0.18 / (idx + 1);
        gain.gain.setValueAtTime(weight, ctx.currentTime);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();
        oscNodes.push(osc);
      });

      // Subtle LFO breath effect (slow 0.15 Hz = ~7-second relaxing breath cycle)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
      lfoGain.gain.setValueAtTime(0.08, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(masterGain.gain);
      lfo.start();

      cleanupFns.push(() => {
        try {
          oscNodes.forEach(o => {
            o.stop();
            o.disconnect();
          });
          lfo.stop();
          lfo.disconnect();
        } catch {}
      });
    }

    activeAmbientNodes = {
      stop: () => {
        const now = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(0, now + 0.4); // Smooth 400ms fade-out
        setTimeout(() => {
          cleanupFns.forEach(fn => fn());
          try {
            masterGain.disconnect();
          } catch {}
        }, 450);
      },
      setVolume: (v: number) => {
        const now = ctx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, v)), now, 0.1);
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
 * Sets volume of active ambient sound.
 */
export function setAmbientVolume(vol: number): void {
  if (activeAmbientNodes) {
    activeAmbientNodes.setVolume(vol);
  }
}
