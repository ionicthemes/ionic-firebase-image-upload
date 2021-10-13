import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { ImageListingModel } from '../utils/models/image-listing.model';
import { DataService } from '../utils/services/data.service';
import { DataStore } from '../utils/shell/data-store';

@Injectable()
export class PrivateContentResolver implements Resolve<any> {

  constructor(private dataService: DataService) {}

  resolve() {
    const filesDataSource: Observable<ImageListingModel> = this.dataService.getPrivateFilesDataSource();
    const filesDataStore: DataStore<ImageListingModel> = this.dataService.getPrivateFilesDataStore(filesDataSource);

    return filesDataStore;
  }
}
