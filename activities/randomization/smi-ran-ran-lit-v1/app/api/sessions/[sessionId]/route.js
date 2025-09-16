// app/api/sessions/[sessionId]/route.js
import { NextResponse } from 'next/server';
import connectMongoDB from '../[sessionId]/../../libs/mongodb';
import Session from '../[sessionId]/../../models/session';

export async function GET(req, { params }) {
  try {
    const { sessionId } = params;
    
    if (!sessionId) {
      return NextResponse.json(
        { message: 'Session ID is required' },
        { status: 400 }
      );
    }

    await connectMongoDB();

    // Find the session by ID
    const session = await Session.findOne({ sessionId });

    if (!session) {
      return NextResponse.json(
        { message: 'Session not found' },
        { status: 404 }
      );
    }

    // Return the session data
    return NextResponse.json(
      { 
        message: 'Session retrieved successfully', 
        session 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrieving session:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}