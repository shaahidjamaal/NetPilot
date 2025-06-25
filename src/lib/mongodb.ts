import mongoose from 'mongoose';

declare global {
  var mongoose: any; // This must be a `var` and not a `let / const`
}

const MONGODB_URI = process.env.MONGODB_URI;

// Check if we're using external backend
const useExternalBackend = process.env.NEXT_PUBLIC_USE_EXTERNAL_BACKEND === 'true';

if (!MONGODB_URI && !useExternalBackend) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// If using external backend and no MONGODB_URI, provide a dummy URI for build process
const connectionUri = MONGODB_URI || (useExternalBackend ? 'mongodb://dummy:27017/dummy' : '');

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

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(connectionUri!, opts).then((mongoose) => {
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
