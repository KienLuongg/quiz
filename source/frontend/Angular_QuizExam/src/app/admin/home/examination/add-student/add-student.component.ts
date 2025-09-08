import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../../admin.component';
import { ExaminationComponent } from '../examination.component';
import { Sem } from '../../../../shared/models/sem.model';
import { SubjectResponse } from '../../../../shared/models/subject.model';
import { ExaminationResponse } from '../../../../shared/models/examination.model';
import { ClassResponse } from '../../../../shared/models/class.model';
import { MarkResponse } from '../../../../shared/models/mark.model';
import { StudentResponse } from '../../../../shared/models/student.model';
import { ExaminationService } from '../../../../shared/service/examination/examination.service';
import { ClassService } from '../../../../shared/service/class/class.service';
import { MarkService } from '../../../../shared/service/mark/mark.service';
import { StudentService } from '../../../../shared/service/student/student.service';
import { UrlService } from '../../../../shared/service/url.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrls: [
    './../../../../shared/styles/admin/style.css',
    './../../../../shared/styles/popup.css',
    './add-student.component.css'
  ]
})
export class AddStudentComponent implements OnInit, OnDestroy {
  examId: number;

  sem: Sem;
  subject: SubjectResponse;
  exam: ExaminationResponse;

  dataTable: any;
  classList: ClassResponse[] = [];
  markList: MarkResponse[] = [];
  studentList: StudentResponse[] = [];
  searchStudent: string = '';
  filterStudents: StudentResponse[] = [];
  searchClass: string = '';
  filterClass: ClassResponse[] = [];

  studentId: number = 0;
  tempSelectedStudents: StudentResponse[] = [];
  selectAllStatus: { [key: number]: boolean } = {};

  classId: number = 0;

  isPopupAddStudent: boolean = false;
  isPopupDelete: boolean = false;

  dialogTitle: string = '';
  dialogMessage: string = '';
  isConfirmationPopup: boolean = false;

  constructor(
    private authService: AuthService,
    private titleService: Title,
    public admin: AdminComponent,
    public examComponent: ExaminationComponent,
    private examService: ExaminationService,
    private classService: ClassService,
    private markService: MarkService,
    private studentService: StudentService,
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
    }
  }

  titlePage(): string {
    return this.examComponent.step ? 'Register students for Exam' : 'Exam participants';
  }

  ngOnInit(): void {
    this.titleService.setTitle(this.titlePage());
    this.examId = Number(this.activatedRoute.snapshot.params['examId']);
    this.loadData();
  }

  loadData(): void {
    forkJoin([
      this.examService.getExamDetailById(this.examId),
      this.classService.getClassList(),
      this.markService.getMarkListByExam(this.examId),
      this.studentService.getStudentListForExam(1, this.classId, this.examId),
    ])
    .subscribe({
      next: ([examResponse, classResponse, markResponse, studentResponse]) => {
        if (new Date() >= new Date(examResponse.endTime)) {
          this.toastr.warning('The exam has ended', 'Warning', { timeOut: 3000 });
          this.router.navigate([this.urlService.getExamUrl('ADMIN')]);
          return;
        }
        
        this.exam = examResponse;
        this.classList = classResponse;
        this.filterClass = classResponse;
        this.markList = markResponse;
        this.studentList = studentResponse;
        this.filterStudents = studentResponse;
        this.initializeDataTable();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, 'exam', 'load data');
        this.router.navigate([this.urlService.getExamUrl('ADMIN')]);
      }
    });
  }

  initializeDataTable(): void {
    this.dataTable = $('#example').DataTable({
      data: this.markList,
      autoWidth: false,
      lengthChange: false,
      searching: false,
      info: false,
      columns: [
        { title: 'STT', data: null, render: (_: any, __: any, row: any, meta: any) => meta.row + 1 },
        { title: 'Full Name', data: 'studentResponse.userResponse.fullName' },
        { title: 'Roll Portal', data: 'studentResponse.rollPortal' },
        { title: 'Roll Number', data: 'studentResponse.rollNumber' },
        {
          title: 'Status',
          render: (data: any, type: any, row: MarkResponse) => {
            const beginTime = new Date(row.beginTime);
            const submittedTime = new Date(row.submittedTime);
            if (beginTime.getTime() == new Date(0).getTime()) {
              return '<b>Not Started</b>';
            }
            else if (beginTime.getTime() != new Date(0).getTime() && submittedTime.getTime() == new Date(0).getTime()) {
              return '<b style="color: dodgerblue">Taking the exam</b>';
            }
            return '<b style="color: green">Completed</b>'; // Đã thi
          }
        },
        {
          title: 'Action',
          render: (data: any, type: any, row: MarkResponse) => {
            const beginTime = new Date(row.beginTime);
            if (this.isTimeValidToSave() && beginTime.getTime() == new Date(0).getTime()) {
              return `<span class="mdi mdi-delete-forever icon-action delete-icon" data-id="${row.studentResponse.userResponse.id}"></span>`;
            }
            return ``;
          }
        }
      ],
      drawCallback: () => {
        $('.delete-icon').on('click', (event: any) => {
          this.studentId = $(event.currentTarget).data('id');
          this.openPopupConfirm('Are you sure?', 'Do you really want to delete this Student?');
          this.isPopupDelete = true;
        });
      }
    });
  }

  isTimeValidToSave(): boolean {
    const currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + this.exam.duration + 30);
    const endTime = new Date(this.exam.endTime);
    if (currentTime < endTime) {
      return true; // Thời gian hợp lệ, có thể lưu
    }
    return false; // Thời gian không hợp lệ, không thể lưu
  }

  navigateExamDetail() {
    this.router.navigate([this.urlService.getExamDetailUrl('ADMIN', this.examId)]);
  }

  openPopupConfirm(title: string, message: string): void {
    this.dialogTitle = title;
    this.dialogMessage = message;
    this.isConfirmationPopup = true;
  }

  openStudentPopup(): void {
    this.tempSelectedStudents = this.markList.map(mark => mark.studentResponse);
    this.updateSelectAllStatus();
    this.isPopupAddStudent = true;
    console.log(this.tempSelectedStudents);
  }

  onSearchStudentsChange(): void {
    this.filterStudents = this.studentList.filter(student =>
      student.userResponse.fullName.toLowerCase().includes(this.searchStudent.toLowerCase()) ||
      student.userResponse.email.toLowerCase().includes(this.searchStudent.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(this.searchStudent.toLowerCase()) 
    );
  }

  onSearchClassChange(): void {
    this.filterClass = this.classList.filter(c =>
      c.name.toLowerCase().includes(this.searchClass.toLowerCase())
    );
    if (this.filterClass.some(() => true)) {
      this.classId = this.filterClass[0].id;
    } else {
      this.classId = 0;
    }
    this.filterStudentsByClass();
  }

  filterStudentsByClass(): void {
    this.studentService.getStudentListForExam(1, this.classId, this.examId).subscribe({
      next: (studentResponse) => {
        this.studentList = studentResponse;
        this.filterStudents = studentResponse;
        this.updateSelectAllStatus();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  handleCheckboxChange(id: number, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const student = this.studentList.find(s => s.userResponse.id === id);

    if (checkbox.checked) {
      if (student && !this.tempSelectedStudents.includes(student)) {
        this.tempSelectedStudents.push(student);
      }
    }
    else {
      this.tempSelectedStudents = this.tempSelectedStudents.filter(student => student.userResponse.id !== id);
    }
    this.updateSelectAllStatus();
    console.log(this.tempSelectedStudents);
  }

  isChecked(id: number): boolean {
    return this.tempSelectedStudents.some(student => student.userResponse.id == id);
  }

  toggleSelectAll(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    
    if (isChecked) {
      this.studentList.forEach(student => {
        if (!this.tempSelectedStudents.some(s => s.userResponse.id === student.userResponse.id)) {
          this.tempSelectedStudents.push(student);
        }
      });
    }
    else {
      this.tempSelectedStudents = this.tempSelectedStudents.filter(student => 
        !this.studentList.some(s => s.userResponse.id === student.userResponse.id)
      );
    }
    this.updateSelectAllStatus();
    console.log(this.tempSelectedStudents);
  }

  updateSelectAllStatus(): void {
    this.selectAllStatus[this.classId] = this.studentList
      .every(student => this.tempSelectedStudents.some(s => s.userResponse.id === student.userResponse.id));
  }

  updateDataTable(): void {
    if (this.dataTable) {
      this.dataTable.clear();
      this.dataTable.rows.add(this.markList);
      this.dataTable.draw();
    }
  }

  saveSelectedStudents(): void {
    this.markList = this.tempSelectedStudents.map(student => {
      const existMark = this.markList.find(mark => mark.studentResponse.userResponse.id == student.userResponse.id);
      return {
        id: existMark ? existMark.id : 0,
        beginTime: existMark ? existMark.beginTime : new Date(0),
        submittedTime: existMark ? existMark.submittedTime : new Date(0),
        score: existMark ? existMark.score : 0,
        maxScore: existMark ? existMark.maxScore : 0,
        subjectName: existMark ? existMark.subjectName : '',
        studentResponse: student
      } as MarkResponse;
    });
    this.updateDataTable();
    this.closePopup();
  }

  closePopup(): void {
    this.searchStudent = '';
    this.tempSelectedStudents = [];
    this.onSearchStudentsChange();
    this.isPopupAddStudent = false;
    this.isPopupDelete = false;
  }

  deleteStudent(): void {
    this.markList = this.markList.filter(mark => mark.studentResponse.userResponse.id != this.studentId);
    this.updateDataTable();
    this.closePopup();
  }

  updateMark(): void {
    if (this.markList.length > 0) {
      let studentIds = this.markList.map(mark => mark.studentResponse.userResponse.id);
      this.markService.updateMark(this.examId, studentIds).subscribe({
        next: (markResponse) => {
          if (this.examComponent.step) {
            this.examComponent.step = true;
            if (this.exam.type == 0) {
              this.examComponent.handleNextStep(this.examComponent.autoGenerateExamSteps, 2);
            }
            else {
              this.examComponent.handleNextStep(this.examComponent.manualQuestionSelectionSteps, 2);
            }
          }
          this.toastr.success(`Register Students for Exam Successful!`, 'Success', { timeOut: 3000 });
          this.router.navigate([this.urlService.getExamDetailUrl('ADMIN', this.examId)]);
        },
        error: (err) => {
          this.authService.handleError(err, undefined, 'mark', 'register students');
        }
      });
    }
    else {
      this.toastr.warning('You must register at least one student for the exam.', 'Warning', { timeOut: 3000 });
    }
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }
}