import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {ActivatedRouteSnapshot, Resolve, Router} from '@angular/router';
import {STATIC_CONFIG} from '@jf/consts/static-config.const';
import {FirestoreCollections} from '@jf/enums/firestore-collections.enum';
import {News} from '@jf/interfaces/news.interface';
import {Product} from '@jf/interfaces/product.interface';
import {Observable, throwError} from 'rxjs';
import {catchError, finalize, map} from 'rxjs/operators';
import {MetaResolver} from '../../../shared/resolvers/meta.resolver';
import {StructuredDataResolver} from '../../../shared/resolvers/structured-data.resolver';
import {StateService} from '../../../shared/services/state/state.service';

@Injectable()
export class NewResolver implements Resolve<Observable<News>> {
  constructor(
    private afs: AngularFirestore,
    private router: Router,
    private metaResolver: MetaResolver,
    private state: StateService,
    private structuredDataResolver: StructuredDataResolver
  ) {}

  resolve(route: ActivatedRouteSnapshot) {
    this.state.loading$.next(true);

    return this.afs
      .doc<News>(
        `${FirestoreCollections.News}-${STATIC_CONFIG.lang}/${route.params.id}`
      )
      .get()
      .pipe(
        map(news => {
          if (!news.exists) {
            this.router.navigate(['/404']);
            return;
          }

          const singleNew = {
            id: news.id,
            ...news.data()
          } as News;

          this.metaResolver.resolve({
            data: {
              meta: {
                title: singleNew.title,
                description: singleNew.shortDescription
              }
            }
          });

          this.structuredDataResolver.resolve({
            data: {
              structuredData: {
                '@type': 'Product',
                name: singleNew.title,
                shortDescription: singleNew.shortDescription,
                id: singleNew.id,
                gallery: singleNew.gallery
              }
            }
          });

          return singleNew;
        }),

        finalize(() => this.state.loading$.next(false)),

        catchError(error => {
          this.router.navigate(['/404']);
          return throwError(error);
        })
      );
  }
}