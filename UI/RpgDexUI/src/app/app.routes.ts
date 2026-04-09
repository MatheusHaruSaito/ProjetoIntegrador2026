import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { UserLoginComponent } from './pages/user-login/user-login.component';
import { UserRegisterComponent } from './pages/user-register/user-register.component';
import { ProfileComponent } from './pages/profile/profile';
import { authGuard } from './guards/auth.guard'; 

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, 
  { path: 'home', component: HomeComponent },
  { path: 'login', component: UserLoginComponent },
  { path: 'cadastro', component: UserRegisterComponent },
  
  { 
    path: 'perfil', 
    component: ProfileComponent, 
    canActivate: [authGuard] 
  },

  { 
    path: 'campanhas', 
    component: ProfileComponent, 
    canActivate: [authGuard] 
  },

  { path: '**', redirectTo: '/home' }
];