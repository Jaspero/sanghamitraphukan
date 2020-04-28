import {TestBed} from '@angular/core/testing';

import {CurrencyRatesService} from './currency-rates.service';

describe('CurrencyRatesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CurrencyRatesService = TestBed.get(CurrencyRatesService);
    expect(service).toBeTruthy();
  });
});
