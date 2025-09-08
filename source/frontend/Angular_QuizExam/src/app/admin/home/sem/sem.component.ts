import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../admin.component';
import { Sem, SemRequest } from '../../../shared/models/sem.model';
import { ValidationError } from '../../../shared/models/models';
import { SemService } from '../../../shared/service/sem/sem.service';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-sem',
  templateUrl: './sem.component.html',
  styleUrls: [
    './../../../shared/styles/admin/style.css',
    './sem.component.css'
  ]
})
export class SemComponent implements OnInit, OnDestroy {
  dataTable: any;
  semList: Sem[] = [];

  semId: number = 0;
  sem: Sem;
  semForm: SemRequest = { };
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
    private semService: SemService,
    private toastr: ToastrService
  ) {
    this.sem = { id: 0, name: '' };
  }

  ngOnInit(): void {
    this.titleService.setTitle('List of Levels');
    this.loadData();
  }

  loadData(): void {
    this.semService.getSemList().subscribe({
      next: (semResponse) => {
        this.semList = semResponse;
        this.initializeDataTable();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  initializeDataTable(): void {
    this.dataTable = $('#example').DataTable({
      data: this.semList,
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
        { title: 'Semester', data: 'name' },
        {
          title: 'Action',
          data: null,
          render: function (data: any, type: any, row: any) {
            return `<span class="mdi mdi-pencil icon-action edit-icon" title="Edit" data-id="${row.id}"></span>`;
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
      this.semId = $(event.currentTarget).data('id');
      this.showFormUpdate(this.semId);
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
    this.semService.getSemList().subscribe({
      next: (semResponse) => {
        this.semList = semResponse;
        this.updateDataTable(this.semList);
        this.hiddenForm();
        this.closePopup();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  loadSemById(id: number, handler: (level: Sem) => void, errorHandler: (err: any) => void): void {
    this.semService.getSemById(id).subscribe({
      next: (semResponse) => {
        this.sem = semResponse;
        handler(this.sem); // Chạy hàm handler sau khi lấy thông tin thành công
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'level', 'load data', this.reloadTable.bind(this));
        errorHandler(err); // Chạy hàm errorHandler nếu có lỗi
      }
    });
  }

  convertToRequest(): void {
    this.semForm.name = this.sem.name;
  }

  scrollToForm(): void {
    const formElement = document.querySelector('#formSection');
    if (formElement) {
      setTimeout(() => { formElement.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 0);
    }
  }

  showFormCreate(): void {
    this.semForm = { }
    this.validationError = { };
    this.checkFormErrors();
    
    this.updateMode = false;
    this.createMode = true;
    this.scrollToForm();
  }

  showFormUpdate(id: number): void {
    this.validationError = { };
    this.checkFormErrors();

    this.loadSemById(id,
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
    this.semId = 0;
    this.semForm = { }
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
    this.semId = 0;
    this.isPopupDelete = false;
  }

  submitForm(): void {
    this.validationError = { };
    if (this.createMode) {
      this.createLevel();
    }
    else if (this.updateMode) {
      this.updateLevel();
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

  createLevel(): void {
    this.semService.createSem(this.semForm).subscribe({
      next: (semResponse) => {
        this.toastr.success(`Sem: ${semResponse.name} created successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'sem', 'create sem', this.reloadTable.bind(this));
        this.checkFormErrors();
      }
    });
  }

  updateLevel(): void {
    this.semService.updateSem(this.semId, this.semForm).subscribe({
      next: (semResponse) => {
        this.toastr.success(`Sem: ${semResponse.name} updated successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'sem', 'update sem', this.reloadTable.bind(this));
        this.checkFormErrors();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }
}