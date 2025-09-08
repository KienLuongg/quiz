import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../admin.component';
import { StudentResponse } from '../../../shared/models/student.model';
import { Sem } from '../../../shared/models/sem.model';
import { MarkResponse } from '../../../shared/models/mark.model';
import { StudentService } from '../../../shared/service/student/student.service';
import { SemService } from '../../../shared/service/sem/sem.service';
import { MarkService } from '../../../shared/service/mark/mark.service';
import { UrlService } from '../../../shared/service/url.service';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-mark',
  templateUrl: './mark.component.html',
  styleUrls: [
    './../../../shared/styles/admin/style.css',
    './../../../shared/styles/popup.css',
    './mark.component.css'
  ]
})
export class MarkComponent implements OnInit, OnDestroy {
  classId: number;
  studentId: number;
  
  dataTable: any;
  student: StudentResponse = {} as StudentResponse;
  semList: Sem[] = [];
  markList: MarkResponse[] = [];

  selectedSem: number = 0;

  constructor(
    private authService: AuthService,
    private titleService: Title,
    public admin: AdminComponent,
    private studentService: StudentService,
    private semService: SemService,
    private markService: MarkService,
    private urlService: UrlService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.classId = Number(this.activatedRoute.snapshot.params['classId']) || 0;
    this.studentId = Number(this.activatedRoute.snapshot.params['studentId']) || 0;
  }

  ngOnInit(): void {
    this.titleService.setTitle('Student Marks Report');
    this.loadData();
  }

  loadData(): void {
    forkJoin([this.semService.getSemList(), this.studentService.getStudentById(this.studentId)])
      .subscribe({
        next: ([semResponse, studentResponse]) => {
          this.semList = semResponse;
          this.student = studentResponse;
          if (this.semList && this.semList.length > 0) {
            // Nếu semList có dữ liệu thì setup chọn mặc định bằng sem đầu tiên
            this.setSelectedSem(this.semList[0].id);
            this.initializeDataTable();
          }
        },
        error: (err) => {
          this.authService.handleError(err, undefined, '', 'load data');
          this.navigateToStudentList();
        }
      }
    );
  }

  setSelectedSem(semId: number): void {
    this.selectedSem = semId;
    this.markService.getMarkListBySemAndStudent(semId, this.studentId).subscribe({
      next: (markResponse) => {
        this.markList = markResponse;
        this.updateDataTable(this.markList);
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  initializeDataTable(): void {
    this.dataTable = $('#example').DataTable({
      data: this.markList,
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
        { title: 'Subject', data: 'subjectName' },
        { title: 'Mark', data: 'score' },
        { title: 'Max Mark', data: 'maxScore' },
        {
          title: 'Rate', // Tính toán tỷ lệ % của điểm
          data: null, // Không có dữ liệu trực tiếp
          render: (data: any, type: any, row: MarkResponse) => {
            return this.getOverall(row); // Gọi hàm tính tỷ lệ điểm
          }
        },
        {
          title: 'Violations',
          data: 'warning',
          render: (data: any) => {
            return data ? `<span class="text-danger">${data}</span>` : '0';
          }
        },
        {
          title: 'Result', // Trạng thái (RE-EXAM/PASS/...)
          data: null, // Không có dữ liệu trực tiếp
          render: (data: any, type: any, row: MarkResponse) => {
            return this.getResult(row.score, row.maxScore); // Gọi hàm tính trạng thái
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
  }

  updateDataTable(newData: any): void {
    if (this.dataTable) {
      this.dataTable.clear(); // Xóa dữ liệu hiện tại
      this.dataTable.rows.add(newData); // Thêm dữ liệu mới
      this.dataTable.draw(); // Vẽ lại bảng
    }
  }

  navigateToStudentList(): void {
    const url = this.classId == 0
      ? this.urlService.getStudentListUrl('ADMIN')
      : this.urlService.getClassDetailUrl('ADMIN', this.classId)
    this.router.navigate([url]);
  }

  getOverall(row: any): string {
    if (row.score && row.maxScore) {
      const percentage = Math.round((row.score / row.maxScore) * 100);
      return `${percentage}%`;
    }
    return '0%';
  }

  getResult(score: number, maxScore: number): string {
    if (maxScore === 0) return 'N/A'; 

    const percentage = (score / maxScore) * 100;

    if (percentage < 40) {
      return 'RE-EXAM';
    } else if (percentage >= 40 && percentage < 60) {
      return 'PASS';
    } else if (percentage >= 60 && percentage < 70) {
      return 'CREDIT';
    } else {
      return 'DISTINCTION';
    }
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }
}