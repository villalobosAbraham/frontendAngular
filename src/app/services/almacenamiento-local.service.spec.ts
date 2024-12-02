import { TestBed } from '@angular/core/testing';

import { AlmacenamientoLocalService } from './almacenamiento-local.service';

describe('AlmacenamientoLocalService', () => {
  let service: AlmacenamientoLocalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlmacenamientoLocalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
