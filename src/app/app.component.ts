/*
 * Angular 2 decorators and services
 */
import {Component} from '@angular/core';


/*
 * App Component
 * Top Level Component
 */
@Component({
    selector: 'app',
    styleUrls: [
        './app.component.css'
    ],
    template: `
    <nav>
      <span>
        <a [routerLink]=" ['./'] ">
          Index
        </a>
      </span>
      |
      <span>
        <a [routerLink]=" ['./home'] ">
          Home
        </a>
      </span>
      |
      <span>
        <a [routerLink]=" ['./detail'] ">
          Detail
        </a>
      </span>
      |
      <span>
        <a [routerLink]=" ['./about'] ">
          About
        </a>
      </span>
    </nav>

    <main>
      <router-outlet></router-outlet>
    </main>


    <footer>
      <span>WebPack Angular 2 Starter by <a [href]="url">@AngularClass</a></span>
      <div>
        <a [href]="url">
          <img [src]="angularclassLogo" width="25%">
        </a>
      </div>
    </footer>
  `
})
export class AppComponent {
    angularclassLogo = 'assets/img/angularclass-avatar.png';
    name = 'Angular 2 Webpack Starter';
    url = 'https://twitter.com/albanx0';

    constructor() {

    }

    ngOnInit() {
    }

}
