// File path: app/api/concerns/filter/route.js

import connectMongoDB from '../../libs/mongodb'
import Session from '../../models/Session'
import { NextResponse } from 'next/server'

// POST endpoint to filter out single-word responses
export async function POST(req) {
  try {
    await connectMongoDB();
    
    // Get all sessions
    const sessions = await Session.find({});
    
    if (!sessions || sessions.length === 0) {
      return NextResponse.json(
        { message: 'No sessions found' },
        { status: 404 }
      );
    }
    
    let totalRemovedResponses = 0;
    let affectedSessions = 0;
    
    // Process each session
    for (const session of sessions) {
      let sessionModified = false;
      
      // Process each section
      for (const section of session.sections) {
        // Process each student
        for (const student of section.students) {
          if (student.concernResponses && student.concernResponses.length > 0) {
            // Filter out single-word responses
            const originalCount = student.concernResponses.length;
            
            student.concernResponses = student.concernResponses.filter(response => {
              const implementationText = response.implementation?.implementationText || '';
              const trimmedText = implementationText.trim();
              
              // Check if it's a single word (no spaces) or empty
              const isSingleWord = trimmedText === '' || !trimmedText.includes(' ');
              
              if (isSingleWord) {
                totalRemovedResponses++;
                return false; // Remove this response
              }
              return true; // Keep this response
            });
            
            // Check if any responses were removed from this student
            if (student.concernResponses.length < originalCount) {
              sessionModified = true;
            }
          }
        }
      }
      
      // Save the session if it was modified using direct update to avoid validation issues
      if (sessionModified) {
        try {
          await Session.updateOne(
            { _id: session._id },
            { $set: { sections: session.sections } },
            { strict: false, runValidators: false }
          );
          affectedSessions++;
        } catch (saveError) {
          console.error('Error saving session:', saveError.message);
          // Continue processing other sessions even if one fails
        }
      }
    }
    
    return NextResponse.json(
      { 
        message: `Successfully filtered single-word responses`,
        removedResponses: totalRemovedResponses,
        affectedSessions: affectedSessions
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error filtering single-word responses:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

// GET endpoint to preview what would be filtered (without actually deleting)
export async function GET(req) {
  try {
    await connectMongoDB();
    
    // Get all sessions
    const sessions = await Session.find({});
    
    if (!sessions || sessions.length === 0) {
      return NextResponse.json(
        { message: 'No sessions found' },
        { status: 404 }
      );
    }
    
    let singleWordResponses = [];
    let totalCount = 0;
    
    // Process each session
    for (const session of sessions) {
      // Process each section
      for (const section of session.sections) {
        // Process each student
        for (const student of section.students) {
          if (student.concernResponses && student.concernResponses.length > 0) {
            // Find single-word responses
            student.concernResponses.forEach(response => {
              const implementationText = response.implementation?.implementationText || '';
              const trimmedText = implementationText.trim();
              
              // Check if it's a single word (no spaces) or empty
              const isSingleWord = trimmedText === '' || !trimmedText.includes(' ');
              
              if (isSingleWord) {
                singleWordResponses.push({
                  sessionId: session.sessionId,
                  sectionNumber: section.sectionNumber,
                  studentId: student.studentId,
                  cardText: response.cardText,
                  binAssignment: response.binAssignment,
                  implementationText: implementationText
                });
                totalCount++;
              }
            });
          }
        }
      }
    }
    
    return NextResponse.json(
      { 
        message: `Found ${totalCount} single-word responses`,
        totalCount: totalCount,
        responses: singleWordResponses
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error previewing single-word responses:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}