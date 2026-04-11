import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { CharacterService } from '../../services/character-service';
import { AuthUser } from '../../../models/authUser';
import { Character } from '../../../models/character';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private characterService = inject(CharacterService);
  private router = inject(Router);

  user: AuthUser | null = null;
  isDarkMode = false;

  characterPreview: Character[] = [];
  characterTotal = 0;

  campaigns = [
    { id: 1, name: 'Crônicas de Arton', role: 'Mestre' },
    { id: 2, name: 'O Chamado de Cthulhu', role: 'Jogador' },
    { id: 3, name: 'Mundo de Ferro', role: 'Mestre' }
  ];

  ngOnInit(): void {
    this.loadUser();
    this.loadCharacterPreview();
  }

  private loadUser() {
    try {
      if (this.authService.isLoggedIn()) {
        this.user = this.authService.GetLoggedUser();
      } else {
        this.router.navigate(['/login']);
      }
    } catch (err) {
      console.error('Erro ao carregar usuário do Token', err);
      this.logout();
    }
  }

  private loadCharacterPreview() {
    this.characterService.GetAll().subscribe({
      next: (response) => {
        const all: Character[] = response.data ?? [];
        this.characterTotal = all.length;
        this.characterPreview = all.slice(0, 3);
      },
      error: (err) => console.error('Erro ao carregar personagens', err)
    });
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme');
  }

  editProfile() {
    alert('Funcionalidade de edição em breve!');
  }

  logout() {
    this.authService.Logout();
    this.router.navigate(['/login']);
  }
}