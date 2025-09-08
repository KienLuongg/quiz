import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { HttpHeaders } from '@angular/common/http';
import { TokenKey, RoleKey, Roles } from '../../shared/enums';
import { LoginRequest, ValidationError } from '../../shared/models/models';
import { UrlService } from '../../shared/service/url.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: LoginRequest = { };
  formError: ValidationError = { };

  constructor(
    private authService: AuthService,
    private titleService: Title,
    public urlService: UrlService,
    private router: Router,
    private toastr: ToastrService
  ) {
    titleService.setTitle('Login');
    if (authService.loadToken(TokenKey.STUDENT)) {
      this.router.navigate(['']);
    }
  }

  ngOnInit(): void {
    this.titleService.setTitle('Login');
  }

  login(): void {
    this.formError = { };
    this.authService.login(this.loginForm).subscribe({
      next: (loginResponse) => {
        const headers = new HttpHeaders().set('Email', this.loginForm.email || '');
        this.authService.takeRole(headers).subscribe({
          next: (roleResponse) => {
            if ([Roles.STUDENT].includes(roleResponse.name as Roles)) {
              localStorage.setItem(TokenKey.STUDENT, JSON.stringify(loginResponse.token));
              localStorage.setItem(RoleKey.STUDENT, roleResponse.name);
              this.toastr.success('Login Successful!', 'Success', { timeOut: 2000 });
              this.router.navigate(['']);
            }
            else {
              this.toastr.error('You do not have permission to access this page.', 'Failed', { timeOut: 3000 });
            }
          },
          error: (err) => {
            this.authService.handleError(err, undefined, '', 'load data');
          }
        });
      },
      error: (err) => {
        this.authService.handleError(err, this.formError, '', 'login');
      }
    });
  }
}