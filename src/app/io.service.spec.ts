import { TestBed, inject } from '@angular/core/testing';

import { IoService } from './io.service';

describe('IoService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IoService]
    });
  });

  it('should be created', inject([IoService], (service: IoService) => {
    expect(service).toBeTruthy();
  }));
});
