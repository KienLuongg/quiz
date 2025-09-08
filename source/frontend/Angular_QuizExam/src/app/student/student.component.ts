import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/service/auth.service';
import { TokenKey } from '../shared/enums';

@Component({

  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrl: './student.component.css'
})
export class StudentComponent implements OnInit {
  darkMode: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.loadTheme();
  }

  saveTheme(isDarkMode: boolean): void {
    if (this.authService.isLocalStorageAvailable()) {
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
      this.updateBodyClass(isDarkMode);
    }
  }

  // Tải trạng thái chế độ từ localStorage
  loadTheme(): void {
    if (this.authService.isLocalStorageAvailable()) {
      const theme = localStorage.getItem('theme');
      this.darkMode = theme === 'dark';
      this.updateBodyClass(this.darkMode);
    }
  }

  // Cập nhật lớp CSS
  updateBodyClass(isDarkMode: boolean): void {
    const body = document.getElementById('app');
    if (body) {
      if (isDarkMode) {
        body.setAttribute('QuizTech-theme', 'dark');
      } else {
        body.setAttribute('QuizTech-theme', 'light');
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
}
