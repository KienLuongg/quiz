import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../admin.component';
import { MarkResponse } from '../../../shared/models/mark.model';
import { MarkService } from '../../../shared/service/mark/mark.service';
import { UrlService } from '../../../shared/service/url.service';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-exam-results',
  templateUrl: './exam-results.component.html',
  styleUrls: ['./../../../shared/styles/admin/style.css', './exam-results.component.css']
})
export class ExamResultsComponent implements OnInit, OnDestroy {
  examId: number;
  
  dataTable: any;
  markList: MarkResponse[] = [];

  subjectName: string = '';

  constructor(
    private authService: AuthService,
    private titleService: Title,
    public admin: AdminComponent,
    private markService: MarkService,
    public urlService: UrlService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.examId = Number(this.activatedRoute.snapshot.params['examId']) ?? 0;
  }

  ngOnInit(): void {
    this.titleService.setTitle('Exam Results');
    this.examId = Number(this.activatedRoute.snapshot.params['examId']);
    this.loadData();
  }

  loadData(): void {
    forkJoin([this.markService.getMarkListByExam(this.examId)])
    .subscribe({
      next: ([markResponse]) => {
        if (markResponse.length == 0) {
          this.navigateDashboard();
          return;
        }
        this.markList = markResponse;
        this.subjectName = this.markList[0].subjectName;
        this.initializeDataTable();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, 'exam', 'load data');
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
          title: 'Score',
          render: (data: any, type: any, row: MarkResponse) => {
            const score = row.score;
            if (score) {
              return row.score + ' / ' + row.maxScore;
            }
            return '';
          }
        },
        {
          title: 'Result',
          render: (data: any, type: any, row: MarkResponse) => {
            const score = row.score;
            const maxScore = row.maxScore;
            if (score) {
              return this.getResult(score, maxScore);
            }
            return '';
          }
        }
      ],
      drawCallback: () => {
      }
    });
  }

  navigateDashboard() {
    this.router.navigate([this.urlService.getPageUrl('ADMIN')]);
  }

  getResult(score: number, maxScore: number): string {
    if (maxScore == 0) return 'N/A'; 
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