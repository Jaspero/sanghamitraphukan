import {HttpClient} from '@angular/common/http';
import {ChangeDetectionStrategy, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';
import {AngularFirestore} from '@angular/fire/firestore';
import {AngularFireFunctions} from '@angular/fire/functions';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {Router} from '@angular/router';
import {RxDestroy} from '@jaspero/ng-helpers';
import {DYNAMIC_CONFIG} from '@jf/consts/dynamic-config.const';
import {STATIC_CONFIG} from '@jf/consts/static-config.const';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {FirestoreStaticDocuments} from '@jf/enums/firestore-static-documents.enum';
import {OrderStatus} from '@jf/enums/order-status.enum';
import {Country} from '@jf/interfaces/country.interface';
import {Customer} from '@jf/interfaces/customer.interface';
import {Discount} from '@jf/interfaces/discount.interface';
import {OrderItem} from '@jf/interfaces/order.interface';
import {Price} from '@jf/interfaces/product.interface';
import {Shipping} from '@jf/interfaces/shipping.interface';
import {StripePipe} from '@jf/pipes/stripe.pipe';
import {notify} from '@jf/utils/notify.operator';
import {fromStripeFormat, toStripeFormat} from '@jf/utils/stripe-format';
import {BehaviorSubject, combineLatest, from, Observable, of, Subscription, throwError} from 'rxjs';
import {catchError, map, shareReplay, startWith, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {DiscountValueType} from '../../../../../dashboard/src/app/pages/discounts/pages/single-page/discounts-single-page.component';
import {environment} from '../../../environments/environment';
import {
  LoginSignupDialogComponent,
  LoginSignUpView
} from '../../shared/components/login-signup-dialog/login-signup-dialog.component';
import {ElementType} from '../../shared/modules/stripe-elements/enums/element-type.enum';
import {ElementConfig} from '../../shared/modules/stripe-elements/interfaces/element-config.interface';
import {StripeElementsComponent} from '../../shared/modules/stripe-elements/stripe-elements.component';
import {CartService} from '../../shared/services/cart/cart.service';
import {CurrencyRatesService} from '../../shared/services/currency/currency-rates.service';
import {StateService} from '../../shared/services/state/state.service';

interface Item extends OrderItem {
  id: string;
  quantity: number;
  price: Price;
  name: string;
  attributes: any;
  identifier: string;
}

@Component({
  selector: 'jfs-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComponent extends RxDestroy implements OnInit {
  constructor(
    public cartService: CartService,
    public afAuth: AngularFireAuth,
    public aff: AngularFireFunctions,
    private http: HttpClient,
    private afs: AngularFirestore,
    private fb: FormBuilder,
    private router: Router,
    private state: StateService,
    private dialog: MatDialog,
    private currencyRatesService: CurrencyRatesService
  ) {
    super();
  }

  @ViewChild('dialogLegal', {static: true})
  dialogLegal: TemplateRef<any>;

  dialogContent = [];

  @ViewChild(StripeElementsComponent, {static: false})
  stripeElementsComponent: StripeElementsComponent;

  clientSecret$: Observable<{clientSecret: string, id: string}>;
  countries$: Observable<Country[]>;
  form$: Observable<FormGroup>;
  loggedIn$: Observable<boolean>;
  loggedOut$: Observable<boolean>;
  items$: Observable<Item[]>;
  formData$: Observable<any>;
  shipping$: Observable<Shipping[]>;
  price$: Observable<{
    total: number;
    shipping: number;
    subTotal: number;
  }>;
  elementConfig$: Observable<[ElementConfig, ElementConfig]>;

  termsControl = new FormControl(false);
  elementType = ElementType;
  currencyCode: string;
  orderId: string;

  code = new FormControl('');
  discount = 0;
  validCode$ = new BehaviorSubject<Discount>(null);

  private shippingSubscription: Subscription;

  ngOnInit() {
    this.currencyRatesService.current$.pipe(take(1)).subscribe(value => {
      this.currencyCode = value;
    });

    this.countries$ = from(
      this.aff.functions.httpsCallable('countries')()
    ).pipe(
      map((res: any) => res.data),
      shareReplay(1)
    );

    this.shipping$ = this.afs
      .doc(
        `${FirestoreCollections.Settings}/${FirestoreStaticDocuments.Shipping}`
      )
      .get()
      .pipe(
        map(res => (res.exists ? res.data().value : [])),
        shareReplay(1)
      );

    this.loggedIn$ = this.state.user$.pipe(map(user => !!user));

    this.loggedOut$ = this.state.user$.pipe(map(user => !user));

    this.form$ = this.state.user$.pipe(
      map(user => this.buildForm(user ? user.customerData : {})),
      shareReplay(1)
    );

    this.formData$ = this.form$.pipe(
      switchMap(form => form.valueChanges.pipe(startWith(form.getRawValue())))
    );

    this.items$ = this.cartService.items$.pipe(
      map(items =>
        items.map(val => ({
          id: val.productId,
          quantity: val.quantity,
          price: val.price,
          name: val.name,
          attributes: val.filters,
          identifier: val.identifier
        }))
      )
    );

    this.clientSecret$ = combineLatest([
      this.state.user$.pipe(take(1)),
      this.formData$,
      this.items$,
      this.currencyRatesService.current$.pipe(take(1)),
      this.validCode$
    ]).pipe(
      switchMap(([user, data, orderItems, currency, discount]) => {

        if (!orderItems.length) {
          return of({clientSecret: '', id: ''});
        }

        return this.http.post<{clientSecret: string, id: string}>(
          `${environment.restApi}/stripe/checkout`,
          {
            orderItems,
            currency,
            lang: STATIC_CONFIG.lang,
            form: data,
            ...(user && {
              customer: {
                email: user.authData.email,
                name: user.customerData.fullName,
                id: user.authData.uid
              }
            }),
            code: discount ? discount.id : null
          }
        );
      }),
      shareReplay(1)
    );

    this.price$ = combineLatest([
      this.cartService.totalPrice$.pipe(take(1)),
      this.formData$.pipe(
        map(data =>
          data.shippingInfo ? data.billing.country : data.shipping.country
        )
      ),
      this.shipping$,
      this.currencyRatesService.current$.pipe(take(1)),
      this.validCode$
    ]).pipe(
      map(([cartTotal, country, shippingData, currency, discount]) => {
        const shippingItem = shippingData.find(it => it.code === country);
        const shipping =
          shippingItem && Number.isInteger(shippingItem.value)
            ? shippingItem.value
            : DYNAMIC_CONFIG.currency.shippingCost || 0;
        let total = cartTotal[DYNAMIC_CONFIG.currency.primary] + shipping;

        if (discount) {
          switch (discount.valueType) {
            case DiscountValueType.Percentage:
              const deduct = fromStripeFormat(total * (discount.value / 100));
              this.discount = -deduct;
              total -= deduct;
              break;
            case DiscountValueType.FixedAmount:
              total = Math.max(
                0,
                total - discount.values[DYNAMIC_CONFIG.currency.primary]
              );
              this.discount = -discount.values[DYNAMIC_CONFIG.currency.primary];
              break;
          }
        }

        return {
          total,
          shipping,
          subTotal: cartTotal[currency]
        };
      })
    );

    this.elementConfig$ = combineLatest([
      this.price$,
      this.formData$,
      this.currencyRatesService.current$.pipe(take(1))
    ]).pipe(
      map(([price, data, currency]) => [
        {
          type: ElementType.Card,
          options: {
            style: {
              base: {
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSmoothing: 'antialiased',
                fontSize: '16px'
              }
            }
          }
        },
        {
          type: ElementType.PaymentRequestButton,
          options: {
            currency: currency.toLowerCase(),
            country: data.billing.country,
            total: {
              label: 'Total',
              amount: price.total
            }
          }
        }
      ])
    );

    this.orderId = this.afs.createId();
  }

  buildForm(value: Partial<Customer>) {
    const group = this.fb.group({
      billing: this.addressForm(value.billing ? value.billing : {}),
      shippingInfo: value.shippingInfo || true,
      saveInfo: true
    });

    if (this.shippingSubscription) {
      this.shippingSubscription.unsubscribe();
    }

    this.shippingSubscription = group
      .get('shippingInfo')
      .valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe(shippingInfo => {
        if (shippingInfo) {
          group.removeControl('shipping');
        } else {
          group.addControl('shipping', this.addressForm(value.shipping || {}));
        }
      });

    return group;
  }

  addressForm(data: any) {
    return this.fb.group({
      firstName: [data.firstName || '', Validators.required],
      lastName: [data.lastName || '', Validators.required],
      email: [data.email || '', [Validators.required, Validators.email]],
      phone: [data.phone || '', Validators.required],
      city: [data.city || '', Validators.required],
      zip: [data.zip || '', Validators.required],
      country: [data.country || '', Validators.required],
      line1: [data.line1 || '', Validators.required],
      line2: [data.line2 || '']
    });
  }

  /**
   * Payments Triggered by clicking on checkout
   */
  checkOut() {
    return () =>
      this.triggerPayment()
  }

  /**
   * Payments triggered by different payment methods
   * like apple pay for example
   */
  paymentTriggered(ev) {
    if (!ev.error) {
      this.triggerPayment(ev.paymentIntent)
        .pipe(take(1))
        .subscribe();
    }
  }

  triggerPayment(paymentIntent?: {id: string}) {
    return combineLatest([
      this.formData$,
      this.state.user$,
      this.price$,
      this.items$,
      this.currencyRatesService.current$.pipe(take(1)),
      this.clientSecret$.pipe(take(1))
    ]).pipe(
      take(1),
      switchMap(([data, user, price, items, currency, {id}]) => {
        if (this.afAuth.auth.currentUser && data.saveInfo) {
          this.afs
            .doc(
              `${FirestoreCollections.Customers}/${this.afAuth.auth.currentUser.uid}`
            )
            .update(data)
            .catch(console.error);
        }

        return from(
          this.afs
            .collection(FirestoreCollections.Orders)
            .doc(this.orderId)
            .set({
              price,
              currency,
              status: OrderStatus.Ordered,
              paymentIntentId: paymentIntent ? paymentIntent.id : id,
              billing: data.billing,
              createdOn: Date.now(),
              code: this.code.value,
              lang: STATIC_CONFIG.lang,

              ...(data.shippingInfo ? {} : {shipping: data.shipping}),
              ...(user &&
                user.authData && {
                  customerId: user.authData.uid,
                  customerName: user.customerData.fullName,
                  email: user.authData.email
                }),

              /**
               * Format ExtendedOrderItem[] in to the
               * appropriate order format
               */
              ...items.reduce(
                (acc, cur) => {
                  const {id, ...data} = cur;

                  if (!data.attributes) {
                    delete data.attributes;
                  }

                  acc.orderItems.push(cur.id);
                  acc.orderItemsData.push(data);

                  return acc;
                },
                {
                  orderItems: [],
                  orderItemsData: []
                }
              )
            })
        )
          .pipe(
            switchMap(() => {
              if (paymentIntent) {
                return of(true);
              } else {
                return this.stripeElementsComponent.activeElement
                  .triggerPayment()
              }
            }),
            tap(() => {
              localStorage.setItem(
                'result',
                JSON.stringify({
                  orderItems: items,
                  price: price,
                  billing: data.billing,
                  ...(data.shippingInfo ? {} : {shipping: data.shipping.email})
                })
              );
              this.router.navigate(['checkout/success']);
            }),
            catchError(error => {
              this.router.navigate(['checkout/error']);
              return throwError(error);
            })
          );
      })
    );
  }

  legalDialog(el) {
    this.afs
      .collection(FirestoreCollections.Settings)
      .doc('legal')
      .get()
      .subscribe(value => {
        this.dialogContent = value.data()[el];
        this.dialog.open(this.dialogLegal, {
          width: '1000px'
        });
      });
  }

  logInSignUp(logIn = true) {
    this.dialog.open(LoginSignupDialogComponent, {
      width: '400px',
      data: {
        view: logIn ? LoginSignUpView.LogIn : LoginSignUpView.SignUp
      }
    });
  }

  clearDiscount() {
    this.validCode$.next(null);
  }

  applyCode() {
    return () => {
      const code = this.code.value;

      this.validCode$.next(null);

      return this.afs
        .collection<Discount>(
          `${FirestoreCollections.Discounts}-${STATIC_CONFIG.lang}`
        )
        .doc(code)
        .get()
        .pipe(
          switchMap(value => {
            const discount = value.data();

            if (
              !value.exists ||
              !discount.active ||
              (discount.type === 'limited' && discount.limitedNumber <= 0) ||
              !(
                discount.startingDate.seconds <
                Date.now() <
                discount.endingDate.seconds
              )
            ) {
              return throwError('Invalid discount');
            }

            this.validCode$.next({
              ...value.data(),
              id: value.id
            } as any);

            return of();
          }),
          notify({
            success: 'Discount applied',
            error: 'Discount is invalid'
          })
        );
    };
  }

  formatLabel(value: number) {
    return new StripePipe().transform(toStripeFormat(value));
  }
}
