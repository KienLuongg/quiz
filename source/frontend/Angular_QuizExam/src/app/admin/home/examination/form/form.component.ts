import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../../admin.component';
import { ExaminationComponent } from '../examination.component';
import { Sem } from '../../../../shared/models/sem.model';
import { SubjectResponse } from '../../../../shared/models/subject.model';
import { LevelResponse } from '../../../../shared/models/level.model';
import { QuestionResponse } from '../../../../shared/models/question.model';
import { ExaminationRequest } from '../../../../shared/models/examination.model';
import { ValidationError } from '../../../../shared/models/models';
import { SemService } from '../../../../shared/service/sem/sem.service';
import { SubjectService } from '../../../../shared/service/subject/subject.service';
import { LevelService } from '../../../../shared/service/level/level.service';
import { QuestionService } from '../../../../shared/service/question/question.service';
import { ExaminationService } from '../../../../shared/service/examination/examination.service';
import { UrlService } from '../../../../shared/service/url.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: [
    './../../../../shared/styles/admin/style.css',
    './../../../../shared/styles/popup.css',
    './form.component.css'
  ]
})

export class FormComponent implements OnInit {
  semList: Sem[] = [];
  subjectList: SubjectResponse[] = [];
  levelList: LevelResponse[] = [];

  selectedSem: number = 0;
  subjectName: string = '';

  examForm: ExaminationRequest;
  validationError: ValidationError = { };

  step: number = 0;

  isPopupLevel = false;

  hasChanges: boolean = false;

  examId: number = 0;

  questionList: QuestionResponse[] = [];
  selectedQuestions: QuestionResponse[] = [];
  searchQuestionList: string = '';
  searchSelectedQuestions: string = '';

  get filteredQuestionList(): QuestionResponse[] {
    return this.questionList.filter(question => question.content.toLowerCase().includes(this.searchQuestionList.toLowerCase()));
  }

  get filteredSelectedQuestions(): QuestionResponse[] {
    return this.selectedQuestions.filter(question => question.content.toLowerCase().includes(this.searchSelectedQuestions.toLowerCase()));
  }

  constructor(
    private authService: AuthService,
    private titleService: Title,
    public admin: AdminComponent,
    public examComponent: ExaminationComponent,
    private semService: SemService,
    private subjectService: SubjectService,
    private levelService: LevelService,
    private questionService: QuestionService,
    private examService: ExaminationService,
    public urlService: UrlService,
    private router: Router,
    private toastr: ToastrService,
    private datePipe: DatePipe
  ) {
    this.examForm = { name: '', startTime: new Date(0), endTime: new Date(0), duration: 40, subjectId: 0, type: 0, levels: { } }
  }

  ngOnInit(): void {
    this.titleService.setTitle('Create Exam');
    this.loadData();
  }

  loadData(): void {
    forkJoin([this.semService.getSemList(), this.levelService.getLevelList()])
      .subscribe({
        next: ([semResponse, levelResponse]) => {
          if (!Array.isArray(semResponse) || semResponse.length == 0) {
            this.toastr.warning('No semesters available', 'Warning');
            this.router.navigate([this.urlService.getExamUrl('ADMIN')]);
            return;
          }
          if (!Array.isArray(levelResponse) || levelResponse.length == 0) {
            this.toastr.warning('At least one level is required', 'Warning');
            this.router.navigate([this.urlService.getExamUrl('ADMIN')]);
            return;
          }
          this.semList = semResponse;
          this.levelList = levelResponse;
          this.setSelectedSem(this.semList[0].id);
          this.setupLevels();
        },
        error: (err) => {
          this.authService.handleError(err, undefined, '', 'load data');
        }
      }
    );
  }

  setSelectedSem(semId: number): void {
    this.selectedSem = semId;
    this.subjectService.getSubjectListBySem(semId).subscribe({
      next: (subjectResponse) => {
        if (!Array.isArray(subjectResponse) || subjectResponse.length == 0) {
          this.toastr.warning('No subjects available', 'Warning');
          return;
        }
        this.subjectList = subjectResponse;
        this.examForm.subjectId = this.subjectList[0].id;
        this.subjectName = this.subjectList[0].name;
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  setSelectedSubject(id: number): void {
    this.subjectName = this.subjectList.find(subject => subject.id == id)?.name || '';
  }

  setupLevels(): void {
    this.levelList.forEach(level => {
      this.examForm.levels[level.id] = 0;
    });
  }

  transformTextWithNewlines(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  convertDateFormat(dateObj: Date | undefined): string {
    // Dùng DatePipe để chuyển đổi đối tượng Date sang định dạng 'dd/MM/yyyy HH:mm'
    return this.datePipe.transform(dateObj, 'dd/MM/yyyy HH:mm')!;
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
    else if (startTime.getTime() <= new Date().getTime()) {
      this.validationError['startTime'] = 'Start time cannot be equal to or before the current time';
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

  nextStep(): void {
    this.validationError = { };
    if (this.validateForm()) {
      return;
    }
    
    if (this.examForm.type == 0) {
      this.openPopupLevel();
    }
    else {
      this.loadDataQuestionsForSelect();
    }
  }

  backStep(): void {
    this.step = 0;
    this.selectedQuestions = [];
    this.examComponent.handleBackStep(this.examComponent.manualQuestionSelectionSteps, 1);
  }

  openPopupLevel(): void {
    this.isPopupLevel = true;
  }

  closePopupLevel(): void {
    this.isPopupLevel = false;
  }

  validateLevel(): boolean {
    var error = false;
    var totalQuestions = 0;
    this.levelList.forEach(level => {
      if (this.examForm.levels[level.id] < 0) {
        this.validationError[`level[${level.id}]`] = "Question number cannot be negative.";
        error = true;
      }
      totalQuestions += this.examForm.levels[level.id];
    });
    if (totalQuestions < 10 || totalQuestions > 50) {
      this.toastr.error('Total number of questions must be between 10 and 50.', 'Error', { timeOut: 3000 });
      error = true;
    }
    return error;
  }

  autoGenerateExam(): void {
    this.validationError = { };
    if (this.validateLevel()) {
      return
    }
    this.examService.createAutoExam(this.examForm).subscribe({
      next: (examResponse) => {
        this.examId = examResponse.id;
        this.loadDataQuestionsForGenerate(this.examId);
        this.toastr.success(`Create exam successfully!`, 'Success', { timeOut: 3000 });
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'exam', 'create exam');
      }
    });
  }

  loadDataQuestionsForGenerate(examId: number): void {
    // Chuyển sang bước 2 (Check Questions)
    forkJoin([this.questionService.getQuestionListByExam(examId), this.questionService.getQuestionList(this.examForm.subjectId)])
      .subscribe({
        next: ([questionExamResponse, questionResponse]) => {
          this.selectedQuestions = questionExamResponse;

          // Lọc ra những câu hỏi trong questionList mà chưa có trong selectedQuestions
          this.questionList = questionResponse.filter(question => 
            !this.selectedQuestions.some(selected => selected.id === question.id)
          );

          this.step = 1;
          this.closePopupLevel();
          this.examComponent.handleNextStep(this.examComponent.autoGenerateExamSteps, 0);
        },
        error: (err) => {
          this.authService.handleError(err, undefined, '', 'load data');
        }
      }
    );
  }

  loadDataQuestionsForSelect(): void {
    // Chuyển sang bước 2 (Add Questions)
    this.questionService.getQuestionList(this.examForm.subjectId).subscribe({
      next: (questionResponse) => {
        this.step = 1;
        this.questionList = questionResponse;
        this.examComponent.handleNextStep(this.examComponent.manualQuestionSelectionSteps, 0);
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  moveToSelectedQuestions(question: any): void {
    const index = this.questionList.findIndex((q) => q.id == question.id);
    if (index !== -1) {
      this.selectedQuestions.push(this.questionList[index]); // Thêm vào Exam
      this.questionList.splice(index, 1); // Xóa khỏi List Question
      this.hasChanges = true; // Đánh dấu là có thay đổi
    }
  }
  
  moveToQuestionList(question: any): void {
    const index = this.selectedQuestions.findIndex((q) => q.id == question.id);
    if (index !== -1) {
      this.questionList.push(this.selectedQuestions[index]); // Thêm vào List Question
      this.selectedQuestions.splice(index, 1); // Xóa khỏi Exam
      this.hasChanges = true; // Đánh dấu là có thay đổi
    }
  }

  validateNumberQuestion(): boolean {
    const totalQuestions = this.selectedQuestions.length;
    
    if (totalQuestions < 10 || totalQuestions > 50) {
      this.toastr.error('Total number of questions must be between 10 and 50.', 'Error', { timeOut: 3000 });
      return true;
    }
    return false;
  }

  createAutoExam(): void {
    if (this.hasChanges) {
      // Nếu mà có thay đổi thì update lại câu hỏi trong bài thi
      let questionIds = this.selectedQuestions.map(question => question.id);
      this.examService.updateQuestionsInExam(this.examId, questionIds).subscribe({
        next: (examResponse) => {
          this.examComponent.step = true;
          this.examComponent.handleNextStep(this.examComponent.autoGenerateExamSteps, 1);
          this.toastr.success(`Update questions in exam successfully!`, 'Success', { timeOut: 3000 });
          this.router.navigate([this.urlService.getAddStudentForExamUrl('ADMIN', this.examId)]);
        },
        error: (err) => {
          this.authService.handleError(err, undefined, 'exam', 'update questions in exam');
        }
      });
    }
    else {
      this.examComponent.step = true;
      this.examComponent.handleNextStep(this.examComponent.autoGenerateExamSteps, 1);
      this.router.navigate([this.urlService.getAddStudentForExamUrl('ADMIN', this.examId)]);
    }
  }

  createExamWithQuestions() {
    if (this.validateNumberQuestion()) {
      return;
    }
    let questionIds = this.selectedQuestions.map(question => question.id);
    this.examService.createExamWithQuestions(this.examForm, questionIds).subscribe({
      next: (examResponse) => {
        this.examComponent.step = true;
        this.examComponent.handleNextStep(this.examComponent.manualQuestionSelectionSteps, 1);
        this.toastr.success(`Create exam successfully!`, 'Success', { timeOut: 3000 });
        this.router.navigate([this.urlService.getAddStudentForExamUrl('ADMIN', examResponse.id)]);
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'exam', 'create exam');
      }
    });
  }

  createExam() {
    this.validationError = { };
    
    if (this.examForm.type == 0) {
      this.createAutoExam();
    }
    else {
      this.createExamWithQuestions();
    }
  }
}