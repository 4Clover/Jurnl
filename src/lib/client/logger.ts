/**
 * Client-Side Logger with Browser Console Styling
 * Zero-dependency structured logging for browser environments
 */

import type {
    LogLevel,
    LogContext,
    LogEntry,
    LoggerConfig,
    Timer,
    ILogger,
} from '$lib/types/logger.types';

// CSS styles for browser console
const STYLES: Record<LogLevel, string> = {
    debug: 'color: #3b82f6; font-weight: bold;',   // Blue
    info: 'color: #10b981; font-weight: bold;',    // Green
    warn: 'color: #f59e0b; font-weight: bold;',    // Yellow
    error: 'color: #ef4444; font-weight: bold;',   // Red
    fatal: 'color: #8b5cf6; font-weight: bold;',   // Purple
};

// Additional styles
const TIMESTAMP_STYLE = 'color: #6b7280; font-size: 0.9em;';
const CONTEXT_STYLE = 'color: #9ca3af; font-style: italic;';

// Emojis for visual distinction
const LEVEL_EMOJIS: Record<LogLevel, string> = {
    debug: '🔵',
    info: '🟢',
    warn: '🟡',
    error: '🔴',
    fatal: '🟣',
};

// Local storage keys
const STORAGE_KEYS = {
    LOG_BUFFER: 'jurnl_log_buffer',
    LOG_CONFIG: 'jurnl_log_config',
} as const;

export class ClientLogger implements ILogger {
    private config: LoggerConfig;
    private context: LogContext;
    private logBuffer: LogEntry[] = [];
    private maxBufferSize = 100;

    constructor(
        config: Partial<LoggerConfig> = {},
        context: LogContext = {}
    ) {
        this.config = this.mergeConfig(config);
        this.context = this.enrichContext(context);
        this.loadLogBuffer();
    }

    private mergeConfig(partial: Partial<LoggerConfig>): LoggerConfig {
        // Check for stored config
        const storedConfig = this.getStoredConfig();
        
        const defaults: LoggerConfig = {
            level: import.meta.env.DEV ? 'debug' : 'info',
            format: 'pretty', // Always pretty in browser
            colors: true, // Always use colors in browser
            includeTimestamp: true,
            includeStackTrace: true,
            maxStackDepth: 10,
            performanceLogging: import.meta.env.DEV,
            contextCapture: {
                requestId: true,
                userId: true,
                userAgent: true,
                ip: false, // Not available in browser
            },
        };
        
        return { ...defaults, ...storedConfig, ...partial };
    }

    private enrichContext(context: LogContext): LogContext {
        // Add browser-specific context
        const enriched: LogContext = {
            ...context,
            userAgent: navigator.userAgent,
            url: window.location.href,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
        };

        // Try to get user context from DOM or window
        if (typeof window !== 'undefined' && window && '__USER__' in window) {
            const windowWithUser = window as Window & { __USER__?: { id?: string; username?: string } };
            if (windowWithUser.__USER__) {
                enriched.userId = windowWithUser.__USER__.id;
                enriched.username = windowWithUser.__USER__.username;
            }
        }

        return enriched;
    }

    private getStoredConfig(): Partial<LoggerConfig> {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.LOG_CONFIG);
            return stored ? JSON.parse(stored) as Partial<LoggerConfig> : {};
        } catch {
            return {};
        }
    }

    private loadLogBuffer(): void {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.LOG_BUFFER);
            if (stored) {
                this.logBuffer = JSON.parse(stored) as LogEntry[];
            }
        } catch {
            this.logBuffer = [];
        }
    }

    private saveLogBuffer(): void {
        try {
            // Keep only the most recent logs
            if (this.logBuffer.length > this.maxBufferSize) {
                this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
            }
            localStorage.setItem(STORAGE_KEYS.LOG_BUFFER, JSON.stringify(this.logBuffer));
        } catch {
            // Ignore storage errors
        }
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
                const stackLines = error.stack.split('\n').slice(0, this.config.maxStackDepth + 1);
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
        metadata?: Record<string, unknown>
    ): LogEntry {
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
        };

        // Add context if present
        if (Object.keys(this.context).length > 0) {
            entry.context = { ...this.context };
        }

        // Add metadata if present
        if (metadata && Object.keys(metadata).length > 0) {
            entry.metadata = metadata;
        }

        // Add error details if present
        if (error) {
            entry.error = this.formatError(error);
        }

        // Add performance metrics if enabled
        if (this.config.performanceLogging && level === 'error') {
            const performanceMemory = performance as Performance & {
                memory?: {
                    usedJSHeapSize: number;
                    totalJSHeapSize: number;
                };
            };
            entry.performance = {
                memory: performanceMemory.memory ? {
                    heapUsed: Math.round(performanceMemory.memory.usedJSHeapSize / 1024 / 1024),
                    heapTotal: Math.round(performanceMemory.memory.totalJSHeapSize / 1024 / 1024),
                } : undefined,
            };
        }

        return entry;
    }

    private formatConsoleArgs(entry: LogEntry): unknown[] {
        const args: string[] = [];
        const styles: string[] = [];

        // Timestamp
        if (this.config.includeTimestamp) {
            const time = new Date(entry.timestamp).toLocaleTimeString();
            args.push(`%c[${time}]`);
            styles.push(TIMESTAMP_STYLE);
        }

        // Level with emoji
        const emoji = LEVEL_EMOJIS[entry.level];
        const levelText = entry.level.toUpperCase();
        args.push(`%c${emoji} ${levelText}`);
        styles.push(STYLES[entry.level]);

        // Message
        args.push(`%c${entry.message}`);
        styles.push(STYLES[entry.level]);

        // Context
        if (entry.context && Object.keys(entry.context).length > 0) {
            const contextPairs = Object.entries(entry.context)
                .filter(([, value]) => value !== undefined)
                .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
                .join(' ');
            if (contextPairs) {
                args.push(`%c${contextPairs}`);
                styles.push(CONTEXT_STYLE);
            }
        }

        // Apply styles
        const styledArgs: unknown[] = [args.join(' '), ...styles];

        // Add metadata as separate console argument
        if (entry.metadata && Object.keys(entry.metadata).length > 0) {
            styledArgs.push('\n', entry.metadata);
        }

        // Add error as separate console argument
        if (entry.error) {
            styledArgs.push('\n', entry.error);
        }

        return styledArgs;
    }

    private log(
        level: LogLevel,
        message: string,
        error?: unknown,
        metadata?: Record<string, unknown>
    ): void {
        if (!this.shouldLog(level)) return;

        const entry = this.createLogEntry(level, message, error, metadata);

        // Add to buffer
        this.logBuffer.push(entry);
        this.saveLogBuffer();

        // Format for console
        const consoleArgs = this.formatConsoleArgs(entry);

        // Output to appropriate console method
        switch (level) {
            case 'debug':
                console.debug(...consoleArgs);
                break;
            case 'info':
                console.info(...consoleArgs);
                break;
            case 'warn':
                console.warn(...consoleArgs);
                break;
            case 'error':
            case 'fatal':
                console.error(...consoleArgs);
                break;
        }

        // Send critical errors to server if configured
        if ((level === 'error' || level === 'fatal') && !import.meta.env.DEV) {
            void this.reportToServer(entry);
        }
    }

    private async reportToServer(entry: LogEntry): Promise<void> {
        try {
            await fetch('/api/client-errors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entry),
            });
        } catch {
            // Ignore reporting errors
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

    error(message: string, error?: unknown, metadata?: Record<string, unknown>): void {
        this.log('error', message, error, metadata);
    }

    fatal(message: string, error?: unknown, metadata?: Record<string, unknown>): void {
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
        return new ClientLogger(this.config, { ...this.context, ...context });
    }

    // Client-specific methods
    
    /**
     * Get the current log buffer
     */
    getLogBuffer(): LogEntry[] {
        return [...this.logBuffer];
    }

    /**
     * Clear the log buffer
     */
    clearLogBuffer(): void {
        this.logBuffer = [];
        this.saveLogBuffer();
    }

    /**
     * Export logs as JSON
     */
    exportLogs(): string {
        return JSON.stringify(this.logBuffer, null, 2);
    }

    /**
     * Update logger configuration
     */
    updateConfig(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
        try {
            localStorage.setItem(STORAGE_KEYS.LOG_CONFIG, JSON.stringify(config));
        } catch {
            // Ignore storage errors
        }
    }
}

// Create and export a default logger instance
export const logger = new ClientLogger();

// Export a function to create logger instances with custom config
export function createLogger(
    config?: Partial<LoggerConfig>,
    context?: LogContext
): ClientLogger {
    return new ClientLogger(config, context);
}

// Browser-specific utilities

/**
 * Install global error handler that uses the logger
 */
export function installGlobalErrorHandler(): void {
    window.addEventListener('error', (event) => {
        logger.error('Uncaught error', event.error || event.message, {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        logger.error('Unhandled promise rejection', event.reason);
    });
}

/**
 * Create a styled console group for better organization
 */
export function logGroup(title: string, fn: () => void): void {
    console.group(`%c${title}`, 'color: #6366f1; font-weight: bold;');
    try {
        fn();
    } finally {
        console.groupEnd();
    }
}