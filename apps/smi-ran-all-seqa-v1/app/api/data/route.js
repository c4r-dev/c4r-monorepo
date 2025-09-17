import { NextResponse } from "next/server";
import mongoose from "mongoose";

// MongoDB Connection URI (replace with your actual URI)
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
if (!mongoose.connection.readyState) {
  mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
}

// Define a schema and model for the collection
const ranSeqASchema = new mongoose.Schema({}, { strict: false }); // Flexible schema
const RanSeqA = mongoose.models.RanSeqA || mongoose.model("RanSeqA", ranSeqASchema, "ranSeqA");

// Fetch the last 100 documents
export async function GET() {
  try {
    const data = await RanSeqA.find().sort({ _id: -1 }).limit(100);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
