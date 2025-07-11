import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../member/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  verificationStatus: 'loading' | 'success' | 'error' = 'loading';
  message: string = '';
  isVerifying: boolean = true;

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');

    if (token) {
      this.verifyEmail(token);
    } else {
      this.verificationStatus = 'error';
      this.message = 'Token de vérification manquant.';
      this.isVerifying = false;
    }
  }

  private verifyEmail(token: string): void {
    this.authService.verifyEmail(token).subscribe({
      next: (response) => {
        this.verificationStatus = 'success';
        this.message = response.message || 'Email vérifié avec succès !';
        this.isVerifying = false;

        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 3000);
      },
      error: (error) => {
        this.verificationStatus = 'error';
        this.message = error.error?.message || 'Erreur lors de la vérification de l\'email.';
        this.isVerifying = false;
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
