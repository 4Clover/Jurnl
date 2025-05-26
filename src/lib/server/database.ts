import { MONGODB_URI } from '$env/static/private';
import mongoose, { Mongoose } from 'mongoose';

import './database/schemas';

interface MongooseConnection {
    promise: Promise<Mongoose> | null;
    connection: Mongoose | null;
}

let cached: MongooseConnection = (globalThis as any).mongoose;

if (!cached) {
    cached = (globalThis as any).mongoose = { connection: null, promise: null };
}

async function connectToDatabase(): Promise<Mongoose> {
    if (!MONGODB_URI) {
        throw new Error(
            'Please define the MONGODB_URI environment variable inside .env or .env.local'
        );
    }

    if (cached.connection) {
        console.log('Using cached MongoDB connection');
        return cached.connection;
    }

    if (!cached.promise) {
        console.log('Attempting to connect to MongoDB...');
        cached.promise = mongoose.connect(MONGODB_URI).then((mongooseInstance) => {
            console.log('Successfully connected to MongoDB!');
            return mongooseInstance;
        }).catch(err => {
            console.error('MongoDB connection error:', err);
            cached.promise = null; // reset on error
            throw err; // for caller
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
