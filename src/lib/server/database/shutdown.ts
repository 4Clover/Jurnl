/* eslint-disable @typescript-eslint/no-misused-promises */
import { dev } from '$app/environment';
import { stopMemoryServer } from './memory-server';
import mongoose from 'mongoose';

let shutdownInProgress = false;

async function gracefulShutdown() {
    if (shutdownInProgress) return;
    shutdownInProgress = true;
    
    console.log('\n🛑 Graceful shutdown initiated...');
    
    try {
        // PRODUCTION: mongoose connection
        if (mongoose.connection.readyState === mongoose.ConnectionStates.connected) {
            await mongoose.connection.close();
            console.log('✅ MongoDB connection closed');
        }
        
        // DEV: memory server
        if (dev) {
            await stopMemoryServer();
        }
        
        console.log('✅ Shutdown complete');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
}

// Register shutdown handlers
if (typeof process !== 'undefined') {
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGUSR2', gracefulShutdown);
}

export { gracefulShutdown };