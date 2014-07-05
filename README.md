`flux-tools` is a collection of tools to help with flux architecture.

## Installation

`flux-tools` is available on npm. It works well with [Browserify](http://browserify.org/).

```
npm install flux-tools
```

`flux-tools` is also available as a browser-ready app on bower.

```
bower install flux-tools
```

## Compatibility

`flux-tools` works with ES5 compatible browsers.
I suggest [es5-shim](https://github.com/es-shims/es5-shim) for legacy support.

## Usage

#### Store

A `Store` is a fancy array that manages events and data.
Customized stores should extend the base `Store`.

```
var Store = require('flux-tools').Store;
var coolStore = new Store();

// add a new record
coolStore.create('cool data');
coolStore.count(); // 1

// add a new record at a given index
coolStore.create('cooler data', 0);
coolStore.count(); // 2

// you can remove items using a predicate function
// this method removes all matches
coolStore.destroy(function(record) {
    return record.data === 'cool data';
});
coolStore.count(); // 1

// you can find records using a predicate function
// this method returns all matches
coolStore.filter(function(data) {
    return data === 'cooler data';
}); // ['cooler data']
```

#### Dispatcher

The `Dispatcher` is a simple, single object that manages the flow of communication to stores.
Stores register with the `Dispatcher`, and other objects can dispatch events to those stores.
The 'change' event name is special. It is fired after any another event is fired.

```js
var Dispatcher = require('flux-tools').Dispatcher;
var Store = require('flux-tools').Store;
var coolStore = new Store();

// listen for the store to change
// change events are fired after every other event
coolStore.on('change', function() {
    console.log('Hey, something changed!');
});

// listen for a cool_stuff event
coolStore.on('cool_stuff', function(data) {
    console.log('cool stuff has happened with ', data.msg ,'!');
});

// this will cause the store to fire both the 'cool_stuff' and 'change' events
Dispatcher.dispatch('cool_stuff', {
    msg: 'awesomeness'
});

// this cancels the 'cool_stuff' event listener on the store
coolStore.un('cool_stuff');
```

