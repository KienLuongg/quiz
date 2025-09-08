import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../../admin.component';
import { ExaminationComponent } from '../examination.component';
import { Sem } from '../../../../shared/models/sem.model';
import { ExaminationResponse } from '../../../../shared/models/examination.model';
import { SemService } from '../../../../shared/service/sem/sem.service';
import { ExaminationService } from '../../../../shared/service/examination/examination.service';
import { UrlService } from '../../../../shared/service/url.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: [
    './../../../../shared/styles/admin/style.css',
    './list.component.css'
  ]
})
export class ListComponent implements OnInit {
  semList: Sem[] = [];
  selectedSem: number = 0;

  examList: ExaminationResponse[] = [];
  filteredExamList: ExaminationResponse[] = [];
  pagedExamList: ExaminationResponse[] = [];
  searchExam: string = '';
  currentPage: number = 1; // Trang hiện tại
  itemsPerPage: number = 5; // Số phần tử trên mỗi trang
  totalPages: number = 0; // Tổng số trang
  pages: number[] = []; // Mảng số trang

  constructor(
    private authService: AuthService,
    private titleService: Title,
    public admin: AdminComponent,
    public examComponent: ExaminationComponent,
    private semService: SemService,
    private examService: ExaminationService,
    public urlService: UrlService,
    private router: Router,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('List of Exams');
    this.loadData();
  }

  loadData(): void {
    this.semService.getSemList().subscribe({
      next: (semResponse) => {
        this.semList = semResponse;
        if (this.semList && this.semList.length > 0) {
          this.setSelectedSem(this.semList[0].id);
        }
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  setSelectedSem(semId: number): void {
    this.selectedSem = semId;
    this.examService.getExamListBySem(semId).subscribe({
      next: (examResponse) => {
        this.examList = examResponse;
        this.filteredExamList = examResponse;
        this.calculatePagination();
        this.updatePagedList();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  convertDateFormat(dateObj: Date | undefined): string {
    // Dùng DatePipe để chuyển đổi đối tượng Date sang định dạng 'dd/MM/yyyy HH:mm'
    return this.datePipe.transform(dateObj, 'dd/MM/yyyy HH:mm')!;
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredExamList.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  updatePagedList(): void {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagedExamList = this.filteredExamList.slice(start, end);
  }

  onSearch(): void {
    this.currentPage = 1;
    this.filteredExamList = this.examList.filter(exam =>
      exam.name.toLowerCase().includes(this.searchExam.toLowerCase()) ||
      exam.subject.name.toLowerCase().includes(this.searchExam.toLowerCase()) ||
      exam.code.toLowerCase().includes(this.searchExam.toLowerCase())
    );
    this.calculatePagination();
    this.updatePagedList();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedList();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedList();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedList();
    }
  }

  getExamDetail(id: any): void {
    this.examComponent.step = false;
    this.router.navigate([this.urlService.getExamDetailUrl('ADMIN', id)]);
  }

  navigateToCreateExam(): void {
    this.router.navigate([this.urlService.getCreateExamUrl('ADMIN')]);
  }
}