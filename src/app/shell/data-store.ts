import { Observable, of, combineLatest, ReplaySubject } from 'rxjs';
import { delay, map, startWith } from 'rxjs/operators';
import { environment } from '../../environments/environment';


export class ShellModel {
  isShell = false;
}

export class DataStore<T> {
  // We wait on purpose 1 or 2 secs on local environment when fetching from json to simulate the backend roundtrip.
  // However, in production you should set this delay to 0 in the environment.prod file.
  // tslint:disable-next-line:max-line-length
  private networkDelay = (environment.appShellConfig && environment.appShellConfig.networkDelay) ? environment.appShellConfig.networkDelay : 0;

  //  holds a reference to the state emitted by the DataSource.
  private timeline: ReplaySubject<T & ShellModel> = new ReplaySubject(1);

  constructor(private shellModel: T) { }

  // Static function with generics
  // (ref: https://stackoverflow.com/a/24293088/1116959)
  // Append a shell (T & ShellModel) to every value (T) emmited to the timeline
  public static AppendShell<T>(dataObservable: Observable<T>, shellModel: T, networkDelay = 400): Observable<T & ShellModel> {
    const delayObservable = of(true).pipe(
      delay(networkDelay)
    );

    // Assign shell flag accordingly
    // (ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
    return combineLatest([
      delayObservable,
      dataObservable
    ]).pipe(
      // Dismiss unnecessary delayValue
      map(([delayValue, dataValue]: [boolean, T]): (T & ShellModel) => Object.assign(dataValue, {isShell: false})),
      // Set the shell model as the initial value
      startWith(Object.assign(shellModel, {isShell: true}))
    );
  }

  load(dataSourceObservable: Observable<T>, networkDelay?: number): void {
    // tslint:disable-next-line:no-shadowed-variable
    const delay = (typeof networkDelay === 'number') ? networkDelay : this.networkDelay;

    let processedDataSource: Observable<any>;

    // If no network delay, then don't show shell
    if (delay === 0) {
      processedDataSource = dataSourceObservable;
    } else {
      processedDataSource = DataStore.AppendShell(dataSourceObservable, this.shellModel, delay);
    }

    processedDataSource
    .subscribe((dataValue: T & ShellModel) => {
      this.timeline.next(dataValue);
    });
  }

  public get state(): Observable<T & ShellModel> {
    return this.timeline.asObservable();
  }
}
