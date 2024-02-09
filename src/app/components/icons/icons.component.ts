import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-icons',
  templateUrl: './icons.component.html',
  styleUrls: ['./icons.component.sass']
})

export class IconsComponent {
  constructor(private router: Router) {}
  @Input() nameArray: string[] = [];
  @Input() pathArray: string[] = [];
  @Input() routeArray: string[] = [];

  get indices(): number[] {
    return Array.from({ length: this.nameArray.length }, (_, index) => index);
  }

  routerRedirect(page: string) {
    console.log(page)
      if (page) {
        this.router.navigate([page]);
      }
  }

}
