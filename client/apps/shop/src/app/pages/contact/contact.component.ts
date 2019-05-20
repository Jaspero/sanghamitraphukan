import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'jfs-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
