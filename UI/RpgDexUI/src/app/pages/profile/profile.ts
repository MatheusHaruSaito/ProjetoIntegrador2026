import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { CharacterService } from '../../services/character-service';
import { UserResponse } from '../../../models/userResponse';
import { Character } from '../../../models/character';

const THEME_KEY = 'rpgdex-theme';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private characterService = inject(CharacterService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  user: UserResponse | null = null;
  isDarkMode = false;

  characterPreview: Character[] = [];
  characterTotal = 0;

  campaigns = [
    { id: 1, name: 'Crônicas de Arton', role: 'Mestre' },
    { id: 2, name: 'O Chamado de Cthulhu', role: 'Jogador' },
    { id: 3, name: 'Mundo de Ferro', role: 'Mestre' }
  ];

  ngOnInit(): void {
    this.initTheme();
    this.loadUser();
  }

  private initTheme(): void {
    const saved = localStorage.getItem(THEME_KEY);
    this.isDarkMode = saved === 'dark';
    this.applyTheme();
  }

  private applyTheme(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem(THEME_KEY, this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private loadUser(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.GetLoggedUser().subscribe({
      next: (response) => {
        this.user = response.data ?? null;
        this.cdr.detectChanges();
        // Carrega personagens só depois de ter o userId
        this.loadCharacterPreview();
      },
      error: (err) => {
        console.error('Erro ao carregar usuário', err);
        this.logout();
      }
    });
  }

  private loadCharacterPreview(): void {
    const userId = this.user?.id;

    this.characterService.GetAll().subscribe({
      next: (response) => {
        const all: Character[] = response.data ?? [];
        const mine = userId ? all.filter(c => c.userId === userId) : all;
        this.characterTotal = mine.length;
        this.characterPreview = mine.slice(0, 3);
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  editProfile(): void {
    alert('Funcionalidade de edição em breve!');
  }

  logout(): void {
    this.authService.Logout();
    this.router.navigate(['/login']);
  }
}