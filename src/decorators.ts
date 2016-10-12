import {Subject} from "rxjs";
import {SimpleChanges, SimpleChange} from "@angular/core";
// The set of lifecycle notification events. Omits ng-on-changes because that is handled in a separate stream.

const lifeCycleEventNames = [
    "ngOnInit",
    "ngDoCheck",
    "ngAfterContentInit",
    "ngAfterContentChecked",
    "ngAferViewInit",
    "ngAfterViewChecked",
    "ngOnDestroy"
];

function ngEventStreamName(name: string) {
    const unprefixed = name.replace("ng", "");
    return unprefixed.charAt(0).toLowerCase() + unprefixed.slice(1);
}

export type LifeCycleNotificationEvent =
"ngOnInit" |
"ngDoCheck" |
"ngAfterContentInit" |
"ngAfterContentChecked" |
"ngAferViewInit" |
"ngAfterViewChecked" |
"ngOnDestroy";

function eqs(left: any) {
    return function (right: any) {
        return left === right;
    };
}

// Point free for use with cool functional libraries... then didn't want to take a dependency on one.
function renderLifeCycleObservable(target: any) {
    return function(eventName: string) {
        Object.defineProperty(target, ngEventStreamName(name), {
            configurable: false,
            enumerable: true,
            value: target["lifeCycleEvents"].filter(eqs(eventName))
        });
    };
}

export function ReactiveLifeCycle(): ClassDecorator {
    return function(target: Function): Function {
        function Decorated() {
            // Initialize before the delegated constructor so that it may reference these streams
            this.lifeCycleEvents = new Subject();
            for (let i = 0; i < lifeCycleEventNames.length; i++) {
                renderLifeCycleObservable(this)(lifeCycleEventNames[i]);
            }
            target.apply(this, Array.prototype.slice.call(arguments, 0));
        }
        Decorated.prototype = Object.create(target.prototype);
        return Decorated;
    };
}

export function ReactiveChange(inputProperty: string): PropertyDecorator {
    return function (target: any, propertyKey: string): void {
        Object.defineProperty(target, propertyKey, {
            writable: false,
            value: new Subject()
        });
        const originalNgOnChanges = target["ngOnChanges"];
        target["ngOnChanges"] = function(changes: SimpleChanges) {
            if (originalNgOnChanges) {
                originalNgOnChanges.call(this, changes);
            }
            if (this.hasOwnProperty(propertyKey) && this[propertyKey] && changes[inputProperty]) {
                this[propertyKey].next(changes[inputProperty]);
            }
        };
    };
}

export function reactiveChangeValue(change: SimpleChange): any {
    return change.currentValue;
}

export function ReactiveSource(): PropertyDecorator {
    return function (target: any, propertyKey: string): void {
        const sink = new Subject();
        Object.defineProperty(target, propertyKey, {
            value: sink.toObservable()
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
