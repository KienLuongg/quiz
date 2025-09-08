import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../admin.component';
import { LevelResponse, LevelRequest } from '../../../shared/models/level.model';
import { ValidationError } from '../../../shared/models/models';
import { LevelService } from '../../../shared/service/level/level.service';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-level',
  templateUrl: './level.component.html',
  styleUrls: [
    './../../../shared/styles/admin/style.css',
    './level.component.css'
  ]
})
export class LevelComponent implements OnInit, OnDestroy {
  dataTable: any;
  levelList: LevelResponse[] = [];

  levelId: number = 0;
  level: LevelResponse;
  levelForm: LevelRequest = { };
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
    private levelService: LevelService,
    private toastr: ToastrService
  ) {
    this.level = { id: 0, name: '', point: 0, status: 0 };
  }

  ngOnInit(): void {
    this.titleService.setTitle('List of Levels');
    this.loadData();
  }

  loadData(): void {
    this.levelService.getLevelList().subscribe({
      next: (levelResponse) => {
        this.levelList = levelResponse;
        this.initializeDataTable();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  initializeDataTable(): void {
    this.dataTable = $('#example').DataTable({
      data: this.levelList,
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
        { title: 'Level', data: 'name' },
        { title: 'Point', data: 'point' },
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
      this.levelId = $(event.currentTarget).data('id');
      this.showFormUpdate(this.levelId);
    });

    $('.delete-icon').on('click', (event: any) => {
      this.levelId = $(event.currentTarget).data('id');
      this.loadLevelById(this.levelId,
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
    this.levelService.getLevelList().subscribe({
      next: (levelResponse) => {
        this.levelList = levelResponse;
        this.updateDataTable(this.levelList);
        this.hiddenForm();
        this.closePopup();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  loadLevelById(id: number, handler: (level: LevelResponse) => void, errorHandler: (err: any) => void): void {
    this.levelService.getLevelById(id).subscribe({
      next: (levelResponse) => {
        this.level = levelResponse;
        handler(this.level); // Chạy hàm handler sau khi lấy thông tin thành công
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'level', 'load data', this.reloadTable.bind(this));
        errorHandler(err); // Chạy hàm errorHandler nếu có lỗi
      }
    });
  }

  convertToRequest(): void {
    this.levelForm.name = this.level.name;
    this.levelForm.point = this.level.point;
  }

  scrollToForm(): void {
    const formElement = document.querySelector('#formSection');
    if (formElement) {
      setTimeout(() => { formElement.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 0);
    }
  }

  showFormCreate(): void {
    this.levelForm = { }
    this.validationError = { };
    this.checkFormErrors();
    
    this.updateMode = false;
    this.createMode = true;
    this.scrollToForm();
  }

  showFormUpdate(id: number): void {
    this.validationError = { };
    this.checkFormErrors();

    this.loadLevelById(id,
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
    this.levelId = 0;
    this.levelForm = { }
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
    this.levelId = 0;
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
    this.levelService.createLevel(this.levelForm).subscribe({
      next: (levelResponse) => {
        this.toastr.success(`Level: ${levelResponse.name} created successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'level', 'create level', this.reloadTable.bind(this));
        this.checkFormErrors();
      }
    });
  }

  updateLevel(): void {
    this.levelService.updateLevel(this.levelId, this.levelForm).subscribe({
      next: (levelResponse) => {
        this.toastr.success(`Level: ${levelResponse.name} updated successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'level', 'update level', this.reloadTable.bind(this));
        this.checkFormErrors();
      }
    });
  }

  deleteLevel(): void {
    this.levelService.deleteLevel(this.levelId).subscribe({
      next: (levelResponse) => {
        this.toastr.success(`Level: ${levelResponse.name} has been deleted successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'level', 'delete level', this.reloadTable.bind(this));
      }
    });
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }
}