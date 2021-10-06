import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { DataStore } from '../shell/data-store';
import { DataService } from '../services/data.service';
import { ImageListingModel } from '../models/image-listing.model';

@Injectable()
export class PrivateContentResolver implements Resolve<any> {

  constructor(private dataService: DataService) {}

  resolve() {
    const filesDataSource: Observable<ImageListingModel> = this.dataService.getPrivateFilesDataSource();
    const filesDataStore: DataStore<ImageListingModel> = this.dataService.getPrivateFilesDataStore(filesDataSource);

    return filesDataStore;
  }
}
