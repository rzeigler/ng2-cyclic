import {Subject, Observable, Subscription} from "rxjs";
import {FormGroup, AbstractControl} from "@angular/forms";
import {SimpleChanges, SimpleChange, OnInit, DoCheck, AfterContentInit, AfterContentChecked, AfterViewInit, AfterViewChecked, OnDestroy, OnChanges} from "@angular/core";
// The set of lifecycle notification events. Omits ng-on-changes because that is handled in a separate stream.

function ngEventStreamName(name: string) {
    const unprefixed = name.replace("ng", "");
    return unprefixed.charAt(0).toLowerCase() + unprefixed.slice(1);
}

export type LifeCycleNotificationEvent =
"ngOnInit" |
"ngDoCheck" |
"ngAfterContentInit" |
"ngAfterContentChecked" |
"ngAfterViewInit" |
"ngAfterViewChecked" |
"ngOnDestroy";

function eqs(left: any) {
    return function (right: any) {
        return left === right;
    };
}

export class ReactiveComponent
        implements OnInit,
                   DoCheck,
                   AfterContentInit,
                   AfterContentChecked,
                   AfterViewInit,
                   AfterViewChecked,
                   OnDestroy,
                   OnChanges {
    private lifeCycleSubject: Subject<LifeCycleNotificationEvent>;
    public readonly lifeCycle$: Observable<LifeCycleNotificationEvent>;
    public readonly onInit$: Observable<LifeCycleNotificationEvent>;
    public readonly doCheck$: Observable<LifeCycleNotificationEvent>;
    public readonly afterContentInit$: Observable<LifeCycleNotificationEvent>;
    public readonly afterContentChecked$: Observable<LifeCycleNotificationEvent>;
    public readonly afterViewInit$: Observable<LifeCycleNotificationEvent>;
    public readonly afterViewChecked$: Observable<LifeCycleNotificationEvent>;
    public readonly onDestroy$: Observable<LifeCycleNotificationEvent>;

    private changesSubject: Subject<SimpleChanges>;
    public readonly changes$: Observable<SimpleChanges>;

    constructor() {
        this.lifeCycle$ = this.lifeCycleSubject = new Subject<LifeCycleNotificationEvent>();
        this.onInit$ = this.lifeCycle$.filter(eqs("ngOnInit"));
        this.doCheck$ = this.lifeCycle$.filter(eqs("ngDoCheck"));
        this.afterContentInit$ = this.lifeCycle$.filter(eqs("ngAfterContentInit"));
        this.afterContentChecked$ = this.lifeCycle$.filter(eqs("ngAfterContentChecked"));
        this.afterViewInit$ = this.lifeCycle$.filter(eqs("ngAfterViewInit"));
        this.afterViewChecked$ = this.lifeCycle$.filter(eqs("ngAfterViewChecked"));
        this.onDestroy$ = this.lifeCycle$.filter(eqs("ngOnDestroy"));
        this.changes$
         = this.changesSubject = new Subject<SimpleChanges>();
    }

    ngOnInit() {
        this.lifeCycleSubject.next("ngOnInit");
    }

    ngDoCheck() {
        this.lifeCycleSubject.next("ngDoCheck");
    }

    ngAfterContentInit() {
        this.lifeCycleSubject.next("ngAfterContentInit");
    }

    ngAfterContentChecked() {
        this.lifeCycleSubject.next("ngAfterContentChecked");
    }

    ngAfterViewInit() {
        this.lifeCycleSubject.next("ngAfterViewInit");
    }

    ngAfterViewChecked() {
        this.lifeCycleSubject.next("ngAfterViewChecked");
    }

    ngOnDestroy() {
        this.lifeCycleSubject.next("ngOnDestroy");
        this.lifeCycleSubject.complete();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.changesSubject.next(changes);
    }
}

export function reactiveChange(name: string) {
    return function (changes: SimpleChanges) {
        return changes[name];
    };
}

export function reactiveChangeValue(change: SimpleChange): any {
    return change.currentValue;
}

export function ReactiveSource(): PropertyDecorator {
    return function (target: any, propertyKey: string): void {
        const sink = new Subject();
        Object.defineProperty(target, propertyKey, {
            value: sink
        });
        Object.defineProperty(target, `${propertyKey}_Sink`, {
            get: function () {
                return function (value: any) {
                    sink.next(value);
                };
            }
        });
    };
}

export function bindProperty(key: string, on: any) {
    return function (value: any) {
        on[key] = value;
    };
}

export function bindProjection(projection: string[], on: any, value: any) {
    return function (value: any) {
        projection.forEach(key => {
            on[key] = value[key];
        });
    }
}

export function bindFormValues(projection: string[], on: FormGroup) {
    return function(source: any) {
        projection.forEach(key => {
            if (!on.controls[key]) {
                console.warn(`Disregarding form binding for ${key}. No control exists`);
            }
            // Prevent change spinning
            if (on.controls[key].value !== source[key]) {
                on.controls[key].setValue(source[key]);
            }
        });
    }
}

export function bindStore(store: {dispatch: Function}) {
    return function (value: any) {
        store.dispatch(value);
    }
}

export function second<T>(_: any, t: T): T {
    return t;
}
