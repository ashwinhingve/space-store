import mongoose from 'mongoose'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cached = (global as any).mongoose || { conn: null, promise: null }

export const connectToDatabase = async (
  MONGODB_URI = process.env.MONGODB_URI
) => {
  if (cached.conn) return cached.conn

  if (!MONGODB_URI) {
    console.error('MONGODB_URI is missing in environment variables')
    throw new Error('MONGODB_URI is missing')
  }

  try {
    cached.promise = cached.promise || mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      retryReads: true,
    })

    cached.conn = await cached.promise
    console.log('MongoDB connected successfully')
    return cached.conn
  } catch (error) {
    console.error('MongoDB connection error:', error)
    cached.promise = null
    
    if (!cached.retryCount) {
      cached.retryCount = 1;
      console.log('Retrying MongoDB connection...');
      
      try {
        cached.promise = mongoose.connect(MONGODB_URI, {
          maxPoolSize: 5,
          serverSelectionTimeoutMS: 15000,
          socketTimeoutMS: 75000,
          connectTimeoutMS: 45000,
        });
        
        cached.conn = await cached.promise;
        console.log('MongoDB reconnected successfully on retry');
        return cached.conn;
      } catch (retryError) {
        console.error('MongoDB retry connection failed:', retryError);
        cached.promise = null;
        throw retryError;
      }
    }
    
    throw error
  }
}
