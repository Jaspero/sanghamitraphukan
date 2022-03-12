import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AngularFireFunctions} from '@angular/fire/functions';
import { ActivatedRoute } from '@angular/router';
import {DYNAMIC_CONFIG} from '@jf/consts/dynamic-config.const';
import { BehaviorSubject, from, Subject } from 'rxjs';
import {filter, map, switchMap, take} from 'rxjs/operators';
import { COUNTRY_CURRENCY } from '../../consts/country-currency.const';

@Injectable({
  providedIn: 'root'
})
export class CurrencyRatesService {
  constructor(
    private aff: AngularFireFunctions,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  static COUNTRY_CACHE_KEY = 'country-req';
  static CURRENT_CODE = 'current-code';

  current$: BehaviorSubject<string>;

  missingCurrency() {
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

  getRates() {
    this.current$ = new BehaviorSubject( DYNAMIC_CONFIG.currency.primary);
    this.route.queryParams.subscribe(async (val) => {
      let currentCode
      let countryCheck = localStorage.getItem(
        CurrencyRatesService.COUNTRY_CACHE_KEY
      );
      if (val.currency && DYNAMIC_CONFIG.currency.supportedCurrencies.includes(val.currency)) {
        currentCode = val.currency;
      } else {
        currentCode = localStorage.getItem(
          CurrencyRatesService.CURRENT_CODE
        );
      }
      if (!currentCode) {
        const ipLocation: any = await this.http.get('https://api.codetabs.com/v1/geolocation/json').toPromise()
        const found = COUNTRY_CURRENCY.find(x => x.countries.includes(ipLocation.country_code))
        if (found && found.currency) {
          currentCode = found.currency
        }
      }

      if (!currentCode && !countryCheck) {
        this.missingCurrency()
      }
    });



    this.current$.subscribe(change => {
      localStorage.setItem(CurrencyRatesService.CURRENT_CODE, change);
      DYNAMIC_CONFIG.currency.primary = change;
    });


  }
}
