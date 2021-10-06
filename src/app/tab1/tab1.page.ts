import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ImageListingModel } from '../models/image-listing.model';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit, OnDestroy {

  friends: ImageListingModel;
  posts: ImageListingModel;
  private subs: Subscription[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.data
    .pipe(
      map((resolvedRouteData) => {

        const friendsDataStore = resolvedRouteData['data'].friends;
        const postsDataStore = resolvedRouteData['data'].posts;

        const sub1 = friendsDataStore.state.subscribe(
          (state: ImageListingModel) => this.friends = state
        );

        const sub2 = postsDataStore.state.subscribe(
          (state: ImageListingModel) => this.posts = state
        );

        this.subs.push(sub1);
        this.subs.push(sub2);
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
