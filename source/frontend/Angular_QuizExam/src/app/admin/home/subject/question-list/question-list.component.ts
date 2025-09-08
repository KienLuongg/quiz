import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../../admin.component';
import { HomeComponent } from '../../home.component';
import { Roles } from '../../../../shared/enums';
import { Sem } from '../../../../shared/models/sem.model';
import { SubjectResponse } from '../../../../shared/models/subject.model';
import { QuestionResponse } from '../../../../shared/models/question.model';
import { SubjectService } from '../../../../shared/service/subject/subject.service';
import { QuestionService } from '../../../../shared/service/question/question.service';
import { UrlService } from '../../../../shared/service/url.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
declare var $: any;

@Component({
  selector: 'app-question-list',
  templateUrl: './question-list.component.html',
  styleUrls: [
    './../../../../shared/styles/admin/style.css',
    './../../../../shared/styles/popup.css',
    './question-list.component.css'
  ]
})
export class QuestionListComponent implements OnInit, OnDestroy {
  subjectId: number;

  dataTable: any;
  sem: Sem;
  subject: SubjectResponse;
  questionList: QuestionResponse[] = [];
  question: QuestionResponse = {} as QuestionResponse;
  questionId: number = 0;

  isPopupDetail: boolean = false;
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
    private questionService: QuestionService,
    public urlService: UrlService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.subjectId = Number(this.activatedRoute.snapshot.params['subjectId']) ?? 0;
    this.sem = { id: 0, name: '' };
    this.subject = { id: 0, name: '', image: '', status: 0, sem: this.sem };
  }

  ngOnInit(): void {
    this.titleService.setTitle('List of Questions');
    this.authService.entityExporter = 'question';
    this.loadData();
  }

  loadData(): void {
    this.subjectService.getSubjectById(this.subjectId).subscribe({
      next: (subjectResponse) => {
        this.subject = subjectResponse;
        this.questionService.getQuestionList(this.subjectId).subscribe({
          next: (questionResponse) => {
            this.questionList = questionResponse;
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
      data: this.questionList,
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
        {
          title: 'Question',
          data: 'content',
          render: function (data: any, type: any, row: any) {
            return `${data}`;
          }
        },
        {
          title: 'Chapter',
          data: 'chapters',
          render: function (data: any, type: any, row: any) {
            let value: any = '';
            data.forEach((val: any) => {
              value += `[${val.name}] `;
            });
            return `${value}`;
          }
        },
        { title: 'Level', data: 'level.name' },
        {
          title: 'Action',
          data: null,
          render: (data: any, type: any, row: any) => {
            if (this.home.isActive([Roles.DIRECTOR])) {
              return `<span class="mdi mdi-information-outline icon-action info-icon" title="Detail" data-id="${row.id}"></span>`
            }
            return `<span class="mdi mdi-information-outline icon-action info-icon" title="Detail" data-id="${row.id}"></span>
            <span class="mdi mdi-pencil icon-action edit-icon" title="Edit" data-id="${row.id}"></span>
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

    $('.info-icon').on('click', (event: any) => {
      this.questionId = $(event.currentTarget).data('id');
      this.openPopupDetail(this.questionId);
    });
    
    $('.edit-icon').on('click', (event: any) => {
      const id = $(event.currentTarget).data('id');
      this.router.navigate([this.urlService.getEditQuestionUrl('ADMIN', this.subjectId, id)]);
    });

    $('.delete-icon').on('click', (event: any) => {
      this.questionId = $(event.currentTarget).data('id');
      this.openPopupConfirm('Are you sure?', 'Do you really want to delete this question?');
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
    this.questionService.getQuestionList(this.subjectId).subscribe({
      next: (questionResponse) => {
        this.questionList = questionResponse;
        this.updateDataTable(this.questionList);
        this.closePopup();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  loadQuestionById(id: number, callback: (question: QuestionResponse) => void): void {
    this.questionService.getQuestionById(id).subscribe({
      next: (questionResponse) => {
        this.question = questionResponse;
        callback(this.question); // Chạy hàm callback sau khi lấy thông tin thành công
      },
      error: (err) => {
        this.authService.handleError(err, undefined, 'question', 'load data', this.reloadTable.bind(this));
      }
    });
  }

  navigateToAddQuestion(): void {
    this.router.navigate([this.urlService.getAddQuestionUrl('ADMIN', this.subjectId)]);
  }

  transformTextWithNewlines(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  getOptionLabel(index: number): string {
    return String.fromCharCode(65 + index); // 65 là mã ASCII cho 'A'
  }

  openPopupConfirm(title: string, message: string): void {
    this.dialogTitle = title;
    this.dialogMessage = message;
    this.isConfirmationPopup = true;
  }

  openPopupDetail(id: number): void {
    this.loadQuestionById(id, () => {
      this.isPopupDetail = true;
    });
  }

  closePopup(): void {
    this.questionId = 0;
    this.isPopupDetail = false;
    this.isPopupDelete = false;
  }

  confirmAction(): void {
    if (this.isPopupDelete) {
      this.deleteQuestion();
    }
  }

  deleteQuestion(): void {
    this.questionService.deleteQuestion(this.questionId).subscribe({
      next: (questionResponse) => {
        this.toastr.success(`Question has been deleted successfully!`, 'Success', { timeOut: 3000 });
        this.reloadTable();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, 'question', 'delete question', this.reloadTable.bind(this));
      }
    });
  }

  exportPDF(): void {
    this.authService.listExporter = this.questionList;
    this.exportData(this.authService.exportDataPDF(), 'question_pdf.pdf');
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