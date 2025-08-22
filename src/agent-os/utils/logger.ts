/**
 * Logger utility for Agent OS
 * Provides structured logging with different levels and output formatting
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  error?: Error;
}

export class Logger {
  private component: string;
  private logLevel: LogLevel = LogLevel.INFO;
  private outputs: LogOutput[] = [];

  constructor(component: string, logLevel: LogLevel = LogLevel.INFO) {
    this.component = component;
    this.logLevel = logLevel;
    
    // Default to console output
    this.outputs.push(new ConsoleLogOutput());
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error | any, data?: any): void {
    this.log(LogLevel.ERROR, message, data, error instanceof Error ? error : undefined);
  }

  fatal(message: string, error?: Error | any, data?: any): void {
    this.log(LogLevel.FATAL, message, data, error instanceof Error ? error : undefined);
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  addOutput(output: LogOutput): void {
    this.outputs.push(output);
  }

  removeOutput(output: LogOutput): void {
    const index = this.outputs.indexOf(output);
    if (index > -1) {
      this.outputs.splice(index, 1);
    }
  }

  private log(level: LogLevel, message: string, data?: any, error?: Error): void {
    if (level < this.logLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      component: this.component,
      message,
      data,
      ...(error && { error })
    };

    for (const output of this.outputs) {
      output.write(entry);
    }
  }
}

export abstract class LogOutput {
  abstract write(entry: LogEntry): void;
}

export class ConsoleLogOutput extends LogOutput {
  write(entry: LogEntry): void {
    const timestamp = entry.timestamp.toISOString();
    const levelName = LogLevel[entry.level];
    const prefix = `[${timestamp}] [${levelName}] [${entry.component}]`;
    
    let message = `${prefix} ${entry.message}`;
    
    if (entry.data) {
      message += ` | Data: ${JSON.stringify(entry.data)}`;
    }

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        if (entry.error) console.warn(entry.error);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message);
        if (entry.error) console.error(entry.error);
        break;
    }
  }
}

export class FileLogOutput extends LogOutput {
  // private filePath: string;

  constructor(_filePath: string) {
    super();
    // this.filePath = filePath;
  }

  write(entry: LogEntry): void {
    // In a real implementation, this would write to a file: ${_filePath}
    // For now, we'll just use console as fallback
    const consoleOutput = new ConsoleLogOutput();
    consoleOutput.write(entry);
  }
}

export class StructuredLogOutput extends LogOutput {
  write(entry: LogEntry): void {
    const structuredEntry = {
      '@timestamp': entry.timestamp.toISOString(),
      level: LogLevel[entry.level],
      component: entry.component,
      message: entry.message,
      ...(entry.data && { data: entry.data }),
      ...(entry.error && { 
        error: {
          message: entry.error.message,
          stack: entry.error.stack,
          name: entry.error.name
        }
      })
    };

    console.log(JSON.stringify(structuredEntry));
  }
}