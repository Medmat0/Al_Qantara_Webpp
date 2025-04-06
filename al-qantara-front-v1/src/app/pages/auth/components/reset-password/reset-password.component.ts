import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../member/services/auth.service';
import { Router } from '@angular/router';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, AsyncPipe, NgIf]
})
export class ResetPasswordComponent{
  fb: FormBuilder = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  showResetForm: boolean = false;



  validationCodeForm = this.fb.group({
    email: ['', {
      validators: [Validators.required, Validators.email],
      updateOn: 'blur'
    }],
  });

  resetPasswordForm = this.fb.group({
    password: ['', {
      validators: [Validators.required, Validators.minLength(8)],
      updateOn: 'blur'
    }],
    accessCode: ['', {
      validators: [Validators.required],
      updateOn: 'blur'
    }],
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
        console.log('Verification code sent successfully', response);
      },
      error: (error) => {
        // Handle error in sending verification code
        console.error('Error sending verification code', error);
      }
    });
  }

  onSubmitNewPassword(): void {
    if (this.resetPasswordForm.invalid) {
      return;
    }

    const { password, accessCode} = this.resetPasswordForm.value;
    console.log(password, accessCode);

    // Handle submitting new password
    this.authService.resetPassword(password,accessCode).subscribe({
      next: (response) => {
        // Handle successful password reset
        console.log('Password reset successfully', response);
        this.router.navigate(['/auth/login']).then(r => console.log(r));
      },
      error: (error) => {
        // Handle error in resetting password
        console.error('Error resetting password', error);
      }
    });
  }
}
