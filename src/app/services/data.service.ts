import { Injectable } from '@angular/core';
import { Storage, ref, getStorage, uploadString, listAll, getDownloadURL, deleteObject, StorageReference, ListResult } from '@angular/fire/storage';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, UserCredential, onAuthStateChanged, User, signOut } from "@angular/fire/auth";
import { Platform } from '@ionic/angular';
import { Photo } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { from, Observable, ReplaySubject } from 'rxjs';
import { DataStore } from '../shell/data-store';
import { ImageListingModel } from '../models/image-listing.model';
import { concatMap, filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class DataService {
  public photos: string[] = [];

  private friendsDataStore: DataStore<ImageListingModel>;
  private postsDataStore: DataStore<ImageListingModel>;
  private privateContentDataStore: DataStore<ImageListingModel>;

  private currentUser: User;
  private loggedUser: ReplaySubject<any> = new ReplaySubject<any>(1);


  constructor(
    private platform: Platform,
    private storage: Storage
  ) {

    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        this.currentUser = user;
        this.loggedUser.next(user);
      } else {
        // User is signed out
        this.currentUser = null;
        this.loggedUser.next(null);
      }
    });

  }

  loggedUserObservable() {
    return this.loggedUser.asObservable();
  }

  public signInToFirebase(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(getAuth(), email, password);
  }

  public signUpToFirebase(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(getAuth(), email, password);
  }

  public signOutFromFirebase() {
    return signOut(getAuth());
  }

  public getFriendsImagesDataSource(): Observable<ImageListingModel> {
    return this.getImages('public-files/friends');
  }

  public getFriendsImagesDataStore(dataSource: Observable<ImageListingModel>): DataStore<ImageListingModel> {
    // Check if we already loaded this object
    if (!this.friendsDataStore) {
      // Initialize the model specifying that it is a shell model
      const shellModel: ImageListingModel = new ImageListingModel();
      this.friendsDataStore = new DataStore(shellModel);
      this.friendsDataStore.load(dataSource);
    }

    return this.friendsDataStore;
  }

  public getPostsImagesDataSource(): Observable<ImageListingModel> {
    return this.getImages('public-files/posts');
  }

  public getPostsImagesDataStore(dataSource: Observable<ImageListingModel>): DataStore<ImageListingModel> {
    // Check if we already loaded this object
    if (!this.postsDataStore) {
      // Initialize the model specifying that it is a shell model
      const shellModel: ImageListingModel = new ImageListingModel();
      this.postsDataStore = new DataStore(shellModel);
      this.postsDataStore.load(dataSource);
    }

    return this.postsDataStore;
  }

  private getImages(bucketPath: string): Observable<ImageListingModel> {
    const storageRef = ref(getStorage());

    // Points to our firestorage folder with path bucketPath
    const friendsRef = ref(storageRef, bucketPath);

    return from(this.getDownloadURLs(friendsRef))
    .pipe(
      map(urls => {
        const model = new ImageListingModel();
        model.imagesUrls = urls;
        return model;
      })
    )
  }

  private getDownloadURLs(imagesRef: StorageReference): Promise<string[]> {
    return new Promise((resolve, reject) => {
      listAll(imagesRef)
      .then((listResult: ListResult) => {
        let downloadUrlsPromises: Promise<string>[] = [];

        listResult.items.forEach((itemRef: StorageReference) => {
          // returns the download url of a given file reference
          const itemUrl = getDownloadURL(ref(imagesRef, itemRef.name));
          downloadUrlsPromises.push(itemUrl);
        });

        Promise.all(downloadUrlsPromises)
        .then((downloadUrls: string[]) => resolve(downloadUrls));
      }).catch((error) => reject(error));
    });
  }

  public getPrivateFilesDataSource(): Observable<ImageListingModel> {
    return this.loggedUser
    .pipe(
      filter((user: User) => user != null),
      concatMap(user => {
        return this.getImages('private-files/' + user.uid);
      })
    )
  }

  public getPrivateFilesDataStore(dataSource: Observable<ImageListingModel>): DataStore<ImageListingModel> {
    // Check if we already loaded this object
    if (!this.privateContentDataStore) {
      // Initialize the model specifying that it is a shell model
      const shellModel: ImageListingModel = new ImageListingModel();
      this.privateContentDataStore = new DataStore(shellModel);
      this.privateContentDataStore.load(dataSource);
    }

    return this.privateContentDataStore;
  }

  // Save picture to file on device
  async savePictureInFirebaseStorage(cameraPhoto: Photo) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(cameraPhoto);

    // Get a reference to the storage service, which is used to create references in your storage bucket
    const storageRef = ref(getStorage());

    // Points to our firestorage folder 'private-files/userID'
    const imagesRef = ref(storageRef, 'private-files/' + this.currentUser.uid);

    // Points to 'tutorial-files/file-name.jpeg'
    const fileName = new Date().getTime() + '.jpeg';
    const spaceRef = ref(imagesRef, fileName);

    const savedFile = await uploadString(spaceRef, base64Data, 'data_url');
    const fileUrl = await getDownloadURL(ref(imagesRef, savedFile.metadata.name));

    return fileUrl;
  }

  // Read camera photo into base64 format based on the platform the app is running on
  private async readAsBase64(cameraPhoto: Photo) {
    // "hybrid" will detect Cordova or Capacitor
    if (this.platform.is('hybrid')) {
      // Read the file into base64 format
      const file = await Filesystem.readFile({
        path: cameraPhoto.path,
      });

      return file.data;
    } else {
      // Fetch the photo, read as a blob, then convert to base64 format
      const response = await fetch(cameraPhoto.webPath!);
      const blob = await response.blob();

      return (await this.convertBlobToBase64(blob)) as string;
    }
  }

  // Delete picture by removing it from reference data and the filesystem
  public deletePicture(photo: string, position: number) {
    // Remove this photo from the Photos reference data array
    this.photos.splice(position, 1);

    // get filename from url path
    const filename = photo.split(RegExp('(%2F)..*(%2F)'))[3].split("?")[0];

    // Get a reference to the storage service, which is used to create references in your storage bucket
    const storageRef = ref(getStorage());

    // Points to our firestorage folder 'private-files/userID'
    const imagesRef = ref(storageRef, 'private-files/' + this.currentUser.uid);

    const imageToDeleteRef = ref(imagesRef, filename);
    // Delete the file
    return deleteObject(imageToDeleteRef);
  }

  private convertBlobToBase64 = (blob: Blob) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.readAsDataURL(blob);
    });
}
