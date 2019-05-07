import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'jfs-cookie',
  templateUrl: './cookie.component.html',
  styleUrls: ['./cookie.component.scss']
})
export class CookieComponent implements OnInit {
  constructor() {}

  cookiesActive: boolean;

  ngOnInit() {
    if (Date.now() - +localStorage.getItem('cookies') >= 31556952000) {
      localStorage.removeItem('privacy');
    }

    this.showCookies();
  }

  showCookies() {
    if (!localStorage.getItem('cookies')) {
      this.cookiesActive = true;
    }
  }

  setCookies() {
    const timeCookies = Date.now();

    this.cookiesActive = false;
    localStorage.setItem('cookies', JSON.stringify(timeCookies));
  }
}
