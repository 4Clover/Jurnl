import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import mongoose, { Mongoose } from 'mongoose';
import type { ConnectOptions } from 'mongoose';
import { startMemoryServer } from './memory-server';

import './schemas';

// TODO: Fix the type errors

interface MongooseConnection {
    promise: Promise<Mongoose> | null;
    connection: Mongoose | null;
}

const defaultConnectionString =
    'mongodb://root:example@mongo:27017/jurnl?authSource=admin&directConnection=' +
    'true&maxPoolSize=10&w=majority&wtimeoutMS=2500&maxIdleTimeMS=60000&maxConnecting=2';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
const globalWithMongoose = globalThis as any;

if (!globalWithMongoose.mongoose) {
    globalWithMongoose.mongoose = { connection: null, promise: null };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const cached: MongooseConnection = globalWithMongoose.mongoose;

// Flag for multiple initialization attempts
let isInitializing = false;

async function connectToDatabase(): Promise<Mongoose> {
    if (cached.connection && mongoose.connection.readyState === 1) {
        return cached.connection;
    }

    if (cached.promise) {
        try {
            cached.connection = await cached.promise;
            return cached.connection;
        } catch (e) {
            cached.promise = null;
            isInitializing = false;
            throw e;
        }
    }

    if (isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return connectToDatabase();
    }

    isInitializing = true;

    if (mongoose.connection.readyState !== 0) {
        console.log('Disconnecting existing MongoDB connection...');
        await mongoose.disconnect();
    }

    let connectionString: string;

    if (dev && (!env.MONGODB_URI || env.MONGODB_URI.trim() === '')) {
        connectionString = await startMemoryServer();
    } else {
        connectionString = env.MONGODB_URI || defaultConnectionString;
    }

    console.log('Connecting to MongoDB...');

    const mongOpts = {
        maxPoolSize: dev ? 5 : 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        directConnection: !dev,
        maxIdleTimeMS: 60000,
        maxConnecting: 2,
    } as unknown as ConnectOptions;

    cached.promise = mongoose
        .connect(connectionString, mongOpts)
        .then((mongooseInstance) => {
            console.log(
                dev && (!env.MONGODB_URI || env.MONGODB_URI.trim() === '')
                    ? 'Successfully connected to MongoDB Memory Server!'
                    : 'Successfully connected to MongoDB!',
            );
            cached.connection = mongooseInstance;
            isInitializing = false;
            return mongooseInstance;
        })
        .catch((error) => {
            cached.promise = null;
            cached.connection = null;
            isInitializing = false;
            console.error('MongoDB connection error:', error);
            throw error;
        });

    return cached.promise;
}
/**
 * Check if database is connected without reconnecting
 */
export function isDatabaseConnected(): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison
    return mongoose.connection.readyState === 1;
}

/**
 * Get mongoose connection state (0=disconnected, 1=connected, 2=connecting, 3=disconnecting)
 */
export function getConnectionState(): number {
    return mongoose.connection.readyState;
}

export default connectToDatabase;
