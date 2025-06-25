import mongoose from 'mongoose';

declare global {
  var mongoose: any; // This must be a `var` and not a `let / const`
}

const MONGODB_URI = process.env.MONGODB_URI;

// Check if we're using external backend
const useExternalBackend = process.env.NEXT_PUBLIC_USE_EXTERNAL_BACKEND === 'true';

// Provide a default dummy URI for build process if none is set
const connectionUri = MONGODB_URI || 'mongodb://dummy:27017/dummy';

if (!MONGODB_URI) {
  console.warn('MONGODB_URI not set. Using dummy URI. Make sure to set MONGODB_URI in production if not using external backend.');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // If using external backend, don't attempt to connect to MongoDB
  if (useExternalBackend) {
    throw new Error('MongoDB connection not available when using external backend');
  }

  // If no real MONGODB_URI is set and not using dummy, throw error at runtime
  if (!MONGODB_URI && connectionUri === 'mongodb://dummy:27017/dummy') {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(connectionUri, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
