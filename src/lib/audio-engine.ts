'use client';

type GenrePreset = {
  baseFreqs: number[];
  chordPatterns: number[][];
  tempo: number;
  filterFreq: number;
  reverbDecay: number;
  padVolume: number;
  bassVolume: number;
  melodyVolume: number;
  melodyNotes: number[];
  swingFactor: number;
};

const GENRE_PRESETS: Record<string, GenrePreset> = {
  jazz: {
    baseFreqs: [130.81, 146.83, 164.81, 174.61, 196.0],
    chordPatterns: [[1, 1.25, 1.5, 1.875], [1, 1.2, 1.5, 1.8], [1, 1.333, 1.5, 1.75]],
    tempo: 85,
    filterFreq: 2000,
    reverbDecay: 3,
    padVolume: 0.08,
    bassVolume: 0.12,
    melodyVolume: 0.06,
    melodyNotes: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88],
    swingFactor: 0.15,
  },
  lounge: {
    baseFreqs: [110.0, 123.47, 138.59, 146.83, 164.81],
    chordPatterns: [[1, 1.25, 1.5, 2], [1, 1.2, 1.5, 1.875], [1, 1.333, 1.667, 2]],
    tempo: 92,
    filterFreq: 1800,
    reverbDecay: 4,
    padVolume: 0.1,
    bassVolume: 0.1,
    melodyVolume: 0.05,
    melodyNotes: [220.0, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0],
    swingFactor: 0.1,
  },
  ambient: {
    baseFreqs: [65.41, 73.42, 82.41, 87.31, 98.0],
    chordPatterns: [[1, 1.5, 2, 3], [1, 1.333, 2, 2.667], [1, 1.5, 2.25, 3]],
    tempo: 60,
    filterFreq: 1200,
    reverbDecay: 6,
    padVolume: 0.12,
    bassVolume: 0.06,
    melodyVolume: 0.04,
    melodyNotes: [196.0, 220.0, 261.63, 293.66, 329.63, 392.0, 440.0],
    swingFactor: 0,
  },
  electronic: {
    baseFreqs: [130.81, 146.83, 155.56, 174.61, 196.0],
    chordPatterns: [[1, 1.333, 1.5, 2], [1, 1.25, 1.5, 1.75], [1, 1.5, 2, 2.5]],
    tempo: 120,
    filterFreq: 3000,
    reverbDecay: 2.5,
    padVolume: 0.1,
    bassVolume: 0.14,
    melodyVolume: 0.07,
    melodyNotes: [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33],
    swingFactor: 0,
  },
  'deep house': {
    baseFreqs: [110.0, 123.47, 130.81, 146.83, 164.81],
    chordPatterns: [[1, 1.2, 1.5, 1.8], [1, 1.25, 1.5, 2], [1, 1.333, 1.667, 2]],
    tempo: 122,
    filterFreq: 2500,
    reverbDecay: 3,
    padVolume: 0.09,
    bassVolume: 0.15,
    melodyVolume: 0.06,
    melodyNotes: [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    swingFactor: 0.05,
  },
  chill: {
    baseFreqs: [98.0, 110.0, 123.47, 130.81, 146.83],
    chordPatterns: [[1, 1.25, 1.5, 2], [1, 1.333, 1.5, 1.875], [1, 1.2, 1.5, 2]],
    tempo: 90,
    filterFreq: 1600,
    reverbDecay: 4,
    padVolume: 0.1,
    bassVolume: 0.08,
    melodyVolume: 0.05,
    melodyNotes: [196.0, 220.0, 261.63, 293.66, 329.63, 392.0, 440.0],
    swingFactor: 0.08,
  },
  classical: {
    baseFreqs: [130.81, 146.83, 164.81, 174.61, 196.0],
    chordPatterns: [[1, 1.25, 1.5, 2], [1, 1.2, 1.5, 1.8], [1, 1.333, 1.5, 2]],
    tempo: 72,
    filterFreq: 4000,
    reverbDecay: 5,
    padVolume: 0.1,
    bassVolume: 0.08,
    melodyVolume: 0.07,
    melodyNotes: [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25],
    swingFactor: 0,
  },
  acoustic: {
    baseFreqs: [110.0, 123.47, 130.81, 146.83, 164.81],
    chordPatterns: [[1, 1.25, 1.5, 2], [1, 1.333, 1.5, 1.875], [1, 1.2, 1.5, 2]],
    tempo: 100,
    filterFreq: 3500,
    reverbDecay: 3,
    padVolume: 0.08,
    bassVolume: 0.1,
    melodyVolume: 0.07,
    melodyNotes: [220.0, 246.94, 261.63, 293.66, 329.63, 392.0, 440.0],
    swingFactor: 0.05,
  },
  folk: {
    baseFreqs: [110.0, 130.81, 146.83, 164.81, 196.0],
    chordPatterns: [[1, 1.25, 1.5, 2], [1, 1.333, 1.5, 2], [1, 1.25, 1.5, 1.875]],
    tempo: 105,
    filterFreq: 3000,
    reverbDecay: 2.5,
    padVolume: 0.07,
    bassVolume: 0.1,
    melodyVolume: 0.08,
    melodyNotes: [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    swingFactor: 0.05,
  },
  meditation: {
    baseFreqs: [55.0, 65.41, 73.42, 82.41, 87.31],
    chordPatterns: [[1, 1.5, 2, 3], [1, 2, 3, 4], [1, 1.5, 2.25, 3]],
    tempo: 55,
    filterFreq: 800,
    reverbDecay: 8,
    padVolume: 0.12,
    bassVolume: 0.04,
    melodyVolume: 0.03,
    melodyNotes: [174.61, 196.0, 220.0, 261.63, 293.66, 329.63, 392.0],
    swingFactor: 0,
  },
  nature: {
    baseFreqs: [65.41, 73.42, 82.41, 98.0, 110.0],
    chordPatterns: [[1, 1.5, 2, 3], [1, 1.333, 2, 2.667], [1, 1.5, 2, 2.5]],
    tempo: 50,
    filterFreq: 1000,
    reverbDecay: 7,
    padVolume: 0.11,
    bassVolume: 0.05,
    melodyVolume: 0.03,
    melodyNotes: [196.0, 220.0, 261.63, 293.66, 329.63, 392.0],
    swingFactor: 0,
  },
  indie: {
    baseFreqs: [110.0, 123.47, 130.81, 146.83, 164.81],
    chordPatterns: [[1, 1.25, 1.5, 2], [1, 1.333, 1.5, 1.875], [1, 1.2, 1.5, 1.8]],
    tempo: 110,
    filterFreq: 2800,
    reverbDecay: 2.5,
    padVolume: 0.08,
    bassVolume: 0.11,
    melodyVolume: 0.07,
    melodyNotes: [220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25],
    swingFactor: 0.05,
  },
  soul: {
    baseFreqs: [110.0, 123.47, 130.81, 146.83, 164.81],
    chordPatterns: [[1, 1.2, 1.5, 1.875], [1, 1.25, 1.5, 1.8], [1, 1.333, 1.5, 2]],
    tempo: 88,
    filterFreq: 2200,
    reverbDecay: 3.5,
    padVolume: 0.09,
    bassVolume: 0.12,
    melodyVolume: 0.06,
    melodyNotes: [220.0, 246.94, 261.63, 293.66, 329.63, 392.0, 440.0],
    swingFactor: 0.12,
  },
  'bossa nova': {
    baseFreqs: [110.0, 123.47, 130.81, 146.83, 164.81],
    chordPatterns: [[1, 1.25, 1.5, 1.875], [1, 1.2, 1.5, 1.8], [1, 1.333, 1.667, 2]],
    tempo: 78,
    filterFreq: 2000,
    reverbDecay: 3.5,
    padVolume: 0.08,
    bassVolume: 0.1,
    melodyVolume: 0.06,
    melodyNotes: [220.0, 246.94, 261.63, 293.66, 329.63, 349.23, 392.0],
    swingFactor: 0.18,
  },
};

const DEFAULT_PRESET = GENRE_PRESETS.ambient;

function getPreset(genre: string): GenrePreset {
  return GENRE_PRESETS[genre.toLowerCase()] || DEFAULT_PRESET;
}

function createReverb(ctx: AudioContext, decay: number): ConvolverNode {
  const convolver = ctx.createConvolver();
  const rate = ctx.sampleRate;
  const length = rate * decay;
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
    }
  }
  convolver.buffer = impulse;
  return convolver;
}

export class AmbienceAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeVenues: Map<string, VenueAudioSession> = new Map();

  private ensureContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1.0;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  startVenue(venueId: string, genre: string, volume: number) {
    this.stopVenue(venueId);
    const ctx = this.ensureContext();
    const session = new VenueAudioSession(ctx, this.masterGain!, genre, volume / 100);
    session.start();
    this.activeVenues.set(venueId, session);
  }

  stopVenue(venueId: string) {
    const session = this.activeVenues.get(venueId);
    if (session) {
      session.stop();
      this.activeVenues.delete(venueId);
    }
  }

  setVenueVolume(venueId: string, volume: number) {
    const session = this.activeVenues.get(venueId);
    if (session) {
      session.setVolume(volume / 100);
    }
  }

  isPlaying(venueId: string): boolean {
    return this.activeVenues.has(venueId);
  }

  stopAll() {
    this.activeVenues.forEach((session) => session.stop());
    this.activeVenues.clear();
  }

  dispose() {
    this.stopAll();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
    }
    this.ctx = null;
    this.masterGain = null;
  }
}

class VenueAudioSession {
  private ctx: AudioContext;
  private output: GainNode;
  private venueGain: GainNode;
  private preset: GenrePreset;
  private running = false;
  private timers: number[] = [];
  private oscillators: OscillatorNode[] = [];
  private sources: AudioBufferSourceNode[] = [];

  constructor(ctx: AudioContext, destination: GainNode, genre: string, volume: number) {
    this.ctx = ctx;
    this.output = destination;
    this.preset = getPreset(genre);
    this.venueGain = ctx.createGain();
    this.venueGain.gain.value = volume;
    this.venueGain.connect(destination);
  }

  start() {
    this.running = true;
    this.playPad();
    this.playBass();
    this.scheduleMelody();
  }

  stop() {
    this.running = false;
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];

    const now = this.ctx.currentTime;
    this.oscillators.forEach((osc) => {
      try {
        osc.stop(now + 0.5);
      } catch {}
    });
    this.sources.forEach((src) => {
      try {
        src.stop(now + 0.5);
      } catch {}
    });

    // Fade out
    this.venueGain.gain.linearRampToValueAtTime(0, now + 0.5);
    setTimeout(() => {
      try { this.venueGain.disconnect(); } catch {}
    }, 600);

    this.oscillators = [];
    this.sources = [];
  }

  setVolume(vol: number) {
    if (this.venueGain) {
      this.venueGain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.1);
    }
  }

  private playPad() {
    if (!this.running) return;

    const p = this.preset;
    const baseFreq = p.baseFreqs[Math.floor(Math.random() * p.baseFreqs.length)];
    const chord = p.chordPatterns[Math.floor(Math.random() * p.chordPatterns.length)];

    const padGain = this.ctx.createGain();
    padGain.gain.value = 0;
    padGain.connect(this.createFilteredReverb(p.filterFreq, p.reverbDecay));

    const fadeDuration = 2;
    const holdDuration = 4 + Math.random() * 4;
    const now = this.ctx.currentTime;

    padGain.gain.linearRampToValueAtTime(p.padVolume, now + fadeDuration);
    padGain.gain.setValueAtTime(p.padVolume, now + fadeDuration + holdDuration);
    padGain.gain.linearRampToValueAtTime(0, now + fadeDuration * 2 + holdDuration);

    chord.forEach((ratio) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = baseFreq * ratio;
      // Slight detune for warmth
      osc.detune.value = (Math.random() - 0.5) * 10;
      osc.connect(padGain);
      osc.start(now);
      osc.stop(now + fadeDuration * 2 + holdDuration + 0.5);
      this.oscillators.push(osc);
      osc.onended = () => {
        this.oscillators = this.oscillators.filter((o) => o !== osc);
      };
    });

    // Add a second layer with triangle wave for richness
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = baseFreq * 0.5;
    const osc2Gain = this.ctx.createGain();
    osc2Gain.gain.value = 0;
    osc2Gain.gain.linearRampToValueAtTime(p.padVolume * 0.3, now + fadeDuration);
    osc2Gain.gain.setValueAtTime(p.padVolume * 0.3, now + fadeDuration + holdDuration);
    osc2Gain.gain.linearRampToValueAtTime(0, now + fadeDuration * 2 + holdDuration);
    osc2.connect(osc2Gain);
    osc2Gain.connect(padGain);
    osc2.start(now);
    osc2.stop(now + fadeDuration * 2 + holdDuration + 0.5);
    this.oscillators.push(osc2);
    osc2.onended = () => {
      this.oscillators = this.oscillators.filter((o) => o !== osc2);
    };

    const nextPad = (fadeDuration * 2 + holdDuration - 1) * 1000;
    const timer = window.setTimeout(() => this.playPad(), nextPad);
    this.timers.push(timer);
  }

  private playBass() {
    if (!this.running) return;

    const p = this.preset;
    const beatInterval = 60 / p.tempo;
    const baseFreq = p.baseFreqs[Math.floor(Math.random() * p.baseFreqs.length)] * 0.5;

    const now = this.ctx.currentTime;
    const bassGain = this.ctx.createGain();
    bassGain.gain.value = 0;
    bassGain.connect(this.venueGain);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    filter.Q.value = 2;
    filter.connect(bassGain);

    // Play 4 bass notes per pattern
    for (let i = 0; i < 4; i++) {
      const noteTime = now + i * beatInterval * 2;
      const freq = baseFreq * (i === 2 ? 1.333 : i === 3 ? 1.5 : 1);

      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(filter);

      const noteGain = this.ctx.createGain();
      osc.disconnect();
      osc.connect(noteGain);
      noteGain.connect(filter);

      noteGain.gain.setValueAtTime(0, noteTime);
      noteGain.gain.linearRampToValueAtTime(p.bassVolume, noteTime + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + beatInterval * 1.8);

      osc.start(noteTime);
      osc.stop(noteTime + beatInterval * 2);
      this.oscillators.push(osc);
      osc.onended = () => {
        this.oscillators = this.oscillators.filter((o) => o !== osc);
      };
    }

    const nextBass = beatInterval * 8 * 1000;
    const timer = window.setTimeout(() => this.playBass(), nextBass);
    this.timers.push(timer);
  }

  private scheduleMelody() {
    if (!this.running) return;

    const p = this.preset;
    const beatInterval = 60 / p.tempo;

    // Play a short melodic phrase
    const phraseLength = 3 + Math.floor(Math.random() * 5);
    const now = this.ctx.currentTime;

    for (let i = 0; i < phraseLength; i++) {
      const swing = i % 2 === 1 ? p.swingFactor * beatInterval : 0;
      const noteTime = now + i * beatInterval + swing;
      const freq = p.melodyNotes[Math.floor(Math.random() * p.melodyNotes.length)];
      const duration = beatInterval * (0.5 + Math.random() * 1.5);

      this.playMelodyNote(freq, noteTime, duration, p);
    }

    // Gap between phrases
    const gap = (phraseLength * beatInterval + beatInterval * (2 + Math.random() * 6)) * 1000;
    const timer = window.setTimeout(() => this.scheduleMelody(), gap);
    this.timers.push(timer);
  }

  private playMelodyNote(freq: number, time: number, duration: number, p: GenrePreset) {
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    osc.detune.value = (Math.random() - 0.5) * 8;

    const noteGain = this.ctx.createGain();
    noteGain.gain.setValueAtTime(0, time);
    noteGain.gain.linearRampToValueAtTime(p.melodyVolume, time + 0.03);
    noteGain.gain.setValueAtTime(p.melodyVolume * 0.7, time + duration * 0.3);
    noteGain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(noteGain);
    noteGain.connect(this.createFilteredReverb(p.filterFreq * 1.5, p.reverbDecay * 0.6));

    osc.start(time);
    osc.stop(time + duration + 0.1);
    this.oscillators.push(osc);
    osc.onended = () => {
      this.oscillators = this.oscillators.filter((o) => o !== osc);
    };
  }

  private createFilteredReverb(filterFreq: number, decay: number): GainNode {
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 0.7;

    const reverb = createReverb(this.ctx, Math.min(decay, 4));
    const reverbGain = this.ctx.createGain();
    reverbGain.gain.value = 0.3;

    const dryGain = this.ctx.createGain();
    dryGain.gain.value = 0.7;

    const mixGain = this.ctx.createGain();
    mixGain.gain.value = 1;

    filter.connect(dryGain);
    filter.connect(reverb);
    reverb.connect(reverbGain);
    dryGain.connect(mixGain);
    reverbGain.connect(mixGain);
    mixGain.connect(this.venueGain);

    // Return a node to connect to
    const inputGain = this.ctx.createGain();
    inputGain.gain.value = 1;
    inputGain.connect(filter);
    return inputGain;
  }
}

// Singleton instance
let engineInstance: AmbienceAudioEngine | null = null;

export function getAudioEngine(): AmbienceAudioEngine {
  if (!engineInstance) {
    engineInstance = new AmbienceAudioEngine();
  }
  return engineInstance;
}
