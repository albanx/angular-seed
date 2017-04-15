import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

@Component({
    selector: 'about',
    styles: [`
  `],
    template: `
    <h1>About</h1>
    <div>
      For hot module reloading run asd asdasd
      <pre>npm run start:hmr</pre>
    </div>
    <div>
      <h3>
      </h3>
    </div>
    <pre>this.localState = {{ localState | json }}</pre>
  `
})
export class AboutComponent {
    localState: any;

    constructor(public route: ActivatedRoute) {

    }

    ngOnInit() {

    }

}
