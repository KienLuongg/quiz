import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../shared/service/auth.service';
import { Title } from '@angular/platform-browser';
import { AdminComponent } from '../../admin.component';
import { ChartOptions } from '../../../shared/models/models';
import { Sem } from '../../../shared/models/sem.model';
import { SubjectResponse } from '../../../shared/models/subject.model';
import { ExaminationResponse } from '../../../shared/models/examination.model';
import { PassPercentage } from '../../../shared/models/mark.model';
import { SemService } from '../../../shared/service/sem/sem.service';
import { SubjectService } from '../../../shared/service/subject/subject.service';
import { ClassService } from '../../../shared/service/class/class.service';
import { StudentService } from '../../../shared/service/student/student.service';
import { EmployeeService } from '../../../shared/service/employee/employee.service';
import { ExaminationService } from '../../../shared/service/examination/examination.service';
import { MarkService } from '../../../shared/service/mark/mark.service';
import { UrlService } from '../../../shared/service/url.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./../../../shared/styles/admin/style.css', './dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  chartOptions!: Partial<ChartOptions>;
  chartOptions_1!: Partial<ChartOptions>;
  chartOptions_2!: Partial<ChartOptions>;

  examCount: number = 0;
  classCount: number = 0;
  studentCount: number = 0;
  employeeCount: number = 0;

  semList: Sem[] = [];

  // Các thuộc tính cho biểu đồ
  examListChart: ExaminationResponse[] = [];
  subjectListChart: SubjectResponse[] = [];
  selectedSemChart: number = 0;
  selectedSubjectChart: number = 0;

  // Các thuộc tính cho bảng
  examListTable: ExaminationResponse[] = [];
  examFilter: any[] = [];
  subjectListTable: SubjectResponse[] = [];
  selectedSemTable: number = 0;
  selectedSubjectTable: number = 0;

  searchExam: string = '';
  startTime: string = '';
  endTime: string = '';
  
  currentPage: number = 1;

  semStats = {
    reExam: 0,
    pass: 0,
    credit: 0,
    distinction: 0,
    totalPass: 0,
    passPercentage: 0
  };

  subjectStats = {
    reExam: 0,
    pass: 0,
    credit: 0,
    distinction: 0,
    totalPass: 0,
    passPercentage: 0
  };

  constructor(
    private authService: AuthService,
    private titleService: Title,
    public admin: AdminComponent,
    private examService: ExaminationService,
    private classService: ClassService,
    private employeeService: EmployeeService,
    private studentService: StudentService,
    private semService: SemService,
    private subjectService: SubjectService,
    private markService: MarkService,
    public urlService: UrlService,
    private router: Router,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle('Dashboard');
    this.loadData();
  }

  loadData(): void {
    forkJoin([
      this.examService.countAllExams(),
      this.classService.getClassList(),
      this.employeeService.countAllEmployees(),
      this.studentService.countAllStudents(),
      this.semService.getSemList(),
      this.subjectService.getAllSubjectList(),
      this.markService.getPassPercentageBySubject()
    ])
    .subscribe({
      next: ([examResponse, classResponse, employeeResponse, studentResponse, semResponse, subjectResponse, passPercentageResponse]) => {
        this.examCount = examResponse;
        this.classCount = classResponse.length;
        this.employeeCount = employeeResponse;
        this.studentCount = studentResponse;

        this.semList = semResponse;

        this.selectedSemTable = 1;
        this.reloadTable(this.selectedSemTable);

        this.selectedSemChart = 1;
        this.reloadChart(this.selectedSemChart);

        this.charts(subjectResponse, passPercentageResponse);
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  charts(subjectResponse: SubjectResponse[], passPercentageResponse: PassPercentage[]): void {
    this.chartOptions = {
      chart: { height: 300, width: '100%', type: 'bar', toolbar: { show: false } },
      title: {
        text: 'Overview all subject',
        align: 'center',
        style: {
          fontSize: '18px',
          fontWeight: 'bold',
          color: 'var(--color-text)'
        }
      },
      dataLabels: { enabled: false },
      stroke: { width: 2, curve: 'smooth' },
      series: [ { name: 'Scores', data: [] } ],
      legend: { position: 'top' },
      xaxis: {
        type: 'category',
        categories: [],
        axisBorder: { show: false },
        labels: {
          style: {
            colors: 'var(--color-text)', // Màu chữ của nhãn trục x
          }
        }
      },
      yaxis: {
        show: true,
        min: 0,
        max: 100,
        tickAmount: 5, // Cột dọc có các điểm
        labels: {
          style: {
            colors: 'var(--color-text)', // Màu chữ của nhãn trục y
          },
          formatter: (value) => {
            return `${value}%`; // Thêm dấu '%' sau giá trị
          }
        }
      },
      colors: ['#73b4ff'],
      fill: { type: 'solid' }, // Tùy chọn phù hợp với kiểu 'bar'
      grid: { borderColor: '#cccccc3b' }
    };
    this.chartOptions_1 = {
      chart: { height: 150, type: 'donut' },
      dataLabels: { enabled: false },
      plotOptions: { pie: { donut: { size: '75%' } } },
      labels: ['New', 'Return'],
      series: [39, 10],
      legend: { show: false },
      tooltip: { theme: 'dark' },
      grid: { padding: { top: 20, right: 0, bottom: 0, left: 0 } },
      colors: ['#4680ff', '#2ed8b6'],
      fill: { opacity: [1, 1] },
      stroke: { width: 0 }
    };
    this.chartOptions_2 = {
      chart: { height: 150, type: 'donut' },
      dataLabels: { enabled: false },
      plotOptions: { pie: { donut: { size: '75%' } } },
      labels: ['Re-exam', 'Pass', 'Credit', 'Distinction'],  // Đặt tên cho các mục trong donut
      series: [0, 0, 0, 0],  // Mặc định, cần cập nhật sau khi có dữ liệu
      legend: { show: false },
      tooltip: { theme: 'dark' },
      grid: { padding: { top: 20, right: 0, bottom: 0, left: 0 } },
      colors: ['#ff3b30', '#ffcc00', '#4cd964', '#007bff'], // Màu sắc cho các phần của donut
      fill: { opacity: [1, 1, 1, 1] },  // Đảm bảo độ trong suốt cho các phần của donut
      stroke: { width: 0 }
    };

    this.updateBarChart(subjectResponse, passPercentageResponse);
  }

  updateBarChart(subjectResponse: SubjectResponse[], passPercentageResponse: PassPercentage[]): void {
    var dataPassPercentage: any = [];
    if (this.chartOptions && this.chartOptions.xaxis && this.chartOptions.series) {
      this.chartOptions.xaxis.categories = subjectResponse.map(subject => subject.name); // Gán dữ liệu từ API vào categories
      this.chartOptions.xaxis.categories.forEach((subjectName: any) => {
        const subjectData = passPercentageResponse.find(item => item.subjectName == subjectName);
        if (subjectData) {
            dataPassPercentage.push(subjectData.passRate);
        }
        else {
          dataPassPercentage.push(0);
        }
      });
      this.chartOptions.series[0] = {
        name: 'Scores',
        data: dataPassPercentage
      };
    }
  }

  // Hàm xử lý khi chọn học kỳ cho biểu đồ
  setSelectedSemChart(event: Event): void {
    const sem = Number((event.target as HTMLSelectElement).value);
    this.selectedSemChart = sem;
    this.reloadChart(this.selectedSemChart);
  }

  updateSemChart(): void {
    this.chartOptions_1.series = [this.semStats.reExam, this.semStats.pass, this.semStats.credit, this.semStats.distinction];
    this.chartOptions_1.labels = ['Re-exam', 'Pass', 'Credit', 'Distinction'];
    this.chartOptions_1.colors = ['#ff3b30', '#ffcc00', '#4cd964', '#007bff'];
  }

  // Tinh % chart Sem
  calculateScoresChartSem(): void {
    this.semStats.reExam = 0;
    this.semStats.pass = 0;
    this.semStats.credit = 0;
    this.semStats.distinction = 0;

    this.examListChart.forEach(exam => {
      exam.markResponses.forEach(mark => {
        const percentage = (mark.score / mark.maxScore) * 100;

        if (percentage < 40) {
          this.semStats.reExam++;
        } else if (percentage >= 40 && percentage < 60) {
          this.semStats.pass++;
        } else if (percentage >= 60 && percentage < 70) {
          this.semStats.credit++;
        } else {
          this.semStats.distinction++;
        }
      });
    });

    // Tính tỷ lệ Pass
    const total = this.semStats.reExam + this.semStats.pass + this.semStats.credit + this.semStats.distinction;
    this.semStats.totalPass = this.semStats.pass + this.semStats.credit + this.semStats.distinction;
    this.semStats.passPercentage = (this.semStats.totalPass / total) * 100;
  }

  loadSemChartData(semId: number): void {
    this.examService.getFinishedExamsBySem(semId).subscribe({
      next: (examResponse) => {
        this.examListChart = examResponse;
        this.calculateScoresChartSem(); // Gọi hàm tính toán số lượng loại điểm
        this.updateSemChart(); // Cập nhật biểu đồ với dữ liệu mới
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  // Hàm xử lý khi chọn môn học cho biểu đồ
  setSelectedSubjectChart(event: Event): void {
    this.selectedSubjectChart = Number((event.target as HTMLSelectElement).value);
    this.loadDataForSubject(this.selectedSubjectChart, 'chart');
  }

  updateSubjectChart(): void {
    this.chartOptions_2.series = [this.subjectStats.reExam, this.subjectStats.pass, this.subjectStats.credit, this.subjectStats.distinction];
    this.chartOptions_2.labels = ['Re-exam', 'Pass', 'Credit', 'Distinction'];
    this.chartOptions_2.colors = ['#ff3b30', '#ffcc00', '#4cd964', '#007bff'];
  }

  // Tinh % chart subject
  calculateScoresChartSubject(): void {
    this.subjectStats.reExam = 0;
    this.subjectStats.pass = 0;
    this.subjectStats.credit = 0;
    this.subjectStats.distinction = 0;

    this.examListChart.forEach((exam: any) => {
      exam.markResponses.forEach((mark: any) => {
        const percentage = (mark.score / mark.maxScore) * 100;

        if (percentage < 40) {
          this.subjectStats.reExam++;
        } else if (percentage >= 40 && percentage < 60) {
          this.subjectStats.pass++;
        } else if (percentage >= 60 && percentage < 70) {
          this.subjectStats.credit++;
        } else {
          this.subjectStats.distinction++;
        }
      });
    });

    // Tính tỷ lệ Pass
    const total = this.subjectStats.reExam + this.subjectStats.pass + this.subjectStats.credit + this.subjectStats.distinction;
    this.subjectStats.totalPass = this.subjectStats.pass + this.subjectStats.credit + this.subjectStats.distinction;
    this.subjectStats.passPercentage = (this.subjectStats.totalPass / total) * 100;
  }

  // Hàm tải dữ liệu cho môn học
  loadDataForSubject(subjectId: number, type: string): void {
    this.examService.getExamListBySubject(subjectId).subscribe({
      next: (examResponse) => {
        if (type === 'chart') {
          this.examListChart = examResponse;
          this.calculateScoresChartSubject();
          this.updateSubjectChart();
        }
        if (type === 'table') {
          this.examListTable = examResponse;
          this.examFilter = this.examListTable; // Khởi tạo examFilter với dữ liệu từ examList
          this.calculateScoresTable(); // Gọi hàm tính toán
        }
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  // Hàm tải lại chart theo semId đã chọn
  reloadChart(semId: number): void {
    this.subjectService.getSubjectListBySem(semId).subscribe({
      next: (subjectResponse) => {
        this.subjectListChart = subjectResponse;
        this.selectedSubjectChart = this.subjectListChart[0].id;
        this.loadDataForSubject(this.selectedSubjectChart, 'chart');
        this.loadSemChartData(semId);
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  // Hàm xử lý khi chọn học kỳ cho bảng
  setSelectedSemTable(event: Event): void {
    const sem = Number((event.target as HTMLSelectElement).value);
    this.selectedSemTable = sem;
    this.reloadTable(this.selectedSemTable);
  }

  // Hàm xử lý khi chọn môn học cho bảng
  setSelectedSubjectTable(event: Event): void {
    this.selectedSubjectTable = Number((event.target as HTMLSelectElement).value);
    this.loadDataForSubject(this.selectedSubjectTable, 'table');
  }

  // Hàm tính toán số lượng các loại điểm
  calculateScoresTable(): void {
    this.examFilter.forEach((exam: any) => {
      let reExamCount = 0;
      let passCount = 0;
      let creditCount = 0;
      let distinctionCount = 0;

      exam.markResponses.forEach((mark: any) => {
        const percentage = (mark.score / mark.maxScore) * 100;

        if (percentage < 40) {
          reExamCount++;
        } else if (percentage >= 40 && percentage < 60) {
          passCount++;
        } else if (percentage >= 60 && percentage < 70) {
          creditCount++;
        } else {
          distinctionCount++;
        }
      });

      // Gán số lượng các loại điểm cho từng bài kiểm tra
      exam.reExamCount = reExamCount;
      exam.passCount = passCount;
      exam.creditCount = creditCount;
      exam.distinctionCount = distinctionCount;
    });
  }

  // Hàm tải lại bảng theo semId đã chọn
  reloadTable(semId: number): void {
    this.subjectService.getSubjectListBySem(semId).subscribe({
      next: (subjectResponse) => {
        this.subjectListTable = subjectResponse;
        this.selectedSubjectTable = this.subjectListTable[0].id;
        this.loadDataForSubject(this.selectedSubjectTable, 'table');
      },
      error: (err) => {
        this.authService.handleError(err, undefined, '', 'load data');
      }
    });
  }

  convertDateFormat(dateObj: Date | undefined): string {
    // Dùng DatePipe để chuyển đổi đối tượng Date sang định dạng 'dd/MM/yyyy HH:mm'
    return this.datePipe.transform(dateObj, 'dd/MM/yyyy - HH:mm')!;
  }

  navigateExamResults(examId: number) {
    this.router.navigate([this.urlService.getExamResultsUrl('ADMIN', examId)]);
  }

  filterExams(): void {
    this.currentPage = 1;
    this.examFilter = this.examListTable.filter(exam =>
      (exam.name.toLowerCase().includes(this.searchExam.toLowerCase()) ||
      exam.code.toLowerCase().includes(this.searchExam.toLowerCase())) &&
      (!this.startTime || new Date(this.startTime) <= new Date(exam.endTime)) &&
      (!this.endTime || new Date(this.endTime) >= new Date(exam.endTime))
    );
  }

  resetFilter(): void {
    this.searchExam = '';
    this.startTime = '';
    this.endTime = '';
    this.filterExams();
  }
}