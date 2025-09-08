import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateExamQuestionsComponent } from './update-exam-questions.component';

describe('UpdateExamQuestionsComponent', () => {
  let component: UpdateExamQuestionsComponent;
  let fixture: ComponentFixture<UpdateExamQuestionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [UpdateExamQuestionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateExamQuestionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
