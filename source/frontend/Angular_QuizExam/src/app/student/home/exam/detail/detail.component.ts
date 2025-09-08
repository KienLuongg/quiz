import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { MarkResponse } from '../../../../shared/models/mark.model';
import { ExaminationResponse } from '../../../../shared/models/examination.model';
import { StudentAnswerRequest, StudentQuestionAnswer } from '../../../../shared/models/student-answer.model';
import { MarkService } from '../../../../shared/service/mark/mark.service';
import { ExaminationService } from '../../../../shared/service/examination/examination.service';
import { StudentAnswerService } from '../../../../shared/service/student-answer/student-answer.service';
import { UrlService } from '../../../../shared/service/url.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: [
    './../../../../shared/styles/student/style.css',
    './detail.component.css'
  ]
})
export class DetailComponent implements OnInit, OnDestroy {
  examId: number;

  mark: MarkResponse = { } as MarkResponse;
  examDetail: ExaminationResponse = { } as ExaminationResponse;

  questionStatus: boolean[] = [];
  studentQuestionAnswer: StudentQuestionAnswer[] = [];
  submitAnswer: StudentAnswerRequest = {};

  selectedAnswers: string = 'selectedAnswers';

  beginTime: Date = new Date();
  remainingTime: string = '';
  countdown: any;
  autoSubmitTimer: any;

  isPopupConfirm: boolean = false;
  isPopupWarning: boolean = false;

  dialogTitle: string = '';
  dialogMessage: string = '';
  isConfirmationPopup: boolean = false;

  constructor(
    private authService: AuthService,
    private titleService: Title,
    private markService: MarkService,
    private examService: ExaminationService,
    private studentAnswerService: StudentAnswerService,
    public urlService: UrlService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.examId = Number(this.activatedRoute.snapshot.paramMap.get('examId')); // Lấy examId từ route
  }

  ngOnInit(): void {
    this.titleService.setTitle('Exam');
    this.examId = Number(this.activatedRoute.snapshot.paramMap.get('examId'));
    this.loadData();
    this.setupScrollListener();
    this.setupAntiCheatMonitoring();
  }

  loadData(): void {
    forkJoin([this.markService.getMarkByExam(this.examId), this.examService.getExamDetailById(this.examId)])
      .subscribe({
        next: ([markResponse, examResponse]) => {
          const startTime = new Date(examResponse.startTime);
          const endTime = new Date(examResponse.endTime);
          const currentTime = new Date(); // Lấy thời gian hiện tại

          if (startTime > currentTime) {
            this.router.navigate([this.urlService.getExamUrl('STUDENT')]);
            return;
          }
          if (markResponse.score != null) {
            this.router.navigate([this.urlService.getExamResultsUrl('STUDENT', this.examId)]);
            return;
          }
          if (markResponse.beginTime == null) {
            if (currentTime > endTime) {
              this.router.navigate([this.urlService.getExamUrl('STUDENT')]);
              return;
            }
            this.updateBeginTime(markResponse.id);
          }

          if (markResponse.warning != null) {
            this.openWarningPopup();
            this.autoSubmit();
          }

          this.mark = markResponse;
          this.examDetail = examResponse;
          this.questionStatus = Array(examResponse.questionRecordResponses.length).fill(false);
          this.calculateNewDuration();
          this.loadFromSession();
        },
        error: (err) => {
          this.authService.handleError(err, undefined, 'exam', 'load data');
          this.router.navigate([this.urlService.getExamUrl('STUDENT')]);
        }
      }
    );
  }

  updateBeginTime(markId: number): void {
    this.markService.updateBeginTime(markId).subscribe({
      next: () => { },
      error: (err) => {
        this.authService.handleError(err, undefined, 'mark', 'update begin time');
      }
    });
  }

  calculateNewDuration(): void {
    // Kiểm tra nếu đã có beginTime thì lấy dữ liệu đó, không thì lấy thời gian hiện tại.
    const beginTime = this.mark.beginTime ? new Date(this.mark.beginTime) : new Date();
    const durationMinutes = this.examDetail.duration;

    // Tính toán endTime.
    const endTime = new Date(beginTime.getTime() + durationMinutes * 60000); // thêm phút vào thời gian bắt đầu

    // Lấy thời gian hiện tại.
    const now = new Date();

    // Tính toán số giây còn lại.
    const remainingDuration = endTime > now ? Math.floor((endTime.getTime() - now.getTime()) / 1000) : 0; // Nếu thời gian đã qua, đặt thành 0
    
    this.remainingTime = this.formatTime(remainingDuration); // Cập nhật remainingTime
    this.startCountdown(remainingDuration); // Bắt đầu đếm ngược từ remainingDuration (bằng giây)
  }

  startCountdown(duration: number): void {
    let remainingSeconds = duration;
    const warningTimes = [180, 120, 60]; // Các mốc thời gian cần thông báo (giây)
  
    this.countdown = setInterval(() => {
      if (remainingSeconds <= 0) {
        this.submitAnswers(); // Optionally submit answers when time is up
        return;
      }

      // Kiểm tra và gửi thông báo cho các mốc thời gian
      if (warningTimes.includes(remainingSeconds)) {
        this.toastr.warning(`Only ${remainingSeconds / 60} minute(s) left!`);
      }
  
      remainingSeconds--;
      this.remainingTime = this.formatTime(remainingSeconds);
    }, 1000);
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${this.padNumber(hours)}:${this.padNumber(minutes)}:${this.padNumber(secs)}`;
  }

  padNumber(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  transformTextWithNewlines(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  preventDeveloperTools = (event: KeyboardEvent) => {
    if (event.key === 'F12' || (event.ctrlKey && event.key === 'u')) {
      event.preventDefault();
      this.toastr.warning("This action is disabled.");
    }
  };

  preventPrintScreen = (event: KeyboardEvent) => {
    if (event.key === 'PrintScreen') {
      event.preventDefault();
      this.toastr.warning("Taking screenshots is not allowed.");
    }
  };

  preventCopy = (event: ClipboardEvent) => {
    event.preventDefault();
    this.toastr.warning("Copying content is not allowed.");
  };

  preventRightClick = (event: MouseEvent) => {
    event.preventDefault();
    this.toastr.warning("Right-click is disabled.");
  };

  handleBeforeUnload(event: BeforeUnloadEvent): void {
    event.preventDefault();
    this.toastr.warning("Reloading the page may be considered a violation. Please be cautious!");
  };

  handleBlur = () => {
    if (this.mark.warning == null || this.mark.warning < 3) {
      this.mark.warning++;
      this.openWarningPopup();
      this.updateWarning();
    }
  };

  handleFocus = () => {
    clearInterval(this.countdown);
    this.calculateNewDuration();
  };

  setupAntiCheatMonitoring() {
    document.addEventListener('keydown', this.preventDeveloperTools); // Ngăn chặn mở Developer Tools
    document.addEventListener('keydown', this.preventPrintScreen); // Ngăn chặn Print Screen
    document.addEventListener('copy', this.preventCopy); // Ngăn chặn sao chép nội dung
    document.addEventListener('contextmenu', this.preventRightClick); // Ngăn chặn menu chuột phải
    window.addEventListener('beforeunload', this.handleBeforeUnload); // Xử lý sự kiện load lại trang
    window.addEventListener('blur', this.handleBlur); // Xử lý sự kiện blur (Check cửa sổ đó bị mất tiêu điểm)
    window.addEventListener('focus', this.handleFocus); // Xử lý sự kiện focus
  }

  setupScrollListener(): void {
    window.addEventListener('scroll', this.handleScroll);
  }

  handleScroll = (): void => {
    const sidebarContainer = document.querySelector('.sidebar-container') as HTMLElement;
    if (sidebarContainer) {
      sidebarContainer.style.transform = window.scrollY > 50 ? 'translate3d(0px, 100px, 0px)' : 'translate3d(0px, 0px, 0px)';
      sidebarContainer.style.marginBottom = window.scrollY > 50 ? "100px" : "0";
    }
  }

  scrollToQuestion(index: number): void {
    const questionElement = document.getElementById(`question-${index + 1}`);
    if (questionElement) {
      const headerOffset = 80; // Chiều cao của header
      const elementPosition = questionElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }

  getSelectedAnswerId(index: number): number | null {
    const selectedAnswer = this.examDetail.questionRecordResponses[index].answerRecords.find((answer: any) => 
      (document.getElementById(answer.id) as HTMLInputElement)?.checked
    );
    return selectedAnswer ? selectedAnswer.id : null;
  }

  getSelectedAnswerIds(index: number): number[] {
    return this.examDetail.questionRecordResponses[index].answerRecords.filter((answer: any) => 
      (document.getElementById(answer.id) as HTMLInputElement)?.checked
    ).map(answer => answer.id);
  }

  markQuestionAsCompleted(index: number): void {
    const question = this.examDetail.questionRecordResponses[index];
    const selectedAnswerIds = question.type === 1 
      ? [this.getSelectedAnswerId(index)].filter((id): id is number => id !== null) 
      : this.getSelectedAnswerIds(index);
    
    // Kiểm tra xem questionRecordId đã tồn tại chưa
    const existingAnswer = this.studentQuestionAnswer.find(answer => answer.questionRecordId === question.id);

    if (existingAnswer) {
      if (question.type === 1) {
        // Xử lý cho câu hỏi dạng radio
        existingAnswer.selectedAnswerIds = selectedAnswerIds; // Cập nhật với ID đã chọn
      }
      else {
        // Xử lý câu hỏi dạng checkbox
        existingAnswer.selectedAnswerIds = existingAnswer.selectedAnswerIds.filter(id => selectedAnswerIds.includes(id));
        for (const id of selectedAnswerIds) {
          if (!existingAnswer.selectedAnswerIds.includes(id)) {
              existingAnswer.selectedAnswerIds.push(id);
          }
        }
      }
      if (selectedAnswerIds.length === 0) {
        // Nếu không có lựa chọn nào, xóa hẳn entry trong studentQuestionAnswer
        this.studentQuestionAnswer = this.studentQuestionAnswer.filter(answer => answer.questionRecordId !== question.id);
      }
    }
    else {
      // Nếu chưa tồn tại, thêm mới
      this.studentQuestionAnswer.push({ questionRecordId: question.id, selectedAnswerIds });
    }

    this.updateQuestionStatus();
    this.saveToSession();
  }

  updateQuestionStatus() {
    // Cập nhật questionStatus dựa trên questionRecordId
    this.questionStatus = this.examDetail.questionRecordResponses.map(question => 
      this.studentQuestionAnswer.some(answer => answer.questionRecordId === question.id)
    );
  }

  isSelectedAnswer(questionId: number, answerId: number): boolean {
    const questionIndex = this.examDetail.questionRecordResponses.findIndex((q: any) => q.id === questionId);
    if (questionIndex !== -1) {
      const studentAnswer = this.studentQuestionAnswer.find(answer => answer.questionRecordId === questionId);
      if (studentAnswer) {
        return studentAnswer.selectedAnswerIds.includes(answerId);
      }
    }
    return false;
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // 65 là mã ASCII cho 'A'
  }

  getQuestionsStatusCount(): number {
    return this.questionStatus.filter(Boolean).length;
  }

  saveToSession(): void {
    localStorage.setItem(this.selectedAnswers, JSON.stringify({ selectedAnswers: this.studentQuestionAnswer }));
  }

  loadFromSession(): void {
    const sessionData = localStorage.getItem(this.selectedAnswers);
    if (sessionData) {
      const { selectedAnswers } = JSON.parse(sessionData);
      this.studentQuestionAnswer = selectedAnswers;
      this.updateQuestionStatus();
    }
  }

  openPopup(title: string, message: string): void {
    this.dialogTitle = title;
    this.dialogMessage = message;
  }

  openWarningPopup(): void {
    this.openPopup(
      'Warning',
      `Please do not click outside the exam.<br>
      <b class="text-danger">Note: The system will automatically submit the exam after 3 violations.</b><br>
      <i class="text-danger">(Current violations: ${this.mark.warning})</i>`
    );
    this.isConfirmationPopup = false;
    this.isPopupWarning = true;
  }

  openPopupConfirmSubmit(): void {
    this.openPopup('Confirm submission', 'Are you sure you want to submit?');
    this.isConfirmationPopup = true;
    this.isPopupConfirm = true;
  }

  closePopup(): void {
    this.isPopupConfirm = false;
    this.isPopupWarning = false;
  }

  confirmAction(): void {
    if (this.isPopupConfirm) {
      this.submitAnswers();
    }
  }

  autoSubmit(): void {
    if (this.mark.warning >= 3) {
      this.dialogMessage =
      `<b class="text-danger">The exam will be automatically submitted in 5 seconds</b><br>
      <i class="text-danger">(Current violations: ${this.mark.warning})</i>`;
      this.autoSubmitTimer = setTimeout(() => { this.submitAnswers(); }, 5000);
    }
  }

  updateWarning(): void {
    this.markService.updateWarning(this.mark.id, this.mark.warning).subscribe({
      next: () => {
        this.autoSubmit();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, 'mark', 'update warning');
      }
    });
  }

  submitAnswers(): void {
    this.submitAnswer.markId = this.mark.id;
    this.submitAnswer.studentQuestionAnswers = this.studentQuestionAnswer;
    this.studentAnswerService.submitAnswers(this.submitAnswer).subscribe({
      next: () => {
        localStorage.removeItem(this.selectedAnswers);
        this.router.navigate([this.urlService.getExamResultsUrl('STUDENT', this.examId)]);
      },
      error: (err) => {
        this.authService.handleError(err, undefined, 'mark', 'submit');
      }
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.preventDeveloperTools);
    document.removeEventListener('keydown', this.preventPrintScreen);
    document.removeEventListener('copy', this.preventCopy);
    document.removeEventListener('contextmenu', this.preventRightClick);
    window.removeEventListener('beforeunload', this.handleBeforeUnload);
    window.removeEventListener('blur', this.handleBlur);
    window.removeEventListener('focus', this.handleFocus);

    window.removeEventListener('scroll', this.handleScroll);
    
    clearInterval(this.countdown);
    clearInterval(this.autoSubmitTimer);
  }
}