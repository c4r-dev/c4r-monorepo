// File path: app/api/concerns/[sessionId]/route.js

import connectMongoDB from '../../libs/mongodb'
import Session from '../../models/Session';
import { NextResponse } from 'next/server'


// GET endpoint - get specific session by ID
export async function GET(req, { params }) {
  try {
    await connectMongoDB();
    const { sessionId } = await params;
    
    const session = await Session.findOne({ sessionId });
    
    if (!session) {
      return NextResponse.json(
        { message: `Session with ID ${sessionId} not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ session }, { status: 200 });
  } catch (error) {
    console.error(`Error getting session:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE endpoint - delete a specific session by ID
export async function DELETE(req, { params }) {
  try {
    await connectMongoDB();
    const { sessionId } = await params;
    
    const result = await Session.deleteOne({ sessionId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: `Session with ID ${sessionId} not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: `Session ${sessionId} deleted successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting session:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}