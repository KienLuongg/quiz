import { TestBed } from '@angular/core/testing';

import { SemService } from './sem.service';

describe('SemService', () => {
  let service: SemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
