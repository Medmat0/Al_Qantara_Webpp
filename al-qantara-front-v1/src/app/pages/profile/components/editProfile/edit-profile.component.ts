import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.scss'
})
export class EditProfileComponent {
  prenom: string = '';
  nom: string = '';
  telephone: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Pré-remplir les champs avec les infos actuelles de l'utilisateur (optionnel)
    this.http.get<any>('http://localhost:3000/user/profile', { withCredentials: true })
      .subscribe({
        next: (res) => {
          console.log('GET /user/profile response:', res);
          this.prenom = res.user.prenom;
          this.nom = res.user.nom;
          this.telephone = res.user.telephone;
        },
        error: (err) => {
          console.error('Erreur lors de la récupération du profil:', err);
        }
      });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    // Validation mot de passe
    if (this.newPassword || this.confirmPassword || this.currentPassword) {
      if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
        this.errorMessage = 'Veuillez remplir tous les champs de mot de passe.';
        return;
      }
      if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = 'Les nouveaux mots de passe ne correspondent pas.';
        return;
      }
    }
    // Mise à jour du profil
    this.http.put<any>('http://localhost:3000/user/profile', {
      prenom: this.prenom,
      nom: this.nom,
      telephone: this.telephone
    }, { withCredentials: true }).subscribe({
      next: (profileRes) => {
        console.log('PUT /user/profile response:', profileRes);
        // Si mot de passe à changer
        if (this.newPassword && this.currentPassword) {
          this.http.put<any>('http://localhost:3000/user/password', {
            currentPassword: this.currentPassword,
            newPassword: this.newPassword
          }, { withCredentials: true }).subscribe({
            next: (pwdRes) => {
              console.log('PUT /user/password response:', pwdRes);
              this.successMessage = 'Profil et mot de passe mis à jour avec succès.';
              this.clearPasswords();
            },
            error: (err) => {
              console.error('Erreur lors de la mise à jour du mot de passe:', err);
              this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour du mot de passe.';
            }
          });
        } else {
          this.successMessage = 'Profil mis à jour avec succès.';
        }
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du profil:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour du profil.';
      }
    });
  }

  clearPasswords() {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }
}
