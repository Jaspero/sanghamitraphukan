import {Component, OnInit} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'jfsc-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.css']
})
export class ContactsComponent implements OnInit {
  displayedColumns: string[] = ['email', 'name', 'message'];

  constructor(private afs: AngularFirestore) {}

  data$: Observable<any>;

  ngOnInit() {
    this.data$ = this.afs
      .collection(FirestoreCollections.Contacts)
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(action => ({
            id: action.payload.doc.id,
            ...action.payload.doc.data()
          }));
        })
      );
  }
}
