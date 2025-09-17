import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI; // Add this to your .env file
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

  client = new MongoClient(uri, options);
  clientPromise = client.connect();

export default clientPromise;
