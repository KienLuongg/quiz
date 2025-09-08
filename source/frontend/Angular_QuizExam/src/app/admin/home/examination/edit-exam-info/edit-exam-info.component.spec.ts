import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditExamInfoComponent } from './edit-exam-info.component';

describe('EditExamInfoComponent', () => {
  let component: EditExamInfoComponent;
  let fixture: ComponentFixture<EditExamInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditExamInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditExamInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
