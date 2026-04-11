import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '../../services/character-service';
import { AuthService } from '../../services/auth-service';
import { Character } from '../../../models/character';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './character-list.html',
  styleUrl: './character-list.css',
})
export class CharacterList implements OnInit {
  characterService = inject(CharacterService);
  authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  characterList: Character[] = [];
  showModal = false;
  isLoading = false;
  errorMessage = '';

  newCharacter: Partial<Character> = {
    name: '',
    description: ''
  };

  ngOnInit(): void {
    this.GetAllCharacters();
  }

  GetAllCharacters() {
    const userId = this.authService.GetLoggedUser().id;

    this.characterService.GetAll().subscribe({
      next: (response) => {
        const all: Character[] = response.data ?? [];
        // Filtra no frontend pelo userId do usuário logado
        // enquanto não existe endpoint GET /Character/user/{userId}
        this.characterList = all.filter(c => c.userId === userId);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar personagens', err)
    });
  }

  OpenModal() {
    this.newCharacter = { name: '', description: '' };
    this.errorMessage = '';
    this.showModal = true;
  }

  CloseModal() {
    this.showModal = false;
    this.errorMessage = '';
  }

  CreateCharacter() {
    this.errorMessage = '';

    if (!this.newCharacter.name?.trim()) {
      this.errorMessage = 'O nome do personagem é obrigatório.';
      return;
    }

    const loggedUser = this.authService.GetLoggedUser();

    const payload = {
      userId: loggedUser.id,
      name: this.newCharacter.name!.trim(),
      description: this.newCharacter.description ?? '',
      attributes: [],
      skills: []
    };

    this.isLoading = true;

    this.characterService.Post(payload as any).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.CloseModal();
        this.GetAllCharacters();
      },
      error: (err) => {
        this.isLoading = false;

        const errorBody = err.error;
        console.error('Erro ao criar personagem:', JSON.stringify(errorBody));

        if (errorBody?.errors) {
          const messages = Object.values(errorBody.errors).flat() as string[];
          this.errorMessage = messages[0] ?? 'Dados inválidos.';
        } else if (errorBody?.message) {
          this.errorMessage = errorBody.message;
        } else if (errorBody?.title) {
          this.errorMessage = errorBody.title;
        } else {
          this.errorMessage = 'Erro ao criar personagem. Tente novamente.';
        }
      }
    });
  }

  DeleteCharacter(id: string) {
    if (!confirm('Tem certeza que deseja excluir este personagem?')) return;

    this.characterService.Delete(id).subscribe({
      next: () => {
        this.characterList = this.characterList.filter(c => c.id !== id);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao excluir personagem', err)
    });
  }
}