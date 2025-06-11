/**
 * Logger Configuration Management
 * Provides environment-aware configuration for the logging system
 */

import type { LoggerConfig, LogLevel } from '$lib/types/logger.types';

// Environment variable names
const ENV_VARS = {
    LOG_LEVEL: 'LOG_LEVEL',
    LOG_FORMAT: 'LOG_FORMAT',
    LOG_COLORS: 'LOG_COLORS',
    LOG_TIMESTAMP: 'LOG_TIMESTAMP',
    LOG_STACK_TRACE: 'LOG_STACK_TRACE',
    LOG_PERFORMANCE: 'LOG_PERFORMANCE',
} as const;

/**
 * Get logger configuration from environment variables
 */
export function getLoggerConfig(): Partial<LoggerConfig> {
    const config: Partial<LoggerConfig> = {};

    // Log level
    const logLevel = process.env[ENV_VARS.LOG_LEVEL]?.toLowerCase() as LogLevel;
    if (logLevel && ['debug', 'info', 'warn', 'error', 'fatal'].includes(logLevel)) {
        config.level = logLevel;
    }

    // Log format
    const logFormat = process.env[ENV_VARS.LOG_FORMAT]?.toLowerCase();
    if (logFormat === 'json' || logFormat === 'pretty') {
        config.format = logFormat;
    }

    // Colors
    const logColors = process.env[ENV_VARS.LOG_COLORS]?.toLowerCase();
    if (logColors === 'true') {
        config.colors = true;
    } else if (logColors === 'false') {
        config.colors = false;
    } else if (logColors === 'auto') {
        config.colors = 'auto';
    }

    // Timestamp
    const logTimestamp = process.env[ENV_VARS.LOG_TIMESTAMP]?.toLowerCase();
    if (logTimestamp === 'false') {
        config.includeTimestamp = false;
    }

    // Stack trace
    const logStackTrace = process.env[ENV_VARS.LOG_STACK_TRACE]?.toLowerCase();
    if (logStackTrace === 'false') {
        config.includeStackTrace = false;
    }

    // Performance logging
    const logPerformance = process.env[ENV_VARS.LOG_PERFORMANCE]?.toLowerCase();
    if (logPerformance === 'true') {
        config.performanceLogging = true;
    } else if (logPerformance === 'false') {
        config.performanceLogging = false;
    }

    return config;
}

/**
 * Get environment-specific default configuration
 */
export function getEnvironmentConfig(): Partial<LoggerConfig> {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const isTest = process.env.NODE_ENV === 'test';

    if (isTest) {
        // Minimal logging in test environment
        return {
            level: 'error',
            format: 'json',
            colors: false,
            includeTimestamp: false,
            includeStackTrace: true,
            performanceLogging: false,
        };
    }

    if (isDevelopment) {
        // Developer-friendly configuration
        return {
            level: 'debug',
            format: 'pretty',
            colors: 'auto',
            includeTimestamp: true,
            includeStackTrace: true,
            maxStackDepth: 15,
            performanceLogging: true,
            contextCapture: {
                requestId: true,
                userId: true,
                userAgent: true,
                ip: true,
            },
        };
    }

    // Production configuration
    return {
        level: 'info',
        format: 'json',
        colors: false,
        includeTimestamp: true,
        includeStackTrace: true,
        maxStackDepth: 10,
        performanceLogging: false,
        contextCapture: {
            requestId: true,
            userId: true,
            userAgent: false,
            ip: false,
        },
    };
}

/**
 * Merge multiple configuration sources with proper precedence
 * Priority: User config > Environment variables > Environment defaults
 */
export function mergeLoggerConfig(userConfig?: Partial<LoggerConfig>): LoggerConfig {
    const defaults: LoggerConfig = {
        level: 'info',
        format: 'pretty',
        colors: 'auto',
        includeTimestamp: true,
        includeStackTrace: true,
        maxStackDepth: 10,
        performanceLogging: false,
        contextCapture: {
            requestId: true,
            userId: true,
            userAgent: true,
            ip: true,
        },
    };

    const environmentDefaults = getEnvironmentConfig();
    const environmentOverrides = getLoggerConfig();

    // Merge in order of precedence
    return {
        ...defaults,
        ...environmentDefaults,
        ...environmentOverrides,
        ...(userConfig || {}),
        // Deep merge for nested objects
        contextCapture: {
            ...defaults.contextCapture,
            ...environmentDefaults.contextCapture,
            ...environmentOverrides.contextCapture,
            ...userConfig?.contextCapture,
        },
    };
}

/**
 * Validate logger configuration
 */
export function validateLoggerConfig(config: LoggerConfig): void {
    const validLevels = ['debug', 'info', 'warn', 'error', 'fatal'];
    if (!validLevels.includes(config.level)) {
        throw new Error(`Invalid log level: ${config.level}`);
    }

    const validFormats = ['json', 'pretty'];
    if (!validFormats.includes(config.format)) {
        throw new Error(`Invalid log format: ${config.format}`);
    }

    if (config.maxStackDepth < 0) {
        throw new Error('maxStackDepth must be non-negative');
    }
}

/**
 * Get a human-readable description of the current configuration
 */
export function describeLoggerConfig(config: LoggerConfig): string {
    const lines = [
        `Log Level: ${config.level.toUpperCase()}`,
        `Format: ${config.format}`,
        `Colors: ${config.colors === 'auto' ? 'auto-detect' : config.colors ? 'enabled' : 'disabled'}`,
        `Timestamps: ${config.includeTimestamp ? 'enabled' : 'disabled'}`,
        `Stack Traces: ${config.includeStackTrace ? `enabled (max ${config.maxStackDepth} lines)` : 'disabled'}`,
        `Performance Logging: ${config.performanceLogging ? 'enabled' : 'disabled'}`,
        `Context Capture:`,
        `  - Request ID: ${config.contextCapture.requestId ? 'yes' : 'no'}`,
        `  - User ID: ${config.contextCapture.userId ? 'yes' : 'no'}`,
        `  - User Agent: ${config.contextCapture.userAgent ? 'yes' : 'no'}`,
        `  - IP Address: ${config.contextCapture.ip ? 'yes' : 'no'}`,
    ];
    return lines.join('\n');
}