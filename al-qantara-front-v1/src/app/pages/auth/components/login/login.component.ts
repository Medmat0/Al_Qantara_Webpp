import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../../member/services/auth.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './login.component.html',
  standalone: true,
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // Déclaration des dépendances
  fb : FormBuilder = inject(FormBuilder);
  authService = inject(AuthService);

  loginForm = this.fb.group({
    email: ['', {
      validators: [Validators.required, Validators.email], // Validateurs synchrones
      updateOn: 'blur' // Quand la validation doit se déclencher
    }],
    password: ['', {
      validators: [Validators.required], // Validateurs synchrones
      updateOn: 'blur'
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
        console.log('Login successful', response);
      },
      error: (error) => {
        // Handle login error
        console.error('Login failed', error);
      }
    });
  }
}
