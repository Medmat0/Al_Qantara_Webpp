import { Routes } from '@angular/router';
import { ProfilePageComponent } from './components/profilePage/profile-page.component';
import { EditProfileComponent } from './components/editProfile/edit-profile.component';

export default [
  { path: '', component: ProfilePageComponent },
  { path: 'edit', component: EditProfileComponent }
] as Routes;
