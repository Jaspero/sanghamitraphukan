import {ChangeDetectionStrategy, Component} from '@angular/core';
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
  currencyList = DYNAMIC_CONFIG.currency.supportedCurrencies;

  changeCurrent(value: string) {
    this.currencyRates.current$.next(value);
  }
}
