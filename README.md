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

A `Store` is a collection class that manages events and handles actions.
A `Store` manages records, which are simple objects containing at least a `data` key and optionally an `id` key.
A record added to a store without and id is automatically assigned an id.
Customized stores should extend the base `Store`.

```
var Store = require('flux-tools').Store;
var coolStore = new Store();

// add a new record
coolStore.add({
    data: 'cool data'
});

// add a new record at a given index
coolStore.add({
    data: 'cooler data'
}, 0);

// add a new record with a given id
coolStore.add({
    data: 'coolest data',
    id: '123CoolId'
});
myStore.length; // 3

// you can remove items by id
coolStore.removeById('123CoolId');
myStore.length; // 2

// you can remove items by a predicate function
// this method removes all matches
coolStore.remove(function(record) {
    return record.data === 'cool data';
});
coolStore.length; // 1

// you can also remove a single item by a predicate function
// this method removes the first match
coolStore.removeOne(function(record) {
    return record.data === 'cooler data';
});
coolStore.length; // 0

// you can load many records with a single call
// this replaces all the data in the store
coolStore.load([{data: 'coolest data', id: 10}, {data: 'cool to the max data'}]);
coolStore.length; // 2

// if you don't want to replace all the data, pass true as the 2nd parameter to load
coolStore.load([{data: 'more cool data'}], true);
coolStore.length; // 3

// you can find records by id
coolStore.findById(10); // {data: 'coolest data', id: 10}

// you can find records by predicate
// this method returns all matches
coolStore.find(function(record) {
    return record.data.indexOf('cool') !== -1;
}); // [{data: 'coolest data', id: 10}, {data: 'cool to the max data'}]

// you can also find a single record by predicate, if that's what you dig
// this method returns the first match
coolStore.findOne(function(record) {
    return record.data.indexOf('cool') !== -1;
}); // {data: 'coolest data', id: 10}

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
```

