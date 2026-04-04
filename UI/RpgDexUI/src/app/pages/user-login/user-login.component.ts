import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth'; 
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-login.component.html', 
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private cookieService: CookieService,
    private router: Router
  ) {

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = ''; 
      
      const credentials = this.loginForm.value;

      this.authService.LogIn(credentials).subscribe({
        next: (jwtToken) => {
          this.cookieService.set('JWTString', jwtToken);
          
          this.router.navigate(['/campanhas']); 
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Email ou senha incorretos. Tente novamente.';
          console.error('Erro no login:', err);
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}