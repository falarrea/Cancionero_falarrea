/**
 * GoodChord - High-Precision Web Audio API Metronome Engine
 * Provides accurate timing, accent beats, tap tempo, sound synthesis, and visual pulse triggers.
 */

export class Metronome {
  constructor() {
    this.audioContext = null;
    this.bpm = 120;
    this.beatsPerBar = 4;
    this.currentBeat = 0;
    this.isPlaying = false;
    this.isMuted = false;

    this.lookahead = 25.0; // How frequently to call scheduling function (in ms)
    this.scheduleAheadTime = 0.1; // How far ahead to schedule audio (in sec)
    this.nextNoteTime = 0.0; // When the next note is due
    this.timerID = null;

    this.tapTimes = [];
    this.onBeatCallback = null;
  }

  initAudio() {
    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setBpm(newBpm) {
    this.bpm = Math.min(Math.max(Math.round(newBpm), 30), 240);
  }

  setBeatsPerBar(beats) {
    this.beatsPerBar = beats;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  tapTempo() {
    const now = performance.now();
    this.tapTimes.push(now);

    // Keep only last 4 taps
    if (this.tapTimes.length > 4) {
      this.tapTimes.shift();
    }

    if (this.tapTimes.length >= 2) {
      let intervals = [];
      for (let i = 1; i < this.tapTimes.length; i++) {
        intervals.push(this.tapTimes[i] - this.tapTimes[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      this.setBpm(calculatedBpm);
    }
    return this.bpm;
  }

  nextNote() {
    const secondsPerBeat = 60.0 / this.bpm;
    this.nextNoteTime += secondsPerBeat;
    this.currentBeat = (this.currentBeat + 1) % this.beatsPerBar;
  }

  scheduleNote(beatNumber, time) {
    // Visual Callback trigger
    if (this.onBeatCallback) {
      const delay = Math.max(0, (time - this.audioContext.currentTime) * 1000);
      setTimeout(() => {
        if (this.isPlaying && this.onBeatCallback) {
          this.onBeatCallback(beatNumber, this.beatsPerBar);
        }
      }, delay);
    }

    if (this.isMuted) return;

    // Synthesize woodblock/tick audio with oscillator
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    if (beatNumber === 0) {
      // Beat 1: High accent click
      osc.frequency.value = 1200;
      gain.gain.value = 0.9;
    } else {
      // Sub-beats: Low click
      osc.frequency.value = 800;
      gain.gain.value = 0.4;
    }

    // Exponential decay for clean percussive click
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  scheduler() {
    while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentBeat, this.nextNoteTime);
      this.nextNote();
    }
    this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
  }

  start() {
    if (this.isPlaying) return;
    this.initAudio();
    this.isPlaying = true;
    this.currentBeat = 0;
    this.nextNoteTime = this.audioContext.currentTime + 0.05;
    this.scheduler();
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    if (this.timerID) {
      clearTimeout(this.timerID);
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }
}
