import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../../admin.component';
import { ExaminationComponent } from '../examination.component';
import { Sem } from '../../../../shared/models/sem.model';
import { SubjectResponse } from '../../../../shared/models/subject.model';
import { ExaminationResponse, ExaminationRequest } from '../../../../shared/models/examination.model';
import { ValidationError } from '../../../../shared/models/models';
import { ExaminationService } from '../../../../shared/service/examination/examination.service';
import { UrlService } from '../../../../shared/service/url.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-exam-info',
  templateUrl: './edit-exam-info.component.html',
  styleUrls: [
    './../../../../shared/styles/admin/style.css',
    './edit-exam-info.component.css'
  ]
})
export class EditExamInfoComponent implements OnInit {
  examId: number;
  sem: Sem;
  subject: SubjectResponse;
  exam: ExaminationResponse;
  examForm: ExaminationRequest;
  validationError: ValidationError = { };

  constructor(
    private authService: AuthService,
    private titleService: Title,
    public admin: AdminComponent,
    public examComponent: ExaminationComponent,
    private examService: ExaminationService,
    public urlService: UrlService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.examId = Number(this.activatedRoute.snapshot.params['examId']) ?? 0;
    this.sem = { id: 0, name: '' };
    this.subject = { id: 0, name: '', image: '', status: 0, sem: this.sem };
    this.exam = {
      id: 0, name: '', code: '', startTime: new Date(), endTime: new Date(), duration: 0, totalQuestion: 0, maxScore: 0, type: 0,
      subject: this.subject, markResponses: [], studentResponses: [],
      questionRecordResponses: []
    };
    this.examForm = { name: '', startTime: new Date(0), endTime: new Date(0), duration: 40, subjectId: 0, type: 0, levels: { } };
  }

  ngOnInit(): void {
    this.titleService.setTitle('Edit Exam');
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
        this.convertToRequest();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  isTimeValidToSave(): boolean {
    const currentTime = new Date();
    const startTime = new Date(this.exam.startTime);
    if (currentTime < startTime) {
      return true; // Thời gian hợp lệ, có thể lưu
    }
    return false; // Thời gian không hợp lệ, không thể lưu
  }

  convertToRequest(): void {
    this.examForm.name = this.exam.name;
    this.examForm.startTime = this.exam.startTime;
    this.examForm.endTime = this.exam.endTime;
    this.examForm.duration = this.exam.duration;
    this.examForm.subjectId = this.exam.subject.id;
    this.examForm.type = this.exam.type;
  }

  validateForm(): boolean {
    let error = false;
    const startTime = new Date(this.examForm.startTime);
    const endTime = new Date(this.examForm.endTime);
    const requiredEndTime = new Date(startTime.getTime() + (this.examForm.duration + 60) * 60 * 1000);

    if (!this.examForm.name.trim()) {
      this.validationError['name'] = 'Exam name is required';
      error = true;
    }

    if (!this.examForm.startTime || startTime.getTime() == new Date(0).getTime()) {
      this.validationError['startTime'] = 'Start time is required';
      error = true;
    }

    if (!this.examForm.endTime || endTime.getTime() == new Date(0).getTime()) {
      this.validationError['endTime'] = 'End time is required';
      error = true;
    }
    else if (endTime < requiredEndTime) {
      this.validationError['endTime'] = `End time must be at least ${this.examForm.duration + 60} minutes after start time`;
      error = true;
    }
    
    if (this.examForm.duration <= 0) {
      this.validationError['duration'] = 'Duration must be greater than 0';
      error = true;
    }
    else if (this.examForm.duration > 1440) {
      this.validationError['duration'] = 'Duration cannot exceed 24 hours (1440 minutes)';
      error = true;
    }
    return error;
  }

  saveExam() {
    this.validationError = { };
    if (this.validateForm()) {
      return;
    }
    this.examService.updateExamInfo(this.examId, this.examForm).subscribe({
      next: (examResponse) => {
        this.toastr.success(`Update exam info successfully!`, 'Success', { timeOut: 3000 });
        this.router.navigate([this.urlService.getExamDetailUrl('ADMIN', this.examId)]);
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'exam', 'update exam');
      }
    });
  }
}