import { Component, Input, HostBinding } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-image-shell',
  templateUrl: './image-shell.component.html',
  styleUrls: ['./image-shell.component.scss']
})
export class ImageShellComponent {
  // To debug shell styles, change configuration in the environment file
  private debugDisplay = (environment.appShellConfig && environment.appShellConfig.debug) ? environment.appShellConfig.debug : false;

  // tslint:disable-next-line:variable-name
  _src = '';
  // tslint:disable-next-line:variable-name
  _alt = '';
  // tslint:disable-next-line:variable-name
  _loadingStrategy: 'lazy' | 'eager' = 'lazy';
  // tslint:disable-next-line:variable-name
  _display = '';

  @HostBinding('class.img-loaded') imageLoaded = false;
  @HostBinding('class.img-error') imageError = false;

  @HostBinding('attr.data-error') errorMessage = 'Could not load image';

  @HostBinding('style.backgroundImage') backgroundImage: string;

  @HostBinding('attr.display')
  @Input()
  set display(val: string) {
    this._display = (val !== undefined && val !== null) ? val : '';

    // For display 'cover' we use a hidden aux image. As it's hidden, if set loading to 'lazy' it won't ever trigger the loading mechanism
    if (this._display === 'cover') {
      this._loadingStrategy = 'eager';
    }
  }
  get display(): string {
    return this._display;
  }

  @Input()
  set src(val: string) {
    if (!this.debugDisplay) {
      this._src = (val !== undefined && val !== null) ? val : '';
    }

    if (this._display === 'cover') {
      // Unset the background-image until the image is loaded
      this.backgroundImage = 'unset';
    }
  }

  @Input()
  set alt(val: string) {
    this._alt = (val !== undefined && val !== null) ? val : '';
  }

  constructor() { }

  _imageLoaded(): void {
    this.imageLoaded = true;

    // If it's a cover image then set the background-image property accordingly
    if (this._display === 'cover') {
      // Now that the image is loaded, set the background image
      this.backgroundImage = 'url(' + this._src + ')';
    }
  }

  _imageLoadError(event: Event): void {
    // Image error event get's called when the src is empty. We use emty values for the shell.
    // (see: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Image_loading_errors)
    // Avoid that shell case
    if (this._src && this._src !== '') {
      this.imageLoaded = false;

      setTimeout(() => {
        this.imageError = true;
      }, 500);
    }
  }
}
