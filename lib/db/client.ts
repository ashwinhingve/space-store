// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
import { MongoClient, ServerApiVersion } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  minPoolSize: 5,
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
}

let client: MongoClient

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient
  }

  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri, options)
  }
  client = globalWithMongo._mongoClient
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
}

// Connection error handling
client.on('error', (error) => {
  console.error('MongoDB client error:', error);
  // Attempt to reconnect if disconnected
  if (!client.connect) {
    console.log('Attempting to reconnect MongoDB client...');
    client.connect().catch(err => {
      console.error('MongoDB client reconnection failed:', err);
    });
  }
});

// Export a module-scoped MongoClient. By doing this in a
// separate module, the client can be shared across functions.
export default client
