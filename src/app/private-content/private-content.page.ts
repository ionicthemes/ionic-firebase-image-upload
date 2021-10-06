import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { ImageListingModel } from '../models/image-listing.model';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-private-content',
  templateUrl: './private-content.page.html',
  styleUrls: ['./private-content.page.scss'],
})
export class PrivateContentPage implements OnInit, OnDestroy {

  files: ImageListingModel;
  private subs: Subscription[] = [];

  constructor(
    public dataService: DataService,
    public actionSheetController: ActionSheetController,
    private route: ActivatedRoute,
    private router: Router
  ) {}



  ngOnInit() {
    const sub1 = this.route.data
    .pipe(
      map((resolvedRouteData) => {
        const sub2 = resolvedRouteData['data'].state.subscribe(
          (state: ImageListingModel) => {
            this.files = state;
          }
        );
        this.subs.push(sub2);
      })
    ).subscribe();

    this.subs.push(sub1);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  async openCameraComponent() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri, // file-based data; provides best performance
      source: CameraSource.Camera, // automatically take a new photo with the camera
      quality: 100, // highest quality (0 to 100)
    });

    const savedImageFile = await this.dataService.savePictureInFirebaseStorage(capturedPhoto);
    this.files.imagesUrls.unshift(savedImageFile);
  }

  public async showActionSheet(photo: string, position: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.dataService.deletePicture(photo, position)
          .then((x) => {
            // File deleted successfully
            this.files.imagesUrls.splice(position, 1);
          }).catch((error) => {
            // Uh-oh, an error occurred!
          });
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          // Nothing to do, action sheet is automatically closed
         }
      }]
    });
    await actionSheet.present();
  }

  signOut() {
    this.dataService.signOutFromFirebase()
    .then(() => this.router.navigate(['/']));
  }
}
