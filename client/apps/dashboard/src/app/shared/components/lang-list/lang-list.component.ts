import {Component} from '@angular/core';
import {from, Observable} from 'rxjs';
import {map, switchMap, take} from 'rxjs/operators';
import {RouteData} from '../../interfaces/route-data.interface';
import {ExportComponent} from '../export/export.component';
import {ListComponent} from '../list/list.component';

@Component({
  selector: 'jfsc-lang-list',
  template: ''
})
export class LangListComponent<
  T extends {id: any},
  R extends RouteData = RouteData
> extends ListComponent<T, R> {
  get collectionRef() {
    return this.state.language$.pipe(map(lang => `${this.collection}-${lang}`));
  }

  delete(id: string): Observable<any> {
    return this.state.language$.pipe(
      switchMap(lang =>
        from(
          this.afs
            .collection(`${this.collection}-${lang}`)
            .doc(id)
            .delete()
        )
      )
    );
  }

  export() {
    this.state.language$
      .pipe(
        take(1),
        switchMap(lang =>
          this.bottomSheet
            .open(ExportComponent, {
              data: {
                collection: `${this.collection}-${lang}`,
                ids: this.selection.selected
              }
            })
            .afterOpened()
        )
      )
      .subscribe();
  }
}
