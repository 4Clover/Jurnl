import { MongoClient, Db } from 'mongodb';
import { MONGODB_URI } from '$env/static/private';

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env or .env.local'
    );
}

const client = new MongoClient(MONGODB_URI);
let dbInstance: Db;

export async function connectToDatabase(): Promise<Db> {
    if (dbInstance) {
        return dbInstance;
    }
    try {
        await client.connect();
        console.log('Successfully connected to MongoDB!');
        // Extract database name from URI or set a default
        const dbName =
            MONGODB_URI.split('/').pop()?.split('?')[0] || 'myJournalApp';
        dbInstance = client.db(dbName);
        return dbInstance;
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw new Error('Failed to connect to the database.');
    }
}

// Export the db instance directly after ensuring connection (simplified for common use)
// Or always call connectToDatabase() before operations if you prefer more explicit control
// This approach attempts to connect once and reuse the instance.
const db = await connectToDatabase();
export { db };
