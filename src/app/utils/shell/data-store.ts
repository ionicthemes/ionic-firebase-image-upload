import { Observable, ReplaySubject } from 'rxjs';
import { map, startWith } from 'rxjs/operators';


export class ShellModel {
  isShell = false;
}

export class DataStore<T> {
  //  holds a reference to the state emitted by the DataSource.
  private timeline: ReplaySubject<T & ShellModel> = new ReplaySubject(1);

  constructor(private shellModel: T) { }

  // Static function with generics
  // Append a shell (T & ShellModel) to every value (T) emmited to the timeline
  public static AppendShell<T>(dataObservable: Observable<T>, shellModel: T): Observable<T & ShellModel> {


    // Assign shell flag accordingly
    // (ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
    return dataObservable.pipe(
      // Dismiss unnecessary delayValue
      map((dataValue: T): (T & ShellModel) => Object.assign(dataValue, {isShell: false})),
      // Set the shell model as the initial value
      startWith(Object.assign(shellModel, {isShell: true}))
    );
  }

  load(dataSourceObservable: Observable<T>): void {
    DataStore.AppendShell(dataSourceObservable, this.shellModel)
    .subscribe((dataValue: T & ShellModel) => {
      this.timeline.next(dataValue);
    });
  }

  public get state(): Observable<T & ShellModel> {
    return this.timeline.asObservable();
  }
}
