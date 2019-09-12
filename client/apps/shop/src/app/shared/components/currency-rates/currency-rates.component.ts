import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import {DYNAMIC_CONFIG} from '@jf/consts/dynamic-config.const';
import {CurrencyRatesService} from '../../services/currency/currency-rates.service';

@Component({
  selector: 'jfs-currency-rates',
  templateUrl: './currency-rates.component.html',
  styleUrls: ['./currency-rates.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CurrencyRatesComponent {
  constructor(public currencyRates: CurrencyRatesService) {}

  base = DYNAMIC_CONFIG.currency.primary;

  changeCurrent(value: {key: string; value: number}) {
    this.currencyRates.current$.next({
      currency: value.key,
      rate: value.value
    });
  }
}
