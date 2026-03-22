import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Theme {
  tag: string;
  phrase: string;
  font: string;
  bg: string;
  gc: string;
  tagBg: string;
  tagC: string;
  titleC: string;
  phraseC: string;
  subC: string;
  ctaBg: string;
  ctaC: string;
  band: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  current = signal(0);
  private timer?: any;

  readonly themes: Theme[] = [
    {
      // TEMA 1: MODERNO (PADRÃO)
      tag: '✦ RPGDex',
      phrase: 'Sua jornada organizada',
      font: "'Nunito', sans-serif",
      bg: '#fdfbf7',
      gc: 'rgba(158, 116, 208, 0.15)',
      tagBg: 'rgba(158, 116, 208, 0.1)',
      tagC: '#9E74D0',
      titleC: '#3C3489',
      phraseC: '#9E74D0',
      subC: '#555',
      ctaBg: '#9E74D0',
      ctaC: '#fff',
      band: 'linear-gradient(90deg, #9E74D0, #80E2FF)',
    },
    {
      // TEMA 2: MEDIEVAL
      tag: '⚔️ Fantasia Medieval',
      phrase: 'Escrito nos pergaminhos',
      font: "'Uncial Antiqua', serif",
      bg: '#e6d5b8',
      gc: 'rgba(61, 43, 31, 0.15)',
      tagBg: '#3d2b1f',
      tagC: '#e6d5b8',
      titleC: '#3d2b1f',
      phraseC: '#8b4513',
      subC: '#5d4037',
      ctaBg: '#5c4033',
      ctaC: '#e6d5b8',
      band: 'linear-gradient(90deg, #3d2b1f, #8b4513)',
    },
    {
      // TEMA 3: CYBERPUNK 
      tag: '⚡ Cyberpunk',
      phrase: 'Um final feliz? Para gente como nós? Cidade errada, pessoas erradas.',
      font: "'Orbitron', sans-serif",
      bg: '#050505',
      gc: 'rgba(0, 245, 255, 0.1)',
      tagBg: 'rgba(0, 245, 255, 0.1)',
      tagC: '#00f5ff',
      titleC: '#00f5ff',
      phraseC: '#ff00aa',
      subC: '#888',
      ctaBg: '#ff00aa',
      ctaC: '#fff',
      band: 'linear-gradient(90deg, #050505, #ff00aa)',
    },
    {
      // TEMA 4: TERROR
      tag: '👁️ Terror',
      phrase: 'Já assistiu os filmes de facada?',
      font: "'Creepster', cursive",
      bg: '#0d0202',
      gc: 'rgba(255, 0, 0, 0.15)',
      tagBg: 'rgba(255, 0, 0, 0.2)',
      tagC: '#ff4d4d',
      titleC: '#ff2828', 
      phraseC: '#ff4d4d',
      subC: '#999',
      ctaBg: '#cc0000',
      ctaC: '#fff',
      band: 'linear-gradient(90deg, #0d0202, #cc0000)',
    },
  ];

  activeTheme = computed(() => this.themes[this.current()]);

  gridStyle = computed(() => {
    const gc = this.activeTheme().gc;
    return (
      `repeating-linear-gradient(0deg, ${gc} 0, ${gc} 1px, transparent 1px, transparent 40px),` +
      `repeating-linear-gradient(90deg, ${gc} 0, ${gc} 1px, transparent 1px, transparent 40px)`
    );
  });

  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  selectTheme(index: number) {
    this.current.set(index);
    this.stopTimer();
    this.startTimer();
  }

  private startTimer() {
    this.timer = setInterval(() => {
      this.current.update((prev) => (prev + 1) % this.themes.length);
    }, 6000);
  }

  private stopTimer() {
    if (this.timer) clearInterval(this.timer);
  }
}
