import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import mongoose from 'mongoose';


// Define the trianCausalInference schema
const trianCausalInferenceSchema = new mongoose.Schema({
  firstResponse: {
    type: String,
    required: true
  },
  secondResponse: {
    type: String,
    required: true
  },
  thirdResponse: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create or get the model
const TrianCausalInference = mongoose.models.trianCausalInference || mongoose.model('trianCausalInference', trianCausalInferenceSchema);

export async function POST(request: NextRequest) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }
    
    await dbConnect();
    
    const body = await request.json();
    
    const { firstResponse, secondResponse, thirdResponse } = body;
    
    if (!firstResponse || !secondResponse || !thirdResponse) {
      return NextResponse.json(
        { error: 'All three responses are required' },
        { status: 400 }
      );
    }
    
    const trianSubmission = new TrianCausalInference({
      firstResponse,
      secondResponse,
      thirdResponse
    });
    
    await trianSubmission.save();
    
    return NextResponse.json({ success: true, id: trianSubmission._id, collection: 'trianCausalInference' });
  } catch (error) {
    console.error('Error saving submission:', error);
    return NextResponse.json(
      { error: 'Failed to save submission' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }
    
    await dbConnect();
    
    // Get the last 15 submissions from trianCausalInference, sorted by timestamp descending
    const submissions = await TrianCausalInference
      .find({})
      .sort({ timestamp: -1 })
      .limit(15)
      .lean();
    
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}