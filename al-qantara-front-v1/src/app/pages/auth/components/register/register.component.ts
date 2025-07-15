import {Component, inject} from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../../member/services/auth.service';
import {CommonModule} from '@angular/common';




@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink
  ],
  templateUrl: './register.component.html',
  standalone: true,
  styleUrl: './register.component.scss'
})

export class RegisterComponent {

  fb : FormBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  errorMessage: string | null = null;



  registerForm = this.fb.group({
    nom: ['', {
      validators: [Validators.required],
      updateOn: 'change'
    }],
    prenom: ['',{
      validators: [Validators.required],
      updateOn: 'change'
    }],
    email: ['',{
      validators: [Validators.required, Validators.email],
      updateOn: 'change'
    }],
    password: ['',{
      validators: [Validators.required, Validators.minLength(8)],
      updateOn: 'change'
    }],
    confirmPassword: ['', {
      validators: [Validators.required, Validators.minLength(8),this.authService.passwordMatchValidator('password', 'confirmPassword')],
      updateOn: 'change'
    }],
    telephone: ['', {
      validators: [Validators.required, Validators.pattern(/^\+?[0-9]{7,15}$/)],
      updateOn: 'change'
    }]
  });



  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    const { nom, prenom, email, password, telephone } = this.registerForm.value;

    this.authService.register(nom, prenom, email, password, telephone).subscribe({
      next: (response) => {
        // Handle successful registration
        console.log('Registration successful', response);
        this.router.navigate(['/auth/login']).then(r => console.log(r));
      },
      error: (error) => {
        this.errorMessage = this.authService.errorMessage;
        console.log(this.errorMessage);
        // Handle registration error
        console.error('Registration failed', error);
      }
    });
  }

}
