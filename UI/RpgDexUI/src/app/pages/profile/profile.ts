import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { CharacterService } from '../../services/character-service';
import { UserResponse } from '../../../models/userResponse';
import { Character } from '../../../models/character';
import { AuthOptionsResponse } from '../../../models/authOptionsResponse';
import { SettingsModalComponent } from '../../modals/settings-modal/settings-modal';

const THEME_KEY = 'rpgdex-theme';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, SettingsModalComponent],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private characterService = inject(CharacterService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  user: UserResponse | null = null;
  authOptions: AuthOptionsResponse | null = null;
  isDarkMode = false;
  isSettingsModalOpen = false;

  characterPreview: Character[] = [];
  characterTotal = 0;

  campaigns = [
    { id: 1, name: 'Crônicas de Arton', role: 'Mestre' },
    { id: 2, name: 'O Chamado de Cthulhu', role: 'Jogador' },
    { id: 3, name: 'Mundo de Ferro', role: 'Mestre' },
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

        if (this.user?.id) {
          this.loadAuthOptions(this.user.id);
          this.loadCharacterPreview();
        }
      },
      error: (err) => {
        console.error('Erro ao carregar usuário', err);
        this.logout();
      },
    });
  }

  private loadAuthOptions(userId: string): void {
    this.authService.GetUserAuthOptions(userId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.authOptions = res.data;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Erro ao carregar opções de autenticação', err),
    });
  }

  private loadCharacterPreview(): void {
    const userId = this.authService.getLoggedUserId();

    this.characterService.GetAll(userId!).subscribe({
      next: (response) => {
        const all: Character[] = response.data ?? [];
        this.characterTotal = all.length;
        this.characterPreview = all.slice(0, 3);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar personagens', err),
    });
  }

  openSettingsModal(): void {
    this.isSettingsModalOpen = true;
  }

  closeSettingsModal(): void {
    this.isSettingsModalOpen = false;
  }

  onTwoFactorUpdated(isEnabled: boolean): void {
    if (this.authOptions) {
      this.authOptions.isTwoFactorEnabled = isEnabled;
    }
  }

  editProfile(): void {
    this.router.navigate(['/perfil/editar']);
  }

  logout(): void {
    this.authService.Logout();
    this.router.navigate(['/login']);
  }
}