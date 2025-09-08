import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { ExaminationResponse } from '../../../../shared/models/examination.model';
import { ExaminationService } from '../../../../shared/service/examination/examination.service';
import { UrlService } from '../../../../shared/service/url.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

declare var $: any;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: [
    './../../../../shared/styles/student/style.css',
    './../../../../shared/styles/popup.css',
    './list.component.css'
  ]
})
export class ListComponent implements OnInit {
  examList: ExaminationResponse[] = [];
  exam: ExaminationResponse = { } as ExaminationResponse;

  isPopupExam: boolean = false;
  examIndex: number = 0;

  constructor(
    private authService: AuthService,
    private titleService: Title,
    private examService: ExaminationService,
    public urlService: UrlService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('List of Exams');
    this.loadData();
  }

  loadData(): void {
    this.examService.getExamListForStudent().subscribe({
      next: (examResponse) => {
        this.examList = examResponse;
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  openPopupExam(examId: number) {
    this.isPopupExam = true;
    this.exam = this.examList.filter(exam => exam.id == examId)[0];
  }

  closePopup(): void {
    this.isPopupExam = false;
    this.examIndex = 0; // Reset khi đóng popup
  }

  startExam(examId: number): void {
    const startTime = new Date(this.exam.startTime); // Chuyển đổi startTime sang Date
    const currentTime = new Date(); // Lấy thời gian hiện tại

    if (startTime > currentTime) {
      this.toastr.warning('The exam has not started yet. Please come back later.');
    }
    else {
      this.router.navigate([this.urlService.getExamDetailUrl('STUDENT', examId)]);
    }
  };
}