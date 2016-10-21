# ng2-reactor

A small set of utilities for "closing the loop" to build a uni directional data flow in Angular 2. It provides mechanisms
for automatically generating useful Observable's inside of Angular components related to events.

For an example see: [ng2-redux-todos](https://github.com/rzeigler/ng2-redux-todos)

# Services

## ReactiveComponent

This is a base class that implements all of the [lifecycle hooks](https://angular.io/docs/ts/latest/guide/lifecycle-hooks.html)
and proxies them into streams. These streams are provided as protected members for subclasses.
This allows you to create workflows that depend upon the angular lifecycle.

The events are mapped using the following pattern:
drop the ng, lowcase the first letter, append $.
For example:
* `ngOnInit` -> `onInit$`
* `ngOnDestroy` -> `onDestroy$`

Additionally, `lifecycle$` will emit all lifecycle events.

ngOnChanges is handled separately. There is a dedicated `changes$` observable containing values are a [`SimpleChanges`](https://angular.io/docs/ts/latest/api/core/index/SimpleChanges-interface.html) object.

Note that helpers are also provided to further split the changes. One may do `this.changes$.map(reactiveChange('propertyName'))`
to focus on a specific property.
To get only the value rather than the metadata, one may further use `reactiveChangeValue`.

## ReactiveSource

This is a decorator the produces Observables suitable for click bindings. Any field decorated with this should
have a type of Observable<T>. The field will be initialized to an Observable<T>. Furthermore, a shadow property
will be also assigned to the object with the name of _fieldName_\_Sink.
Component templates may use this shadow property as an output binding to send values through the stream.
For instance

```
@ReactiveSource() private deleteTodo$: Observable<string>;
```
would be used in a template as

```
<button (click)="deleteTodo$_Sink(todo.id);">Delete</button>
```

## Form Binding
`bindFormState(group: FormGroup)` provides a mechanism for synchronizing the value in a form with an observable.
This is most useful in conjunction with a redux implementation such as ngrx/store where your form state lives in
the application state. This allows form values to be changed simply by dispatching to the store.

The value of the input stream should match the shape of group.valueChanges.

## `second`
Sometimes you want to sample something using `Observable#withLatestFrom` because `Observable#sample` is broken.
`second` is a function of 2 arguments that returns its second argument so you don't have to repeatedly write code like `(_, v) => v`
