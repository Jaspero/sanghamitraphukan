import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {News} from '@jf/interfaces/news.interface';
import {Observable} from 'rxjs';

@Component({
  selector: 'jfs-news-single',
  templateUrl: './news-single.component.html',
  styleUrls: ['./news-single.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsSingleComponent implements OnInit {
  constructor(private activatedRoute: ActivatedRoute) {}

  data$: Observable<{news: News}>;

  ngOnInit() {
    this.data$ = this.activatedRoute.data as Observable<{news: News}>;
  }
}
