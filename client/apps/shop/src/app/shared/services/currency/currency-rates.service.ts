import {Injectable} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {DYNAMIC_CONFIG} from '@jf/consts/dynamic-config.const';
import {BehaviorSubject, from} from 'rxjs';
import {filter, map, switchMap, take} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CurrencyRatesService {
  constructor(private aff: AngularFireFunctions) {}

  static COUNTRY_CACHE_KEY = 'country-req';
  static CURRENT_CODE = 'current-code';

  current$: BehaviorSubject<string>;

  getRates() {
    let currentCode: any = localStorage.getItem(
      CurrencyRatesService.CURRENT_CODE
    );
    let countryCheck = localStorage.getItem(
      CurrencyRatesService.COUNTRY_CACHE_KEY
    );

    this.current$ = new BehaviorSubject(
      currentCode ? currentCode : DYNAMIC_CONFIG.currency.primary
    );

    this.current$.subscribe(change => {
      localStorage.setItem(CurrencyRatesService.CURRENT_CODE, change);
    });

    if (!currentCode && !countryCheck) {
      from(this.aff.functions.httpsCallable('ipData')())
        .pipe(
          filter(value => !!value),
          switchMap(value =>
            this.current$.pipe(map(current => [current, value.data]))
          ),
          take(1)
        )
        .subscribe(([current, countryCurrency]) => {
          localStorage.setItem(CurrencyRatesService.COUNTRY_CACHE_KEY, 'sent');

          if (
            countryCurrency !== current &&
            DYNAMIC_CONFIG.currency.supportedCurrencies.includes(
              countryCurrency
            )
          ) {
            this.current$.next(countryCurrency);
          }
        });
    }
  }
}
