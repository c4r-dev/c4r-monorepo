import { NextResponse } from 'next/server';
import connectMongoDB from '../libs/mongodb';
import NmdaSession from '../models/NmdaSession';

export async function POST(req) {
  try {
    console.log('Connecting to MongoDB...');
    await connectMongoDB();
    console.log('MongoDB connected successfully');

    // Parse the request body
    const sessionData = await req.json();
    console.log('Received session data:', JSON.stringify(sessionData, null, 2));
    
    const { sessionId, moveHistory, finalState } = sessionData;

    // Validate required fields
    if (!sessionId) {
      console.log('Missing sessionId in request');
      return NextResponse.json(
        { message: 'Missing required field: sessionId' },
        { status: 400 }
      );
    }

    console.log(`Processing session: ${sessionId}`);
    console.log('Move history:', JSON.stringify(moveHistory, null, 2));
    console.log('Final state:', JSON.stringify(finalState, null, 2));

    // Verify the data structure matches the schema
    // Log any potential schema validation issues
    if (!moveHistory || typeof moveHistory !== 'object') {
      console.log('Invalid moveHistory structure');
    }
    
    if (!finalState || typeof finalState !== 'object') {
      console.log('Invalid finalState structure');
    }

    // Find and update the session document, or create a new one if it doesn't exist
    console.log('Attempting to update or create session document...');
    const updatedSession = await NmdaSession.findOneAndUpdate(
      { sessionId },
      {
        sessionId,
        moveHistory: moveHistory || {},
        finalState: finalState || {},
        timestamp: sessionData.timestamp || new Date()
      },
      { 
        new: true, // Return the updated document
        upsert: true, // Create a new document if one doesn't exist
        runValidators: true // Ensure the update meets schema validation
      }
    );

    console.log('Session saved successfully:', updatedSession);
    return NextResponse.json({ 
      success: true,
      sessionId: updatedSession.sessionId,
      timestamp: updatedSession.timestamp
    });
  } catch (error) {
    console.error('Error saving NMDA session data:', error);
    console.error('Stack trace:', error.stack);
    // More detailed error response
    return NextResponse.json(
      { 
        message: 'Internal Server Error', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
export async function GET(req) {
  try {
    await connectMongoDB();
    
    // Get parameters from the URL
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    const aggregated = url.searchParams.get('aggregated');
    
    // If aggregated data is requested, return last 15 entries for each task from all sessions
    if (aggregated === 'true') {
      try {
        console.log('Fetching aggregated data...');
        // Get all sessions and aggregate the last 15 entries for each task
        const sessions = await NmdaSession.find({}).sort({ timestamp: -1 });
        console.log(`Found ${sessions.length} sessions`);
        
        const aggregatedData = {
          task1: [],
          task2: [],
          task3: []
        };
        
        // Collect all moves from all sessions
        sessions.forEach((session, index) => {
          console.log(`Processing session ${index + 1}:`, session.sessionId);
          if (session.moveHistory) {
            console.log('Session moveHistory:', session.moveHistory);
            // Add moves from each task, including session info
            ['task1', 'task2', 'task3'].forEach(taskKey => {
              if (session.moveHistory[taskKey] && session.moveHistory[taskKey].length > 0) {
                console.log(`Found ${session.moveHistory[taskKey].length} moves for ${taskKey}`);
                session.moveHistory[taskKey].forEach(move => {
                  console.log('Processing move:', move);
                  // Extract the raw data from Mongoose document
                  const moveData = move.toObject ? move.toObject() : move;
                  aggregatedData[taskKey].push({
                    ...moveData,
                    sessionId: session.sessionId,
                    sessionTimestamp: session.timestamp
                  });
                });
              }
            });
          }
        });
        
        console.log('Aggregated data before sorting:', aggregatedData);
        
        // Sort each task's moves by timestamp (newest first) and take last 15
        ['task1', 'task2', 'task3'].forEach(taskKey => {
          aggregatedData[taskKey] = aggregatedData[taskKey]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 15);
        });
        
        console.log('Final aggregated data:', aggregatedData);
        
        return NextResponse.json({
          moveHistory: aggregatedData,
          totalSessions: sessions.length,
          aggregated: true
        });
      } catch (error) {
        console.error('Error fetching aggregated data:', error);
        return NextResponse.json(
          { message: 'Error fetching aggregated data', error: error.message },
          { status: 500 }
        );
      }
    }
    
    // Original single session functionality
    if (!sessionId) {
      return NextResponse.json(
        { message: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Find the session by ID
    const session = await NmdaSession.findOne({ sessionId });
    
    if (!session) {
      return NextResponse.json(
        { message: 'Session not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(session);
  } catch (error) {
    console.error('Error fetching NMDA session:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}