import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../admin.component';
import { TokenKey } from '../../../shared/enums';
import { UserRequest } from '../../../shared/models/user.model';
import { ChangePassword, ValidationError } from '../../../shared/models/models';
import { EmployeeService } from '../../../shared/service/employee/employee.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: [
    './../../../shared/styles/admin/style.css',
    './profile.component.css'
  ]
})
export class ProfileComponent implements OnInit {
  profileForm: UserRequest = { };
  changePasswordForm: ChangePassword = { };
  formError: ValidationError = { };

  isViewInfo: boolean = true;
  isEditMode: boolean = false;
  isChangePasswordMode: boolean = false;

  constructor(
    public authService: AuthService,
    private titleService: Title,
    public admin: AdminComponent,
    private employeeService: EmployeeService,
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

  convertToRequest(): void {
    this.profileForm.fullName = this.authService.employeeProfile.fullName;
    this.profileForm.dob = this.authService.employeeProfile.dob;
    this.profileForm.gender = this.authService.employeeProfile.gender;
    this.profileForm.address = this.authService.employeeProfile.address;
    this.profileForm.phoneNumber = this.authService.employeeProfile.phoneNumber;
    this.profileForm.email = this.authService.employeeProfile.email;
    this.profileForm.roleId = this.authService.employeeProfile.role?.id;
  }

  showInformation(): void {
    this.authService.loadProfile(TokenKey.ADMIN);
    this.isViewInfo = true;
    this.isEditMode = false;
    this.isChangePasswordMode = false;
  }

  showEditForm(): void {
    this.convertToRequest();
    this.formError = { };
    this.isViewInfo = false;
    this.isEditMode = true;
    this.isChangePasswordMode = false;
  }

  showPasswordForm(): void {
    this.changePasswordForm = { };
    this.formError = { };
    this.isViewInfo = false;
    this.isEditMode = false;
    this.isChangePasswordMode = true;
  }

  togglePasswordVisibility(inputId: string, iconId: string): void {
    const inputElement = document.getElementById(inputId) as HTMLInputElement;
    const iconElement = document.getElementById(iconId) as HTMLElement;

    if (inputElement.type === "password") {
      inputElement.type = "text";  // Đổi từ password thành text
      iconElement.classList.remove("fa-eye-slash");
      iconElement.classList.add("fa-eye");  // Đổi icon thành "eye"
    } else {
      inputElement.type = "password";  // Đổi lại thành password
      iconElement.classList.remove("fa-eye");
      iconElement.classList.add("fa-eye-slash");  // Đổi icon thành "eye-slash"
    }
  }

  updateProfile(): void {
    this.formError = { };
    this.employeeService.updateEmployee(this.authService.employeeProfile.id, this.profileForm).subscribe({
      next: () => {
        this.toastr.success(`Updated successfully!`, 'Success', { timeOut: 3000 });
        this.showInformation();
      },
      error: (err) => {
        this.authService.handleError(err, this.formError, '', 'update');
      }
    });
  }

  changePassword(): void {
    this.formError = { };
    this.authService.changePassword(this.changePasswordForm).subscribe({
      next: () => {
        this.toastr.success(`Change password successfully!`, 'Success', { timeOut: 3000 });
        this.showInformation();
      },
      error: (err) => {
        this.authService.handleError(err, this.formError, '', 'change password');
      }
    });
  }
}