/**
 * Server-Side Logger with Color Coding
 * Zero-dependency structured logging for Node.js environments
 */

import { performance } from 'perf_hooks';
import type {
    LogLevel,
    LogContext,
    LogEntry,
    LoggerConfig,
    Timer,
    ILogger,
    LOG_LEVELS,
} from '$lib/types/logger.types';

const COLORS = {
    debug: '\x1b[34m',
    info: '\x1b[32m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
    fatal: '\x1b[35m',
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    timestamp: '\x1b[36m',
    context: '\x1b[90m',
};

const LEVEL_EMOJIS: Record<LogLevel, string> = {
    debug: '🔵',
    info: '🟢',
    warn: '🟡',
    error: '🔴',
    fatal: '🟣',
};

export class Logger implements ILogger {
    private config: LoggerConfig;
    private context: LogContext;
    private isColorEnabled: boolean;

    constructor(config: Partial<LoggerConfig> = {}, context: LogContext = {}) {
        this.config = this.mergeConfig(config);
        this.context = context;
        this.isColorEnabled = this.shouldUseColors();
    }

    private mergeConfig(partial: Partial<LoggerConfig>): LoggerConfig {
        const defaults: LoggerConfig = {
            level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
            format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
            colors: 'auto',
            includeTimestamp: true,
            includeStackTrace: true,
            maxStackDepth: 10,
            performanceLogging: process.env.NODE_ENV !== 'production',
            contextCapture: {
                requestId: true,
                userId: true,
                userAgent: true,
                ip: true,
            },
        };
        return { ...defaults, ...partial };
    }

    private shouldUseColors(): boolean {
        if (this.config.colors === 'auto') {
            return (
                process.stdout.isTTY === true &&
                process.env.NODE_ENV !== 'production'
            );
        }
        return this.config.colors === true;
    }

    private shouldLog(level: LogLevel): boolean {
        const levelPriorities: Record<LogLevel, number> = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
            fatal: 4,
        };
        return levelPriorities[level] >= levelPriorities[this.config.level];
    }

    private formatError(error: unknown): LogEntry['error'] {
        if (error instanceof Error) {
            const formatted: LogEntry['error'] = {
                message: error.message,
            };

            if (this.config.includeStackTrace && error.stack) {
                const stackLines = error.stack
                    .split('\n')
                    .slice(0, this.config.maxStackDepth + 1);
                formatted.stack = stackLines.join('\n');
            }

            if ('code' in error && typeof error.code === 'string') {
                formatted.code = error.code;
            }

            if ('cause' in error) {
                formatted.cause = error.cause;
            }

            return formatted;
        }

        return {
            message: String(error),
        };
    }

    private createLogEntry(
        level: LogLevel,
        message: string,
        error?: unknown,
        metadata?: Record<string, unknown>,
    ): LogEntry {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
        };

        if (Object.keys(this.context).length > 0) {
            entry.context = { ...this.context };
        }

        if (metadata && Object.keys(metadata).length > 0) {
            entry.metadata = metadata;
        }

        if (error) {
            entry.error = this.formatError(error);
        }

        if (this.config.performanceLogging && level === 'error') {
            const memoryUsage = process.memoryUsage();
            entry.performance = {
                memory: {
                    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                    heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024)
                },
            };
        }

        return entry;
    }

    private formatPretty(entry: LogEntry): string {
        const parts: string[] = [];
        const color = this.isColorEnabled ? COLORS[entry.level] : '';
        const reset = this.isColorEnabled ? COLORS.reset : '';
        const bright = this.isColorEnabled ? COLORS.bright : '';
        const dim = this.isColorEnabled ? COLORS.dim : '';
        const timestampColor = this.isColorEnabled ? COLORS.timestamp : '';
        const contextColor = this.isColorEnabled ? COLORS.context : '';

        if (this.config.includeTimestamp) {
            const time = new Date(entry.timestamp).toLocaleTimeString();
            parts.push(`${timestampColor}[${time}]${reset}`);
        }

        const emoji = LEVEL_EMOJIS[entry.level];
        const levelText = entry.level.toUpperCase().padEnd(5);
        parts.push(`${color}${bright}${emoji} ${levelText}${reset}`);

        parts.push(`${color}${entry.message}${reset}`);

        if (entry.context && Object.keys(entry.context).length > 0) {
            const contextStr = Object.entries(entry.context)
                .filter(([_, value]) => value !== undefined)
                .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
                .join(' ');
            if (contextStr) {
                parts.push(`${contextColor}${contextStr}${reset}`);
            }
        }

        if (entry.metadata && Object.keys(entry.metadata).length > 0) {
            parts.push(
                `${dim}${JSON.stringify(entry.metadata, null, 2)}${reset}`,
            );
        }

        if (entry.error) {
            parts.push(
                `\n${color}${bright}Error: ${entry.error.message}${reset}`,
            );
            if (entry.error.stack) {
                parts.push(`${dim}${entry.error.stack}${reset}`);
            }
            if (entry.error.cause) {
                parts.push(
                    `${dim}Caused by: ${JSON.stringify(entry.error.cause)}${reset}`,
                );
            }
        }

        if (entry.performance) {
            const perfStr = `heap: ${entry.performance.memory?.heapUsed}MB/${entry.performance.memory?.heapTotal}MB`;
            parts.push(`${dim}[${perfStr}]${reset}`);
        }

        return parts.join(' ');
    }

    private log(
        level: LogLevel,
        message: string,
        error?: unknown,
        metadata?: Record<string, unknown>,
    ): void {
        if (!this.shouldLog(level)) return;

        const entry = this.createLogEntry(level, message, error, metadata);

        const output =
            this.config.format === 'json'
                ? JSON.stringify(entry)
                : this.formatPretty(entry);

        if (level === 'error' || level === 'fatal') {
            console.error(output);
        } else if (level === 'warn') {
            console.warn(output);
        } else {
            console.log(output);
        }

        if (level === 'fatal' && process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    }

    debug(message: string, metadata?: Record<string, unknown>): void {
        this.log('debug', message, undefined, metadata);
    }

    info(message: string, metadata?: Record<string, unknown>): void {
        this.log('info', message, undefined, metadata);
    }

    warn(message: string, metadata?: Record<string, unknown>): void {
        this.log('warn', message, undefined, metadata);
    }

    error(
        message: string,
        error?: Error | unknown,
        metadata?: Record<string, unknown>,
    ): void {
        this.log('error', message, error, metadata);
    }

    fatal(
        message: string,
        error?: Error | unknown,
        metadata?: Record<string, unknown>,
    ): void {
        this.log('fatal', message, error, metadata);
    }

    startTimer(): Timer {
        const start = performance.now();
        return {
            end: (message?: string, metadata?: Record<string, unknown>) => {
                const duration = Math.round(performance.now() - start);
                const finalMessage = message || 'Operation completed';
                this.info(finalMessage, {
                    ...metadata,
                    duration: `${duration}ms`,
                });
            },
        };
    }

    child(context: LogContext): ILogger {
        return new Logger(this.config, { ...this.context, ...context });
    }
}

export const logger = new Logger();

export function createLogger(
    config?: Partial<LoggerConfig>,
    context?: LogContext,
): Logger {
    return new Logger(config, context);
}
