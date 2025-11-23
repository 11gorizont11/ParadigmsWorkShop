// Interfaces for Monad operations
interface IFunctor<T> {
  map<U>(fn: (value: T) => U): IFunctor<U>;
}

interface IChain<T> extends IFunctor<T> {
  chain<U>(fn: (value: T) => Monad<U>): Monad<U>;
}

interface IApplicative<T> extends IFunctor<T> {
  ap<U>(container: Monad<U>): Monad<U>;
}

// Point interface for the usage example
interface Point {
  x: number;
  y: number;
}

class Monad<T> implements IChain<T>, IApplicative<T> {
  readonly #value: T;

  private constructor(value: T) {
    this.#value = value;
  }

  static of<T>(value: T): Monad<T> {
    return new Monad(value);
  }

  map<U>(fn: (value: T) => U): Monad<U> {
    const value = structuredClone(this.#value);
    return Monad.of(fn(value));
  }

  chain<U>(fn: (value: T) => Monad<U>): Monad<U> {
    const value = structuredClone(this.#value);
    return fn(value);
  }

  ap<U>(container: Monad<U>): Monad<U> {
    const fn = this.#value as unknown as (value: U) => U;
    return container.map(fn);
  }
}

const move = (d: Point) => ({ x, y }: Point): Point => ({ x: x + d.x, y: y + d.y });
const clone = ({ x, y }: Point): Point => ({ x, y });
const toString = ({ x, y }: Point): Monad<string> => Monad.of(`(${x}, ${y})`);
const log = <T>(value: T): Monad<T> => {
  console.log(value);
  return Monad.of(value);
};

// Usage

const p1 = Monad.of<Point>({ x: 10, y: 20 });
p1.chain(toString).chain(log);
const c0 = p1.map(clone);
const t1 = Monad.of<(p: Point) => Point>(move({ x: -5, y: 10 }));
const c1 = t1.ap(c0);
c1.chain(toString).chain(log);
