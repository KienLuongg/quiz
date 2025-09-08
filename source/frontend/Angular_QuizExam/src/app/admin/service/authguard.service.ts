import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from '../../shared/service/auth.service';
import { TokenKey, RoleKey } from '../../shared/enums';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (this.authService.isLocalStorageAvailable()) {
      const token = localStorage.getItem(TokenKey.ADMIN);
      const roles = route.data["roles"] as Array<String>;
      
      if (token) {
        const role = localStorage.getItem(RoleKey.ADMIN);
        if (role && roles.includes(role)) {
          return true;
        }
        this.router.navigate(['/admin']);
      }
      this.router.navigate(['/admin/login']);
    }
    return false;
  }
}