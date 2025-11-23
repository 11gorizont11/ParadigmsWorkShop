'use strict';

// Rewrite to TypeScript with interface

interface ISerializable {
  toJson(): string;
}

class Serializable {
  toJson() {
    return JSON.stringify(this);
  }
}

class User implements ISerializable {
  #id;
  #name;

  constructor(id: number, name: string) {
    this.#id = id;
    this.#name = name;
  }

  toJson() {
    return JSON.stringify({ id: this.#id, name: this.#name });
  }

  // toString() {
  //   return `{ id: ${this.#id}, name: ${this.#name} }`;
  // }

  get [Symbol.toStringTag](): string {
    const constructorName = this.constructor.name;
    return constructorName.charAt(0).toUpperCase() + constructorName.slice(1);
  }
}

const user = new User(15, 'Marcus');

console.log(user);
console.log(user.toString());
console.log(user.toJson());
