import { Component, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { AuthService } from '../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../admin.component';
import { Role } from '../../../shared/models/role.model';
import { UserResponse, UserRequest } from '../../../shared/models/user.model';
import { ValidationError } from '../../../shared/models/models';
import { RoleService } from '../../../shared/service/role/role.service';
import { EmployeeService } from '../../../shared/service/employee/employee.service';
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: [
    './../../../shared/styles/admin/style.css',
    './../../../shared/styles/popup.css',
    './employee.component.css'
  ]
})

export class EmployeeComponent implements OnInit, OnDestroy {
  dataTable: any;
  employeeList: UserResponse[] = [];
  roleList: Role[] = [];

  statusId: number = 1;
  employeeId: number = 0;
  role: Role;
  employee: UserResponse;
  employeeForm: UserRequest = { };
  validationError: ValidationError = { };
  
  isPopupCreate: boolean = false;
  isPopupDetail: boolean = false;
  isPopupUpdate: boolean = false;
  isPopupRemove: boolean = false;

  isPopupResetPassword: boolean = false;
  isPopupRestore: boolean = false;

  isPopupViewInactive: boolean = false;

  dialogTitle: string = '';
  dialogMessage: string = '';
  isConfirmationPopup: boolean = false;

  constructor(
    private authService: AuthService,
    private titleService: Title,
    public admin: AdminComponent,
    private roleService: RoleService,
    private employeeService: EmployeeService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.role = { id: 0, name: '', description: '' };
    this.employee = { id: 0, fullName: '', dob: new Date(), gender: 0, address: '', phoneNumber: '', email: '', role: this.role };
    this.initializeEmployeeForm();
  }

  initializeEmployeeForm(): void {
    this.employeeForm = { gender: 1, roleId: 4 };
  }

  ngOnInit(): void {
    this.titleService.setTitle('List of Employees');
    this.authService.entityExporter = 'user';
    this.loadData();
  }

  loadData(): void {
    forkJoin([this.roleService.getRoleListToEmployee(), this.employeeService.getEmployeeList(this.statusId)])
      .subscribe({
        next: ([roleResponse, employeeResponse]) => {
          this.roleList = roleResponse;
          this.employeeList = employeeResponse;
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
      data: this.employeeList,
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
        { title: 'Full Name', data: 'fullName' },
        { title: 'Email', data: 'email' },
        { title: 'Phone Number', data: 'phoneNumber' },
        { title: 'Role', data: 'role.name' },
        {
          title: 'Action',
          data: null,
          render: (data: any, type: any, row: any) => {
            if (this.statusId == 1) {
              return `<span class="mdi mdi-information-outline icon-action info-icon" title="Info" data-id="${row.id}"></span>
              <span class="mdi mdi-pencil icon-action edit-icon" title="Edit" data-id="${row.id}"></span>
              <span class="mdi mdi-lock-reset icon-action reset-password-icon" title="Reset Password" data-id="${row.id}"></span>
              <span class="mdi mdi-delete-forever icon-action delete-icon" title="Remove" data-id="${row.id}"></span>`;
            }
            return `<span class="mdi mdi-backup-restore icon-action backup-restore-icon" title="Backup Restore" data-id="${row.id}"></span>`;
          }
        }
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

    $('.info-icon').on('click', (event: any) => {
      this.employeeId = $(event.currentTarget).data('id');
      this.openPopupDetail(this.employeeId);
    });

    $('.edit-icon').on('click', (event: any) => {
      this.employeeId = $(event.currentTarget).data('id');
      this.openPopupUpdate(this.employeeId);
    });

    $('.reset-password-icon').on('click', (event: any) => {
      this.employeeId = $(event.currentTarget).data('id');
      this.openPopupConfirm('Are you sure?', 'Do you want to reset the password for this employee?');
      this.isPopupResetPassword = true;
    });

    $('.delete-icon').on('click', (event: any) => {
      this.employeeId = $(event.currentTarget).data('id');
      this.openPopupConfirm('Are you sure?', 'Do you really want to delete this employee?');
      this.isPopupRemove = true;
    });

    $('.backup-restore-icon').on('click', (event: any) => {
      this.employeeId = $(event.currentTarget).data('id');
      this.openPopupConfirm('Are you sure?', "Do you really want to recover this employee's account?");
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
    this.employeeService.getEmployeeList(this.statusId).subscribe({
      next: (employeeResponse) => {
        this.employeeList = employeeResponse;
        this.updateDataTable(this.employeeList);
        this.closePopup();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  loadEmployeeById(id: number, callback: (employee: UserResponse) => void): void {
    this.employeeService.getEmployeeById(id).subscribe({
      next: (employeeResponse) => {
        this.employee = employeeResponse;
        callback(this.employee); // Chạy hàm callback sau khi lấy thông tin thành công
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'user', 'load data', this.reloadTable.bind(this));
      }
    });
  }

  convertDateFormat(dateObj: Date | undefined): string {
    // Dùng DatePipe để chuyển đổi đối tượng Date sang định dạng 'dd/MM/yyyy'
    return this.datePipe.transform(dateObj, 'dd/MM/yyyy')!;
  }

  convertToRequest(): void {
    this.employeeForm.fullName = this.employee.fullName;
    this.employeeForm.dob = this.employee.dob;
    this.employeeForm.gender = this.employee.gender;
    this.employeeForm.address = this.employee.address;
    this.employeeForm.phoneNumber = this.employee.phoneNumber;
    this.employeeForm.email = this.employee.email;
    this.employeeForm.roleId = this.employee.role.id;
  }

  openPopupConfirm(title: string, message: string): void {
    this.dialogTitle = title;
    this.dialogMessage = message;
    this.isConfirmationPopup = true;
  }

  openPopupCreate(): void {
    this.isPopupCreate = true;
  }

  openPopupDetail(id: number): void {
    this.loadEmployeeById(id, () => {
      this.isPopupDetail = true;
    });
  }
  
  openPopupUpdate(id: number): void {
    this.loadEmployeeById(id, () => {
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
      this.employeeId = 0;
      this.validationError = { };
      this.initializeEmployeeForm();
      this.isPopupCreate = false;
      this.isPopupDetail = false;
      this.isPopupUpdate = false;
      this.isPopupRemove = false;
      this.isPopupResetPassword = false;
      this.isPopupRestore = false;
    }
  }

  confirmAction(): void {
    if (this.isPopupResetPassword) {
      this.resetPasswordEmployee();
    }
    else if (this.isPopupRemove) {
      this.removeEmployee();
    }
    else if (this.isPopupViewInactive) {
      this.viewEmployeeInactive();
    }
    else if (this.isPopupRestore) {
      this.restoreEmployee();
    }
  }

  submitForm(): void {
    this.validationError = { };
    if (this.isPopupCreate) {
      this.createEmployee();
    }
    else if (this.isPopupUpdate) {
      this.updateEmployee();
    }
  }

  createEmployee(): void {
    this.employeeService.createEmployee(this.employeeForm).subscribe({
      next: (employeeResponse) => {
        this.toastr.success(`Employee: ${employeeResponse.fullName} created successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'user', 'create employee', this.reloadTable.bind(this));
        this.openPopupViewInactive();
      }
    });
  }

  updateEmployee(): void {
    this.employeeService.updateEmployee(this.employeeId, this.employeeForm).subscribe({
      next: (employeeResponse) => {
        this.toastr.success(`Employee: ${employeeResponse.fullName} updated successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'user', 'update employee', this.reloadTable.bind(this));
        this.openPopupViewInactive();
      }
    });
  }

  resetPasswordEmployee(): void {
    this.employeeService.resetPasswordEmployee(this.employeeId).subscribe({
      next: (employeeResponse) => {
        this.toastr.success(`Password for Employee: ${employeeResponse.fullName} has been reset successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'user', 'reset password employee', this.reloadTable.bind(this));
      }
    });
  }

  removeEmployee(): void {
    this.employeeService.removeEmployee(this.employeeId).subscribe({
      next: (employeeResponse) => {
        this.toastr.success(`Employee: ${employeeResponse.fullName} has been removed successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'user', 'remove employee', this.reloadTable.bind(this));
      }
    });
  }

  viewEmployeeInactive(): void {
    this.statusId = 0;
    this.reloadTable();
    this.isPopupCreate = false;
    this.isPopupUpdate = false;
    if (this.validationError['restore']) {
      if (this.validationError['restore'].includes('Email')) {
        this.dataTable.search(this.employeeForm.email).draw();
      }
      else {
        this.dataTable.search(this.employeeForm.phoneNumber).draw();
      }
    }
  }

  restoreEmployee(): void {
    this.employeeService.restoreEmployee(this.employeeId).subscribe({
      next: (employeeResponse) => {
        this.toastr.success(`Employee: ${employeeResponse.fullName} has been restored successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, this.validationError, 'user', 'restore employee', this.reloadTable.bind(this));
      }
    });
  }

  exportExcel(): void {
    this.authService.listExporter = this.employeeList;
    this.exportData(this.authService.exportDataExcel(), 'employee_excel.xlsx');
  }

  exportPDF(): void {
    this.authService.listExporter = this.employeeList;
    this.exportData(this.authService.exportDataPDF(), 'employee_pdf.pdf');
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