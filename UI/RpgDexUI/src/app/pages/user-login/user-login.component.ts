import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { FormsModule } from '@angular/forms';
import { loginUser } from '../../../models/loginUser';
import { authUser } from '../../../models/authUser';

@Component({
  selector: 'app-user-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user-login.component.html',
  styleUrl: './user-login.component.css'
})
export class UserLoginComponent {
  authUserForm: loginUser={
    email: '',
    password: '',
  }
  
  authService = inject(AuthService);
  constructor() {
  }

  Login(){

    this.authService.Login(this.authUserForm).subscribe({
      next: stringa=>{
          console.log(stringa);
      },
      error: err=>{
        console.log(err)
      }
    })

    console.log(this.authService.GetLoggedUser())
  }
}
