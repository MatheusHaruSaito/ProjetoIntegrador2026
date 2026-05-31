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

// Tipos para renderização da ficha
export interface SheetItem  { name: string; value: any; }
export interface SheetSection { title: string; items: SheetItem[]; }
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

  /**
   * Converte properties em colunas para o template.
   *
   * Cada chave de nível superior vira uma coluna.
   * O valor pode ser:
   *   - Array de { Name, Value }          → seção única com título = nome da chave
   *   - Array de objetos com sub-chaves   → cada sub-chave vira uma seção (ex: Collum1)
   *   - String / número / outro           → scalar exibido como badge
   */
  getSheetColumns(character: Character): SheetColumn[] {
    if (!character.properties) return [];

    return Object.entries(character.properties).map(([colKey, colValue]) => {
      // Valor escalar simples
      if (!Array.isArray(colValue) && typeof colValue !== 'object') {
        return { key: colKey, sections: [], scalar: String(colValue) };
      }

      // Array direto de { Name, Value }
      if (Array.isArray(colValue) && colValue.length > 0 && 'Name' in colValue[0]) {
        return {
          key: colKey,
          sections: [{
            title: colKey,
            items: colValue.map((i: any) => ({ name: i.Name ?? i.name, value: i.Value ?? i.value }))
          }]
        };
      }

      // Array de objetos com sub-seções (ex: [{ Skills: [...] }, { Attributes: [...] }])
      if (Array.isArray(colValue)) {
        const sections: SheetSection[] = [];
        for (const block of colValue) {
          if (typeof block === 'object' && block !== null) {
            for (const [sectionKey, sectionItems] of Object.entries(block)) {
              if (Array.isArray(sectionItems)) {
                sections.push({
                  title: sectionKey,
                  items: (sectionItems as any[]).map(i => ({
                    name:  i.Name  ?? i.name  ?? '',
                    value: i.Value ?? i.value ?? ''
                  }))
                });
              }
            }
          }
        }
        return { key: colKey, sections };
      }

      // Objeto direto com sub-chaves { Skills: [...], Attributes: [...] }
      if (typeof colValue === 'object' && colValue !== null) {
        const sections: SheetSection[] = [];
        for (const [sectionKey, sectionItems] of Object.entries(colValue as Record<string, any>)) {
          if (Array.isArray(sectionItems)) {
            sections.push({
              title: sectionKey,
              items: sectionItems.map((i: any) => ({
                name:  i.Name  ?? i.name  ?? '',
                value: i.Value ?? i.value ?? ''
              }))
            });
          }
        }
        return { key: colKey, sections };
      }

      return { key: colKey, sections: [] };
    });
  }
}