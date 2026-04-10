import { Component, inject, OnInit } from '@angular/core';
import { CharacterService } from '../../services/character-service'
import { response } from 'express';
import { Character } from '../../../models/character';
@Component({
  selector: 'app-character-list',
  imports: [],
  templateUrl: './character-list.html',
  styleUrl: './character-list.css',
})
export class CharacterList implements OnInit {
  character = inject(CharacterService);
  characterList!: Character[]| any;

  ngOnInit(): void {
    this.GetAllCharacters()
  }


  GetAllCharacters(){
    this.character.GetAll().subscribe({
      next: response =>{
        console.log(response)
          this.characterList = response.data;
      }
    })
  }
}
