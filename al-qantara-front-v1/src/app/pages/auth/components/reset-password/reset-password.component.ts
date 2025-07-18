import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../member/services/auth.service';
import { Router } from '@angular/router';
import {AsyncPipe, NgIf, NgStyle} from '@angular/common';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, NgIf, NgStyle]
})
export class ResetPasswordComponent{
  fb: FormBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  showResetForm: boolean = false;
  message: string = '';
  emailSent:string | null = '';
  isError: boolean = false;



  validationCodeForm = this.fb.group({
    email: ['', {
      validators: [Validators.required, Validators.email],
      updateOn: 'change'
    }],
  });

  resetPasswordForm = this.fb.group({
    password: ['', {
      validators: [Validators.required, Validators.minLength(8)],
      updateOn: 'change'
    }],
    accessCode: ['', {
      validators: [Validators.required],
      updateOn: 'change'
    }],
    confirmPassword: ['', {
      validators: [Validators.required, Validators.minLength(8), this.authService.passwordMatchValidator('password', 'confirmPassword')],
      updateOn: 'change'
    }]
  });

  onSendVerificationCode(): void {
    if (this.validationCodeForm.invalid) {
      return;
    }

    const { email } = this.validationCodeForm.value;
    this.authService.sendVerificationCode(email).subscribe({
      next: (response) => {
        // Handle successful sending of verification code
        this.showResetForm = true;
        this.isError = false;
        this.emailSent = 'Un email de vérification a été envoyé à ' + email;
      },
      error: (error) => {
        this.isError = true;
        // Handle error in sending verification code
        this.emailSent = this.authService.errorMessage;
        console.error('Error sending verification code', error);
      }
    });
  }

  onSubmitNewPassword(): void {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    const { password, accessCode } = this.resetPasswordForm.value;

    this.authService.resetPassword(password, accessCode).subscribe({
      next: (response) => {
        // Handle successful password reset
        this.isError = false;
        this.message = 'Password reset successfully';
        this.router.navigate(['/auth/login']).then(r => console.log(r));
      },
      error: (error) => {
        this.isError = true;
        console.error('Error resetting password', error);
        const messageFromServer = this.authService.errorMessage;

        if (typeof messageFromServer === 'string') {
          this.message = messageFromServer;
        } else {
          this.message = 'Une erreur est survenue.';
        }
      }

    });
  }
}
