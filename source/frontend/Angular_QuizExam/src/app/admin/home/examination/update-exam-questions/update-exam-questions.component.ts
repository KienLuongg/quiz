import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../../admin.component';
import { QuestionResponse } from '../../../../shared/models/question.model';
import { ExaminationResponse } from '../../../../shared/models/examination.model';
import { QuestionService } from '../../../../shared/service/question/question.service';
import { ExaminationService } from '../../../../shared/service/examination/examination.service';
import { UrlService } from '../../../../shared/service/url.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-update-exam-questions',
  templateUrl: './update-exam-questions.component.html',
  styleUrls: [
    './../../../../shared/styles/admin/style.css',
    './../../../../shared/styles/popup.css',
    './update-exam-questions.component.css'
  ]
})
export class UpdateExamQuestionsComponent implements OnInit {
  examId: number;
  exam: ExaminationResponse = { } as ExaminationResponse;

  questionList: QuestionResponse[] = [];
  selectedQuestions: QuestionResponse[] = [];

  hasChanges: boolean = false;

  searchQuestionList: string = '';
  searchSelectedQuestions: string = '';

  get filteredQuestionList(): QuestionResponse[] {
    return this.questionList.filter(question => question.content.toLowerCase().includes(this.searchQuestionList.toLowerCase()));
  }

  get filteredSelectedQuestions(): QuestionResponse[] {
    return this.selectedQuestions.filter(question => question.content.toLowerCase().includes(this.searchSelectedQuestions.toLowerCase()));
  }

  isPopupSave: boolean = false;
  isPopupBack: boolean = false;

  dialogTitle: string = '';
  dialogMessage: string = '';
  isConfirmationPopup: boolean = false;

  constructor(
    private authService: AuthService,
    private titleService: Title,
    public admin: AdminComponent,
    private questionService: QuestionService,
    private examService: ExaminationService,
    public urlService: UrlService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.examId = Number(this.activatedRoute.snapshot.params['examId']) ?? 0;
  }

  ngOnInit(): void {
    this.titleService.setTitle('Update Questions for Exam');
    this.loadData();
  }

  loadData(): void {
    this.examService.getExamDetailById(this.examId).subscribe({
      next: (examResponse) => {
        if (new Date() >= new Date(examResponse.startTime)) {
          this.toastr.warning('Cannot update examination as it has already started.', 'Warning', { timeOut: 3000 });
          this.router.navigate([this.urlService.getExamDetailUrl('ADMIN', this.examId)]);
          return;
        }
        this.exam = examResponse;
        this.loadDataQuestions(examResponse.subject.id);
      },
      error: (err) => {
        this.authService.handleError(err, undefined, 'exam', 'load data');
        this.router.navigate([this.urlService.getExamUrl('ADMIN')]);
      }
    });
  }

  loadDataQuestions(subjectId: number): void {
    forkJoin([this.questionService.getQuestionListByExam(this.examId), this.questionService.getQuestionList(subjectId)])
      .subscribe({
        next: ([questionExamResponse, questionResponse]) => {
          this.selectedQuestions = questionExamResponse;

          // Lọc ra những câu hỏi trong questionList mà chưa có trong selectedQuestions
          this.questionList = questionResponse.filter(question => 
            !this.selectedQuestions.some(selected => selected.id === question.id)
          );
        },
        error: (err) => {
          this.authService.handleError(err, undefined, '', 'load data');
        }
      }
    );
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

  openPopupConfirm(title: string, message: string): void {
    this.dialogTitle = title;
    this.dialogMessage = message;
    this.isConfirmationPopup = true;
  }

  openPopupSave(): void {
    this.openPopupConfirm('Are you sure?', 'Do you want to change the questions for this exam?');
    this.isPopupSave = true;
  }

  openPopupBack(): void {
    if (this.hasChanges) {
      // Chỉ hiển thị popup nếu có thay đổi
      this.openPopupConfirm('Are you sure?', 'Do you want to cancel these changes?');
      this.isPopupBack = true;
    }
    else {
      this.router.navigate([this.urlService.getExamDetailUrl('ADMIN', this.examId)]);
    }
  }

  closePopup(): void {
    this.isPopupSave = false;
    this.isPopupBack = false;
  }

  confirmAction(): void {
    if (this.isPopupSave) {
      this.updateQuestionsInExam();
    }
    else if (this.isPopupBack) {
      this.router.navigate([this.urlService.getExamDetailUrl('ADMIN', this.examId)]);
    }
  }

  updateQuestionsInExam(): void {
    let questionIds = this.selectedQuestions.map(question => question.id);
    this.examService.updateQuestionsInExam(this.examId, questionIds).subscribe({
      next: (examResponse) => {
        this.toastr.success(`Update questions in exam successfully!`, 'Success', { timeOut: 3000 });
        this.router.navigate([this.urlService.getExamDetailUrl('ADMIN', examResponse.id)]);
      },
      error: (err) => {
        this.authService.handleError(err, undefined, 'exam', 'update questions in exam');
      }
    });
  }
}