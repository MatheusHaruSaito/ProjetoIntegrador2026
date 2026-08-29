import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CharacterService } from '../../services/character-service';
import { AuthService } from '../../services/auth-service';
import { CampaignService } from '../../services/campaign-service';
import { Character } from '../../../models/character';
import { Campaign } from '../../../models/campaign';
import { CreateJoinCampaignModalComponent } from '../../modals/create-join-campaign-modal/create-join-campaign-modal';

const LAST_ACCESSED_KEY = 'rpgdex-last-accessed-chars';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, RouterModule, CreateJoinCampaignModalComponent],
  templateUrl: './campaigns.html',
  styleUrls: ['./campaigns.css'],
})
export class CampaignsComponent implements OnInit {
  private characterService = inject(CharacterService);
  private campaignService = inject(CampaignService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  myCampaigns: Campaign[] = [];
  myCharacters: Character[] = [];
  currentUserId = '';

  isModalOpen = false;
  activeModalTab: 'create' | 'join' = 'create';

  ngOnInit(): void {
    this.currentUserId = this.authService.getLoggedUserId() ?? '';
    if (this.currentUserId) {
      this.loadCampaigns();
      this.loadCharacters();
    }
  }

  private loadCampaigns(): void {
    this.campaignService.GetAllByUser().subscribe({
      next: (r) => {
        this.myCampaigns = r.data ?? [];

        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  private loadCharacters(): void {
    this.characterService.GetAll().subscribe({
      next: (r) => {
        const all = r.data ?? [];
        const filtered = all.filter((c) => c.userId === this.currentUserId);

        //Criar paginamento na api dps (Refatorar)
        // Ordena por último acesso e limita aos 5 mais recentes
        this.myCharacters = this.sortByLastAccessed(filtered).slice(0, 5);
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  // --- LÓGICA DE ÚLTIMO ACESSO ---
  private sortByLastAccessed(chars: Character[]): Character[] {
    const accessed = this.getLastAccessedMap();
    return [...chars].sort((a, b) => {
      const ta = accessed[a.id] ?? 0;
      const tb = accessed[b.id] ?? 0;
      return tb - ta;
    });
  }

  private getLastAccessedMap(): Record<string, number> {
    try {
      return JSON.parse(localStorage.getItem(LAST_ACCESSED_KEY) ?? '{}');
    } catch {
      return {};
    }
  }

  openCharacter(id: string): void {
    const map = this.getLastAccessedMap();
    map[id] = Date.now();
    localStorage.setItem(LAST_ACCESSED_KEY, JSON.stringify(map));
    this.router.navigate(['/personagens', id]);
  }

  lastAccessedLabel(id: string): string {
    const map = this.getLastAccessedMap();
    const ts = map[id];
    if (!ts) return 'Nunca acessado';
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'Agora mesmo';
    if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
  }

  wasAccessed(id: string): boolean {
    return !!this.getLastAccessedMap()[id];
  }

  // --- MODAL & CAMPANHAS ---
  openModal(tab: 'create' | 'join'): void {
    this.activeModalTab = tab;
    this.isModalOpen = true;
  }

  handleCreateCampaign(formData: FormData): void {
    formData.append('gameMasterId', this.currentUserId);
    this.campaignService.Post(formData as any).subscribe({
      next: () => this.loadCampaigns(),
      error: () => {},
    });
  }

  handleJoinCampaign(payload: { campaignId: string; password?: string }): void {
    this.campaignService
      .AddPlayer({
        campaignId: payload.campaignId,
        playerId: this.currentUserId,
        password: payload.password,
      })
      .subscribe({
        next: () => {
          alert('Você entrou na campanha!');
          this.loadCampaigns();
        },
        error: () => alert('Erro ao entrar na campanha. Verifique o ID e Senha.'),
      });
  }

  goToCampaignDetail(id: string): void {
    this.router.navigate(['/campanha', id]);
  }

  formatNextSession(dateValue: any): string {
    if (!dateValue) return 'A Definir';

    const sessionDate = new Date(dateValue);
    const now = new Date();

    if (isNaN(sessionDate.getTime()) || sessionDate.getFullYear() <= 2000 || sessionDate < now) {
      return 'A Definir';
    }

    return sessionDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  }
}
