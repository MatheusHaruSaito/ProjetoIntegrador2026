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
    this.characterService.GetAll().subscribe({
      next: (response) => {
        this.characterList = response.data ?? [];
        this.onSearch();
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao buscar personagens:', err),
    });
  }

  onSearch(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.filteredList = [...this.characterList];
      return;
    }
    this.filteredList = this.characterList.filter((char) =>
      char.name.toLowerCase().includes(query),
    );
  }

  navigateToEditor(id: string): void {
    this.router.navigate(['/personagens', id]);
  }

  DeleteCharacter(id: string): void {
    if (!confirm('Tem certeza que deseja excluir este personagem?')) return;

    this.characterService.Delete(id).subscribe({
      next: () => {
        this.GetAllCharacters();
      },
      error: (err) => console.error('Erro ao deletar personagem:', err),
    });
  }
}
