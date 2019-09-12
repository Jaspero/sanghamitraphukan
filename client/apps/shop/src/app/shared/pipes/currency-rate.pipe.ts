import {Pipe, PipeTransform} from '@angular/core';
import {StripePipe} from '@jf/pipes/stripe.pipe';
import {map} from 'rxjs/operators';
import {CurrencyRatesService} from '../services/currency/currency-rates.service';

@Pipe({
  name: 'cr'
})
export class CurrencyRatePipe implements PipeTransform {
  constructor(private currentRates: CurrencyRatesService) {}

  private stripePipe: StripePipe;

  transform(value: number) {
    if (!this.stripePipe) {
      this.stripePipe = new StripePipe();
    }

    return this.currentRates.current$.pipe(
      map(current => {
        const valueToUse = value * current.rate;
        return this.stripePipe.transform(valueToUse, current.currency);
      })
    );
  }
}
