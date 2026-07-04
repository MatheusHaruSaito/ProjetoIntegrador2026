import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { UserLoginComponent } from './pages/user-login/user-login.component';
import { UserRegisterComponent } from './pages/user-register/user-register.component';
import { CharacterList } from './pages/character-list/character-list';
import { CharacterEditor } from './pages/character-editor/character-editor';
import { CampaignsComponent } from './pages/campaigns/campaigns';
import { ProfileComponent } from './pages/profile/profile';
import { EditProfileComponent } from './pages/edit-profile/edit-profile';
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
    path: 'perfil/editar',
    component: EditProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: 'personagens',
    component: CharacterList,
    canActivate: [authGuard]
  },
  {
    path: 'personagens/:id',
    component: CharacterEditor,
    canActivate: [authGuard]
  },
  {
    path: 'campanhas',
    component: CampaignsComponent,
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/home' }
];