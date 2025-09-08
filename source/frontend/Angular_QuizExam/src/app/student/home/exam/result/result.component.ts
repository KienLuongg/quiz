import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { MarkResponse } from '../../../../shared/models/mark.model';
import { MarkService } from '../../../../shared/service/mark/mark.service';
import { QuestionRecordService } from '../../../../shared/service/question-record/question-record.service';
import { StudentAnswerService } from '../../../../shared/service/student-answer/student-answer.service';
import { UrlService } from '../../../../shared/service/url.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Chart } from 'chart.js/auto';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: [
    './../../../../shared/styles/student/style.css',
    './result.component.css'
  ]
})
export class ResultComponent implements OnInit {
  examId: number = 0; // ID của bài kiểm tra

  mark: MarkResponse = { } as MarkResponse;

  percentagesByLevel: { [key: string]: number } = { };
  levelNames: string[] = [];
  levelPercentageScores: number[] = [];

  timeTaken: string = ''; // Thời gian làm bài

  constructor(
    private authService: AuthService,
    private titleService: Title,
    private markService: MarkService,
    private questionRecordService: QuestionRecordService,
    private studentAnswerService: StudentAnswerService,
    public urlService: UrlService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.examId = Number(this.activatedRoute.snapshot.paramMap.get('examId')); // Lấy examId từ route
  }

  ngOnInit(): void {
    this.titleService.setTitle('Result');
    this.loadData();
  }

  loadData(): void {
    forkJoin([
      this.markService.getMarkByExam(this.examId),
      this.questionRecordService.getMaxScoreByLevelForExam(this.examId), // Lấy điểm tối đa theo các cấp độ có trong bài thi
      this.studentAnswerService.getScoreByLevelOfStudentInExam(this.examId) // Lấy điểm của học sinh theo các cấp độ có trong bài thi
    ])
    .subscribe({
      next: ([markResponse, questionRecordResponse, studentAnswerResponse]) => {
        if (!markResponse || markResponse.score == null) {
          this.router.navigate([this.urlService.getExamUrl('STUDENT')]);
          return;
        }
        // Lưu dữ liệu điểm của học sinh trong bài thi
        this.mark = markResponse;
        
        // Tính toán thời gian làm bài
        this.calculateTimeTaken(this.mark.submittedTime, this.mark.beginTime);
        
        // Tính toán tỉ lệ điểm theo cấp độ
        this.percentagesByLevel = this.calculatePercentagesByLevel(questionRecordResponse, studentAnswerResponse);
        this.levelNames = Object.keys(this.percentagesByLevel); // Lấy tên các cấp độ
        this.levelPercentageScores = Object.values(this.percentagesByLevel); // Lấy điểm % các cấp độ đó
        
        // Vẽ biểu đồ
        this.drawCharts();
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
        this.router.navigate([this.urlService.getExamUrl('STUDENT')]);
      }
    });
  }

  calculateTimeTaken(submittedTime: Date, beginTime: Date): void {
    // Tính toán thời gian làm bài và chuyển đổi thành định dạng hh:mm:ss
    const timeTakenInMs = new Date(submittedTime).getTime() - new Date(beginTime).getTime();
    const totalSeconds = Math.floor(timeTakenInMs / 1000); // Chuyển đổi milliseconds thành giây
    const hours = Math.floor(totalSeconds / 3600); // Tính số giờ
    const minutes = Math.floor((totalSeconds % 3600) / 60); // Tính số phút
    const seconds = totalSeconds % 60; // Tính số giây

    this.timeTaken = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }

  calculatePercentagesByLevel(maxScores: { [key: string]: number }, scores: { [key: string]: number }): { [key: string]: number } {
    const percentages: { [key: string]: number } = {};
  
    for (const level in maxScores) {
      if (maxScores.hasOwnProperty(level)) {
        const maxScore = maxScores[level];
        const score = scores[level];
        // Tính tỷ lệ phần trăm cho cấp độ
        const percentage = (score / maxScore) * 100;
        percentages[level] = percentage;
      }
    }
  
    return percentages;
  }

  drawCharts(): void {
    this.drawDoughnutChart();
    this.drawBarChart();
  }

  drawDoughnutChart(): void {
    // Vẽ biểu đồ Doughnut
    const doughnutChart = new Chart(document.getElementById('doughnutChart') as HTMLCanvasElement, {
      type: 'doughnut',
      data: {
        labels: ['Score', 'Remain Score'],
        datasets: [{
          data: [0, this.mark.maxScore], // Khởi đầu với điểm 0
          backgroundColor: ['#26AA10', '#DDDDDD'],
          borderWidth: 0,
        }]
      },
      options: {
        cutout: '50%',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: { enabled: true },
          legend: { display: false }
        },
        animation: { animateRotate: false, animateScale: false }
      }
    });

    let currentScore = 0;
    const totalFrames = 20; // 1 giây với 20 fps
    const scoreIncrement = this.mark.score / totalFrames;

    const updateChart = () => {
      currentScore = Math.min(currentScore + scoreIncrement, this.mark.score);
      doughnutChart.data.datasets[0].data = [currentScore, this.mark.maxScore - currentScore];
      doughnutChart.update();
    
      // Cập nhật phần trăm vào phần tử HTML
      const percentage = Math.round((currentScore / this.mark.maxScore) * 100);
      document.getElementById('percentageLabel')!.innerText = `${percentage}%`;
    
      if (currentScore < this.mark.score) {
        requestAnimationFrame(updateChart);
      }
    };
    requestAnimationFrame(updateChart);
  }

  drawBarChart(): void {
    // Vẽ biểu đồ cột
    const barColors = this.levelPercentageScores.map(score => {
      if (score < 30) {
        return '#EE0906'; // Đỏ cho điểm dưới 30%
      }
      if (score <= 70) {
        return '#FFD912'; // Vàng cho điểm từ 30% đến 70%
      }
      return '#26AA10'; // Xanh cho điểm trên 70%
    });

    new Chart(document.getElementById('progressChart') as HTMLCanvasElement, {
      type: 'bar',
      data: {
        labels: this.levelNames,
        datasets: [{ data: this.levelPercentageScores, backgroundColor: barColors, barThickness: 30 }]
      },
      options: {
        indexAxis: 'y',
        plugins: { legend: { display: false } },
        animation: { duration: 2000 },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { 
            beginAtZero: true, 
            max: 100,
            grid: {
              color: '#A9A9A9',
            },
            ticks: {
              color: '#A9A9A9',
            }
          },
          y: {
            grid: {
              color: '#A9A9A9',
            },
            ticks: {
              color: '#A9A9A9',
            }
          }
        }
      }
    });
  }
}