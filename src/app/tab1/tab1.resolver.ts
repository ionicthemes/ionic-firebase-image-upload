import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { DataStore } from '../utils/shell/data-store';
import { DataService } from '../utils/services/data.service';
import { ImageListingModel } from '../utils/models/image-listing.model';

@Injectable()
export class Tab1Resolver implements Resolve<any> {

  constructor(private dataService: DataService) {}

  resolve() {

    const friendsDataSource: Observable<ImageListingModel> = this.dataService.getFriendsImagesDataSource();
    const friendsDataStore: DataStore<ImageListingModel> = this.dataService.getFriendsImagesDataStore(friendsDataSource);

    const postsDataSource: Observable<ImageListingModel> = this.dataService.getPostsImagesDataSource();
    const postsDataStore: DataStore<ImageListingModel> = this.dataService.getPostsImagesDataStore(postsDataSource);

    return { friends: friendsDataStore, posts: postsDataStore };
  }
}
