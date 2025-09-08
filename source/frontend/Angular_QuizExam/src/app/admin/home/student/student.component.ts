import { Component, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { AuthService } from '../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../admin.component';
import { Role } from '../../../shared/models/role.model';
import { UserResponse } from '../../../shared/models/user.model';
import { ClassResponse } from '../../../shared/models/class.model';
import { StudentRequest, StudentResponse, UpdateStudentClassRequest } from '../../../shared/models/student.model';
import { ValidationError } from '../../../shared/models/models';
import { ClassService } from '../../../shared/service/class/class.service';
import { StudentService } from '../../../shared/service/student/student.service';
import { UrlService } from '../../../shared/service/url.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-class',
  templateUrl: './student.component.html',
  styleUrls: [
    './../../../shared/styles/admin/style.css',
    './../../../shared/styles/popup.css',
    './student.component.css'
  ]
})
export class StudentComponent implements OnInit, OnDestroy {
  classId: number;
  className: string = '';
  
  dataTable: any;
  classList: ClassResponse[] = [];
  studentList: StudentResponse[] = [];

  statusId: number = 1;
  studentId: number = 0;
  role: Role;
  user: UserResponse;
  classes: ClassResponse;
  student: StudentResponse;
  studentForm: StudentRequest;
  getStudentsMovingToClass: StudentResponse[] = [];
  studentClassForm: UpdateStudentClassRequest;
  validationError: ValidationError = { };

  searchClass: string = '';
  filterClass: ClassResponse[] = [];

  isPopupCreate: boolean = false;
  isPopupDetail: boolean = false;
  isPopupUpdate: boolean = false;
  isPopupRemove: boolean = false;

  isPopupResetPassword: boolean = false;
  isPopupRestore: boolean = false;

  isPopupViewInactive: boolean = false;

  isPopupMoveToClass = false;

  dialogTitle: string = '';
  dialogMessage: string = '';
  isConfirmationPopup: boolean = false;

  constructor(
    private authService: AuthService,
    private titleService: Title,
    public admin: AdminComponent,
    private classService: ClassService,
    private studentService: StudentService,
    public urlService: UrlService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.classId = Number(this.activatedRoute.snapshot.params['classId']) ?? 0;
    this.role = { id: 0, name: '', description: '' };
    this.user = { id: 0, fullName: '', dob: new Date(), gender: 0, address: '', phoneNumber: '', email: '', role: this.role };
    this.classes = { id: 0, name: '', classDay: '', classTime: '', admissionDate: new Date(), status: 0 };
    this.student = { userResponse: this.user, rollPortal: '', rollNumber: '', classes: this.classes };
    this.studentForm = { userRequest: { gender: 1, roleId: 5 }, classId: this.classId };
    this.studentClassForm = { userIds: [], classId: 0 };
  }

  isClassIdValid(): boolean {
    return (isNaN(this.classId) || this.classId == 0);
  }

  ngOnInit(): void {
    this.titleService.setTitle('List of Students');
    this.authService.entityExporter = 'student';
    this.loadData();
  }

  loadData(): void {
    forkJoin([this.classService.getClassList(), this.studentService.getStudentList(this.classId, this.statusId)])
      .subscribe({
        next: ([classResponse, studentResponse]) => {
          this.classList = classResponse;
          this.filterClass = classResponse;
          this.studentList = studentResponse;
          this.className = this.classList.find(c => c.id == this.classId)?.name!;
          this.initializeDataTable();
        },
        error: (err) => {
          this.authService.handleError(err, undefined, '', 'load data');
        }
      }
    );
  }

  initializeDataTable(): void {
    this.dataTable = $('#example').DataTable({
      data: this.studentList,
      autoWidth: false, // Bỏ width của table
      pageLength: 10, // Đặt số lượng mục hiển thị mặc định là 10
      lengthMenu: [10, 15, 20, 25], // Tùy chọn trong dropdown: 10, 15, 20, 25
      language: {
        search: '' // Xóa chữ "Search:"
      },
      info: false, // Xóa dòng chữ Showing 1 to 10 of 22 entries
      columns: [
        {
          title: 'STT',
          data: null, // Không cần dữ liệu từ nguồn API
          render: (data: any, type: any, row: any, meta: any) => {
            return meta.row + 1; // Trả về số thứ tự, `meta.row` là chỉ số của hàng bắt đầu từ 0
          }
        },
        { title: 'Full Name', data: 'userResponse.fullName' },
        { title: 'Email', data: 'userResponse.email' },
        { title: 'Phone Number', data: 'userResponse.phoneNumber' },
        { title: 'Roll Portal', data: 'rollPortal' },
        { title: 'Roll Number', data: 'rollNumber' },
        {
          title: 'Action',
          data: null,
          render: (data: any, type: any, row: any) => {
            if (this.statusId == 1) {
              return `<input type="checkbox" class="icon-action chk_box" data-id="${row.userResponse.id}">
              <span class="mdi mdi-pencil icon-action edit-icon" title="Edit" data-id="${row.userResponse.id}"></span>
              <span class="mdi mdi-clipboard-text icon-action mark-icon" title="Mark" data-id="${row.userResponse.id}"></span>
              <span class="mdi mdi-lock-reset icon-action reset-password-icon" title="Reset Password" data-id="${row.userResponse.id}"></span>
              <span class="mdi mdi-delete-forever icon-action delete-icon" title="Delete" data-id="${row.userResponse.id}"></span>`;
            }
            return `<span class="mdi mdi-backup-restore icon-action backup-restore-icon" title="Backup Restore" data-id="${row.userResponse.id}"></span>`;
          },
        },
      ],

      drawCallback: () => {
        this.addEventListeners();
        this.cssDataTable();
      }
    });
  }

  addEventListeners(): void {
    // Sửa input search thêm button vào
    if (!$('.dataTables_filter button').length) {
      $('.dataTables_filter').append(`<button type="button"><i class="fa-solid fa-magnifying-glass search-icon"></i></button>`);
    }

    // Thêm placeholder vào input của DataTables
    $('.dataTables_filter input[type="search"]').attr('placeholder', 'Search');

    $('.chk_box').on('click', (event: any) => {
      const id = $(event.currentTarget).data('id');
      this.studentClassForm.userIds.includes(id)
      ? this.studentClassForm.userIds.splice(this.studentClassForm.userIds.indexOf(id), 1)
      : this.studentClassForm.userIds.push(id);
      console.log(this.studentClassForm);
    });

    $('.edit-icon').on('click', (event: any) => {
      this.studentId = $(event.currentTarget).data('id');
      this.openPopupUpdate(this.studentId);
    });

    $('.mark-icon').on('click', (event: any) => {
      this.studentId = $(event.currentTarget).data('id');
      const url = this.isClassIdValid()
        ? this.urlService.getMarkUrl('ADMIN', this.studentId)
        : this.urlService.getMarkUrl('ADMIN', this.studentId, this.classId);
      this.router.navigate([url]);
    });

    $('.reset-password-icon').on('click', (event: any) => {
      this.studentId = $(event.currentTarget).data('id');
      this.openPopupConfirm('Are you sure?', 'Do you want to reset the password for this student?');
      this.isPopupResetPassword = true;
    });

    $('.delete-icon').on('click', (event: any) => {
      this.studentId = $(event.currentTarget).data('id');
      this.openPopupConfirm('Are you sure?', 'Do you really want to delete this student?');
      this.isPopupRemove = true;
    });

    $('.backup-restore-icon').on('click', (event: any) => {
      this.studentId = $(event.currentTarget).data('id');
      this.openPopupConfirm('Are you sure?', "Do you really want to recover this student's account?");
      this.isPopupRestore = true;
    });
  }

  cssDataTable(): void {
    if (!$('#custom-select-status').length) {
      $('.dataTables_length').append(`
        <label for="" class="label-status">Status:</label>
        <select class="select-status" id="custom-select-status">
          <option value=1>Active</option>
          <option value=0>Inactive</option>
        </select>
      `);

      // Theo dõi sự thay đổi của dropdown
      $('#custom-select-status').on('change', () => {
        this.statusId = $('#custom-select-status').val();
        this.dataTable.search('').draw();
        this.reloadTable();
      });
    }

    $('#custom-select-status').val(this.statusId);

    const dataTablesLength = this.el.nativeElement.querySelector('.dataTables_length');
    this.renderer.setStyle(dataTablesLength, 'display', 'inline-flex');
    
    const lengthElement = this.el.nativeElement.querySelector('.dataTables_length label');
    this.renderer.setStyle(lengthElement, 'width', '160px');

    const labelStatus = this.el.nativeElement.querySelector('.label-status');
    this.renderer.setStyle(labelStatus, 'margin', '0 5px 0 30px');
    this.renderer.setStyle(labelStatus, 'align-content', 'center');

    const selectStatus = this.el.nativeElement.querySelector('.select-status');
    this.renderer.setStyle(selectStatus, 'width', '120px');
    this.renderer.setStyle(selectStatus, 'cursor', 'pointer');
  }

  updateDataTable(newData: any): void {
    if (this.dataTable) {
      this.dataTable.clear(); // Xóa dữ liệu hiện tại
      this.dataTable.rows.add(newData); // Thêm dữ liệu mới
      this.dataTable.draw(); // Vẽ lại bảng
      $('#custom-select-status').val(this.statusId);
    }
  }

  reloadTable(): void {
    this.studentService.getStudentList(this.classId, this.statusId).subscribe({
      next: (studentResponse) => {
        this.studentList = studentResponse;
        this.updateDataTable(this.studentList);
        this.closePopup();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  loadStudentById(id: number, callback: (student: StudentResponse) => void): void {
    this.studentService.getStudentById(id).subscribe({
      next: (studentResponse) => {
        this.student = studentResponse;
        callback(this.student); // Chạy hàm callback sau khi lấy thông tin thành công
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'student', 'load data', this.reloadTable.bind(this));
      }
    });
  }

  convertToRequest(): void {
    this.studentForm.userRequest.fullName = this.student.userResponse.fullName;
    this.studentForm.userRequest.dob = this.student.userResponse.dob;
    this.studentForm.userRequest.gender = this.student.userResponse.gender;
    this.studentForm.userRequest.address = this.student.userResponse.address;
    this.studentForm.userRequest.phoneNumber = this.student.userResponse.phoneNumber;
    this.studentForm.userRequest.email = this.student.userResponse.email;
    this.studentForm.userRequest.roleId = this.student.userResponse.role.id;
    this.studentForm.rollPortal = this.student.rollPortal;
    this.studentForm.rollNumber = this.student.rollNumber;
  }

  openPopupConfirm(title: string, message: string): void {
    this.dialogTitle = title;
    this.dialogMessage = message;
    this.isConfirmationPopup = true;
  }

  openPopupMoveToClass(): void {
    this.studentService.getStudentsMovingToClass(this.studentClassForm.userIds).subscribe({
      next: (studentResponse) => {
        this.getStudentsMovingToClass = studentResponse;
        this.isPopupMoveToClass = true;
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  openPopupCreate(): void {
    this.isPopupCreate = true;
  }
  
  openPopupUpdate(id: number): void {
    this.loadStudentById(id, () => {
      this.convertToRequest();
      this.isPopupUpdate = true;
    });
  }

  openPopupViewInactive(): void {
    if (this.validationError['restore']?.trim()) {
      this.openPopupConfirm('Would you like to switch to the inactive user?', this.validationError['restore']);
      this.isPopupViewInactive = true;
    }
  }

  popupFormTitle(): string {
    if (this.isPopupCreate) return 'Create';
    if (this.isPopupUpdate) return 'Update';
    return '';
  }

  closePopup(): void {
    if (this.isPopupViewInactive) {
      this.isPopupViewInactive = false;
    }
    else {
      this.studentId = 0;
      this.validationError = { };
      this.studentForm = { userRequest: { gender: 1, roleId: 5 }, classId: this.classId };
      this.isPopupCreate = false;
      this.isPopupDetail = false;
      this.isPopupUpdate = false;
      this.isPopupRemove = false;
      this.isPopupResetPassword = false;
      this.isPopupRestore = false;
      this.isPopupMoveToClass = false;
    }
  }

  onSearchClassChange(): void {
    this.filterClass = this.classList.filter((c: any) => c.name.toLowerCase().includes(this.searchClass.toLowerCase()));
    if (this.filterClass.some(() => true)) {
      this.studentClassForm.classId = this.filterClass[0].id;
    }
    else {
      this.studentClassForm.classId = 0;
    }
  }

  confirmAction(): void {
    if (this.isPopupResetPassword) {
      this.resetPasswordStudent();
    }
    else if (this.isPopupRemove) {
      this.removeStudent();
    }
    else if (this.isPopupViewInactive) {
      this.viewStudentInactive();
    }
    else if (this.isPopupRestore) {
      this.restoreStudent();
    }
  }

  submitForm(): void {
    this.validationError = { };
    if (this.isPopupCreate) {
      this.createStudent();
    }
    else if (this.isPopupUpdate) {
      this.updateStudent();
    }
  }

  createStudent(): void {
    this.studentService.createStudent(this.studentForm).subscribe({
      next: (studentResponse) => {
        this.toastr.success(`Student: ${studentResponse.userResponse.fullName} created successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'student', 'create student', this.reloadTable.bind(this));
        this.openPopupViewInactive();
      }
    });
  }

  updateStudent(): void {
    this.studentService.updateStudent(this.studentId, this.studentForm).subscribe({
      next: (studentResponse) => {
        this.toastr.success(`Student: ${studentResponse.userResponse.fullName} updated successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'student', 'update student', this.reloadTable.bind(this));
        this.openPopupViewInactive();
      }
    });
  }

  updateStudentClass(): void {
    this.studentService.updateStudentClass(this.studentClassForm).subscribe({
      next: (studentResponse) => {
        this.toastr.success(`Student: Update student class successfully!`, 'Success', { timeOut: 3000 });
        let url = this.studentClassForm.classId == 0
        ? this.urlService.getStudentListUrl('ADMIN')
        : this.urlService.getClassDetailUrl('ADMIN', this.studentClassForm.classId);
        this.router.navigate([url]);
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'student', 'update student', this.reloadTable.bind(this));
        this.openPopupViewInactive();
      }
    });
  }

  resetPasswordStudent(): void {
    this.studentService.resetPasswordStudent(this.studentId).subscribe({
      next: (studentResponse) => {
        this.toastr.success(`Password for Student: ${studentResponse.userResponse.fullName} has been reset successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'student', 'reset password student', this.reloadTable.bind(this));
      }
    });
  }

  removeStudent(): void {
    this.studentService.removeStudent(this.studentId).subscribe({
      next: (studentResponse) => {
        this.toastr.success(`Student: ${studentResponse.userResponse.fullName} has been removed successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'student', 'remove student', this.reloadTable.bind(this));
      }
    });
  }

  viewStudentInactive(): void {
    this.statusId = 0;
    this.reloadTable();
    this.isPopupCreate = false;
    this.isPopupUpdate = false;
    if (this.validationError['restore']) {
      if (this.validationError['restore'].includes('Email')) {
        this.dataTable.search(this.studentForm.userRequest?.email).draw();
      }
      else {
        this.dataTable.search(this.studentForm.userRequest?.phoneNumber).draw();
      }
    }
  }

  restoreStudent(): void {
    this.studentService.restoreStudent(this.studentId).subscribe({
      next: (studentResponse) => {
        this.toastr.success(`Studen: ${studentResponse.userResponse.fullName} has been restored successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'student', 'restore student', this.reloadTable.bind(this));
      }
    });
  }

  exportExcel(): void {
    this.authService.listExporter = this.studentList;
    this.exportData(this.authService.exportDataExcel(), 'student_excel.xlsx');
  }

  exportPDF(): void {
    this.authService.listExporter = this.studentList;
    this.exportData(this.authService.exportDataPDF(), 'student_pdf.pdf');
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

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }
}