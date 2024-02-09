import { TestBed } from '@angular/core/testing';

import { ObreirosService } from './obreiros.service';

describe('ObreirosService', () => {
  let service: ObreirosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObreirosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
