import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { FormsModule } from '@angular/forms';
import { LoginUser } from '../../../models/loginUser';
import { Router, RouterModule } from '@angular/router'; 

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent {
  authUserForm: LoginUser = {
    email: '',
    password: '',
  }
  
  authService = inject(AuthService);
  private router = inject(Router); 

  Login() {
    this.authService.Login(this.authUserForm).subscribe({
      next: (res) => {
        this.router.navigate(['/home']).then(() => {
          window.location.reload(); 
        });
      },
      error: (err) => {
        console.error("Erro no login", err);
        alert("Falha ao entrar. Verifique seu email e senha."); 
      }
    });
  }
}