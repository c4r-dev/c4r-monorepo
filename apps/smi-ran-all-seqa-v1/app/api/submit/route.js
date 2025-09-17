import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // Ensure this is in your .env file
const client = new MongoClient(uri);

export async function POST(req) {
  try {
    const { selectedOption, textInput } = await req.json();
    
    if (!selectedOption || !textInput) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }

    await client.connect();
    const database = client.db('c4r'); // Replace with your database name
    const collection = database.collection('ranSeqA');

    const response = await collection.insertOne({ selectedOption, textInput, createdAt: new Date() });

    return NextResponse.json({ message: "Data saved successfully", id: response.insertedId }, { status: 200 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ message: "Error saving data" }, { status: 500 });
  } finally {
    await client.close();
  }
}
