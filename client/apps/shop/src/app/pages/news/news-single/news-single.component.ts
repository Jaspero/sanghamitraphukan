import {Component, OnInit, ChangeDetectionStrategy} from '@angular/core';

@Component({
  selector: 'jfs-news-single',
  templateUrl: './news-single.component.html',
  styleUrls: ['./news-single.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewsSingleComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
