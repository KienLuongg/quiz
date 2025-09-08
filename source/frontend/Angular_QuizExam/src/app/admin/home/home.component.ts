import { Component } from '@angular/core';
import { AuthService } from '../../shared/service/auth.service';
import { AdminComponent } from '../admin.component';
import { Roles, TokenKey } from '../../shared/enums';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  role = Roles;

  constructor(public authService: AuthService, public admin: AdminComponent, private router: Router) {
    authService.loadProfile(TokenKey.ADMIN);
  }

  isActive(roles: Array<String>): boolean {
    return roles.includes(this.authService.employeeProfile.role.name);
  }

  urlProfile() {
    this.router.navigate([`/admin/profile`]);
  }

  onLogout() {
    this.authService.logout(TokenKey.ADMIN);
  }
}