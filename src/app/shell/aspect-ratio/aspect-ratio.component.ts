import { Component, Input, HostBinding } from '@angular/core';

@Component({
  selector: 'app-aspect-ratio',
  templateUrl: './aspect-ratio.component.html',
  styleUrls: ['./aspect-ratio.component.scss']
})
export class AspectRatioComponent {

  @HostBinding('style.padding') ratioPadding = '0px';

  @Input()
  set ratio(ratio: { w: number, h: number }) {
    ratio = (ratio !== undefined && ratio !== null) ? ratio : {w: 1, h: 1};

    const heightRatio = (ratio.h / ratio.w * 100) + '%';

    // Conserve aspect ratio (see: http://stackoverflow.com/a/10441480/1116959)
    this.ratioPadding = '0px 0px ' + heightRatio + ' 0px';
  }

  constructor() { }
}
