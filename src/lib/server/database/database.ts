import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';
import mongoose, { Mongoose } from 'mongoose';
import type {ConnectOptions} from 'mongoose';
import { startMemoryServer } from './memory-server';

import './schemas';

// TODO: Fix the type errors --  P A I N

interface MongooseConnection {
    promise: Promise<Mongoose> | null;
    connection: Mongoose | null;
}

// Default for Production -- current set to local and for docker
const defaultConnectionString = 'mongodb://root:example@mongo:27017/jurnl?authSource=admin&directConnection=' +
    'true&maxPoolSize=10&w=majority&wtimeoutMS=2500&maxIdleTimeMS=60000&maxConnecting=2';

// Global singleton [singleton ref page] for connection caching
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
    // Check for active connection
    if (cached.connection && mongoose.connection.readyState === 1) {
        return cached.connection;
    }

    // If currently connecting, wait
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

    // Prevent multiple simultaneous init attempts
    if (isInitializing) {
        // Wait a bit and try again
        await new Promise(resolve => setTimeout(resolve, 100));
        return connectToDatabase();
    }
    
    isInitializing = true;

    // If existing connection in any state, disconnect first
    if (mongoose.connection.readyState !== 0) {
        console.log('Disconnecting existing MongoDB connection...');
        await mongoose.disconnect();
    }

    // No connection or promise, create!
    let connectionString: string;
    
    // Use in-memory MongoDB for dev unless MONGODB_URI is explicitly set
    if (dev && (!env.MONGODB_URI || env.MONGODB_URI.trim() === '')) {
        connectionString = await startMemoryServer();
    } else {
        connectionString = env.MONGODB_URI || defaultConnectionString;
    }
    
    console.log('Connecting to MongoDB...');
    
    const mongOpts = {
        maxPoolSize: dev ? 5 : 10, // Fewer connections for memory server
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        bufferCommands: false,
        directConnection: !dev, // Don't use direct connection for memory server
        maxIdleTimeMS: 60000,
        maxConnecting: 2,
    } as unknown as ConnectOptions;
    
    cached.promise = mongoose
        .connect(connectionString, mongOpts)
        .then((mongooseInstance) => {
            console.log(dev && (!env.MONGODB_URI || env.MONGODB_URI.trim() === '')
                ? 'Successfully connected to MongoDB Memory Server!' 
                : 'Successfully connected to MongoDB!');
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
 * Get mongoose connection state
 * 0 = disconnected
 * 1 = connected
 * 2 = connecting
 * 3 = disconnecting
 */
export function getConnectionState(): number {
    return mongoose.connection.readyState;
}

// Call whenever needed, caching will let this be fine
export default connectToDatabase;
