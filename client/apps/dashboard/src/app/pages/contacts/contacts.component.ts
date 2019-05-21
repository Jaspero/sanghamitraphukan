import {Component} from '@angular/core';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {Contact} from '@jf/interfaces/contact.interface';
import {ListComponent} from '../../shared/components/list/list.component';

@Component({
  selector: 'jfsc-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent extends ListComponent<Contact> {
  displayedColumns: string[] = ['checkBox', 'email', 'name', 'message'];

  collection = FirestoreCollections.Contacts;
}
