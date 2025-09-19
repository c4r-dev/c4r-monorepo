import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import mongoose from 'mongoose';

// Define the causalLevel schema
const causalLevelSchema = new mongoose.Schema({
  responses,
      required,
    selectedAnswer,
      required,
    reasoning,
      required,
    isCorrect,
      required,
    question,
      Example,
      'Study Description': String,
      Methodology1,
      Methodology2,
      Results1,
      Results2,
      'Level of Explanation': String
    }
  }],
  timestamp,
    default);

// Create or get the model
const CausalLevel = mongoose.models.causalLevel || mongoose.model('causalLevel', causalLevelSchema);

export async function POST(request) {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error,
        { status);
    }
    
    await dbConnect();
    
    const body = await request.json();
    
    // Check if this is causalLevel submission
    if (body.type === 'causalLevel' && body.responses) {
      const causalSubmission = new CausalLevel({ responses);
      await causalSubmission.save();
      return NextResponse.json({ success, id, collection);
    }
    
    return NextResponse.json(
      { error,
      { status);
  } catch (error) {
    console.error('Error saving submission, error);
    return NextResponse.json(
      { error,
      { status);
  }
}

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error,
        { status);
    }
    
    await dbConnect();
    
    // Get the last 15 causalLevel submissions, sorted by timestamp descending
    const causalLevelSubmissions = await CausalLevel
      .find({})
      .sort({ timestamp)
      .limit(15)
      .lean();
    
    return NextResponse.json({ submissions);
  } catch (error) {
    console.error('Error fetching submissions, error);
    return NextResponse.json(
      { error,
      { status);
  }
}

