import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../../admin.component';
import { HomeComponent } from '../../home.component';
import { Roles } from '../../../../shared/enums';
import { Sem } from '../../../../shared/models/sem.model';
import { SubjectRequest, SubjectResponse } from '../../../../shared/models/subject.model';
import { ValidationError } from '../../../../shared/models/models';
import { SemService } from '../../../../shared/service/sem/sem.service';
import { SubjectService } from '../../../../shared/service/subject/subject.service';
import { UrlService } from '../../../../shared/service/url.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: [
    './../../../../shared/styles/admin/style.css',
    './../../../../shared/styles/popup.css',
    './list.component.css'
  ]
})
export class ListComponent implements OnInit, OnDestroy {
  dataTable: any;
  semList: Sem[] = [];
  subjectList: SubjectResponse[] = [];

  subjectId: number = 0;
  sem: Sem;
  subject: SubjectResponse;
  subjectForm: SubjectRequest = { };
  validationError: ValidationError = { };

  changeImg: boolean = false;

  isPopupCreate: boolean = false;
  isPopupUpdate: boolean = false;
  isPopupDelete: boolean = false;

  dialogTitle: string = '';
  dialogMessage: string = '';
  isConfirmationPopup: boolean = false;

  constructor(
    private authService: AuthService,
    private titleService: Title,
    public admin: AdminComponent,
    public home: HomeComponent,
    private semService: SemService,
    private subjectService: SubjectService,
    public urlService: UrlService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.sem = { id: 0, name: '' };
    this.subject = { id: 0, name: '', image: '', status: 0, sem: this.sem };
  }

  ngOnInit(): void {
    this.titleService.setTitle('List of Subjects');
    this.authService.entityExporter = 'subject';
    this.loadData();
  }

  loadData(): void {
    this.semService.getSemList().subscribe({
      next: (semResponse) => {
        this.semList = semResponse;
        if (this.semList && this.semList.length > 0) {
          // Nếu semList có dữ liệu thì setup semId của subjectForm mặc định bằng sem đầu tiên
          this.sem.id = this.semList[0].id;
          this.subjectForm.semId = this.sem.id;
          this.subjectService.getSubjectListBySem(this.sem.id).subscribe({
            next: (subjectResponse) => {
              this.subjectList = subjectResponse;
              this.initializeDataTable();
            },
            error: (err) => {
              this.authService.handleError(err, undefined, '', 'load data');
            }
          });
        }
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  initializeDataTable(): void {
    this.dataTable = $('#example').DataTable({
      data: this.subjectList,
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
        { title: 'Subject', data: 'name' },
        {
          title: 'Action',
          data: null,
          render: (data: any, type: any, row: any) => {
            if (this.home.isActive([Roles.TEACHER])) {
              return `<span class="mdi mdi-information-outline icon-action info-icon" title="Chapters" data-id="${row.id}"></span>
                      <span class="mdi mdi-comment-question-outline icon-action question-icon" title="Question" data-id="${row.id}"></span>`;
            }
            if (this.home.isActive([Roles.DIRECTOR])) {
              return `<span class="mdi mdi-pencil icon-action edit-icon" title="Edit" data-id="${row.id}"></span>
                      <span class="mdi mdi-comment-question-outline icon-action question-icon" title="Question" data-id="${row.id}"></span>
                      <span class="mdi mdi-delete-forever icon-action delete-icon" title="Remove" data-id="${row.id}"></span>`
            }
            return `<span class="mdi mdi-information-outline icon-action info-icon" title="Chapters" data-id="${row.id}"></span>
                    <span class="mdi mdi-pencil icon-action edit-icon" title="Edit" data-id="${row.id}"></span>
                    <span class="mdi mdi-comment-question-outline icon-action question-icon" title="Question" data-id="${row.id}"></span>
                    <span class="mdi mdi-delete-forever icon-action delete-icon" title="Remove" data-id="${row.id}"></span>`;
          }
        }
      ],

      drawCallback: () => this.addEventListeners()
    });
  }

  addEventListeners(): void {
    // Sửa input search thêm button vào
    if (!$('.dataTables_filter button').length) {
      $('.dataTables_filter').append(`<button type="button"><i class="fa-solid fa-magnifying-glass search-icon"></i></button>`);
    }

    // Thêm placeholder vào input của DataTables
    $('.dataTables_filter input[type="search"]').attr('placeholder', 'Search');

    $('.info-icon').on('click', (e: any) => this.router.navigate([this.urlService.getChapterUrl('ADMIN', $(e.currentTarget).data('id'))]));
    $('.edit-icon').on('click', (e: any) => this.openPopupUpdate($(e.currentTarget).data('id')));
    $('.question-icon').on('click', (e: any) => this.router.navigate([this.urlService.getQuestionUrl('ADMIN', $(e.currentTarget).data('id'))]));
    $('.delete-icon').on('click', (e: any) => this.openPopupDelete($(e.currentTarget).data('id')));
  }

  updateDataTable(newData: any): void {
    if (this.dataTable) {
      this.dataTable.clear(); // Xóa dữ liệu hiện tại
      this.dataTable.rows.add(newData); // Thêm dữ liệu mới
      this.dataTable.draw(); // Vẽ lại bảng
    }
  }

  reloadTable(): void {
    this.subjectService.getSubjectListBySem(this.sem.id).subscribe({
      next: (subjectResponse) => {
        this.subjectList = subjectResponse;
        this.updateDataTable(this.subjectList);
        this.closePopup();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  loadSubjectById(id: number, callback: (subject: SubjectResponse) => void): void {
    this.subjectService.getSubjectById(id).subscribe({
      next: (subjectResponse) => {
        this.subject = subjectResponse;
        callback(this.subject); // Chạy hàm callback sau khi lấy thông tin thành công
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'subject', 'load data', this.reloadTable.bind(this));
      }
    });
  }

  setSelectedSem(semId: number): void {
    this.sem.id = semId;
    this.subjectForm.semId = this.sem.id;
    this.reloadTable();
  }

  convertToRequest(): void {
    this.subjectForm.semId = this.subject.sem.id;
    this.subjectForm.name = this.subject.name;
    this.subjectForm.image = this.subject.image;
  }

  openPopupConfirm(title: string, message: string): void {
    this.dialogTitle = title;
    this.dialogMessage = message;
    this.isConfirmationPopup = true;
  }

  openPopupCreate(): void {
    this.isPopupCreate = true;
  }
  
  openPopupUpdate(id: number): void {
    this.loadSubjectById(id, () => {
      this.subjectId = id;
      this.convertToRequest();
      this.isPopupUpdate = true;
    });
  }

  openPopupDelete(id: number): void {
    this.loadSubjectById(id, () => {
      this.subjectId = id;
      this.openPopupConfirm('Are you sure?', 'Do you really want to delete this Subject? This action cannot be undone.');
      this.isPopupDelete = true;
    });
  }

  popupFormTitle(): string {
    if (this.isPopupCreate) return 'Create';
    if (this.isPopupUpdate) return 'Update';
    return '';
  }

  chooseImage(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    const imgSubject = document.getElementById(`image-subject`) as HTMLImageElement;
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imgSubject.src = e.target?.result as string;
        imgSubject.style.display = 'block';
      };
      reader.readAsDataURL(file);
      this.subjectForm.file = file;
      this.subjectForm.image = file.name;
      this.changeImg = true;
    }
  }

  removeImage(): void {
    const imgSubject = document.getElementById(`image-subject`) as HTMLImageElement;
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Xóa ảnh
    this.subjectForm.file = null;
    this.subjectForm.image = '';
    this.changeImg = true;
    imgSubject.src = '';
    imgSubject.style.display = 'none';

    // Đặt lại giá trị input file
    if (fileInput) {
      fileInput.value = '';
    }
  }

  closePopup(): void {
    this.subjectId = 0;
    this.changeImg = false;
    this.subjectForm = { semId: this.sem.id };
    this.validationError = { };
    this.isPopupCreate = false;
    this.isPopupUpdate = false;
    this.isPopupDelete = false;
  }

  submitForm(): void {
    this.validationError = { };
    if (this.isPopupCreate) {
      this.createSubject();
    }
    else if (this.isPopupUpdate) {
      this.updateSubject();
    }
  }

  createSubject(): void {
    this.subjectService.createSubject(this.subjectForm).subscribe({
      next: (subjectResponse) => {
        this.toastr.success(`Subject: ${subjectResponse.name} created successfully!`, 'Success', { timeOut: 3000 });
        this.setSelectedSem(subjectResponse.sem.id);
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'subject', 'create subject', this.reloadTable.bind(this));
      }
    });
  }

  updateSubject(): void {
    this.subjectService.updateSubject(this.subjectId, this.subjectForm, this.changeImg).subscribe({
      next: (subjectResponse) => {
        this.toastr.success(`Subject: ${subjectResponse.name} updated successfully!`, 'Success', { timeOut: 3000 });
        this.setSelectedSem(subjectResponse.sem.id);
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'subject', 'update subject', this.reloadTable.bind(this));
      }
    });
  }

  deleteSubject(): void {
    this.subjectService.deleteSubject(this.subjectId).subscribe({
      next: (subjectResponse) => {
        this.toastr.success(`Subject: ${subjectResponse.name} has been deleted successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'subject', 'delete subject', this.reloadTable.bind(this));
      }
    });
  }

  exportExcel(): void {
    this.authService.listExporter = this.subjectList;
    this.exportData(this.authService.exportDataExcel(), 'subject_excel.xlsx');
  }

  exportPDF(): void {
    this.authService.listExporter = this.subjectList;
    this.exportData(this.authService.exportDataPDF(), 'subject_pdf.pdf');
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