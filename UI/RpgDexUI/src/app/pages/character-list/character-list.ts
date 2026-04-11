import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterService } from '../../services/character-service';
import { Character } from '../../../models/character';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character-list.html',
  styleUrl: './character-list.css',
})
export class CharacterList implements OnInit {
  characterService = inject(CharacterService);
  characterList: Character[] = [];

  ngOnInit(): void {
    this.GetAllCharacters();
  }

  GetAllCharacters() {
    this.characterService.GetAll().subscribe({
      next: (response) => {
        this.characterList = response.data ?? [];
      },
      error: (err) => console.error('Erro ao carregar personagens', err)
    });
  }
} 