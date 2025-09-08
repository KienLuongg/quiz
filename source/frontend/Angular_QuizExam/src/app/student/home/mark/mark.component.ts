import { Component, Injectable, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { Sem } from '../../../shared/models/sem.model';
import { MarkResponse } from '../../../shared/models/mark.model';
import { SemService } from '../../../shared/service/sem/sem.service';
import { MarkService } from '../../../shared/service/mark/mark.service';

@Component({
  selector: 'app-mark',
  templateUrl: './mark.component.html',
  styleUrls: [
    './../../../shared/styles/student/style.css',
    './mark.component.css'
  ]
})
@Injectable()
export class MarkComponent implements OnInit {
  semList: Sem[] = [];
  markList: MarkResponse[] = [];

  constructor(
    private authService: AuthService,
    private titleService: Title,
    private semService: SemService,
    private markService: MarkService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Mark');
    this.loadData();
  }

  loadData(): void {
    this.semService.getSemList().subscribe({
      next: (semResponse) => {
        this.semList = semResponse;
        if (this.semList && this.semList.length > 0) {
          // Nếu semList có dữ liệu thì setup chọn mặc định bằng sem đầu tiên
          this.setSelectedSem(this.semList[0].id);
        }
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  setSelectedSem(semId: number): void {
    this.markService.getMarkListBySem(semId).subscribe({
      next: (markResponse) => {
        this.markList = markResponse;
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  getOverall(index: number): number {
    if (index >= this.markList.length) {
      return 0;
    }
    const score = this.markList[index].score;
    const maxScore = this.markList[index].maxScore;
    return maxScore ? Math.round((score / maxScore) * 100) : 0;
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
}