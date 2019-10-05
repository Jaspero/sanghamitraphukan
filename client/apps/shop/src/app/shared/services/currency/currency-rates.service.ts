import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {DYNAMIC_CONFIG} from '@jf/consts/dynamic-config.const';
import {BehaviorSubject, combineLatest, from, Observable, of} from 'rxjs';
import {filter, map, shareReplay, switchMap, take, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CurrencyRatesService {
  constructor(private http: HttpClient, public aff: AngularFireFunctions) {}

  static BASE_URL = 'https://api.exchangeratesapi.io/latest';
  static CURRENCIES_TO_REQUEST = ['USD', 'INR', 'EUR', 'GBP'];
  static COUNTRY_CACHE_KEY = 'country-req';
  static CACHE_KEY = 'rates';
  static CURRENT_CACHE_KEY = 'current-rate';

  rates$: Observable<{
    [key: string]: number;
  }>;
  current$: BehaviorSubject<{
    currency: string;
    rate: number;
    base: string;
  }>;

  getRates() {
    let rates: any = localStorage.getItem(CurrencyRatesService.CACHE_KEY);
    let currentRate: any = localStorage.getItem(
      CurrencyRatesService.CURRENT_CACHE_KEY
    );
    let countryCheck = localStorage.getItem(
      CurrencyRatesService.COUNTRY_CACHE_KEY
    );

    if (currentRate) {
      try {
        currentRate = JSON.parse(currentRate);
      } catch (e) {}
    }

    this.current$ = new BehaviorSubject(
      currentRate &&
      currentRate.base === DYNAMIC_CONFIG.currency.primary &&
      CurrencyRatesService.CURRENCIES_TO_REQUEST.includes(currentRate.currency)
        ? currentRate
        : {
            currency: DYNAMIC_CONFIG.currency.primary,
            rate: 1
          }
    );

    this.current$.subscribe(change => {
      localStorage.setItem(
        CurrencyRatesService.CURRENT_CACHE_KEY,
        JSON.stringify(change)
      );
    });

    if (!currentRate && !countryCheck) {
      from(this.aff.functions.httpsCallable('ipData')())
        .pipe(
          filter(value => !!value),
          switchMap(value =>
            combineLatest([this.current$, this.rates$]).pipe(
              map(val => [...val, value.data])
            )
          ),
          take(1)
        )
        .subscribe(([current, rates, countryCurrency]) => {
          localStorage.setItem(CurrencyRatesService.COUNTRY_CACHE_KEY, 'sent');

          if (countryCurrency !== current.currency && rates[countryCurrency]) {
            this.current$.next({
              currency: countryCurrency,
              rate: rates[countryCurrency],
              base: DYNAMIC_CONFIG.currency.primary
            });
          }
        });
    }

    if (rates) {
      try {
        rates = JSON.parse(rates);
      } catch (e) {}

      if (
        rates &&
        rates.date &&
        rates.base === DYNAMIC_CONFIG.currency.primary
      ) {
        const cacheDate = new Date(rates.date);
        const today = new Date();

        if (
          cacheDate.getDate() === today.getDate() &&
          cacheDate.getFullYear() === today.getFullYear() &&
          cacheDate.getMonth() === today.getMonth()
        ) {
          rates = rates.rates;
        } else {
          rates = '';
        }
      } else {
        rates = '';
      }
    }

    if (rates) {
      this.rates$ = of(rates);
    } else {
      this.rates$ = this.http
        .get<{
          base: string;
          date: string;
          rates: {
            [key: string]: number;
          };
        }>(CurrencyRatesService.BASE_URL, {
          params: {
            base: DYNAMIC_CONFIG.currency.primary,
            symbols: CurrencyRatesService.CURRENCIES_TO_REQUEST.join(',')
          }
        })
        .pipe(
          tap(res => {
            localStorage.setItem(
              CurrencyRatesService.CACHE_KEY,
              JSON.stringify(res)
            );
          }),
          map(res => res.rates),
          shareReplay(1)
        );
    }
  }
}
