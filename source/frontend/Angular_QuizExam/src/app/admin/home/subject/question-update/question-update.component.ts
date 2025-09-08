import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../../admin.component';
import { Sem } from '../../../../shared/models/sem.model';
import { SubjectResponse } from '../../../../shared/models/subject.model';
import { ChapterResponse } from '../../../../shared/models/chapter.model';
import { LevelResponse } from '../../../../shared/models/level.model';
import { QuestionResponse, QuestionRequest, AnswerRequest } from '../../../../shared/models/question.model';
import { ValidationError } from '../../../../shared/models/models';
import { SubjectService } from '../../../../shared/service/subject/subject.service';
import { ChapterService } from '../../../../shared/service/chapter/chapter.service';
import { LevelService } from '../../../../shared/service/level/level.service';
import { QuestionService } from '../../../../shared/service/question/question.service';
import { UrlService } from '../../../../shared/service/url.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-question-update',
  templateUrl: './question-update.component.html',
  styleUrls: [
    './../../../../shared/styles/admin/style.css',
    './../../../../shared/styles/admin/question-form.css',
    './../../../../shared/styles/popup.css',
    './question-update.component.css'
  ]
})

export class QuestionUpdateComponent implements OnInit {
  subjectId: number;
  questionId: number;

  sem: Sem;
  subject: SubjectResponse;
  chapterList: ChapterResponse[] = [];
  levelList: LevelResponse[] = [];

  answerForms: AnswerRequest[] = [];
  questionForm: QuestionRequest;
  validationError: ValidationError = { };

  changeImg: boolean = false;

  isPopupChapter: boolean = false;

  searchChapter: string = '';
  filterChapters: ChapterResponse[] = [];
  tempSelectedChapters: number[] = [];

  isPopupDeleteAnswer: boolean = false;
  isPopupCancel: boolean = false;

  answerIndex: number | null = null;

  dialogTitle: string = '';
  dialogMessage: string = '';
  isConfirmationPopup: boolean = false;

  constructor(
    private authService: AuthService,
    private titleService: Title,
    public admin: AdminComponent,
    private subjectService: SubjectService,
    private chapterService: ChapterService,
    private levelService: LevelService,
    private questionService: QuestionService,
    public urlService: UrlService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.subjectId = Number(this.activatedRoute.snapshot.params['subjectId']) ?? 0;
    this.questionId = Number(this.activatedRoute.snapshot.params['id']) ?? 0;
    this.sem = { id: 0, name: '' };
    this.subject = { id: 0, name: '', image: '', status: 0, sem: this.sem };
    this.questionForm = { subjectId: this.subjectId, chapters: [], levelId: 0, content: '', answers: [] }
  }

  ngOnInit(): void {
    this.titleService.setTitle('Edit Question');
    this.loadData();
  }

  loadData(): void {
    forkJoin([
      this.subjectService.getSubjectById(this.subjectId),
      this.chapterService.getChapterList(this.subjectId),
      this.levelService.getLevelList(),
      this.questionService.getQuestionById(this.questionId)
    ])
    .subscribe({
      next: ([subjectResponse, chapterResponse, levelResponse, questionResponse]) => {
        if (!subjectResponse || !subjectResponse.id) {
          this.toastr.warning('Subject not found', 'Warning');
          this.router.navigate([this.urlService.getSubjectUrl('ADMIN')]);
          return;
        }
        if (!Array.isArray(levelResponse) || levelResponse.length <= 0) {
          this.toastr.warning('Level not found', 'Warning');
          this.router.navigate([this.urlService.getQuestionUrl('ADMIN', this.subjectId)]);
          return;
        }
        if (!questionResponse || !questionResponse.id) {
          this.toastr.warning('Question not found', 'Warning');
          this.router.navigate([this.urlService.getQuestionUrl('ADMIN', this.subjectId)]);
          return;
        }
  
        this.subject = subjectResponse; // Lưu dữ liệu subject
        this.chapterList = chapterResponse; // Lưu dữ liệu chapters
        this.levelList = levelResponse; // Lưu dữ liệu levels
        this.convertToRequest(questionResponse);
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  convertToRequest(question: QuestionResponse): void {
    const levelExists = this.levelList.some(level => level.id == question.level.id);
    
    this.questionForm.subjectId = question.subject.id;
    this.questionForm.chapters = question.chapters.map(chapter => chapter.id);
    this.questionForm.levelId = levelExists ? question.level.id : 0;
    this.questionForm.content = question.content;
    this.questionForm.answers = question.answers.map(answer => ({
      content: answer.content,
      isCorrect: answer.isCorrect
    }));
    this.questionForm.image = question.image;
  }

  getSelectedChaptersNames(): string {
    const selectedChapters = this.chapterList.filter(chapter => this.questionForm.chapters.includes(chapter.id));
    return selectedChapters.map(chapter => `[${chapter.name}]`).join(' ') || 'Choose Chapter';
  }

  openPopupConfirm(title: string, message: string): void {
    this.dialogTitle = title;
    this.dialogMessage = message;
    this.isConfirmationPopup = true;
  }

  openPopupNotice(title: string, message: string): void {
    this.dialogTitle = title;
    this.dialogMessage = message;
    this.isConfirmationPopup = false;
  }

  openPopupChapter(): void {
    this.isPopupChapter = true;
    this.tempSelectedChapters = this.questionForm.chapters.slice();
    this.searchChapter = '';
    this.onSearchChange();
  }

  onSearchChange(): void {
    this.filterChapters = this.chapterList.filter(chapter => chapter.name.toLowerCase().includes(this.searchChapter.toLowerCase()));
  }

  toggleChapterSelection(chapterId: number, event: Event): void {
    const checkbox = (event.target as HTMLInputElement);

    if (checkbox.checked) {
      // Thêm chapter vào mảng tạm thời nếu checkbox được tick
      this.tempSelectedChapters.push(chapterId);
    }
    else {
      // Xóa chapter khỏi mảng tạm thời nếu checkbox bị bỏ tick
      const index = this.tempSelectedChapters.indexOf(chapterId);
      if (index > -1) {
        this.tempSelectedChapters.splice(index, 1);
      }
    }
  }

  confirmChapterSelection(): void {
    // Cập nhật chapters cho câu hỏi
    this.questionForm.chapters = this.tempSelectedChapters;
    
    // Đóng popup
    this.closePopupChapter();
  }

  closePopupChapter(): void {
    this.isPopupChapter = false;
    this.tempSelectedChapters = [];
  }

  addAnswer(): void {
    this.questionForm.answers.push({ content: '', isCorrect: false });
  }

  openPopupDeleteAnswer(index: number): void {
    // Kiểm tra nếu câu hỏi có nhiều hơn 4 câu trả lời
    if (this.questionForm.answers.length > 4) {
      this.answerIndex = index;
      this.openPopupConfirm('Are you sure?', 'Do you really want to delete this answer? This action cannot be undone.');
    }
    else {
      this.openPopupNotice('Notice', 'You cannot delete any answer because at least 4 answers are required for each question.');
    }
    this.isPopupDeleteAnswer = true;
  }

  confirmDeleteAnswer(): void {
    if (this.answerIndex !== null) {
      this.questionForm.answers.splice(this.answerIndex, 1);
      this.closePopupDialog();
      this.toastr.success('The answer has been deleted.', '', { timeOut: 2000 });
    }
  }

  openPopupConfirmCancel(): void {
    this.openPopupConfirm('Are you sure?', 'Do you really want to cancel? Any unsaved changes will be lost.');
    this.isPopupCancel = true;
  }

  confirmCancel(): void {
    this.closePopupDialog();
    this.router.navigate([this.urlService.getQuestionUrl('ADMIN', this.subjectId)]);
  }

  confirmAction(): void {
    if (this.isPopupDeleteAnswer) {
      this.confirmDeleteAnswer();
    }
    if (this.isPopupCancel) {
      this.confirmCancel();
    }
  }

  closePopupDialog(): void {
    this.answerIndex = null;
    this.isPopupDeleteAnswer = false;
    this.isPopupCancel = false;
  }

  chooseImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const imgQuestion = document.getElementById(`image-question`) as HTMLImageElement;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imgQuestion.src = e.target?.result as string;
        imgQuestion.style.display = 'block';
      };
      reader.readAsDataURL(file);
      this.questionForm.file = file;
      this.questionForm.image = file.name;
      this.changeImg = true;
    }
  }

  removeImage(): void {
    const imgQuestion = document.getElementById(`image-question`) as HTMLImageElement;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Xóa ảnh
    this.questionForm.file = null;
    this.questionForm.image = '';
    this.changeImg = true;
    imgQuestion.src = '';
    imgQuestion.style.display = 'none';
    
    // Đặt lại giá trị input file
    if (fileInput) {
        fileInput.value = '';
    }
  }

  saveQuestion(): void {
    this.validationError = { }
    this.questionService.updateQuestion(this.questionId, this.questionForm, this.changeImg).subscribe({
      next: (questionResponse) => {
        this.toastr.success(`Question has been saved successfully!`, 'Success', { timeOut: 3000 });
        this.router.navigate([this.urlService.getQuestionUrl('ADMIN', this.subjectId)]);
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'question', 'update question');
      }
    });
  }
}