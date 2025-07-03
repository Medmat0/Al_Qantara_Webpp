import { Component, OnInit } from '@angular/core';
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
export class EditProfileComponent implements OnInit {
  // Form fields
  prenom: string = '';
  nom: string = '';
  telephone: string = '';
  currentPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  
  // UI state
  loading: boolean = true;
  isSubmitting: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';
  
  // Password visibility toggles
  showCurrentPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  // Original user data for comparison
  originalData: any = {};

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http.get<any>('http://localhost:3000/user/profile', { withCredentials: true })
      .subscribe({
        next: (res) => {
          console.log('GET /user/profile response:', res);
          this.originalData = res.user;
          this.prenom = res.user.prenom || '';
          this.nom = res.user.nom || '';
          this.telephone = res.user.telephone || '';
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur lors de la récupération du profil:', err);
          this.errorMessage = 'Erreur lors du chargement du profil';
          this.loading = false;
        }
      });
  }

  onSubmit(): void {
    if (this.isSubmitting) return;
    
    this.errorMessage = '';
    this.successMessage = '';
    
    // Plus de validation obligatoire sur prénom et nom (PUT partiel accepté)
    
    // Validation du téléphone (optionnel mais format basique)
    if (this.telephone && !this.isValidPhone(this.telephone)) {
      this.errorMessage = 'Le format du numéro de téléphone n\'est pas valide.';
      return;
    }
    
    // Validation des mots de passe
    if (this.hasPasswordFields()) {
      if (!this.validatePasswords()) {
        return;
      }
    }
    
    this.isSubmitting = true;
    this.updateProfile();
  }

  private hasPasswordFields(): boolean {
    return !!(this.currentPassword || this.newPassword || this.confirmPassword);
  }

  private validatePasswords(): boolean {
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Veuillez remplir tous les champs de mot de passe.';
      return false;
    }
    
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Les nouveaux mots de passe ne correspondent pas.';
      return false;
    }
    
    if (this.newPassword.length < 6) {
      this.errorMessage = 'Le nouveau mot de passe doit contenir au moins 6 caractères.';
      return false;
    }
    
    if (this.currentPassword === this.newPassword) {
      this.errorMessage = 'Le nouveau mot de passe doit être différent de l\'ancien.';
      return false;
    }
    
    return true;
  }

  private updateProfile(): void {
    // Mise à jour du profil
    this.http.put<any>('http://localhost:3000/user/profile', {
      prenom: this.prenom.trim(),
      nom: this.nom.trim(),
      telephone: this.telephone.trim()
    }, { withCredentials: true }).subscribe({
      next: (profileRes) => {
        console.log('PUT /user/profile response:', profileRes);
        
        // Si mot de passe à changer
        if (this.hasPasswordFields()) {
          this.updatePassword();
        } else {
          this.handleSuccess('Profil mis à jour avec succès.');
        }
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du profil:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour du profil.';
        this.isSubmitting = false;
      }
    });
  }

  private updatePassword(): void {
    this.http.put<any>('http://localhost:3000/user/password', {
      currentPassword: this.currentPassword,
      newPassword: this.newPassword
    }, { withCredentials: true }).subscribe({
      next: (pwdRes) => {
        console.log('PUT /user/password response:', pwdRes);
        this.handleSuccess('Profil et mot de passe mis à jour avec succès.');
        this.clearPasswords();
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du mot de passe:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la mise à jour du mot de passe.';
        this.isSubmitting = false;
      }
    });
  }

  private handleSuccess(message: string): void {
    this.successMessage = message;
    this.isSubmitting = false;
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  clearPasswords(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    switch (field) {
      case 'current':
        this.showCurrentPassword = !this.showCurrentPassword;
        break;
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  getPasswordStrength(): string {
    const password = this.newPassword;
    if (!password) return '';
    
    let score = 0;
    
    // Length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    
    // Character types
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return 'weak';
    if (score <= 3) return 'medium';
    if (score <= 4) return 'good';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    const strengthMap: { [key: string]: string } = {
      'weak': 'Faible',
      'medium': 'Moyen',
      'good': 'Bon',
      'strong': 'Fort'
    };
    
    return strengthMap[strength] || '';
  }

  private isValidPhone(phone: string): boolean {
    // Regex basique pour numéros français
    const phoneRegex = /^(?:\+33|0)[1-9](?:[0-9]{8})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  hasUnsavedChanges(): boolean {
    return (
      this.prenom !== (this.originalData.prenom || '') ||
      this.nom !== (this.originalData.nom || '') ||
      this.telephone !== (this.originalData.telephone || '') ||
      this.hasPasswordFields()
    );
  }

  resetForm(): void {
    this.prenom = this.originalData.prenom || '';
    this.nom = this.originalData.nom || '';
    this.telephone = this.originalData.telephone || '';
    this.clearPasswords();
    this.errorMessage = '';
    this.successMessage = '';
  }
}