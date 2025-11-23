/**
 * Chain of Responsibility Pattern Example
 *
 * This pattern allows passing requests along a chain of handlers.
 * Each handler decides either to process the request or to pass it to the next handler.
 */

// Abstract Handler - defines the interface for handling requests
abstract class SupportHandler {
  protected nextHandler: SupportHandler | null = null;

  // Set the next handler in the chain
  setNext(handler: SupportHandler): SupportHandler {
    this.nextHandler = handler;
    return handler; // Return handler for chaining
  }

  // Template method that defines the chain logic
  handle(request: SupportRequest): string {
    if (this.canHandle(request)) {
      return this.processRequest(request);
    } else if (this.nextHandler) {
      return this.nextHandler.handle(request);
    } else {
      return `No handler available for ${request.type} request with priority ${request.priority}`;
    }
  }

  // Abstract methods to be implemented by concrete handlers
  protected abstract canHandle(request: SupportRequest): boolean;
  protected abstract processRequest(request: SupportRequest): string;
}

// Request object
interface SupportRequest {
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  customerId: string;
}

// Concrete Handler 1: Junior Support
class JuniorSupport extends SupportHandler {
  protected canHandle(request: SupportRequest): boolean {
    return request.priority === 'low' && request.type === 'general';
  }

  protected processRequest(request: SupportRequest): string {
    return `[Junior Support] Handling low priority general request from ${request.customerId}: "${request.description}"`;
  }
}

// Concrete Handler 2: Senior Support
class SeniorSupport extends SupportHandler {
  protected canHandle(request: SupportRequest): boolean {
    return (request.priority === 'medium' || request.priority === 'low') &&
           (request.type === 'technical' || request.type === 'general');
  }

  protected processRequest(request: SupportRequest): string {
    return `[Senior Support] Handling ${request.priority} priority ${request.type} request from ${request.customerId}: "${request.description}"`;
  }
}

// Concrete Handler 3: Technical Lead
class TechnicalLead extends SupportHandler {
  protected canHandle(request: SupportRequest): boolean {
    return request.priority === 'high' && request.type === 'technical';
  }

  protected processRequest(request: SupportRequest): string {
    return `[Technical Lead] Handling high priority technical request from ${request.customerId}: "${request.description}"`;
  }
}

// Concrete Handler 4: Manager (handles critical issues)
class Manager extends SupportHandler {
  protected canHandle(request: SupportRequest): boolean {
    return request.priority === 'critical';
  }

  protected processRequest(request: SupportRequest): string {
    return `[MANAGER - URGENT] Handling critical ${request.type} request from ${request.customerId}: "${request.description}"`;
  }
}

// ============================================
// Usage Example
// ============================================

console.log('=== Chain of Responsibility Pattern Demo ===\n');

// Build the chain
const junior = new JuniorSupport();
const senior = new SeniorSupport();
const techLead = new TechnicalLead();
const manager = new Manager();

// Chain them together: Junior -> Senior -> TechLead -> Manager
junior.setNext(senior).setNext(techLead).setNext(manager);

// Create various support requests
const requests: SupportRequest[] = [
  {
    type: 'general',
    priority: 'low',
    description: 'How do I reset my password?',
    customerId: 'CUST001'
  },
  {
    type: 'technical',
    priority: 'medium',
    description: 'API returning 500 errors occasionally',
    customerId: 'CUST002'
  },
  {
    type: 'technical',
    priority: 'high',
    description: 'Database connection pool exhausted',
    customerId: 'CUST003'
  },
  {
    type: 'billing',
    priority: 'critical',
    description: 'Payment system completely down!',
    customerId: 'CUST004'
  },
  {
    type: 'feature',
    priority: 'low',
    description: 'Can we add dark mode?',
    customerId: 'CUST005'
  }
];

// Process each request through the chain
requests.forEach((request, index) => {
  console.log(`Request ${index + 1}:`);
  const result = junior.handle(request);
  console.log(result);
  console.log('---\n');
});

// ============================================
// Alternative Example: Logging System
// ============================================

console.log('\n=== Alternative Example: Logging Chain ===\n');

abstract class Logger {
  protected nextLogger: Logger | null = null;
  protected level: LogLevel;

  constructor(level: LogLevel) {
    this.level = level;
  }

  setNext(logger: Logger): Logger {
    this.nextLogger = logger;
    return logger;
  }

  log(level: LogLevel, message: string): void {
    if (level >= this.level) {
      this.write(message);
    }
    if (this.nextLogger) {
      this.nextLogger.log(level, message);
    }
  }

  protected abstract write(message: string): void;
}

class ConsoleLogger extends Logger {
  protected write(message: string): void {
    console.log(`[CONSOLE] ${message}`);
  }
}

class FileLogger extends Logger {
  protected write(message: string): void {
    console.log(`[FILE] Writing to file: ${message}`);
  }
}

class ErrorLogger extends Logger {
  protected write(message: string): void {
    console.log(`[ERROR LOG] ⚠️  ${message}`);
  }
}

// Log levels
enum LogLevel {
  INFO = 1,
  WARNING = 2,
  ERROR = 3,
}

// Build logging chain
const consoleLogger = new ConsoleLogger(LogLevel.INFO);
const fileLogger = new FileLogger(LogLevel.WARNING);
const errorLogger = new ErrorLogger(LogLevel.ERROR);

consoleLogger.setNext(fileLogger).setNext(errorLogger);

// Test logging
consoleLogger.log(LogLevel.INFO, 'This is an informational message');
consoleLogger.log(LogLevel.WARNING, 'This is a warning message');
consoleLogger.log(LogLevel.ERROR, 'This is an error message');
