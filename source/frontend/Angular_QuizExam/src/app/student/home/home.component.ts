import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../shared/service/auth.service';
import { TokenKey } from '../../shared/enums';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  windowScrolled = false;

  constructor(public authService: AuthService) {
    authService.loadProfile(TokenKey.STUDENT);
  }

  @HostListener('window:scroll', ['$event']) // Lắng nghe sự kiện scroll trên cửa sổ
  onScroll(event: Event): void {
    this.windowScrolled = window.scrollY != 0;
  }

  scrollToTop(): void {
    window.scrollTo(0, 0);
  }
}