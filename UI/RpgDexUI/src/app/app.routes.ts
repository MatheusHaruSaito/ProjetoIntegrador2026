import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { UserLoginComponent } from './pages/user-login/user-login.component';
import { UserRegisterComponent } from './pages/user-register/user-register.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, 
  { path: 'home', component: HomeComponent },
  { path: 'login', component: UserLoginComponent },
  { path: 'cadastro', component: UserRegisterComponent }
];