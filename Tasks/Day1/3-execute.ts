// Type definitions
interface User {
  id: number;
  name: string;
  age: number;
}

interface ReadParams {
  id: number;
}

interface MatchCriteria {
  name: string;
}

interface Effect {
  log?: keyof User;
  noop?: boolean;
}

interface Environment {
  user?: User;
}

interface Context {
  reader: (params: ReadParams) => User;
  log: (message: any) => void;
  env: Environment;
}

interface ExecOptions {
  reader: (params: ReadParams) => User;
  log?: (message: any) => void;
}

// Abstract Step class
abstract class Step {
  protected nextStep: Step | null = null;

  setNext(step: Step): Step {
    this.nextStep = step;
    return step;
  }

  abstract execute(context: Context): void;
}

// Read step - reads data using a reader function
class ReadStep extends Step {
  constructor(private params: ReadParams) {
    super();
  }

  execute(context: Context): void {
    const user = context.reader(this.params);
    context.env.user = user;
    if (this.nextStep) {
      this.nextStep.execute(context);
    }
  }
}

// Match step - conditional branching based on matching criteria
class MatchStep extends Step {
  constructor(
    private criteria: MatchCriteria,
    private successStep: Step,
    private failStep: Step
  ) {
    super();
  }

  execute(context: Context): void {
    if (!context.env.user) {
      throw new Error('User not found in context');
    }
    const ok = context.env.user.name === this.criteria.name;
    const nextStep = ok ? this.successStep : this.failStep;
    nextStep.execute(context);
  }
}

// Effect step - performs side effects
class EffectStep extends Step {
  constructor(private effect: Effect) {
    super();
  }

  execute(context: Context): void {
    if (this.effect.log && context.env.user) {
      const key = this.effect.log;
      context.log(context.env.user[key]);
    }
    // 'noop' effect does nothing
  }
}

// Main Exec class
class Exec {
  private reader: (params: ReadParams) => User;
  private log: (message: any) => void;

  constructor(options: ExecOptions) {
    this.reader = options.reader;
    this.log = options.log || console.log;
  }

  run(steps: Step): void {
    const context: Context = {
      reader: this.reader,
      log: this.log,
      env: {},
    };

    steps.execute(context);
  }
}

// Example usage
const reader = ({ id }: ReadParams): User => ({ id, name: 'marcus', age: 42 });

// OOP approach
const readStep = new ReadStep({ id: 15 });
const successEffect = new EffectStep({ log: 'age' });
const failEffect = new EffectStep({ noop: true });
const matchStep = new MatchStep({ name: 'marcus' }, successEffect, failEffect);

readStep.setNext(matchStep);

const main = new Exec({ reader, log: console.log });
main.run(readStep);
