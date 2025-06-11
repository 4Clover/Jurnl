/**
 * Logger Types - Shared types for both server and client logging
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
    requestId?: string;
    userId?: string;
    userAgent?: string;
    ip?: string;
    sessionId?: string;
    [key: string]: unknown;
}

export interface LogEntry {
    level: LogLevel;
    message: string;
    timestamp: string;
    context?: LogContext;
    metadata?: Record<string, unknown>;
    error?: {
        message: string;
        stack?: string;
        code?: string;
        cause?: unknown;
    };
    performance?: {
        duration?: number;
        memory?: {
            heapUsed: number;
            heapTotal: number;
        };
    };
}

export interface LoggerConfig {
    level: LogLevel;
    format: 'json' | 'pretty';
    colors: boolean | 'auto';
    includeTimestamp: boolean;
    includeStackTrace: boolean;
    maxStackDepth: number;
    performanceLogging: boolean;
    contextCapture: {
        requestId: boolean;
        userId: boolean;
        userAgent: boolean;
        ip: boolean;
    };
}

export interface Timer {
    end: (message?: string, metadata?: Record<string, unknown>) => void;
}

export interface ILogger {
    debug(message: string, metadata?: Record<string, unknown>): void;
    info(message: string, metadata?: Record<string, unknown>): void;
    warn(message: string, metadata?: Record<string, unknown>): void;
    error(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void;
    fatal(message: string, error?: Error | unknown, metadata?: Record<string, unknown>): void;
    startTimer(): Timer;
    child(context: LogContext): ILogger;
}

// Log level priorities for comparison
export const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
};

// Default configuration
export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
    level: 'info',
    format: 'pretty',
    colors: 'auto',
    includeTimestamp: true,
    includeStackTrace: true,
    maxStackDepth: 10,
    performanceLogging: true,
    contextCapture: {
        requestId: true,
        userId: true,
        userAgent: true,
        ip: true,
    },
};