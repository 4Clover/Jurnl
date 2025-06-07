import { MONGODB_URI } from '$env/static/private';
import mongoose, { Mongoose } from 'mongoose';
import type {ConnectOptions} from 'mongoose';


import './database/schemas';

interface MongooseConnection {
    promise: Promise<Mongoose> | null;
    connection: Mongoose | null;
}
const connectionString = MONGODB_URI ||
    'mongodb://root:example@localhost:27017/jurnl?authSource=admin&directConnection=' +
    'true&maxPoolSize=10&w=majority&wtimeoutMS=2500&maxIdleTimeMS=60000&maxConnecting=2';

let cached: MongooseConnection =  (globalThis as any).mongoose || { conn: null, promise: null };

if (!cached) {
    cached = (globalThis as any).mongoose = { connection: null, promise: null };
}

async function connectToDatabase(): Promise<Mongoose> {
    if (cached.connection) {
        console.log('Using cached MongoDB connection');
        return cached.connection;
    }

    if (!cached.promise) {
        console.log('Attempting to connect to MongoDB...');
        const mongOpts = {
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            bufferCommands: false, // Disable mongoose buffering
            directConnection: true, // Force direct connection (faster for single instance)
            maxIdleTimeMS: 60000, // Close connections after 60 seconds of inactivity
            maxConnecting: 2, // Allow only 2 connections to be establishing at a time
        } as unknown as ConnectOptions;
        cached.promise = mongoose
            .connect(connectionString, mongOpts)
            .then((mongooseInstance) => {
                console.log('Successfully connected to MongoDB!');
                return mongooseInstance;
            });
    }

    try {
        cached.connection = await cached.promise;
    } catch (e) {
        cached.promise = null; // clear promise on error
        throw e; // let caller catch
    }

    return cached.connection;
}
// Call whenever needed, caching will let this be fine
export default connectToDatabase;
