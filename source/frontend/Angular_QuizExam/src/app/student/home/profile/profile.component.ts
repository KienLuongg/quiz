import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { ChangePassword, ValidationError } from '../../../shared/models/models';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: [
    './../../../shared/styles/student/style.css',
    './profile.component.css'
  ]
})
export class ProfileComponent implements OnInit {
  changePasswordForm: ChangePassword = { };
  formError: ValidationError = { };

  showPasswordChangeForm: boolean = false;
  isChangePasswordButtonVisible: boolean = true;

  constructor(
    public authService: AuthService,
    private titleService: Title,
    private toastr: ToastrService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Profile');
  }

  convertDateFormat(dateObj: Date | undefined): string {
    // Dùng DatePipe để chuyển đổi đối tượng Date sang định dạng 'dd/MM/yyyy'
    return this.datePipe.transform(dateObj, 'dd/MM/yyyy')!;
  }

  initializeForm(): void {
    this.formError = { };
    this.changePasswordForm = { };
    this.checkFormErrors();
  }

  // Hiển thị form đổi mật khẩu
  showChangePasswordForm(): void {
    this.initializeForm();
    this.showPasswordChangeForm = true;
    this.isChangePasswordButtonVisible = false;
  }

  // Ẩn form đổi mật khẩu
  hideChangePasswordForm(): void {
    this.initializeForm();
    this.showPasswordChangeForm = false;
    setTimeout(() => { this.isChangePasswordButtonVisible = true; }, 500);
  }
  
  visiblePassword(inputId: string, iconId: string): void {
    // Tìm phần tử đầu vào mật khẩu và icon bằng ID
    const passwordInput = document.getElementById(inputId) as HTMLInputElement | null;
    const toggleIcon = document.getElementById(iconId) as HTMLElement | null;

    if (passwordInput && toggleIcon) {
      // Kiểm tra và thay đổi thuộc tính 'type' giữa 'password' và 'text'
      const isPassword = passwordInput.getAttribute("type") === "password";
      passwordInput.setAttribute("type", isPassword ? "text" : "password");

      // Thay đổi icon dựa trên trạng thái của trường mật khẩu
      if (isPassword) {
        toggleIcon.classList.remove('mdi-eye-off-outline');
        toggleIcon.classList.add('mdi-eye-outline');
      } else {
        toggleIcon.classList.remove('mdi-eye-outline');
        toggleIcon.classList.add('mdi-eye-off-outline');
      }
    } else {
      console.error(`Element with id ${inputId} or ${iconId} not found.`);
    }
  }

  checkFormErrors(): void {
    if (Object.values(this.formError).some(error => error?.trim())) {
      document.querySelector('.change-password-form')?.classList.add('error-active');
    }
    else {
      document.querySelector('.change-password-form')?.classList.remove('error-active');
    }
  }

  changePassword(): void {
    this.formError = { };
    this.authService.changePassword(this.changePasswordForm).subscribe({
      next: () => {
        this.toastr.success(`Change password successfully!`, 'Success', { timeOut: 3000 });
        this.hideChangePasswordForm();
      },
      error: (err) => {
        this.authService.handleError(err, this.formError, '', 'change password');
        this.checkFormErrors();
      }
    });
  }
}