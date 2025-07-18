import {Component, inject} from '@angular/core';
import {Router,RouterLink} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../../member/services/auth.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // Déclaration des dépendances
  fb : FormBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  errorMessage: string | null = null;

  loginForm = this.fb.group({
    email: ['', {
      validators: [Validators.required, Validators.email],
      updateOn: 'change'
    }],
    password: ['', {
      validators: [Validators.required],
      updateOn: 'change'
    }]
  });


  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        // Handle successful login
        this.router.navigate(['']).then(r => console.log(r));
      },
      error: (error) => {
        this.errorMessage = this.authService.errorMessage;
        console.log(this.errorMessage);
        // Handle login error
        console.error('Login failed', error);
      }
    });
  }
}
