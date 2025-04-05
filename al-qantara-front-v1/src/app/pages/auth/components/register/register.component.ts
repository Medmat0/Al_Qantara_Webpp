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

  registerForm = this.fb.group({
    nom: ['', {
      validators: [Validators.required],
      updateOn: 'blur'
    }],
    prenom: ['',{
      validators: [Validators.required],
      updateOn: 'blur'
    }],
    email: ['',{
      validators: [Validators.required, Validators.email],
      updateOn: 'blur'
    }],
    password: ['',{
      validators: [Validators.required],
      updateOn: 'blur'
    }]
  });
  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    const { nom, prenom, email, password } = this.registerForm.value;

    this.authService.register(nom, prenom, email, password).subscribe({
      next: (response) => {
        // Handle successful registration
        console.log('Registration successful', response);
        this.router.navigate(['']).then(r => console.log(r));
      },
      error: (error) => {
        // Handle registration error
        console.error('Registration failed', error);
      }
    });
  }

}
