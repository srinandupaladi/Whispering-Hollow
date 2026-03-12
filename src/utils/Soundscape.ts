export class Soundscape {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambienceNodes: AudioNode[] = [];
  private heartbeatInterval?: number;

  unlock() {
    if (!this.context) {
      const AudioContextClass = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        return;
      }
      this.context = new AudioContextClass();
      this.master = this.context.createGain();
      this.master.gain.value = 0.18;
      this.master.connect(this.context.destination);
    }

    if (this.context.state === 'suspended') {
      void this.context.resume();
    }
  }

  private ensure() {
    this.unlock();
    return this.context && this.master ? { context: this.context, master: this.master } : null;
  }

  playTone(frequency: number, duration: number, type: OscillatorType, gainValue: number, detune = 0) {
    const nodes = this.ensure();
    if (!nodes) {
      return;
    }

    const oscillator = nodes.context.createOscillator();
    const gain = nodes.context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    oscillator.detune.value = detune;
    gain.gain.setValueAtTime(gainValue, nodes.context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, nodes.context.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(nodes.master);
    oscillator.start();
    oscillator.stop(nodes.context.currentTime + duration);
  }

  playNoise(duration: number, gainValue: number) {
    const nodes = this.ensure();
    if (!nodes) {
      return;
    }

    const buffer = nodes.context.createBuffer(1, nodes.context.sampleRate * duration, nodes.context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let index = 0; index < channel.length; index += 1) {
      channel[index] = (Math.random() * 2 - 1) * 0.35;
    }

    const source = nodes.context.createBufferSource();
    const filter = nodes.context.createBiquadFilter();
    const gain = nodes.context.createGain();
    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 550;
    gain.gain.value = gainValue;
    gain.gain.exponentialRampToValueAtTime(0.0001, nodes.context.currentTime + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(nodes.master);
    source.start();
  }

  playEffect(effect: 'jump' | 'land' | 'toggle' | 'pickup' | 'damage' | 'whisper' | 'boss') {
    switch (effect) {
      case 'jump':
        this.playTone(290, 0.18, 'square', 0.07);
        break;
      case 'land':
        this.playTone(120, 0.11, 'triangle', 0.06);
        break;
      case 'toggle':
        this.playTone(520, 0.12, 'sine', 0.05, 80);
        break;
      case 'pickup':
        this.playTone(680, 0.16, 'triangle', 0.07);
        this.playTone(920, 0.24, 'triangle', 0.05);
        break;
      case 'damage':
        this.playNoise(0.25, 0.08);
        this.playTone(140, 0.32, 'sawtooth', 0.05);
        break;
      case 'whisper':
        this.playNoise(0.55, 0.05);
        this.playTone(220, 0.4, 'sine', 0.03, -300);
        break;
      case 'boss':
        this.playNoise(0.8, 0.06);
        this.playTone(90, 0.8, 'sawtooth', 0.04);
        break;
    }
  }

  startAmbience(theme: 'forest' | 'village' | 'tunnels' | 'cathedral' | 'road') {
    this.stopAmbience();
    const nodes = this.ensure();
    if (!nodes) {
      return;
    }

    const baseFrequencies: Record<typeof theme, number[]> = {
      road: [98, 147],
      forest: [82, 123],
      village: [110, 164],
      tunnels: [70, 105],
      cathedral: [65, 98]
    };

    baseFrequencies[theme].forEach((frequency, index) => {
      const oscillator = nodes.context.createOscillator();
      const gain = nodes.context.createGain();
      oscillator.type = index === 0 ? 'triangle' : 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.value = 0.02 + index * 0.01;
      oscillator.connect(gain);
      gain.connect(nodes.master);
      oscillator.start();
      this.ambienceNodes.push(oscillator, gain);
    });
  }

  stopAmbience() {
    this.ambienceNodes.forEach((node) => {
      if (node instanceof OscillatorNode) {
        node.stop();
      }
      node.disconnect();
    });
    this.ambienceNodes = [];
    if (this.heartbeatInterval) {
      window.clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  setHeartbeat(intensity: number) {
    if (this.heartbeatInterval) {
      window.clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }

    if (intensity < 0.55) {
      return;
    }

    const bpm = 58 + Math.floor(intensity * 55);
    const stepMs = Math.max(320, Math.floor((60_000 / bpm) * 0.5));
    this.heartbeatInterval = window.setInterval(() => {
      this.playTone(72, 0.15, 'triangle', 0.04);
      this.playTone(54, 0.12, 'triangle', 0.03);
    }, stepMs);
  }
}
