import {Component, OnInit} from '@angular/core';
import {BROWSER_CONFIG} from '@jf/consts/browser-config.const';

@Component({
  selector: 'jfs-cookie',
  templateUrl: './cookie.component.html',
  styleUrls: ['./cookie.component.scss']
})
export class CookieComponent implements OnInit {
  constructor() {}

  active: boolean;

  ngOnInit() {
    if (BROWSER_CONFIG.isBrowser) {
      /**
       * delete cookies policy after one year
       */

      if (Date.now() - +localStorage.getItem('cookies') >= 31556952000) {
        localStorage.removeItem('privacy');
      }

      this.showCookies();
    }
  }

  showCookies() {
    if (!localStorage.getItem('cookies')) {
      this.active = true;
    }
  }

  setCookies() {
    const timeCookies = Date.now();

    this.active = false;
    localStorage.setItem('cookies', JSON.stringify(timeCookies));
  }
}
