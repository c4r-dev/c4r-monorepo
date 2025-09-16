// // File path: app/api/concerns/route.js

import connectMongoDB from '../libs/mongodb'
import Session from '../models/Session'
import { NextResponse } from 'next/server'

// // export async function POST(req) {
// //   try {
// //     await connectMongoDB();

// //     // Parse the request body to get all data
// //     const body = await req.json();
// //     const { 
// //       sessionId, 
// //       studentId, 
// //       concerns, 
// //       selectedSection, 
// //       sessionType = 'individual' 
// //     } = body;
    
// //     // Validate required fields
// //     if (!sessionId || !studentId || !concerns || !concerns.length) {
// //       return NextResponse.json(
// //         { message: 'sessionId, studentId, and at least one concern are required' },
// //         { status: 400 }
// //       );
// //     }

// //     // Validate selectedSection
// //     const sectionNumber = parseInt(selectedSection) || 1; // Default to section 1 if not provided
// //     if (isNaN(sectionNumber) || ![1, 2, 3].includes(sectionNumber)) {
// //       return NextResponse.json(
// //         { message: 'selectedSection must be 1, 2, or 3' },
// //         { status: 400 }
// //       );
// //     }

// //     // Validate concerns
// //     const validBins = ['constrain', 'distribute', 'test'];
// //     const validCardTexts = [
// //       'Sterilization Protocol',
// //       'Incubation Procedure',
// //       'Culture Sourcing',
// //       'Evaluation Timing',
// //       'Neuroserpin Processing',
// //       'Neuron Selection'
// //     ];

// //     // Check if all concerns have valid card texts and bin assignments
// //     for (const concern of concerns) {
// //       if (!validCardTexts.includes(concern.concernname)) {
// //         return NextResponse.json(
// //           { message: `Invalid card text: ${concern.concernname}` },
// //           { status: 400 }
// //         );
// //       }
// //       if (!validBins.includes(concern.binname)) {
// //         return NextResponse.json(
// //           { message: `Invalid bin assignment: ${concern.binname}` },
// //           { status: 400 }
// //         );
// //       }
// //     }

// //     // Map concern data to match schema
// //     const concernResponses = concerns.map(concern => {
// //       // Get card ID from card text
// //       const cardIdMap = {
// //         'Sterilization Protocol': 1,
// //         'Incubation Procedure': 2,
// //         'Culture Sourcing': 3,
// //         'Evaluation Timing': 4,
// //         'Neuroserpin Processing': 5,
// //         'Neuron Selection': 6
// //       };

// //       return {
// //         cardId: cardIdMap[concern.concernname],
// //         cardText: concern.concernname,
// //         binAssignment: concern.binname,
// //         implementation: {
// //           implementationText: concern.response || '',
// //           timestamp: new Date()
// //         }
// //       };
// //     });

// //     // Find the session by sessionId
// //     let session = await Session.findOne({ sessionId });

// //     // If session doesn't exist, create a new one with all three sections
// //     if (!session) {
// //       session = new Session({
// //         sessionId,
// //         sessionType,
// //         activityType: 'concern-cards',
// //         sections: [
// //           { sectionNumber: 1, students: [] },
// //           { sectionNumber: 2, students: [] },
// //           { sectionNumber: 3, students: [] }
// //         ]
// //       });
      
// //       console.log(`Creating new session with ID: ${sessionId}`);
// //     }

// //     // Make sure all three sections exist
// //     for (let i =
// //  1; i <= 3; i++) {
// //       if (!session.sections.some(section => section.sectionNumber === i)) {
// //         session.sections.push({ sectionNumber: i, students: [] });
// //       }
// //     }

// //     // Find the appropriate section
// //     const sectionIndex = session.sections.findIndex(
// //       section => section.sectionNumber === sectionNumber
// //     );

// //     if (sectionIndex === -1) {
// //       return NextResponse.json(
// //         { message: `Section ${sectionNumber} not found in session` },
// //         { status: 500 }
// //       );
// //     }

// //     // Check if the student exists in the section
// //     const studentIndex = session.sections[sectionIndex].students.findIndex(
// //       student => student.studentId === studentId
// //     );

// //     if (studentIndex === -1) {
// //       // If student doesn't exist in the section, add them
// //       session.sections[sectionIndex].students.push({
// //         studentId,
// //         concernResponses,
// //         completedAt: new Date()
// //       });
// //     } else {
// //       // If student exists, update their concern responses
// //       session.sections[sectionIndex].students[studentIndex].concernResponses = concernResponses;
// //       session.sections[sectionIndex].students[studentIndex].completedAt = new Date();
// //     }

// //     // Save the updated or new session
// //     await session.save();

// //     return NextResponse.json(
// //       { 
// //         message: `Concern cards added successfully to section ${sectionNumber}`, 
// //         session 
// //       },
// //       { status: 200 }
// //     );
// //   } catch (error) {
// //     console.error('Error adding concern cards:', error);
// //     return NextResponse.json(
// //       { message: 'Internal Server Error', error: error.message },
// //       { status: 500 }
// //     );
// //   }
// // }

// export async function POST(req) {
//     try {
//       await connectMongoDB();
  
//       // Parse the request body to get all data
//       const body = await req.json();
//       const { 
//         sessionId, 
//         studentId, 
//         concerns, 
//         selectedSection, 
//         sessionType = 'individual' 
//       } = body;
      
//       // Validate required fields
//       if (!sessionId || !studentId || !concerns || !concerns.length) {
//         return NextResponse.json(
//           { message: 'sessionId, studentId, and at least one concern are required' },
//           { status: 400 }
//         );
//       }
  
//       // Validate selectedSection
//       const sectionNumber = parseInt(selectedSection) || 1; // Default to section 1 if not provided
//       if (isNaN(sectionNumber) || ![1, 2, 3].includes(sectionNumber)) {
//         return NextResponse.json(
//           { message: 'selectedSection must be 1, 2, or 3' },
//           { status: 400 }
//         );
//       }
  
//       // Validate concerns
//       const validBins = ['constrain', 'distribute', 'test'];
//       const validCardTexts = [
//         'Sterilization Protocol',
//         'Incubation Procedure',
//         'Culture Sourcing',
//         'Evaluation Timing',
//         'Neuroserpin Processing',
//         'Neuron Selection'
//       ];
  
//       // Check if all concerns have valid card texts and bin assignments
//       for (const concern of concerns) {
//         if (!validCardTexts.includes(concern.concernname)) {
//           return NextResponse.json(
//             { message: `Invalid card text: ${concern.concernname}` },
//             { status: 400 }
//           );
//         }
//         if (!validBins.includes(concern.binname)) {
//           return NextResponse.json(
//             { message: `Invalid bin assignment: ${concern.binname}` },
//             { status: 400 }
//           );
//         }
//       }
  
//       // Map concern data to match schema
//       const concernResponses = concerns.map(concern => {
//         // Get card ID from card text
//         const cardIdMap = {
//           'Sterilization Protocol': 1,
//           'Incubation Procedure': 2,
//           'Culture Sourcing': 3,
//           'Evaluation Timing': 4,
//           'Neuroserpin Processing': 5,
//           'Neuron Selection': 6
//         };
  
//         return {
//           cardId: cardIdMap[concern.concernname],
//           cardText: concern.concernname,
//           binAssignment: concern.binname,
//           implementation: {
//             implementationText: concern.response || '',
//             timestamp: new Date()
//           }
//         };
//       });
  
//       // Find the session by sessionId
//       let session = await Session.findOne({ sessionId });
  
//       // If session doesn't exist, create a new one with all three sections
//       if (!session) {
//         session = new Session({
//           sessionId,
//           sessionType,
//           activityType: 'concern-cards',
//           sections: [
//             { sectionNumber: 1, students: [] },
//             { sectionNumber: 2, students: [] },
//             { sectionNumber: 3, students: [] }
//           ]
//         });
//       }
  
//       // Make sure all three sections exist
//       for (let i = 1; i <= 3; i++) {
//         if (!session.sections.some(section => section.sectionNumber === i)) {
//           session.sections.push({ sectionNumber: i, students: [] });
//         }
//       }
  
//       // Find the appropriate section
//       const sectionIndex = session.sections.findIndex(
//         section => section.sectionNumber === sectionNumber
//       );
  
//       if (sectionIndex === -1) {
//         return NextResponse.json(
//           { message: `Section ${sectionNumber} not found in session` },
//           { status: 500 }
//         );
//       }
  
//       // Check if the student exists in the section
//       const studentIndex = session.sections[sectionIndex].students.findIndex(
//         student => student.studentId === studentId
//       );
  
//       if (studentIndex === -1) {
//         // If student doesn't exist in the section, add them
//         session.sections[sectionIndex].students.push({
//           studentId,
//           concernResponses,
//           completedAt: new Date()
//         });
//       } else {
//         // If student exists, update their concern responses
//         session.sections[sectionIndex].students[studentIndex].concernResponses = concernResponses;
//         session.sections[sectionIndex].students[studentIndex].completedAt = new Date();
//       }
  
//       // Save the updated or new session
//       await session.save();
  
//       return NextResponse.json(
//         { 
//           message: `Concern cards added successfully to section ${sectionNumber}`, 
//           session 
//         },
//         { status: 200 }
//       );
//     } catch (error) {
//       console.error('Error adding concern cards:', error);
//       return NextResponse.json(
//         { message: 'Internal Server Error', error: error.message },
//         { status: 500 }
//       );
//     }
//   }

// export async function GET(req) {
//   try {
//     await connectMongoDB();

//     // Get URL to extract query parameters
//     const url = new URL(req.url);
//     const sessionId = url.searchParams.get('sessionId');
//     const sectionNumber = url.searchParams.get('sectionNumber');
//     const studentId = url.searchParams.get('studentId');

//     // Build query based on parameters
//     let query = {};
//     if (sessionId) {
//       query.sessionId = sessionId;
//     }

//     // Fetch sessions from the database
//     let sessions = await Session.find(query);

//     // Filter by activityType if needed
//     sessions = sessions.filter(session => session.activityType === 'concern-cards');

//     // If no sessions are found, return an empty array
//     if (!sessions || sessions.length === 0) {
//       return NextResponse.json(
//         { message: 'No concern card sessions found', sessions: [] },
//         { status: 200 }
//       );
//     }

//     // Further filter results if sectionNumber or studentId is provided
//     if (sectionNumber || studentId) {
//       sessions = sessions.map(session => {
//         // Create a copy of the session object to avoid modifying the original
//         const sessionObj = session.toObject();
        
//         // Filter sections if sectionNumber is provided
//         if (sectionNumber) {
//           const sectionNum = parseInt(sectionNumber);
//           sessionObj.sections = sessionObj.sections.filter(
//             section => section.sectionNumber === sectionNum
//           );
//         }
        
//         // Filter students if studentId is provided
//         if (studentId) {
//           sessionObj.sections = sessionObj.sections.map(section => {
//             section.students = section.students.filter(
//               student => student.studentId === studentId
//             );
//             return section;
//           });
//         }
        
//         return sessionObj;
//       });
//     }

//     // Return filtered sessions
//     return NextResponse.json(
//       { message: 'Concern card sessions retrieved successfully', sessions },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error retrieving concern card sessions:', error);
//     return NextResponse.json(
//       { message: 'Internal Server Error', error: error.message },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(req) {
//   try {
//     await connectMongoDB();

//     // Get URL to extract query parameters
//     const url = new URL(req.url);
//     const sessionId = url.searchParams.get('sessionId');

//     let result;
//     if (sessionId) {
//       // Delete specific session
//       result = await Session.deleteOne({ sessionId, activityType: 'concern-cards' });
//     } else {
//       // Delete all concern card sessions
//       result = await Session.deleteMany({ activityType: 'concern-cards' });
//     }

//     // Check if any documents were deleted
//     if (result.deletedCount === 0) {
//       return NextResponse.json(
//         { message: 'No concern card sessions found to delete' },
//         { status: 200 }
//       );
//     }

//     // Return success message with count of deleted sessions
//     return NextResponse.json(
//       { 
//         message: sessionId 
//           ? `Session ${sessionId} deleted successfully` 
//           : 'All concern card sessions deleted successfully', 
//         deletedCount: result.deletedCount 
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error deleting concern card sessions:', error);
//     return NextResponse.json(
//       { message: 'Internal Server Error', error: error.message },
//       { status: 500 }
//     );
//   }
// }

// // app/api/sessions/route.js
// import { NextResponse } from 'next/server';
// import connectMongoDB from '@/lib/mongodb';
// import Session from '@/models/Session';

// POST endpoint - creates or updates a session

export async function POST(req) {
    console.log('=== POST /api/concerns called ===');
    try {
      console.log('Connecting to MongoDB...');
      await connectMongoDB();
      console.log('MongoDB connected successfully');
      
      // Parse request body
      const body = await req.json();
      const { sessionId, studentId, selectedSection, sessionType, concerns } = body;
      
      // Debug logging
      console.log('POST /api/concerns - Request body:', body);
      console.log('sessionId:', sessionId);
      console.log('selectedSection (raw):', selectedSection, 'type:', typeof selectedSection);
      
      // Ensure selectedSection is a number
      const sectionNumber = parseInt(selectedSection) || 1;
      console.log('sectionNumber (parsed):', sectionNumber, 'type:', typeof sectionNumber);
      
      // Find the session or create it if it doesn't exist
      let session = await Session.findOne({ sessionId });
      console.log('Found existing session:', !!session);
      
      if (!session) {
        console.log('Creating new session with sessionId:', sessionId);
        // Create a new session if it doesn't exist
        session = new Session({
          sessionId,
          sessionType,
          activityType: "concern-cards",
          sections: [
            { sectionNumber: 1, students: [] },
            { sectionNumber: 2, students: [] },
            { sectionNumber: 3, students: [] }
          ]
        });
        console.log('New session created with sections:', session.sections ? session.sections.map(s => s.sectionNumber) : 'undefined');
      } else {
        console.log('Existing session sections:', session.sections ? session.sections.map(s => s.sectionNumber) : 'undefined');
        
        // Ensure existing sessions have all required sections
        if (!session.sections || session.sections.length === 0) {
          console.log('Existing session has no sections, initializing...');
          session.sections = [
            { sectionNumber: 1, students: [] },
            { sectionNumber: 2, students: [] },
            { sectionNumber: 3, students: [] }
          ];
        } else {
          // Make sure all three sections exist
          for (let i = 1; i <= 3; i++) {
            if (!session.sections.some(section => section.sectionNumber === i)) {
              console.log(`Adding missing section ${i}`);
              session.sections.push({ sectionNumber: i, students: [] });
            }
          }
        }
        console.log('Updated session sections:', session.sections.map(s => s.sectionNumber));
      }
      
      // Find the section
      console.log('Looking for section with sectionNumber:', sectionNumber);
      console.log('Available sections:', session.sections ? session.sections.map(s => ({ sectionNumber: s.sectionNumber, type: typeof s.sectionNumber })) : 'undefined');
      
      // Check if sections exist
      if (!session.sections || !Array.isArray(session.sections)) {
        console.log('ERROR: Session sections is undefined or not an array:', session.sections);
        return NextResponse.json(
          { message: `Session sections not properly initialized` },
          { status: 500 }
        );
      }
      
      const sectionIndex = session.sections.findIndex(
        section => section.sectionNumber === sectionNumber
      );
      console.log('Found sectionIndex:', sectionIndex);
      
      if (sectionIndex === -1) {
        console.log('ERROR: Section not found!');
        return NextResponse.json(
          { message: `Section ${sectionNumber} not found` },
          { status: 404 }
        );
      }
      
      // Find the student in the section or prepare to add them
      let studentIndex = session.sections[sectionIndex].students.findIndex(
        student => student.studentId === studentId
      );
      
      const currentTime = new Date();
      
      // Transform concerns into the required format
      const concernResponses = concerns.map((concern, index) => ({
        cardId: index + 1,
        cardText: concern.concernname,
        binAssignment: concern.binname,
        implementation: {
          implementationText: concern.response,
          timestamp: currentTime
        }
      }));
      
      if (studentIndex === -1) {
        // Add the student if they don't exist in this section
        session.sections[sectionIndex].students.push({
          studentId,
          concernResponses,
          completedAt: currentTime
        });
      } else {
        // Update the student's concern responses
        session.sections[sectionIndex].students[studentIndex].concernResponses = concernResponses;
        session.sections[sectionIndex].students[studentIndex].completedAt = currentTime;
      }
      
      // Save the session
      try {
        await session.save();
        console.log('Session saved successfully');
      } catch (saveError) {
        console.error('Error saving session:', saveError);
        throw saveError;
      }
      
      return NextResponse.json(
        { 
          message: `Concern cards added successfully to section ${sectionNumber}`,
          session: session 
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error adding concern cards:', error);
      return NextResponse.json(
        { message: 'Internal Server Error', error: error.message },
        { status: 500 }
      );
    }
  }
  


export async function GET(req) {
  try {
    await connectMongoDB();
    
    // Get URL parameters
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    const studentId = url.searchParams.get('studentId');
    const sectionNumber = url.searchParams.get('sectionNumber');
    
    // Build query based on parameters
    const query = {};
    
    // If sessionId is provided, filter by it
    if (sessionId) {
      query.sessionId = sessionId;
    }
    
    // Create a base query
    let sessionQuery = Session.find(query);
    
    // Execute the query
    let sessions = await sessionQuery.exec();
    
    // If student ID or section number provided, filter the results in memory
    // (This is more complex as these are nested in the document)
    if (studentId || sectionNumber) {
      sessions = sessions.map(session => {
        // Convert mongoose document to plain object
        const plainSession = session.toObject();
        
        // Filter sections if sectionNumber is provided
        if (sectionNumber) {
          plainSession.sections = plainSession.sections.filter(
            section => section.sectionNumber === parseInt(sectionNumber)
          );
        }
        
        // Filter students if studentId is provided
        if (studentId) {
          plainSession.sections = plainSession.sections.map(section => {
            section.students = section.students.filter(
              student => student.studentId === studentId
            );
            return section;
          });
        }
        
        return plainSession;
      });
    }
    
    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error('Error getting sessions:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE endpoint - removes a session or specific student data
export async function DELETE(req) {
  try {
    await connectMongoDB();
    
    // Get URL parameters
    const url = new URL(req.url);
    const sessionId = url.searchParams.get('sessionId');
    const studentId = url.searchParams.get('studentId');
    const sectionNumber = url.searchParams.get('sectionNumber');
    
    // Ensure sessionId is provided
    if (!sessionId) {
      return NextResponse.json(
        { message: 'sessionId is required' },
        { status: 400 }
      );
    }
    
    // If only sessionId is provided, delete the entire session
    if (!studentId && !sectionNumber) {
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
    }
    
    // If studentId or sectionNumber is provided, we need to update the session
    const session = await Session.findOne({ sessionId });
    
    if (!session) {
      return NextResponse.json(
        { message: `Session with ID ${sessionId} not found` },
        { status: 404 }
      );
    }
    
    // If sectionNumber is provided, remove that section
    if (sectionNumber && !studentId) {
      const secNum = parseInt(sectionNumber);
      const sectionIndex = session.sections.findIndex(
        section => section.sectionNumber === secNum
      );
      
      if (sectionIndex === -1) {
        return NextResponse.json(
          { message: `Section ${sectionNumber} not found in session ${sessionId}` },
          { status: 404 }
        );
      }
      
      // Remove the section
      session.sections.splice(sectionIndex, 1);
      await session.save();
      
      return NextResponse.json(
        { message: `Section ${sectionNumber} deleted from session ${sessionId}` },
        { status: 200 }
      );
    }
    
    // If both sectionNumber and studentId are provided
    if (sectionNumber && studentId) {
      const secNum = parseInt(sectionNumber);
      const sectionIndex = session.sections.findIndex(
        section => section.sectionNumber === secNum
      );
      
      if (sectionIndex === -1) {
        return NextResponse.json(
          { message: `Section ${sectionNumber} not found in session ${sessionId}` },
          { status: 404 }
        );
      }
      
      const studentIndex = session.sections[sectionIndex].students.findIndex(
        student => student.studentId === studentId
      );
      
      if (studentIndex === -1) {
        return NextResponse.json(
          { message: `Student ${studentId} not found in section ${sectionNumber}` },
          { status: 404 }
        );
      }
      
      // Remove the student from the section
      session.sections[sectionIndex].students.splice(studentIndex, 1);
      await session.save();
      
      return NextResponse.json(
        { 
          message: `Student ${studentId} deleted from section ${sectionNumber} in session ${sessionId}` 
        },
        { status: 200 }
      );
    }
    
    // If only studentId is provided, remove that student from all sections
    if (studentId && !sectionNumber) {
      let studentFound = false;
      
      // Loop through all sections and remove the student
      session.sections.forEach(section => {
        const studentIndex = section.students.findIndex(
          student => student.studentId === studentId
        );
        
        if (studentIndex !== -1) {
          section.students.splice(studentIndex, 1);
          studentFound = true;
        }
      });
      
      if (!studentFound) {
        return NextResponse.json(
          { message: `Student ${studentId} not found in any section` },
          { status: 404 }
        );
      }
      
      await session.save();
      
      return NextResponse.json(
        { message: `Student ${studentId} deleted from all sections in session ${sessionId}` },
        { status: 200 }
      );
    }
    
  } catch (error) {
    console.error('Error deleting session data:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

