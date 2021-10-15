import { Injectable } from '@angular/core';
import { Storage, ref, getStorage, uploadString, listAll, getDownloadURL, deleteObject, StorageReference, ListResult, UploadResult } from '@angular/fire/storage';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, UserCredential, onAuthStateChanged, User, signOut } from "@angular/fire/auth";
import { Photo } from '@capacitor/camera';
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

  private currentUser: User;
  private loggedUser: ReplaySubject<any> = new ReplaySubject<any>(1);


  constructor(
    private _fireStorage: Storage
  ) {

    onAuthStateChanged(getAuth(), (user) => {
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

    // Initialize the model specifying that it is a shell model
    const shellModel: ImageListingModel = new ImageListingModel();

    let privateContentDataStore: DataStore<ImageListingModel> = new DataStore(shellModel);
    privateContentDataStore.load(dataSource);

    return privateContentDataStore;
  }

  // Save picture to file on device
  public async savePictureInFirebaseStorage(cameraPhoto: Photo) {

    // Get a reference to the storage service, which is used to create references in your storage bucket
    const storageRef = ref(getStorage());

    // Points to our firestorage folder 'private-files/userID'
    const imagesRef = ref(storageRef, 'private-files/' + this.currentUser.uid);

    // Points to 'tutorial-files/file-name.jpeg'
    const fileName = new Date().getTime() + '.jpeg';
    const spaceRef = ref(imagesRef, fileName);

    let savedFile: UploadResult = await uploadString(spaceRef, cameraPhoto.base64String, 'base64');

    return await getDownloadURL(ref(imagesRef, savedFile?.metadata.name));
  }

  // Delete picture
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

  private getImages(bucketPath: string): Observable<ImageListingModel> {
    // Get a reference to the storage service, which is used to create references in your storage bucket
    const storage = getStorage();

    // Create a storage reference from our storage service
    const storageRef = ref(storage);

    // Points to our firestorage folder with path bucketPath
    const folderRef = ref(storageRef, bucketPath);

    return from(this.getDownloadURLs(folderRef))
    .pipe(
      map(urls => {
        const model = new ImageListingModel();
        model.imagesUrls = urls;
        return model;
      })
    );
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
}
