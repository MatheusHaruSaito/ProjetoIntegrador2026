import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CharacterService } from '../../services/character-service';
import { AuthService } from '../../services/auth-service';
import { Character } from '../../../models/character';

export interface Campaign {
  id: number;
  name: string;
  imageUrl: string;
}

export interface SheetItem  { name: string; value: any; }
export interface SheetSection {
  title: string;
  items: SheetItem[];
  subsections: SheetSection[];
}
export interface SheetColumn  { key: string; sections: SheetSection[]; scalar?: string; }

@Component({
  selector: 'app-campaigns',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './campaigns.html',
  styleUrls: ['./campaigns.css']
})
export class CampaignsComponent implements OnInit {
  private characterService = inject(CharacterService);
  private authService      = inject(AuthService);
  private cdr              = inject(ChangeDetectorRef);

  myCampaigns: Campaign[] = [
    { id: 1, name: 'A Mina Perdida',     imageUrl: 'https://placehold.co/400x400/e0e0e0/9E74D0?text=Campanha+1' },
    { id: 2, name: 'Maldição de Strahd', imageUrl: 'https://placehold.co/400x400/e0e0e0/9E74D0?text=Campanha+2' }
  ];

  isModalOpen = false;
  toggleModal() { this.isModalOpen = !this.isModalOpen; }

  myCharacters: Character[] = [];
  expandedCharacterId: string | null = null;

  ngOnInit(): void {
    this.loadCharacters();
  }

  private loadCharacters(): void {
    const userId = this.authService.getLoggedUserId();
    this.characterService.GetAll(userId!).subscribe({
      next: (response) => {
        const all = response.data ?? [];
        this.myCharacters = userId ? all.filter(c => c.userId === userId) : all;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  toggleCharacter(id: string): void {
    this.expandedCharacterId = this.expandedCharacterId === id ? null : id;
  }

  private readonly GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  private cleanKey(key: string): string {
    if (this.GUID_RE.test(key)) return 'Grupo';
    const cleaned = key.replace(
      /_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      ''
    );
    return cleaned.trim() || 'Atributo';
  }

  private buildSection(title: string, value: any): SheetSection {
    if (value === null || value === undefined || (!Array.isArray(value) && typeof value !== 'object')) {
      return { title, items: [{ name: title, value }], subsections: [] };
    }

    const items: SheetItem[] = [];
    const subsections: SheetSection[] = [];

    const entries: any[] = Array.isArray(value) ? value : [value];

    for (const entry of entries) {
      if (!entry || typeof entry !== 'object') continue;

      if (!Array.isArray(entry) && ('Name' in entry || 'Value' in entry)) {
        items.push({ name: entry.Name ?? entry.name ?? '', value: entry.Value ?? entry.value ?? '' });
      } else {
                for (const [rawKey, childValue] of Object.entries(entry)) {
          subsections.push(this.buildSection(this.cleanKey(rawKey), childValue));
        }
      }
    }

    return { title, items, subsections };
  }

  getSheetColumns(character: Character): SheetColumn[] {
    if (!character.properties) return [];

    return Object.entries(character.properties).map(([rawColKey, colValue]) => {
      const colKey = this.cleanKey(rawColKey);

      if (!Array.isArray(colValue) && typeof colValue !== 'object') {
        return { key: colKey, sections: [], scalar: String(colValue) };
      }

      const root = this.buildSection(colKey, colValue);
      return { key: colKey, sections: root.subsections.length > 0 || root.items.length > 0 ? [root] : [] };
    });
  }
}