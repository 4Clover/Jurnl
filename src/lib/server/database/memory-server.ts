import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer | null = null;
let mongoUri: string | null = null;
let startPromise: Promise<string> | null = null;

export async function startMemoryServer(): Promise<string> {
    // If server is already running, return existing URI
    if (mongoServer && mongoUri) {
        return mongoUri;
    }

    // If starting, wait for promise
    if (startPromise) {
        return startPromise;
    }

    // ACTUAL START OF SERVER
    // Create a new start promise
    startPromise = createMemoryServer();

    try {
        const uri = await startPromise;
        startPromise = null; // Clear promise once complete
        return uri;
    } catch (error) {
        startPromise = null; // Clear promise on error
        throw error;
    }
}

async function createMemoryServer(): Promise<string> {
    console.log('Creating new MongoDB Memory Server...');

    // Create instance of MongoMemoryServer
    mongoServer = await MongoMemoryServer.create({
        instance: {
            dbName: 'jurnl',
            port: 27018, // Different for conflicts w docker
            storageEngine: 'wiredTiger',
        },
    });

    // Get connection string
    mongoUri = mongoServer.getUri();
    console.log('MongoDB Memory Server started at:', mongoUri);

    return mongoUri;
}

export async function stopMemoryServer(): Promise<void> {
    if (mongoServer) {
        await mongoose.disconnect();
        await mongoServer.stop();
        mongoServer = null;
        mongoUri = null;
        console.log('MongoDB Memory Server stopped');
    }
}

export function isMemoryServerRunning(): boolean {
    return mongoServer !== null;
}
