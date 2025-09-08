import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dialog-popup',
  templateUrl: './dialog-popup.component.html',
  styleUrls: ['./dialog-popup.component.css']
})
export class DialogPopupComponent {
  @Input() isVisible: boolean = false; // Điều khiển hiển thị popup
  
  @Input() title: string = ''; // Tiêu đề của popup
  @Input() message: string = ''; // Nội dung thông báo

  @Input() isConfirmationPopup: boolean = false; // Biến xác định kiểu popup

  @Output() confirm = new EventEmitter<void>(); // Phát sự kiện xác nhận
  @Output() close = new EventEmitter<void>(); // Phát sự kiện đóng popup

  // Phương thức đóng popup
  closePopup() {
    this.close.emit();
  }

  // Phương thức xác nhận
  confirmAction() {
    this.confirm.emit();
  }
}