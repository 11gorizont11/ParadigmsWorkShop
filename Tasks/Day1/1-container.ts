class Integer {
  private value: number;

  constructor(value: number) {
    // Check if value is a number
    if (typeof value !== 'number') {
      throw new TypeError('Value must be a number');
    }

    // Check if value is not NaN
    if (isNaN(value)) {
      throw new TypeError('Value cannot be NaN');
    }

    // Check if value is finite
    if (!isFinite(value)) {
      throw new RangeError('Value must be finite');
    }

    // Check if value is an integer
    if (!Number.isInteger(value)) {
      throw new TypeError('Value must be an integer');
    }

    this.value = value;
  }

  add(other: Integer): Integer {
    return new Integer(this.value + other.value);
  }

  div(other: Integer): Integer {
    if (other.value === 0) {
      throw new Error('Division by zero');
    }
    return new Integer(Math.floor(this.value / other.value));
  }

  gt(other: Integer): boolean {
    return this.value > other.value;
  }

  get(): number {
    return this.value;
  }
}

// Usage

const a = new Integer(7);
const b = new Integer(3);

const c = a.add(b);
const d = a.div(b);
if (a.gt(b)) {
  console.log('a > b');
}

console.log(`c = ${c.get()}`);
console.log(`d = ${d.get()}`);
