import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../../admin.component';
import { ExaminationComponent } from '../examination.component';
import { Sem } from '../../../../shared/models/sem.model';
import { SubjectResponse } from '../../../../shared/models/subject.model';
import { ExaminationResponse } from '../../../../shared/models/examination.model';
import { ExaminationService } from '../../../../shared/service/examination/examination.service';
import { UrlService } from '../../../../shared/service/url.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: [
    './../../../../shared/styles/admin/style.css',
    './detail.component.css'
  ]
})
export class DetailComponent implements OnInit {
  examId: number;

  sem: Sem;
  subject: SubjectResponse;
  exam: ExaminationResponse;

  constructor(
    private authService: AuthService,
    private titleService: Title,
    public admin: AdminComponent,
    public examComponent: ExaminationComponent,
    private examService: ExaminationService,
    public urlService: UrlService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private datePipe: DatePipe
  ) {
    this.examId = Number(this.activatedRoute.snapshot.params['examId']) ?? 0;
    this.sem = { id: 0, name: '' };
    this.subject = { id: 0, name: '', image: '', status: 0, sem: this.sem };
    this.exam = {
      id: 0, name: '', code: '', startTime: new Date(), endTime: new Date(), duration: 0, totalQuestion: 0, maxScore: 0, type: 0,
      subject: this.subject, markResponses: [], studentResponses: [],
      questionRecordResponses: []
    }
  }

  ngOnInit(): void {
    this.titleService.setTitle('Exam Detail');
    this.authService.entityExporter = 'exam';
    this.loadData();
  }

  loadData(): void {
    this.examService.getExamDetailById(this.examId).subscribe({
      next: (examResponse) => {
        if (new Date() >= new Date(examResponse.endTime)) {
          this.toastr.warning('The exam has ended', 'Warning', { timeOut: 3000 });
          this.router.navigate([this.urlService.getExamUrl('ADMIN')]);
          return;
        }
        this.exam = examResponse;
      },
      error: (err) => {
        this.authService.handleError(err, undefined, 'exam', 'load data');
        this.navigateToExamList();
      }
    });
  }

  isTimeValidToUpdateQuestion(): boolean {
    const currentTime = new Date();
    const startTime = new Date(this.exam.startTime);
    if (currentTime < startTime) {
      return true; // Thời gian hợp lệ, có thể vào cập nhật
    }
    return false; // Thời gian không hợp lệ, không thể cập nhật
  }

  convertDateFormat(dateObj: Date | undefined): string {
    // Dùng DatePipe để chuyển đổi đối tượng Date sang định dạng 'dd/MM/yyyy HH:mm'
    return this.datePipe.transform(dateObj, 'dd/MM/yyyy HH:mm')!;
  }

  transformTextWithNewlines(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  navigateToExamList(): void {
    this.router.navigate([this.urlService.getExamUrl('ADMIN')]);
  }

  navigateToEditExam(): void {
    this.router.navigate([this.urlService.getEditExamInfoUrl('ADMIN', this.examId)]);
  }

  navigateToExamParticipants(): void {
    this.router.navigate([this.urlService.getAddStudentForExamUrl('ADMIN', this.examId)]);
  }

  navigateToUpdateExamQuestions(): void {
    this.router.navigate([this.urlService.getUpdateExamQuestionsUrl('ADMIN', this.examId)]);
  }

  exportPDF(): void {
    this.authService.listExporter = this.exam;
    this.exportData(this.authService.exportDataPDF(), 'exam_pdf.pdf');
  }

  exportData(exportFunction: any, fileName: string): void {
    exportFunction.subscribe({
      next: (response: any) => {
        const url = window.URL.createObjectURL(new Blob([response], { type: 'application/octet-stream' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (err: any) => {
        this.authService.handleError(err, undefined, '', 'export');
      }
    });
  }
}