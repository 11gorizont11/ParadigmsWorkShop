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
  name?: string;
  city?: string;
  [key: string]: any;
}

interface Environment {
  user?: User;
}

interface Context {
  reader: (params: ReadParams) => User;
  logger: (message: any) => void;
  env: Environment;
}

interface ExecOptions {
  reader: (params: ReadParams) => User;
  logger?: (message: any) => void;
}

// Action type definitions
type ActionType = 'read' | 'match' | 'log' | 'noop';

interface BaseAction {
  type: ActionType;
  args?: any;
}

interface ReadAction extends BaseAction {
  type: 'read';
  args: ReadParams;
}

interface LogAction extends BaseAction {
  type: 'log';
  args: keyof User | string;
}

interface NoopAction extends BaseAction {
  type: 'noop';
}

interface MatchAction extends BaseAction {
  type: 'match';
  args: MatchCriteria;
  callback?: {
    onSuccess?: Action;
    onFail?: Action;
  };
}

type Action = ReadAction | MatchAction | LogAction | NoopAction;

// Main Exec class
class Exec {
  private reader: (params: ReadParams) => User;
  private logger: (message: any) => void;

  constructor(options: ExecOptions) {
    this.reader = options.reader;
    this.logger = options.logger || console.log;
  }

  run(actions: Action[]): void {
    const context: Context = {
      reader: this.reader,
      logger: this.logger,
      env: {},
    };

    this.executeActions(actions, context);
  }

  private executeActions(actions: Action[], context: Context): void {
    for (const action of actions) {
      this.executeAction(action, context);
    }
  }

  private executeAction(action: Action, context: Context): void {
    switch (action.type) {
      case 'read':
        this.executeRead(action as ReadAction, context);
        break;
      case 'match':
        this.executeMatch(action as MatchAction, context);
        break;
      case 'log':
        this.executeLog(action as LogAction, context);
        break;
      case 'noop':
        // Do nothing
        break;
      default:
        throw new Error(`Unknown action type: ${(action as any).type}`);
    }
  }

  private executeRead(action: ReadAction, context: Context): void {
    const user = context.reader(action.args);
    context.env.user = user;
  }

  private executeMatch(action: MatchAction, context: Context): void {
    if (!context.env.user) {
      throw new Error('User not found in context');
    }

    const user = context.env.user;
    const criteria = action.args;

    // Check if all criteria match
    const matches = Object.keys(criteria).every((key) => {
      return user[key as keyof User] === criteria[key];
    });

    // Execute callback based on match result
    if (action.callback) {
      const nextAction = matches ? action.callback.onSuccess : action.callback.onFail;
      if (nextAction) {
        this.executeAction(nextAction, context);
      }
    }
  }

  private executeLog(action: LogAction, context: Context): void {
    if (!context.env.user) {
      throw new Error('User not found in context');
    }

    const key = action.args as keyof User;
    if (key in context.env.user) {
      context.logger(context.env.user[key]);
    } else {
      context.logger(action.args);
    }
  }
}

// Example usage
const reader = ({ id }: ReadParams): User => ({ id, name: 'marcus', age: 42 });

const main = new Exec({ reader, logger: console.log });
const actions: Action[] = [
  {
    type: 'read',
    args: { id: 15 }
  },
  {
    type: 'match',
    args: { name: 'marcus' },
    callback: {
      onSuccess: {
        type: 'log',
        args: 'age'
      },
      onFail: {
        type: 'noop'
      },
    }
  },
];

main.run(actions);
