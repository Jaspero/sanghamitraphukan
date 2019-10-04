import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import {DYNAMIC_CONFIG} from '@jf/consts/dynamic-config.const';
import {BehaviorSubject, from, Observable, of} from 'rxjs';
import {filter, map, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CurrencyRatesService {
  constructor(private http: HttpClient, public aff: AngularFireFunctions) {
    this.getRates();
  }

  static BASE_URL = 'https://api.exchangeratesapi.io/latest';
  static CURRENCIES_TO_REQUEST = ['USD', 'INR', 'EUR'];
  static CACHE_KEY = 'rates';
  static CURRENT_CACHE_KEY = 'current-rate';

  rates$: Observable<{
    [key: string]: number;
  }>;
  current$: BehaviorSubject<{currency: string; rate: number}>;

  getRates() {
    let rates: any = localStorage.getItem(CurrencyRatesService.CACHE_KEY);
    let currentRate: any = localStorage.getItem(
      CurrencyRatesService.CURRENT_CACHE_KEY
    );

    if (currentRate) {
      try {
        currentRate = JSON.parse(currentRate);
      } catch (e) {}
    }

    if (!currentRate) {
      from(this.aff.functions.httpsCallable('countries')())
        .pipe(filter(value => !!value))
        .subscribe(value => {});
    }

    this.current$ = new BehaviorSubject(
      currentRate || {
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
        const today = new Date(rates.date);

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
          map(res => res.rates)
        );
    }
  }
}
