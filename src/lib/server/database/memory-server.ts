import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer | null = null;
let mongoUri: string | null = null;
let startPromise: Promise<string> | null = null;

export async function startMemoryServer(): Promise<string> {
    if (mongoServer && mongoUri) {
        return mongoUri;
    }

    if (startPromise) {
        return startPromise;
    }

    startPromise = createMemoryServer();

    try {
        const uri = await startPromise;
        startPromise = null;
        return uri;
    } catch (error) {
        startPromise = null;
        throw error;
    }
}

async function createMemoryServer(): Promise<string> {
    console.log('Creating new MongoDB Memory Server...');

    mongoServer = await MongoMemoryServer.create({
        instance: {
            dbName: 'jurnl',
            port: 27018,
            storageEngine: 'wiredTiger',
        },
    });

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
