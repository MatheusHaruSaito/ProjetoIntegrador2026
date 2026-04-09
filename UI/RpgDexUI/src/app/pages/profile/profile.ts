import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth-service';
import { authUser } from '../../../models/authUser';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  
  user: authUser | null = null;
  isDarkMode = false;

  // Mock de campanhas para o grid
  campaigns = [
    { id: 1, name: 'Crônicas de Arton', role: 'Mestre' },
    { id: 2, name: 'O Chamado de Cthulhu', role: 'Jogador' },
    { id: 3, name: 'Mundo de Ferro', role: 'Mestre' }
  ];

  ngOnInit(): void {
    try {
      this.user = this.authService.GetLoggedUser();
    } catch (err) {
      console.error("Erro ao carregar usuário do Token", err);
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    // Lógica para aplicar classe no body futuramente
    document.body.classList.toggle('dark-theme');
  }

  editProfile() {
    alert('Funcionalidade de edição em breve!');
  }

  logout() {
    // Aqui você chamaria o método de limpar cookie do seu AuthService
    console.log("Logout acionado");
  }
}