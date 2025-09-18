import { NextResponse } from 'next/server';
import connectMongoDB from '../libs/mongodb';
import NmdaSession from '../models/NmdaSession';
const logger = require('../../../../../packages/logging/logger');

export async function POST(req) {
  try {
    logger.app.info('Connecting to MongoDB...');
    await connectMongoDB();
    logger.app.info('MongoDB connected successfully');

    // Parse the request body
    const sessionData = await req.json();
    logger.app.info('Received session data', { sessionData });
    
    const { sessionId, moveHistory, finalState } = sessionData;

    // Validate required fields
    if (!sessionId) {
      logger.app.warn('Missing sessionId in request');
      return NextResponse.json(
        { message: 'Missing required field: sessionId' },
        { status: 400 }
      );
    }

    logger.app.info('Processing session', { sessionId });
    logger.app.info('Move history', { moveHistory });
    logger.app.info('Final state', { finalState });

    // Verify the data structure matches the schema
    // Log any potential schema validation issues
    if (!moveHistory || typeof moveHistory !== 'object') {
      logger.app.warn('Invalid moveHistory structure');
    }
    
    if (!finalState || typeof finalState !== 'object') {
      logger.app.warn('Invalid finalState structure');
    }

    // Find and update the session document, or create a new one if it doesn't exist
    logger.app.info('Attempting to update or create session document...');
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

    logger.app.info('Session saved successfully', { sessionId: updatedSession.sessionId });
    return NextResponse.json({ 
      success: true,
      sessionId: updatedSession.sessionId,
      timestamp: updatedSession.timestamp
    });
  } catch (error) {
    logger.app.error('Error saving NMDA session data', { error: error.message, stack: error.stack });
    logger.app.error('Stack trace', { stack: error.stack });
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
        logger.app.info('Fetching aggregated data...');
        // Get all sessions and aggregate the last 15 entries for each task
        const sessions = await NmdaSession.find({}).sort({ timestamp: -1 });
        logger.app.info('Found sessions', { sessionCount: sessions.length });
        
        const aggregatedData = {
          task1: [],
          task2: [],
          task3: []
        };
        
        // Collect all moves from all sessions
        sessions.forEach((session, index) => {
          logger.app.info('Processing session', { sessionIndex: index + 1, sessionId: session.sessionId });
          if (session.moveHistory) {
            logger.app.info('Session moveHistory', { sessionId: session.sessionId, hasHistory: !!session.moveHistory });
            // Add moves from each task, including session info
            ['task1', 'task2', 'task3'].forEach(taskKey => {
              if (session.moveHistory[taskKey] && session.moveHistory[taskKey].length > 0) {
                logger.app.info('Found moves for task', { taskKey, moveCount: session.moveHistory[taskKey].length });
                session.moveHistory[taskKey].forEach(move => {
                  logger.app.info('Processing move', { taskKey, moveData: move });
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
        
        logger.app.info('Aggregated data before sorting', { dataKeys: Object.keys(aggregatedData) });
        
        // Sort each task's moves by timestamp (newest first) and take last 15
        ['task1', 'task2', 'task3'].forEach(taskKey => {
          aggregatedData[taskKey] = aggregatedData[taskKey]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 15);
        });
        
        logger.app.info('Final aggregated data', { dataKeys: Object.keys(aggregatedData), totalEntries: Object.values(aggregatedData).flat().length });
        
        return NextResponse.json({
          moveHistory: aggregatedData,
          totalSessions: sessions.length,
          aggregated: true
        });
      } catch (error) {
        logger.app.error('Error fetching aggregated data', { error: error.message, stack: error.stack });
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
    logger.app.error('Error fetching NMDA session', { error: error.message, stack: error.stack });
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}