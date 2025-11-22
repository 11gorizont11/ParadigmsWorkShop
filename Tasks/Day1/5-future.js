'use strict';

const fs = require('node:fs');

class Future {
  constructor(computation) {
    this.computation = computation;
  }

  map(fn) {
    return new Future((reject, resolve) => {
      this.computation(reject, (value) => resolve(fn(value)));
    });
  }

  chain(fn) {
    return new Future((reject, resolve) => {
      this.computation(reject, (value) => {
        fn(value).fork(reject, resolve);
      });
    });
  }

  fork(onError, onSuccess) {
    this.computation(onError, onSuccess);
  }
}

const futurify = (fn) =>
  (...args) =>
    new Future((reject, resolve) =>
      fn(...args, (error, result) =>
        error ? reject(error) : resolve(result),
      ),
    );

const readFuture = futurify(fs.readFile);
const writeFuture = futurify(fs.writeFile);

readFuture('future.js', 'utf8')
  .map((text) => text.toUpperCase())
  .chain((text) => writeFuture('future.md', text))
  .fork(
    (error) => console.error('FS error:', error),
    () => console.log('Done'),
  );
