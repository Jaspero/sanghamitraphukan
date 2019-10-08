import {Pipe, PipeTransform} from '@angular/core';
import {Price} from '@jf/interfaces/product.interface';
import {StripePipe} from '@jf/pipes/stripe.pipe';
import {map} from 'rxjs/operators';
import {CurrencyRatesService} from '../services/currency/currency-rates.service';

@Pipe({
  name: 'cr'
})
export class CurrencyRatePipe implements PipeTransform {
  constructor(private currentRates: CurrencyRatesService) {}

  private stripePipe: StripePipe;

  transform(value: Price) {
    if (!this.stripePipe) {
      this.stripePipe = new StripePipe();
    }

    return this.currentRates.current$.pipe(
      map(current => {
        return this.stripePipe.transform(value, current);
      })
    );
  }
}
