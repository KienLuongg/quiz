import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { StudentComponent } from './student.component';
import { ToastrModule, ToastrService } from 'ngx-toastr';

describe('StudentComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([])
      ],
      declarations: [
        StudentComponent
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(StudentComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'Angular_QuizExam'`, () => {
    const fixture = TestBed.createComponent(StudentComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Angular_QuizExam');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(StudentComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, Angular_QuizExam');
  });
});
