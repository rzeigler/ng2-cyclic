import {Observable, Subscription} from "rxjs";
import {FormGroup, AbstractControl} from "@angular/forms";

export function bindProperty(key: string, on: any) {
    return function (value: any) {
        on[key] = value;
    };
}

export function bindProjection(projection: string[], on: any, value: any) {
    projection.forEach(key => {
        on[key] = value[key];
    });
}

export function bindFormValues(projection: string[], on: FormGroup, source: any) {
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

export function second<T>(_: any, t: T): T {
    return t;
}
