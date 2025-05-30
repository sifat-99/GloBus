// /Users/sifat/Projects/SALD/driverly/utils/db.js
import { MongoClient } from 'mongodb';

const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kysojnx.mongodb.net/globus?retryWrites=true&w=majority`;
const MONGODB_DB = "globusDB";// Your database name

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
}
if (!MONGODB_DB) {
    throw new Error('Please define the MONGODB_DB environment variable');
}

let cachedClient = null;
let cachedDb = null;

export async function getDb() {
    if (cachedDb) {
        return cachedDb;
    }

    if (!cachedClient) {
        cachedClient = new MongoClient(MONGODB_URI);
        await cachedClient.connect();
    }

    cachedDb = cachedClient.db(MONGODB_DB);
    return cachedDb;
}
