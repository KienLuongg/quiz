import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SemComponent } from './sem.component';

describe('SemComponent', () => {
  let component: SemComponent;
  let fixture: ComponentFixture<SemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
