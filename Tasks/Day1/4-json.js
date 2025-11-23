'use strict';

// Rewrite to TypeScript with interface

class Serializable {
  toJson() {
    return JSON.stringify(this);
  }
}

class User extends Serializable {
  #id;
  #name;

  constructor(id, name) {
    super();
    this.#id = id;
    this.#name = name;
  }
}

const user = new User(15, 'Marcus');
console.log(user.toString());
console.log(user.toJson());
