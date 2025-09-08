import { Component } from '@angular/core';
import { AuthService } from '../../../../shared/service/auth.service';
import { StudentComponent } from '../../../student.component';
import { TokenKey } from '../../../../shared/enums';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  constructor(public authService: AuthService, public student: StudentComponent) {}

  onLogout() {
    this.authService.logout(TokenKey.STUDENT);
  }
}
