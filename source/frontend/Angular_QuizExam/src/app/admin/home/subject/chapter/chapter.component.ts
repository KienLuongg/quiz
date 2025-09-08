import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../../admin.component';
import { HomeComponent } from '../../home.component';
import { Sem } from '../../../../shared/models/sem.model';
import { SubjectResponse } from '../../../../shared/models/subject.model';
import { ChapterRequest, ChapterResponse } from '../../../../shared/models/chapter.model';
import { ValidationError } from '../../../../shared/models/models';
import { SubjectService } from '../../../../shared/service/subject/subject.service';
import { ChapterService } from '../../../../shared/service/chapter/chapter.service';
import { UrlService } from '../../../../shared/service/url.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-chapter',
  templateUrl: './chapter.component.html',
  styleUrls: [
    './../../../../shared/styles/admin/style.css',
    './chapter.component.css'
  ]
})
export class ChapterComponent implements OnInit, OnDestroy {
  subjectId: number;

  dataTable: any;
  sem: Sem;
  subject: SubjectResponse;
  chapterList: ChapterResponse[] = [];

  chapterId: number = 0;
  chapter: ChapterResponse;
  chapterForm: ChapterRequest = { };
  validationError: ValidationError = { };

  createMode: boolean = false;
  updateMode: boolean = false;
  
  isPopupDelete: boolean = false;

  dialogTitle: string = '';
  dialogMessage: string = '';
  isConfirmationPopup: boolean = false;

  constructor(
    private authService: AuthService,
    private titleService: Title,
    public admin: AdminComponent,
    public home: HomeComponent,
    private subjectService: SubjectService,
    private chapterService: ChapterService,
    public urlService: UrlService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.subjectId = Number(this.activatedRoute.snapshot.params['subjectId']) ?? 0;
    this.sem = { id: 0, name: '' };
    this.subject = { id: 0, name: '', image: '', status: 0, sem: this.sem };
    this.chapter = { id: 0, name: '', status: 0, subject: this.subject };
  }

  ngOnInit(): void {
    this.titleService.setTitle('List of Chapter');
    this.loadData();
  }

  loadData(): void {
    this.subjectService.getSubjectById(this.subjectId).subscribe({
      next: (subjectResponse) => {
        this.subject = subjectResponse;
        this.chapterService.getChapterList(this.subjectId).subscribe({
          next: (chapterResponse) => {
            this.chapterList = chapterResponse;
            this.initializeDataTable();
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

  initializeDataTable(): void {
    this.dataTable = $('#example').DataTable({
      data: this.chapterList,
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
        { title: 'Chapter', data: 'name' },
        {
          title: 'Action',
          data: null,
          render: function (data: any, type: any, row: any) {
            return `<span class="mdi mdi-pencil icon-action edit-icon" title="Edit" data-id="${row.id}"></span>
            <span class="mdi mdi-delete-forever icon-action delete-icon" title="Delete" data-id="${row.id}"></span>`;
          }
        }
      ],

      drawCallback: () => {
        this.addEventListeners();
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

    $('.edit-icon').on('click', (event: any) => {
      this.chapterId = $(event.currentTarget).data('id');
      this.showFormUpdate(this.chapterId);
    });

    $('.delete-icon').on('click', (event: any) => {
      this.chapterId = $(event.currentTarget).data('id');
      this.loadChapterById(this.chapterId,
        (success) => {
          this.openPopupConfirm('Are you sure?', 'Do you really want to delete this Level? This action cannot be undone.');
          this.isPopupDelete = true;
        },
        (error) => { }
      );
    });
  }

  updateDataTable(newData: any): void {
    if (this.dataTable) {
      this.dataTable.clear(); // Xóa dữ liệu hiện tại
      this.dataTable.rows.add(newData); // Thêm dữ liệu mới
      this.dataTable.draw(); // Vẽ lại bảng
    }
  }

  reloadTable(): void {
    this.chapterService.getChapterList(this.subjectId).subscribe({
      next: (chapterResponse) => {
        this.chapterList = chapterResponse;
        this.updateDataTable(this.chapterList);
        this.hiddenForm();
        this.closePopup();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  loadChapterById(id: number, handler: (chapter: ChapterResponse) => void, errorHandler: (err: any) => void): void {
    this.chapterService.getChapterById(id).subscribe({
      next: (chapterResponse) => {
        this.chapter = chapterResponse;
        handler(this.chapter); // Chạy hàm handler sau khi lấy thông tin thành công
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'chapter', 'load data', this.reloadTable.bind(this));
        errorHandler(err); // Chạy hàm errorHandler nếu có lỗi
      }
    });
  }

  convertToRequest(): void {
    this.chapterForm.subjectId = this.chapter.subject.id;
    this.chapterForm.name = this.chapter.name;
  }

  backToSubject(): void {
    this.router.navigate([this.urlService.getSubjectUrl('ADMIN')]);
  }

  scrollToForm(): void {
    const formElement = document.querySelector('#formSection');
    if (formElement) {
      setTimeout(() => { formElement.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 0);
    }
  }

  showFormCreate(): void {
    this.chapterForm = { subjectId: this.subjectId }
    this.validationError = { };
    this.checkFormErrors();
    
    this.updateMode = false;
    this.createMode = true;
    this.scrollToForm();
  }

  showFormUpdate(id: number): void {
    this.validationError = { };
    this.checkFormErrors();

    this.loadChapterById(id,
      (success) => {
        this.convertToRequest();
        this.createMode = false;
        this.updateMode = true;
        this.scrollToForm();
      },
      (error) => { this.updateMode = false; }
    );
  }

  formTitle(): string {
    if (this.createMode) return 'Create';
    if (this.updateMode) return 'Update';
    return '';
  }

  hiddenForm(): void {
    this.chapterId = 0;
    this.chapterForm = { }
    this.validationError = { };
    this.checkFormErrors();
    this.createMode = false;
    this.updateMode = false;
  }

  openPopupConfirm(title: string, message: string): void {
    this.dialogTitle = title;
    this.dialogMessage = message;
    this.isConfirmationPopup = true;
  }

  closePopup(): void {
    this.chapterId = 0;
    this.isPopupDelete = false;
  }

  submitForm(): void {
    this.validationError = { };
    if (this.createMode) {
      this.createChapter();
    }
    else if (this.updateMode) {
      this.updateChapter();
    }
  }

  checkFormErrors(): void {
    if (Object.values(this.validationError).some(error => error?.trim())) {
      document.querySelector('.form-section')?.classList.add('error-active');
    }
    else {
      document.querySelector('.form-section')?.classList.remove('error-active');
    }
  }

  createChapter(): void {
    this.chapterService.createChapter(this.chapterForm).subscribe({
      next: (chapterResponse) => {
        this.toastr.success(`Chapter: ${chapterResponse.name} created successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'chapter', 'create chapter', this.reloadTable.bind(this));
        this.checkFormErrors();
      }
    });
  }

  updateChapter(): void {
    this.chapterService.updateChapter(this.chapterId, this.chapterForm).subscribe({
      next: (chapterResponse) => {
        this.toastr.success(`Chapter: ${chapterResponse.name} updated successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'chapter', 'update chapter', this.reloadTable.bind(this));
        this.checkFormErrors();
      }
    });
  }

  deleteChapter(): void {
    this.chapterService.deleteChapter(this.chapterId).subscribe({
      next: (chapterResponse) => {
        this.toastr.success(`Chapter: ${chapterResponse.name} has been deleted successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'chapter', 'delete chapter', this.reloadTable.bind(this));
      }
    });
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }
}