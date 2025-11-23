export class Either<L, R> {
  private readonly value: L | R;
  private readonly isRightValue: boolean;

  private constructor(value: L | R, isRight: boolean) {
    this.value = value;
    this.isRightValue = isRight;
  }

  // Static factory method for Right (success case)
  static right<L, R>(value: R): Either<L, R> {
    return new Either<L, R>(value, true);
  }

  // Static factory method for Left (error case)
  static left<L, R>(value: L): Either<L, R> {
    return new Either<L, R>(value, false);
  }

  // Check if this is a Right value
  isRight(): boolean {
    return this.isRightValue;
  }

  // Check if this is a Left value
  isLeft(): boolean {
    return !this.isRightValue;
  }

  // Map over the Right value (functor)
  map<T>(fn: (value: R) => T): Either<L, T> {
    if (this.isRightValue) {
      return Either.right(fn(this.value as R));
    }
    return Either.left(this.value as L);
  }

  // Chain/flatMap for the Right value (monad)
  chain<T>(fn: (value: R) => Either<L, T>): Either<L, T> {
    if (this.isRightValue) {
      return fn(this.value as R);
    }
    return Either.left(this.value as L);
  }

  // Fold/match - handle both cases
  fold<T>(leftFn: (left: L) => T, rightFn: (right: R) => T): T {
    if (this.isRightValue) {
      return rightFn(this.value as R);
    }
    return leftFn(this.value as L);
  }

  // Get the value (unsafe - use fold instead when possible)
  getOrElse(defaultValue: R): R {
    if (this.isRightValue) {
      return this.value as R;
    }
    return defaultValue;
  }
}

// Usage examples

// Creating Either values
const success = Either.right<string, number>(42);
const failure = Either.left<string, number>('Error occurred');

console.log('Success is right:', success.isRight()); // true
console.log('Failure is left:', failure.isLeft()); // true

// Using map (only transforms Right values)
const doubled = success.map(x => x * 2);
console.log('Doubled:', doubled.fold(
  err => `Error: ${err}`,
  val => `Success: ${val}`
)); // Success: 84

const failedMap = failure.map(x => x * 2);
console.log('Failed map:', failedMap.fold(
  err => `Error: ${err}`,
  val => `Success: ${val}`
)); // Error: Error occurred

// Using chain for operations that return Either
const divide = (x: number) => (y: number): Either<string, number> =>
  y === 0 ? Either.left('Division by zero') : Either.right(x / y);

const result1 = Either.right<string, number>(10)
  .chain(divide(20))
  .map(x => x + 1);

console.log('Division result:', result1.fold(
  err => `Error: ${err}`,
  val => `Result: ${val}`
)); // Result: 3

const result2 = Either.right<string, number>(0)
  .chain(divide(20));

console.log('Division by zero:', result2.fold(
  err => `Error: ${err}`,
  val => `Result: ${val}`
)); // Error: Division by zero

// Using getOrElse
console.log('Get or else (success):', success.getOrElse(0)); // 42
console.log('Get or else (failure):', failure.getOrElse(0)); // 0

// Practical example: parsing and validation
const parseNumber = (str: string): Either<string, number> => {
  const num = parseFloat(str);
  return isNaN(num) ? Either.left('Invalid number') : Either.right(num);
};

const validatePositive = (num: number): Either<string, number> =>
  num > 0 ? Either.right(num) : Either.left('Number must be positive');

const processInput = (input: string) =>
  parseNumber(input)
    .chain(validatePositive)
    .map(x => x * 2);

console.log('\nValidation examples:');
console.log(processInput('5').fold(err => `Error: ${err}`, val => `Result: ${val}`)); // Result: 10
console.log(processInput('-5').fold(err => `Error: ${err}`, val => `Result: ${val}`)); // Error: Number must be positive
console.log(processInput('abc').fold(err => `Error: ${err}`, val => `Result: ${val}`)); // Error: Invalid number