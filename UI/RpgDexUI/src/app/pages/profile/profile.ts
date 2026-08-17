import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { CharacterService } from '../../services/character-service';
import { CampaignService } from '../../services/campaign-service';
import { UserResponse } from '../../../models/userResponse';
import { Character } from '../../../models/character';
import { AuthOptionsResponse } from '../../../models/authOptionsResponse';
import { SettingsModalComponent } from '../../modals/settings-modal/settings-modal';
import { Campaign } from '../../../models/campaign';

const THEME_KEY = 'rpgdex-theme';

export interface CampaignDisplayItem {
  id: string;
  title: string;
  role: string;
  iconPath?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, SettingsModalComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'], // 🟢 Corrigido de styleUrl para styleUrls
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private characterService = inject(CharacterService);
  private campaignService = inject(CampaignService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  user: UserResponse | null = null;
  authOptions: AuthOptionsResponse | null = null;
  isDarkMode = false;
  isSettingsModalOpen = false;

  characterPreview: Character[] = [];
  characterTotal = 0;

  campaignPreview: CampaignDisplayItem[] = [];
  campaignTotal = 0;

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
          this.loadCampaignPreview();
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
    if (!userId) return;

    this.characterService.GetAll(userId).subscribe({
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
  private loadCampaignPreview(): void {
    const userId = this.authService.getLoggedUserId();
    if (!userId) return;

    this.campaignService.GetAll().subscribe({
      next: (response) => {
        const allCampaigns: Campaign[] = response.data ?? [];

        const userCampaigns = allCampaigns.filter(
          (c) => c.gameMasterId === userId || (c.playerIds && c.playerIds.includes(userId)),
        );

        this.campaignTotal = userCampaigns.length;

        this.campaignPreview = userCampaigns.slice(0, 3).map((c) => ({
          id: c.id,
          title: c.title,
          role: c.gameMasterId === userId ? 'Mestre' : 'Jogador',
          iconPath: c.iconPath,
        }));

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar campanhas', err),
    });
  }

  editProfile(): void {
    this.router.navigate(['/perfil/editar']);
  }

  logout(): void {
    this.authService.Logout();
    this.router.navigate(['/login']);
  }
}
