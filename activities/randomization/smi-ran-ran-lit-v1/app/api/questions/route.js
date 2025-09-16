// File path: app/api/questions/route.js

// import { NextResponse } from 'next/server';
// import { connectMongoDB } from '@/lib/mongodb';
// import Session from '@/models/Session';

import connectMongoDB from '../libs/mongodb'
import Session from '../models/session'
import { NextResponse } from 'next/server'
import mongoose from 'mongoose';
// File path: app/api/questions/route.js


export async function POST(req) {
  try {
    await connectMongoDB();

    // Parse the request body to get all data
    const body = await req.json();
    const { sessionId, userId, questionText, selectedSection, sessionType = 'group' } = body;
    
    // Validate required fields
    if (!sessionId || !userId || !questionText) {
      return NextResponse.json(
        { message: 'sessionId, userId, and questionText are all required' },
        { status: 400 }
      );
    }

    // Validate selectedSection
    const sectionNumber = parseInt(selectedSection);
    if (isNaN(sectionNumber) || ![1, 2, 3].includes(sectionNumber)) {
      return NextResponse.json(
        { message: 'selectedSection must be 1, 2, or 3' },
        { status: 400 }
      );
    }

    // Find the session by sessionId
    let session = await Session.findOne({ sessionId });

    // If session doesn't exist, create a new one with all three sections
    if (!session) {
      session = new Session({
        sessionId,
        sessionType,
        sections: [
          { sectionNumber: 1, students: [] },
          { sectionNumber: 2, students: [] },
          { sectionNumber: 3, students: [] }
        ]
      });
      
      console.log(`Creating new session with ID: ${sessionId}`);
    }

    // Make sure all three sections exist
    for (let i = 1; i <= 3; i++) {
      if (!session.sections.some(section => section.sectionNumber === i)) {
        session.sections.push({ sectionNumber: i, students: [] });
      }
    }

    // Find the appropriate section
    const sectionIndex = session.sections.findIndex(
      section => section.sectionNumber === sectionNumber
    );

    if (sectionIndex === -1) {
      return NextResponse.json(
        { message: `Section ${sectionNumber} not found in session` },
        { status: 500 }
      );
    }

    // Check if the student exists in the section
    const studentIndex = session.sections[sectionIndex].students.findIndex(
      student => student.studentId === userId
    );

    if (studentIndex === -1) {
      // If student doesn't exist in the section, add them
      session.sections[sectionIndex].students.push({
        studentId: userId,
        questions: [{ 
          questionText, 
          timestamp: new Date() 
        }]
      });
    } else {
      // If student exists, add the question to their questions array
      session.sections[sectionIndex].students[studentIndex].questions.push({
        questionText,
        timestamp: new Date()
      });
    }

    // Save the updated or new session
    await session.save();

    return NextResponse.json(
      { 
        message: `Question added successfully to section ${sectionNumber}`, 
        session 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error adding question:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    await connectMongoDB();

    // Fetch all sessions from the database
    const sessions = await Session.find({});

    // If no sessions are found, return an empty array
    if (!sessions || sessions.length === 0) {
      return NextResponse.json(
        { message: 'No sessions found', sessions: [] },
        { status: 200 }
      );
    }

    // Return all sessions
    return NextResponse.json(
      { message: 'Sessions retrieved successfully', sessions },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrieving sessions:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}



export async function DELETE(req) {
    try {
      await connectMongoDB();
  
      // Delete all sessions from the database
      const result = await Session.deleteMany({});
  
      // Check if any documents were deleted
      if (result.deletedCount === 0) {
        return NextResponse.json(
          { message: 'No sessions found to delete' },
          { status: 200 }
        );
      }
  
      // Return success message with count of deleted sessions
      return NextResponse.json(
        { 
          message: 'All sessions deleted successfully', 
          deletedCount: result.deletedCount 
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error deleting sessions:', error);
      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      );
    }
  }