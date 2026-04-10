import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { UserLoginComponent } from './pages/user-login/user-login.component';
import { UserRegisterComponent } from './pages/user-register/user-register.component';
import { CharacterList } from './pages/character-list/character-list';
import { CampaignsComponent } from './pages/campaigns/campaigns';
import { ProfileComponent } from './pages/profile/profile';
import { authGuard } from './guards/auth.guard'; 

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, 
  { path: 'home', component: HomeComponent },
  { path: 'login', component: UserLoginComponent },
  { path: 'cadastro', component: UserRegisterComponent },
  { path: 'character', component: CharacterList },
  { path: 'campaign', component: CampaignsComponent },
  { 
    path: 'perfil', 
    component: ProfileComponent, 
    canActivate: [authGuard] 
  },
  { path: '**', redirectTo: '/home' }
];