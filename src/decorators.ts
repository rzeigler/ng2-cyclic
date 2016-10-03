import {Subject} from 'rxjs';
import {SimpleChanges, SimpleChange} from '@angular/core';
// The set of lifecycle notification events. Omits ng-on-changes because that is handled in a separate stream.
export type LifeCycleNotificationEvent =
    "ng-on-init" |
    "ng-do-check" |
    "ng-after-content-init" |
    "ng-after-content-checked" |
    "ng-after-view-init" |
    "ng-after-view-checked" |
    "ng-on-destroy";


export function ReactiveLifeCycle(): ClassDecorator {
    return function(target: Function): Function {
        function Decorated() {
            target.apply(this, Array.prototype.slice.call(arguments, 0));
            this.lifeCycleEvents = new Subject();
        }
        Decorated.prototype = Object.create(target.prototype);
        Decorated.prototype.ngOnInit = function () {
            if (target.prototype.ngOnInit) {
                target.prototype.ngOnInit.apply(this, Array.prototype.slice.call(arguments, 0));
            }
            this.lifeCycleEvents.next("ng-on-init");
        }
        Decorated.prototype.ngDoCheck = function () {
            if (target.prototype.ngDoCheck) {
                target.prototype.ngDoCheck.apply(this, Array.prototype.slice.call(arguments, 0));
            }
            this.lifeCycleEvents.next("ng-do-check");
        }
        Decorated.prototype.ngAfterContentInit = function () {
            if (target.prototype.ngAfterContentInit) {
                target.prototype.ngAfterContentInit.apply(this, Array.prototype.slice.call(arguments, 0));
            }
            this.lifeCycleEvents.next("ng-after-content-init");
        }
        Decorated.prototype.ngAfterViewInit = function () {
            if (target.prototype.ngAfterViewInit) {
                target.prototype.ngAfterViewInit.apply(this, Array.prototype.slice.call(arguments, 0));
            }
            this.lifeCycleEvents.next("ng-after-view-init");
        }
        Decorated.prototype.ngAfterViewChecked = function () {
            if (target.prototype.ngAfterViewChecked) {
                target.prototype.ngAfterViewChecked.apply(this, Array.prototype.slice.call(arguments, 0));
            }
            this.lifeCycleEvents.next("ng-after-view-checked");
        }
        Decorated.prototype.ngOnDestroy = function () {
            if (target.prototype.ngOnDestroy) {
                target.prototype.ngOnDestroy.apply(this, Array.prototype.slice.call(arguments, 0));
            }
            this.lifeCycleEvents.next("ng-on-destroy");
        }
        return Decorated;
    }
}

export function ReactiveChanges(): ClassDecorator {
    return function (target: Function): Function {
        function Decorated() {
            target.apply(this, Array.prototype.slice.call(arguments, 0));
            this.inputValues = new Subject();
            this.changes = new Subject();
        }
        Decorated.prototype = Object.create(target.prototype);
        Decorated.prototype.ngOnChanges = function (changes: SimpleChanges) {
            this.changes.next(changes);
            const values = {};
            for (let k in changes) {
                values[k] = changes[k].currentValue;
            }
            this.inputValues.next(values);
        }
        return Decorated;
    }
}
