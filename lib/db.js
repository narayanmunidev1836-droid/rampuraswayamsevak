import mongoose from 'mongoose';

let MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

// Prevent an accidental // before the database name.
// Example:
// mongodb://localhost:27017//rampura_swayamsevak
// becomes:
// mongodb://localhost:27017/rampura_swayamsevak
//
// This fixes errors such as:
// Invalid namespace specified: /rampura_swayamsevak.submissions
MONGODB_URI = MONGODB_URI.replace(
  /(mongodb(?:\+srv)?:\/\/[^/]+)\/+(?=[^/?#]+(?:[?#]|$))/,
  '$1/'
);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null
  };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false
    });
  }

  cached.conn = await cached.promise;

  return cached.conn;
}