import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  OnInit
} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {Customer} from '@jf/interfaces/customer.interface';
import {combineLatest, Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {MatAutocompleteSelectedEvent} from '@angular/material/autocomplete';

@Component({
  selector: 'jfsc-customer-lookup',
  templateUrl: './customer-lookup.component.html',
  styleUrls: ['./customer-lookup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomerLookupComponent),
      multi: true
    }
  ]
})
export class CustomerLookupComponent implements OnInit, ControlValueAccessor {
  constructor(private afs: AngularFirestore) {}

  onTouch: Function;
  onModelChange: Function;
  search = new FormControl('');
  customers$: Observable<Customer[]>;
  filteredCustomers$: Observable<Customer[]>;

  ngOnInit() {
    this.customers$ = this.afs
      .collection<Customer>(FirestoreCollections.Customers)
      .valueChanges({idField: 'id'});

    this.filteredCustomers$ = combineLatest([
      this.customers$,
      this.search.valueChanges.pipe(
        startWith(this.search.value || ''),
        map(value => (value || '').toLowerCase())
      )
    ]).pipe(
      map(([customers, value]) =>
        customers.filter(customer =>
          (customer.fullName || customer.name || customer.email || '').toLowerCase().includes(value)
        )
      )
    );
  }

  optionSelected(event: MatAutocompleteSelectedEvent) {
    this.onModelChange({
      id: event.option.id,
      name: event.option.value
    });
  }

  registerOnChange(fn: any) {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean) {
    if (isDisabled) {
      this.search.disable();
    } else if (this.search.disabled) {
      this.search.enable();
    }
  }

  writeValue(value: string | {id: string; fullName: string}) {
    this.search.setValue(typeof value === 'string' ? value : value && value.fullName || '');
  }
}
