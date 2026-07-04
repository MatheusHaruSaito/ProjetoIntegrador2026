import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CharacterService } from '../../services/character-service';
import { AuthService } from '../../services/auth-service';
import { Character } from '../../../models/character';
import { CreateCharacterModal } from '../../modals/create-character-modal/create-character-modal';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CreateCharacterModal],
  templateUrl: './character-list.html',
  styleUrl: './character-list.css',
})
export class CharacterList implements OnInit {
  private characterService = inject(CharacterService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  characterList: Character[] = [];
  filteredList: Character[] = [];
  searchQuery = '';
  showCreateModal = false;

  ngOnInit(): void {
    this.GetAllCharacters();
  }

  GetAllCharacters(): void {
    const userId = this.authService.getLoggedUserId();
    if (!userId) return;
    this.characterService.GetAll(userId).subscribe({
      next: (response) => {
        this.characterList = response.data ?? [];
        this.filteredList = [...this.characterList];
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }

  onSearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredList = q
      ? this.characterList.filter(c => c.name.toLowerCase().includes(q))
      : [...this.characterList];
  }

  navigateToEditor(id: string): void {
    this.router.navigate(['/personagens', id]);
  }

  DeleteCharacter(id: string): void {
    if (!confirm('Tem certeza que deseja excluir este personagem?')) return;
    this.characterService.Delete(id).subscribe({
      next: () => {
        this.characterList = this.characterList.filter(c => c.id !== id);
        this.filteredList = this.filteredList.filter(c => c.id !== id);
        this.cdr.detectChanges();
      },
      error: () => {},
    });
  }
}