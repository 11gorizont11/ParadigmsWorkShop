'use strict';

class DoMonad {
  constructor(value) {
    this.value = value;
  }

  bind(fn) {
    const result = fn(this.value);
    return new DoMonad(result);
  }

  run(arg) {
    if (typeof this.value === 'function') {
      return this.value(arg);
    }
    return this.value;
  }
}

function Do(value) {
  return new DoMonad(value);
}

Do({ id: 15 })
  .bind(({ id }) => ({ id, name: 'marcus', age: 42 }))
  .bind(({ name, age }) => (name === 'marcus' ? (log) => log(age) : () => {}))
  .run(console.log);
