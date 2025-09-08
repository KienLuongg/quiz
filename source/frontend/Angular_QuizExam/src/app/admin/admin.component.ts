import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/service/auth.service';

@Component({

  selector: 'app-admin',
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {
  darkMode: boolean = false;

  isSidebarCollapsed: boolean = false;
  
  contentSidebar: boolean = true;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.loadTheme();
    this.loadSidebarState();
  }

  saveTheme(isDarkMode: boolean): void {
    if (this.authService.isLocalStorageAvailable()) {
      localStorage.setItem('theme-admin', isDarkMode ? 'dark-admin' : 'light-admin');
      this.updateBodyClass(isDarkMode);
    }
  }

  // Tải trạng thái chế độ từ localStorage
  loadTheme(): void {
    if (this.authService.isLocalStorageAvailable()) {
      const theme = localStorage.getItem('theme-admin');
      this.darkMode = theme === 'dark-admin';
      this.updateBodyClass(this.darkMode);
    }
  }

  // Cập nhật lớp CSS
  updateBodyClass(isDarkMode: boolean): void {
    const body = document.getElementById('app');
    if (body) {
      if (isDarkMode) {
        body.setAttribute('QuizTech-theme', 'dark-admin');
      } else {
        body.setAttribute('QuizTech-theme', 'light-admin');
      }
    }
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    this.saveTheme(this.darkMode);
  }

  menuToggle(): void {
    const toggleMenu = document.querySelector(".menu");
    toggleMenu?.classList.toggle("active");
  }

  loadSidebarState(): void {
    if (this.authService.isLocalStorageAvailable()) {
      const sidebarState = localStorage.getItem('sidebar-collapsed');
      if (sidebarState !== null) {
        this.isSidebarCollapsed = JSON.parse(sidebarState);
        this.contentSidebar = !this.isSidebarCollapsed;
      }
    }
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    if (this.isSidebarCollapsed) {
      this.contentSidebar = false;
    }
    else {
      setTimeout(() => {
        this.contentSidebar = true;
      }, 500);
    }
    if (this.authService.isLocalStorageAvailable()) {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(this.isSidebarCollapsed));
    }
  }
}