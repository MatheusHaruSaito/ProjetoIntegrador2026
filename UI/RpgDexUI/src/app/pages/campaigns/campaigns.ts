import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CharacterService } from '../../services/character-service';
import { AuthService } from '../../services/auth-service';
import { Character } from '../../../models/character';

export interface Campaign {
  id: number;
  name: string;
  imageUrl: string;
}

const LAST_ACCESSED_KEY = 'rpgdex-last-accessed-chars';

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './campaigns.html',
  styleUrls: ['./campaigns.css']
})
export class CampaignsComponent implements OnInit {
  private characterService = inject(CharacterService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  myCampaigns: Campaign[] = [
    { id: 1, name: 'A Mina Perdida',     imageUrl: 'https://placehold.co/400x400/e0e0e0/9E74D0?text=Campanha+1' },
    { id: 2, name: 'Maldição de Strahd', imageUrl: 'https://placehold.co/400x400/e0e0e0/9E74D0?text=Campanha+2' }
  ];

  isModalOpen = false;
  toggleModal() { this.isModalOpen = !this.isModalOpen; }

  myCharacters: Character[] = [];

  ngOnInit(): void {
    this.loadCharacters();
  }

  private loadCharacters(): void {
    const userId = this.authService.getLoggedUserId();
    this.characterService.GetAll(userId!).subscribe({
      next: (response) => {
        const all = response.data ?? [];
        const filtered = userId ? all.filter(c => c.userId === userId) : all;
        this.myCharacters = this.sortByLastAccessed(filtered);
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  // Ordena pelo último acesso registrado no localStorage
  private sortByLastAccessed(chars: Character[]): Character[] {
    const accessed = this.getLastAccessedMap();
    return [...chars].sort((a, b) => {
      const ta = accessed[a.id] ?? 0;
      const tb = accessed[b.id] ?? 0;
      return tb - ta; // mais recente primeiro
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
    // Registra o timestamp de acesso antes de navegar
    const map = this.getLastAccessedMap();
    map[id] = Date.now();
    localStorage.setItem(LAST_ACCESSED_KEY, JSON.stringify(map));
    this.router.navigate(['/personagens', id]);
  }

  // Retorna há quanto tempo o personagem foi acessado (ex: "Agora", "5 min atrás")
  lastAccessedLabel(id: string): string {
    const map = this.getLastAccessedMap();
    const ts = map[id];
    if (!ts) return 'Nunca acessado';
    const diff = Math.floor((Date.now() - ts) / 1000); // segundos
    if (diff < 60) return 'Agora mesmo';
    if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
  }

  wasAccessed(id: string): boolean {
    return !!this.getLastAccessedMap()[id];
  }
}