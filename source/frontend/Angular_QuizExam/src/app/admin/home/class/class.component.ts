import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../admin.component';
import { ClassResponse, ClassRequest } from '../../../shared/models/class.model';
import { ValidationError } from '../../../shared/models/models';
import { ClassService } from '../../../shared/service/class/class.service';
import { UrlService } from '../../../shared/service/url.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
declare var $: any;

@Component({
  selector: 'app-class',
  templateUrl: './class.component.html',
  styleUrls: [
    './../../../shared/styles/admin/style.css',
    './../../../shared/styles/popup.css',
    './class.component.css'
  ]
})
export class ClassComponent implements OnInit, OnDestroy {
  dataTable: any;
  classList: ClassResponse[] = [];

  classId: number = 0;
  classes: ClassResponse;
  classForm: ClassRequest = { };
  validationError: ValidationError = { };

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
    private classService: ClassService,
    public urlService: UrlService,
    private router: Router,
    private toastr: ToastrService,
    private datePipe: DatePipe
  ) {
    this.classes = { id: 0, name: '', classDay: '', classTime: '', admissionDate: new Date(), status: 0 };
    this.initializeClassForm();
  }

  initializeClassForm(): void {
    this.classForm = {
      classDay: '2, 4, 6',
      classTime: '08h00 - 10h00'
    };
  }

  ngOnInit(): void {
    this.titleService.setTitle('List of Classes');
    this.authService.entityExporter = 'class';
    this.loadData();
  }

  loadData(): void {
    this.classService.getClassList().subscribe({
      next: (classResponse) => {
        this.classList = classResponse;
        this.initializeDataTable();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  initializeDataTable(): void {
    this.dataTable = $('#example').DataTable({
      data: this.classList,
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
        { title: 'Name', data: 'name' },
        { title: 'Day', data: 'classDay' },
        { title: 'Hour', data: 'classTime' },
        {
          title: 'Admission Date', 
          data: 'admissionDate',
          render: (data: any) => { return this.convertDateFormat(data); }
        },
        {
          title: 'Action',
          data: null,
          render: function (data: any, type: any, row: any) {
            return `<span class="mdi mdi-information-outline icon-action info-icon" title="Info" data-id="${row.id}"></span>
            <span class="mdi mdi-pencil icon-action edit-icon" title="Edit" data-id="${row.id}"></span>
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

    $('.info-icon').on('click', (event: any) => {
      this.classId = $(event.currentTarget).data('id');
      this.router.navigate([this.urlService.getClassDetailUrl('ADMIN', this.classId)])
    });

    $('.edit-icon').on('click', (event: any) => {
      this.classId = $(event.currentTarget).data('id');
      this.openPopupUpdate(this.classId);
    });

    $('.delete-icon').on('click', (event: any) => {
      this.classId = $(event.currentTarget).data('id');
      this.openPopupConfirm('Are you sure?', 'Do you really want to delete this Class?<br>The students in this class will also be deleted, and this action cannot be undone.');
      this.isPopupDelete = true;
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
    this.classService.getClassList().subscribe({
      next: (classResponse) => {
        this.classList = classResponse;
        this.updateDataTable(this.classList);
        this.closePopup();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  loadClassById(id: number, callback: (classes: ClassResponse) => void): void {
    this.classService.getClassById(id).subscribe({
      next: (classResponse) => {
        this.classes = classResponse;
        callback(this.classes); // Chạy hàm callback sau khi lấy thông tin thành công
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'class', 'load data', this.reloadTable.bind(this));
      }
    });
  }

  convertDateFormat(dateObj: Date | undefined): string {
    // Dùng DatePipe để chuyển đổi đối tượng Date sang định dạng 'dd/MM/yyyy'
    return this.datePipe.transform(dateObj, 'dd/MM/yyyy')!;
  }

  convertToRequest(): void {
    this.classForm.name = this.classes.name;
    this.classForm.classDay = this.classes.classDay;
    this.classForm.classTime = this.classes.classTime;
    this.classForm.admissionDate = this.classes.admissionDate;
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
    this.loadClassById(id, () => {
      this.convertToRequest();
      this.isPopupUpdate = true;
    });
  }

  popupFormTitle(): string {
    if (this.isPopupCreate) return 'Create';
    if (this.isPopupUpdate) return 'Update';
    return '';
  }

  closePopup(): void {
    this.classId = 0;
    this.validationError = { };
    this.initializeClassForm();
    this.isPopupCreate = false;
    this.isPopupUpdate = false;
    this.isPopupDelete = false;
  }

  submitForm(): void {
    this.validationError = { };
    if (this.isPopupCreate) {
      this.createClass();
    }
    else if (this.isPopupUpdate) {
      this.updateClass();
    }
  }

  createClass(): void {
    this.classService.createClass(this.classForm).subscribe({
      next: (classResponse) => {
        this.toastr.success(`Class: ${classResponse.name} created successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'class', 'create class', this.reloadTable.bind(this));
      }
    });
  }

  updateClass(): void {
    this.classService.updateClass(this.classId, this.classForm).subscribe({
      next: (classResponse) => {
        this.toastr.success(`Class: ${classResponse.name} updated successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'class', 'update class', this.reloadTable.bind(this));
      }
    });
  }

  deleteClass(): void {
    this.classService.deleteClass(this.classId).subscribe({
      next: (classResponse) => {
        this.toastr.success(`Class: ${classResponse.name} has been deleted successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'class', 'delete class', this.reloadTable.bind(this));
      }
    });
  }

  exportExcel(): void {
    this.authService.listExporter = this.classList;
    this.exportData(this.authService.exportDataExcel(), 'class_excel.xlsx');
  }

  exportPDF(): void {
    this.authService.listExporter = this.classList;
    this.exportData(this.authService.exportDataPDF(), 'class_pdf.pdf');
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