import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../../admin.component';
import { Sem } from '../../../../shared/models/sem.model';
import { SubjectResponse } from '../../../../shared/models/subject.model';
import { ChapterResponse } from '../../../../shared/models/chapter.model';
import { LevelResponse } from '../../../../shared/models/level.model';
import { QuestionRequest, AnswerRequest } from '../../../../shared/models/question.model';
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
  selector: 'app-question-form',
  templateUrl: './question-form.component.html',
  styleUrls: [
    './../../../../shared/styles/admin/style.css',
    './../../../../shared/styles/admin/question-form.css',
    './../../../../shared/styles/popup.css',
    './question-form.component.css'
  ]
})
export class QuestionFormComponent implements OnInit {
  subjectId: number;
  
  sem: Sem;
  subject: SubjectResponse;
  chapterList: ChapterResponse[] = [];
  levelList: LevelResponse[] = [];

  answerForms: AnswerRequest[] = [];
  questionForms: QuestionRequest[] = [];
  validationError: ValidationError = { };
  
  isPopupChapter: boolean[] = [];
  popupChapterIndex: number = 0;

  searchChapter: string = '';
  filterChapters: ChapterResponse[] = [];
  tempSelectedChapters: number[] = [];

  isPopupDeleteQuestion: boolean = false;
  isPopupDeleteAnswer: boolean = false;
  isPopupCancel: boolean = false;

  questionIndex: number | null = null;
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
    this.subjectId = Number(this.activatedRoute.snapshot.params['subjectId']) || 0;
    this.sem = { id: 0, name: '' };
    this.subject = { id: 0, name: '', image: '', status: 0, sem: this.sem };
  }

  ngOnInit(): void {
    this.titleService.setTitle('Add new Question');
    this.loadData();
  }

  loadData(): void {
    this.subjectService.getSubjectById(this.subjectId).subscribe({
      next: (subjectResponse) => {
        this.subject = subjectResponse;
        
        forkJoin([this.chapterService.getChapterList(this.subjectId), this.levelService.getLevelList()])
        .subscribe({
          next: ([chapterResponse, levelResponse]) => {
            if (!Array.isArray(levelResponse) || levelResponse.length <= 0) {
              this.toastr.warning('Level not found', 'Warning');
              this.router.navigate([this.urlService.getQuestionUrl('ADMIN', this.subjectId)]);
              return;
            }
            this.chapterList = chapterResponse; // Lưu dữ liệu chapters
            this.levelList = levelResponse; // Lưu dữ liệu levels
            this.initializeQuestion();
          },
          error: (err) => {
            this.authService.handleError(err, undefined, '', 'load data');
          }
        });
      },
      error: (err) => {
        this.router.navigate([this.urlService.getSubjectUrl('ADMIN')]);
      }
    });
  }

  initializeQuestion(): void {
    this.answerForms = [
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false }
    ];
    this.questionForms = [{
      subjectId: this.subjectId,
      chapters: [],
      levelId: this.levelList[0]?.id,
      content: '',
      answers: this.answerForms,
      image: ''
    }];
    this.isPopupChapter = Array(this.questionForms.length).fill(false);
  }

  getSelectedChaptersNames(question: QuestionRequest): string {
    const selectedChapters = this.chapterList.filter(chapter => question.chapters.includes(chapter.id));
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

  openPopupChapter(questionIndex: number): void {
    this.popupChapterIndex = questionIndex;
    this.isPopupChapter[questionIndex] = true;
    if (this.questionForms[questionIndex].chapters) {
      this.tempSelectedChapters = this.questionForms[questionIndex].chapters.slice();
    }
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
    this.questionForms[this.popupChapterIndex].chapters = this.tempSelectedChapters;
    
    // Đóng popup
    this.closePopupChapter();
  }

  closePopupChapter(): void {
    this.isPopupChapter[this.popupChapterIndex] = false;
    this.popupChapterIndex = 0;
    this.tempSelectedChapters = [];
  }

  addQuestionForm(): void {
    this.answerForms = [
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false },
      { content: '', isCorrect: false }
    ];
    this.questionForms.push({
      subjectId: this.subjectId,
      chapters: [],
      levelId: this.levelList[0].id,
      content: '',
      answers: this.answerForms,
      image: ''
    });
    this.isPopupChapter.push(false);
    setTimeout(() => document.getElementById(`question-form-${this.questionForms.length - 1}`)?.scrollIntoView({ behavior: 'smooth' }), 0);
  }

  openPopupDeleteQuestion(index: number): void {
    if (this.questionForms.length > 1) {
      this.questionIndex = index;
      this.openPopupConfirm('Are you sure?', `Do you really want to delete this <b>Question ${index + 1}</b>? This action cannot be undone.`);
    }
    else {
      this.openPopupNotice('Notice', 'At least one question must remain.');
    }
    this.isPopupDeleteQuestion = true;
  }

  confirmDeleteQuestion(): void {
    if (this.questionIndex !== null) {
      this.questionForms.splice(this.questionIndex, 1);
      this.closePopupDialog();
      this.toastr.success('The question has been deleted.', '', { timeOut: 2000 });
    }
  }

  addAnswer(index: number): void {
    this.questionForms[index].answers.push({ content: '', isCorrect: false });
  }

  openPopupDeleteAnswer(qIndex: number, aIndex: number): void {
    // Kiểm tra nếu câu hỏi có nhiều hơn 4 câu trả lời
    if (this.questionForms[qIndex].answers.length > 4) {
      this.questionIndex = qIndex;
      this.answerIndex = aIndex;
      this.openPopupConfirm('Are you sure?', 'Do you really want to delete this answer? This action cannot be undone.');
    }
    else {
      this.openPopupNotice('Notice', 'You cannot delete any answer because at least 4 answers are required for each question.');
    }
    this.isPopupDeleteAnswer = true;
  }

  confirmDeleteAnswer(): void {
    if (this.questionIndex !== null && this.answerIndex !== null) {
      this.questionForms[this.questionIndex].answers.splice(this.answerIndex, 1);
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
    if (this.isPopupDeleteQuestion) {
      this.confirmDeleteQuestion();
    }
    if (this.isPopupDeleteAnswer) {
      this.confirmDeleteAnswer();
    }
    if (this.isPopupCancel) {
      this.confirmCancel();
    }
  }

  closePopupDialog(): void {
    this.questionIndex = null;
    this.answerIndex = null;
    this.isPopupDeleteQuestion = false;
    this.isPopupDeleteAnswer = false;
    this.isPopupCancel = false;
  }

  chooseImage(event: Event, questionIndex: number): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const imgQuestion = document.getElementById(`image-question${questionIndex}`) as HTMLImageElement;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imgQuestion.src = e.target?.result as string;
        imgQuestion.style.display = 'block';
      };
      reader.readAsDataURL(file);
      this.questionForms[questionIndex].file = file;
      this.questionForms[questionIndex].image = file.name;
    }
  }

  removeImage(questionIndex: number): void {
    const imgQuestion = document.getElementById(`image-question${questionIndex}`) as HTMLImageElement;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Xóa ảnh
    this.questionForms[questionIndex].file = null;
    this.questionForms[questionIndex].image = '';
    imgQuestion.src = '';
    imgQuestion.style.display = 'none';
    
    // Đặt lại giá trị input file
    if (fileInput) {
        fileInput.value = '';
    }
  }

  validateAnswers(answers: AnswerRequest[]): boolean {
    return answers.some(a => a.isCorrect) && answers.some(a => !a.isCorrect);
  }

  validateQuestions(): boolean {
    let errors = false;
    let errorMessage = '';
    let questionNumber = -1;
  
    for (var i = 0; i < this.questionForms.length; i++) {
      // Kiểm tra nếu câu hỏi chưa có nội dung
      if (!this.questionForms[i].content.trim()) {
        this.validationError[`question[${i}].content`] = 'Content Question is required';
        errors = true;
      }
  
      // Kiểm tra nếu câu trả lời không có nội dung
      this.questionForms[i].answers.forEach((answer, j) => {
        if (!answer.content.trim()) {
          this.validationError[`question[${i}].answer[${j}].content`] = 'Content Answer is required';
          errors = true;
        }
      });

      if (errors) {
        questionNumber = i;
        errorMessage = `Please fill out all fields correctly. (Question ${i + 1})`;
        break;
      }

      // Kiểm tra nếu số lượng câu trả lời < 4
      if (this.questionForms[i].answers.length < 4) {
        errorMessage = `Must have at least 4 answers. (Question ${i + 1})`;
        questionNumber = i;
        errors = true;
        break;
      }
  
      // Kiểm tra nếu không có câu trả lời đúng và sai
      if (!this.validateAnswers(this.questionForms[i].answers)) {
        errorMessage = `Must have at least one correct and one incorrect answer. (Question ${i + 1})`;
        questionNumber = i;
        errors = true;
        break;
      }

      // Kiểm tra câu trả lời giống nhau trong từng câu hỏi
      const answerContents = this.questionForms[i].answers.map(a => a.content.trim());
      const uniqueAnswers = new Set(answerContents);
      if (answerContents.length !== uniqueAnswers.size) {
        errorMessage = `Answers must be unique. (Question ${i + 1})`;
        questionNumber = i;
        errors = true;
        break;
      }
    }
  
    if (errors) {
      this.toastr.error(errorMessage, 'Error', { timeOut: 3000 });
  
      // Di chuyển đến form có lỗi
      setTimeout(() => {
        const questionError = document.getElementById(`question-form-${questionNumber}`);
        if (questionError) {
          questionError.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);
    }
    return errors;
  }

  saveQuestions(): void {
    this.validationError = { }
    if (this.validateQuestions()) {
      return; // Dừng lại nếu có lỗi
    }
    this.questionService.createQuestion(this.questionForms).subscribe({
      next: (questionResponse) => {
        this.toastr.success(`Question has been saved successfully!`, 'Success', { timeOut: 3000 });
        this.router.navigate([this.urlService.getQuestionUrl('ADMIN', this.subjectId)]);
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'question', 'create question');
      }
    });
  }
}