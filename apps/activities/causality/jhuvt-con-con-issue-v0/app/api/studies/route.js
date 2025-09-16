import { NextResponse } from 'next/server';
import Session from '../models/Session'; // Adjust path as needed
import  connectMongoDB  from '../libs/mongodb'; // Adjust path as needed



export async function POST(req) {
  try {
    await connectMongoDB();

    const body = await req.json();
    console.log('Received POST request body:', JSON.stringify(body, null, 2));
    
    const { sessionId, studentId, selectedSection, roundNumber, roundData } = body;

    // Additional validation to ensure sessionId is not null or undefined
    if (!sessionId || sessionId === 'null' || sessionId === 'undefined') {
      return NextResponse.json(
        { 
          message: 'SessionId is required and cannot be null or undefined',
          received: { sessionId, studentId, selectedSection }
        },
        { status: 400 }
      );
    }

    if (!studentId || !selectedSection) {
      return NextResponse.json(
        { 
          message: 'Missing required fields: studentId and selectedSection are required',
          received: { sessionId, studentId, selectedSection }
        },
        { status: 400 }
      );
    }

    if (![1, 2, 3].includes(selectedSection)) {
      return NextResponse.json(
        { message: 'selectedSection must be 1, 2, or 3' },
        { status: 400 }
      );
    }

    if (roundNumber !== undefined) {
      if (!Number.isInteger(roundNumber) || roundNumber < 1) {
        return NextResponse.json(
          { message: 'roundNumber must be a positive integer (1, 2, 3, 4, ...)' },
          { status: 400 }
        );
      }

      if (roundData && typeof roundData === 'object') {
        if (roundData.option == null || roundData.response == null) {
          return NextResponse.json(
            { message: 'roundData is missing required fields: option and response' },
            { status: 400 }
          );
        }

        if (!['adequate', 'inadequate'].includes(roundData.option)) {
          return NextResponse.json(
            { message: 'Invalid option. Must be "adequate" or "inadequate"' },
            { status: 400 }
          );
        }

        if (roundData.option === 'inadequate') {
          const validCategories = [
            'Imprecise negative control',
            'Opportunity for bias',
            'Covariates imbalanced',
            'Missing positive control',
            'Risk of underpowered study',
            'Ungeneralizable sample',
            'Other'
          ];

          if (!roundData.category || !validCategories.includes(roundData.category)) {
            return NextResponse.json(
              { message: `Invalid or missing category. Required when option is 'inadequate'. Valid categories: ${validCategories.join(', ')}` },
              { status: 400 }
            );
          }
        }
      }
    }

    let session = await Session.findOne({ sessionId });
    
    if (session) {
      console.log('Found existing session with', session.sections.length, 'sections');
      let needsCleanup = false;
      
      session.sections.forEach((section, idx) => {
        console.log(`Section ${section.sectionNumber} has ${section.students.length} students:`);
        section.students.forEach((student, studentIdx) => {
          console.log(`  Student ${studentIdx}: sessionId=${student.sessionId}, studentId=${student.studentId}`);
          if (!student.sessionId) {
            console.log(`    ⚠️  Student ${studentIdx} has undefined sessionId - will fix`);
            student.sessionId = sessionId;
            needsCleanup = true;
          }
        });
      });
      
      if (needsCleanup) {
        console.log('Cleaning up students with missing sessionId...');
        await session.save();
        console.log('Cleanup completed');
      }
    }

    if (!session) {
      console.log('Creating new session with sessionId:', sessionId);
      const newSessionData = {
        sessionId,
        sessionType: 'individual',
        activityType: 'concern-cards',
        sections: [
          { sectionNumber: 1, students: [] },
          { sectionNumber: 2, students: [] },
          { sectionNumber: 3, students: [] }
        ]
      };
      console.log('New session data structure:', JSON.stringify(newSessionData, null, 2));
      
      session = new Session(newSessionData);
      console.log('Created Session object, about to save...');

      await session.save();
      console.log('Session saved successfully');
    }

    const sectionIndex = session.sections.findIndex(
      section => section.sectionNumber === selectedSection
    );

    if (sectionIndex === -1) {
      return NextResponse.json(
        { message: `Section ${selectedSection} not found` },
        { status: 404 }
      );
    }

    let studentIndex = session.sections[sectionIndex].students.findIndex(
      student => student.studentId === studentId
    );

    if (studentIndex === -1) {
      console.log('Adding new student with sessionId:', sessionId);
      const newStudent = {
        sessionId,
        studentId,
        concernResponses: [],
        rounds: {},
        completedAt: null
      };
      console.log('New student object:', JSON.stringify(newStudent, null, 2));
      
      session.sections[sectionIndex].students.push(newStudent);
      studentIndex = session.sections[sectionIndex].students.length - 1;
      
      console.log('Student added at index:', studentIndex);
      console.log('Student in array:', JSON.stringify(session.sections[sectionIndex].students[studentIndex], null, 2));
    }

    const student = session.sections[sectionIndex].students[studentIndex];

    if (!student.rounds) {
      student.rounds = {};
    }

    if (roundNumber === undefined) {
      if (Object.keys(student.rounds).length === 0) {
        student.rounds = {
          round1: { option: '', response: '', category: null },
          round2: { option: '', response: '', category: null },
          round3: { option: '', response: '', category: null }
        };
      }

      session.markModified(`sections.${sectionIndex}.students.${studentIndex}.rounds`);

      await session.save();

      return NextResponse.json(
        {
          message: `Blank rounds initialized successfully for student ${studentId} in section ${selectedSection}`,
          data: {
            sessionId,
            studentId,
            selectedSection,
            rounds: student.rounds,
            createdAt: new Date().toISOString()
          }
        },
        { status: 200 }
      );
    }

    const roundKey = `round${roundNumber}`;

    if (roundData) {
      student.rounds[roundKey] = {
        option: roundData.option,
        response: roundData.response,
        category: roundData.option === 'inadequate' ? roundData.category : null
      };

      console.log(`Updated ${roundKey} for student ${studentId}`);
    } else {
      if (!student.rounds[roundKey]) {
        student.rounds[roundKey] = { option: '', response: '', category: null };
        console.log(`Created blank ${roundKey} for student ${studentId}`);
      } else {
        console.log(`${roundKey} already exists for student ${studentId}, no changes made`);
      }
    }

    session.markModified(`sections.${sectionIndex}.students.${studentIndex}.rounds`);

    await session.save();

    const action = roundData ? 'updated' : 'initialized';
    const responseMessage = `Round ${roundNumber} ${action} successfully for student ${studentId} in section ${selectedSection}`;

    return NextResponse.json(
      {
        message: responseMessage,
        data: {
          sessionId,
          studentId,
          selectedSection,
          roundNumber,
          updatedRound: student.rounds[roundKey],
          allRounds: student.rounds,
          action,
          updatedAt: new Date().toISOString()
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating rounds:', error);

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        {
          message: 'Validation error',
          details: Object.values(error.errors).map(err => err.message)
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

//comments and console logs to debug the POST request
// export async function POST(req) {
//   try {
//     await connectMongoDB();

//     const body = await req.json();
//     console.log('1. Received request body:', JSON.stringify(body, null, 2));
    
//     const { sessionId, studentId, selectedSection, roundNumber, roundData } = body;
    
//     console.log('2. Extracted values:', {
//       sessionId,
//       studentId,
//       selectedSection,
//       roundNumber,
//       roundData
//     });

//     // Validation
//     if (!sessionId || !studentId || !selectedSection) {
//       console.log('3. Missing required fields validation failed');
//       return NextResponse.json(
//         { message: 'Missing required fields: sessionId, studentId, and selectedSection are required' },
//         { status: 400 }
//       );
//     }

//     if (![1, 2, 3].includes(selectedSection)) {
//       console.log('4. Invalid selectedSection validation failed');
//       return NextResponse.json(
//         { message: 'selectedSection must be 1, 2, or 3' },
//         { status: 400 }
//       );
//     }

//     if (roundNumber !== undefined) {
//       if (!Number.isInteger(roundNumber) || roundNumber < 1) {
//         console.log('5. Invalid roundNumber validation failed');
//         return NextResponse.json(
//           { message: 'roundNumber must be a positive integer (1, 2, 3, 4, ...)' },
//           { status: 400 }
//         );
//       }

//       if (roundData && typeof roundData === 'object') {
//         if (roundData.option == null || roundData.response == null) {
//           console.log('6. Missing roundData fields validation failed');
//           return NextResponse.json(
//             { message: 'roundData is missing required fields: option and response' },
//             { status: 400 }
//           );
//         }

//         if (!['adequate', 'inadequate'].includes(roundData.option)) {
//           console.log('7. Invalid roundData option validation failed');
//           return NextResponse.json(
//             { message: 'Invalid option. Must be "adequate" or "inadequate"' },
//             { status: 400 }
//           );
//         }

//         if (roundData.option === 'inadequate') {
//           const validCategories = [
//             'Imprecise negative control',
//             'Opportunity for bias',
//             'Covariates imbalanced',
//             'Missing positive control',
//             'Risk of underpowered study',
//             'Ungeneralizable sample',
//             'Other'
//           ];

//           if (!roundData.category || !validCategories.includes(roundData.category)) {
//             console.log('8. Invalid category validation failed');
//             return NextResponse.json(
//               { message: `Invalid or missing category. Required when option is 'inadequate'. Valid categories: ${validCategories.join(', ')}` },
//               { status: 400 }
//             );
//           }
//         }
//       }
//     }

//     console.log('9. All input validations passed');

//     let session = await Session.findOne({ sessionId });
//     console.log('10. Found existing session:', session ? 'YES' : 'NO');

//     if (!session) {
//       console.log('11. Creating new session...');
//       const newSessionData = {
//         sessionId,
//         sessionType: 'individual',
//         activityType: 'concern-cards',
//         sections: [
//           { sectionNumber: 1, students: [] },
//           { sectionNumber: 2, students: [] },
//           { sectionNumber: 3, students: [] }
//         ]
//       };
      
//       console.log('12. New session data:', JSON.stringify(newSessionData, null, 2));
      
//       session = new Session(newSessionData);
      
//       // Validate before saving
//       console.log('13. Validating new session...');
//       const validationError = session.validateSync();
//       if (validationError) {
//         console.error('14. NEW SESSION Validation error:', validationError);
//         console.error('15. Validation error details:', JSON.stringify(validationError.errors, null, 2));
//         return NextResponse.json(
//           {
//             message: 'New session validation failed',
//             details: Object.keys(validationError.errors).map(key => ({
//               field: key,
//               message: validationError.errors[key].message,
//               value: validationError.errors[key].value
//             }))
//           },
//           { status: 400 }
//         );
//       }
      
//       console.log('16. Saving new session...');
//       await session.save();
//       console.log('17. New session saved successfully');
//     }

//     const sectionIndex = session.sections.findIndex(
//       section => section.sectionNumber === selectedSection
//     );

//     if (sectionIndex === -1) {
//       console.log('18. Section not found');
//       return NextResponse.json(
//         { message: `Section ${selectedSection} not found` },
//         { status: 404 }
//       );
//     }

//     console.log('19. Found section at index:', sectionIndex);

//     let studentIndex = session.sections[sectionIndex].students.findIndex(
//       student => student.studentId === studentId
//     );

//     console.log('20. Student index:', studentIndex);

//     if (studentIndex === -1) {
//       console.log('21. Creating new student...');
//       const newStudent = {
//         sessionId,
//         studentId,
//         concernResponses: [],
//         rounds: {},
//         completedAt: null
//       };
      
//       console.log('22. New student data:', JSON.stringify(newStudent, null, 2));
      
//       session.sections[sectionIndex].students.push(newStudent);
//       studentIndex = session.sections[sectionIndex].students.length - 1;
//       console.log('23. Student added at index:', studentIndex);
//     }

//     const student = session.sections[sectionIndex].students[studentIndex];
//     console.log('24. Current student:', JSON.stringify(student, null, 2));

//     if (!student.rounds) {
//       console.log('25. Initializing student.rounds object');
//       student.rounds = {};
//     }

//     if (roundNumber === undefined) {
//       console.log('26. Processing roundNumber === undefined case');
      
//       if (Object.keys(student.rounds).length === 0) {
//         console.log('27. Creating empty round objects...');
        
//         const emptyRounds = {
//           round1: { option: '', response: '', category: null },
//           round2: { option: '', response: '', category: null },
//           round3: { option: '', response: '', category: null }
//         };
        
//         console.log('28. Empty rounds to be assigned:', JSON.stringify(emptyRounds, null, 2));
        
//         student.rounds = emptyRounds;
        
//         console.log('29. Student.rounds after assignment:', JSON.stringify(student.rounds, null, 2));
//       } else {
//         console.log('30. Student already has rounds:', JSON.stringify(student.rounds, null, 2));
//       }

//       console.log('31. Marking modified...');
//       session.markModified(`sections.${sectionIndex}.students.${studentIndex}.rounds`);
      
//       console.log('32. About to save session with initialized rounds...');
      
//       // Log the full session structure to see what's being saved
//       console.log('33. Full session structure before save:');
//       console.log('33a. Session ID:', session.sessionId);
//       console.log('33b. Session Type:', session.sessionType);
//       console.log('33c. Activity Type:', session.activityType);
//       console.log('33d. Sections length:', session.sections.length);
//       console.log('33e. Target section:', JSON.stringify(session.sections[sectionIndex], null, 2));
      
//       // Validate before saving
//       console.log('34. Validating session before save...');
//       const validationError = session.validateSync();
//       if (validationError) {
//         console.error('35. ROUNDS INIT Validation error:', validationError);
//         console.error('36. Validation error name:', validationError.name);
//         console.error('37. Validation error message:', validationError.message);
//         console.error('38. Validation error details:');
        
//         Object.keys(validationError.errors).forEach(key => {
//           const error = validationError.errors[key];
//           console.error(`    Field: ${key}`);
//           console.error(`    Message: ${error.message}`);
//           console.error(`    Value: ${JSON.stringify(error.value)}`);
//           console.error(`    Path: ${error.path}`);
//           console.error(`    Kind: ${error.kind}`);
//         });
        
//         return NextResponse.json(
//           {
//             message: 'Rounds initialization validation failed',
//             details: Object.keys(validationError.errors).map(key => ({
//               field: key,
//               path: validationError.errors[key].path,
//               message: validationError.errors[key].message,
//               value: validationError.errors[key].value,
//               kind: validationError.errors[key].kind
//             }))
//           },
//           { status: 400 }
//         );
//       }

//       console.log('39. Validation passed, saving session...');
//       await session.save();
//       console.log('40. Session saved successfully with initialized rounds');

//       return NextResponse.json(
//         {
//           message: `Blank rounds initialized successfully for student ${studentId} in section ${selectedSection}`,
//           data: {
//             sessionId,
//             studentId,
//             selectedSection,
//             rounds: student.rounds,
//             createdAt: new Date().toISOString()
//           }
//         },
//         { status: 200 }
//       );
//     }

//     // Handle specific round updates
//     console.log('41. Processing specific round update...');
//     const roundKey = `round${roundNumber}`;

//     if (roundData) {
//       console.log('42. Updating round with data:', JSON.stringify(roundData, null, 2));
//       student.rounds[roundKey] = {
//         option: roundData.option,
//         response: roundData.response,
//         category: roundData.option === 'inadequate' ? roundData.category : null
//       };

//       console.log(`43. Updated ${roundKey} for student ${studentId}`);
//     } else {
//       if (!student.rounds[roundKey]) {
//         console.log('44. Creating blank round');
//         student.rounds[roundKey] = { option: '', response: '', category: null };
//         console.log(`45. Created blank ${roundKey} for student ${studentId}`);
//       } else {
//         console.log(`46. ${roundKey} already exists for student ${studentId}, no changes made`);
//       }
//     }

//     console.log('47. Marking modified for specific round update...');
//     session.markModified(`sections.${sectionIndex}.students.${studentIndex}.rounds`);

//     console.log('48. About to save session with round update...');
    
//     // Validate before saving
//     const finalValidationError = session.validateSync();
//     if (finalValidationError) {
//       console.error('49. FINAL Validation error:', finalValidationError);
//       console.error('50. Final validation error details:', JSON.stringify(finalValidationError.errors, null, 2));
//       return NextResponse.json(
//         {
//           message: 'Final validation failed',
//           details: Object.keys(finalValidationError.errors).map(key => ({
//             field: key,
//             message: finalValidationError.errors[key].message,
//             value: finalValidationError.errors[key].value
//           }))
//         },
//         { status: 400 }
//       );
//     }

//     await session.save();
//     console.log('51. Final save successful');

//     const action = roundData ? 'updated' : 'initialized';
//     const responseMessage = `Round ${roundNumber} ${action} successfully for student ${studentId} in section ${selectedSection}`;

//     return NextResponse.json(
//       {
//         message: responseMessage,
//         data: {
//           sessionId,
//           studentId,
//           selectedSection,
//           roundNumber,
//           updatedRound: student.rounds[roundKey],
//           allRounds: student.rounds,
//           action,
//           updatedAt: new Date().toISOString()
//         }
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error('MAIN CATCH Error:', error);
//     console.error('Error name:', error.name);
//     console.error('Error message:', error.message);
//     console.error('Error stack:', error.stack);

//     if (error.name === 'ValidationError') {
//       console.error('CATCH Validation Error Details:');
//       Object.keys(error.errors).forEach(key => {
//         const err = error.errors[key];
//         console.error(`  Field: ${key}`);
//         console.error(`  Message: ${err.message}`);
//         console.error(`  Value: ${JSON.stringify(err.value)}`);
//         console.error(`  Path: ${err.path}`);
//         console.error(`  Kind: ${err.kind}`);
//       });
      
//       return NextResponse.json(
//         {
//           message: 'Validation error',
//           details: Object.values(error.errors).map(err => ({
//             field: err.path,
//             message: err.message,
//             value: err.value,
//             kind: err.kind
//           }))
//         },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { message: 'Internal Server Error', error: error.message },
//       { status: 500 }
//     );
//   }
// }

//delete api to delete individual sessions with sessionid as query params
// export async function DELETE(req) {
//   try {
//     await connectMongoDB();

//     // Get sessionId from query parameters or request body
//     const url = new URL(req.url);
//     const sessionId = url.searchParams.get('sessionId');
    
//     // Alternative: get from request body if not in query params
//     let bodySessionId = null;
//     try {
//       const body = await req.json();
//       bodySessionId = body.sessionId;
//     } catch (error) {
//       // No body or invalid JSON, that's fine
//     }

//     const targetSessionId = sessionId || bodySessionId;

//     console.log('DELETE request - sessionId:', targetSessionId);

//     if (!targetSessionId) {
//       return NextResponse.json(
//         { 
//           message: 'sessionId is required. Provide it as query parameter (?sessionId=individual1) or in request body.' 
//         },
//         { status: 400 }
//       );
//     }

//     // Check if session exists
//     const existingSession = await Session.findOne({ sessionId: targetSessionId });
    
//     if (!existingSession) {
//       return NextResponse.json(
//         { 
//           message: `Session with sessionId '${targetSessionId}' not found.` 
//         },
//         { status: 404 }
//       );
//     }

//     console.log(`Found session '${targetSessionId}' with ${existingSession.sections.length} sections`);
    
//     // Log some details about what we're deleting
//     let totalStudents = 0;
//     existingSession.sections.forEach((section, index) => {
//       console.log(`Section ${section.sectionNumber}: ${section.students.length} students`);
//       totalStudents += section.students.length;
//     });
//     console.log(`Total students in session: ${totalStudents}`);

//     // Delete the session
//     const deleteResult = await Session.deleteOne({ sessionId: targetSessionId });

//     console.log('Delete result:', deleteResult);

//     if (deleteResult.deletedCount === 0) {
//       return NextResponse.json(
//         { 
//           message: `Failed to delete session '${targetSessionId}'. It may have been already deleted.` 
//         },
//         { status: 404 }
//       );
//     }

//     return NextResponse.json(
//       {
//         message: `Session '${targetSessionId}' deleted successfully.`,
//         data: {
//           sessionId: targetSessionId,
//           deletedCount: deleteResult.deletedCount,
//           sectionsDeleted: existingSession.sections.length,
//           studentsDeleted: totalStudents,
//           deletedAt: new Date().toISOString()
//         }
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error('Error deleting session:', error);
    
//     return NextResponse.json(
//       { 
//         message: 'Internal Server Error', 
//         error: error.message 
//       },
//       { status: 500 }
//     );
//   }
// }

// DELETE API to delete all sessions data
export async function DELETE(req) {
  try {
    await connectMongoDB();

    // Get the action from query parameters
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const confirm = url.searchParams.get('confirm');
    
    // Alternative: get from request body
    let bodyAction = null;
    let bodyConfirm = null;
    try {
      const body = await req.json();
      bodyAction = body.action;
      bodyConfirm = body.confirm;
    } catch (error) {
      // No body or invalid JSON, that's fine
    }

    const targetAction = action || bodyAction;
    const confirmValue = confirm || bodyConfirm;

    console.log('DELETE request - action:', targetAction, 'confirm:', confirmValue);

    // Handle single session deletion
    if (!targetAction || targetAction === 'single') {
      const sessionId = url.searchParams.get('sessionId') || (bodyAction ? null : bodyConfirm);
      
      if (!sessionId) {
        return NextResponse.json(
          { 
            message: 'For single session deletion, provide sessionId as query parameter (?sessionId=individual1) or in request body.' 
          },
          { status: 400 }
        );
      }

      // Check if session exists
      const existingSession = await Session.findOne({ sessionId: sessionId });
      
      if (!existingSession) {
        return NextResponse.json(
          { 
            message: `Session with sessionId '${sessionId}' not found.` 
          },
          { status: 404 }
        );
      }

      console.log(`Found session '${sessionId}' with ${existingSession.sections.length} sections`);
      
      // Log details about what we're deleting
      let totalStudents = 0;
      existingSession.sections.forEach((section) => {
        console.log(`Section ${section.sectionNumber}: ${section.students.length} students`);
        totalStudents += section.students.length;
      });
      console.log(`Total students in session: ${totalStudents}`);

      // Delete the session
      const deleteResult = await Session.deleteOne({ sessionId: sessionId });

      console.log('Delete result:', deleteResult);

      if (deleteResult.deletedCount === 0) {
        return NextResponse.json(
          { 
            message: `Failed to delete session '${sessionId}'. It may have been already deleted.` 
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          message: `Session '${sessionId}' deleted successfully.`,
          data: {
            sessionId: sessionId,
            deletedCount: deleteResult.deletedCount,
            sectionsDeleted: existingSession.sections.length,
            studentsDeleted: totalStudents,
            deletedAt: new Date().toISOString()
          }
        },
        { status: 200 }
      );
    }

    // Handle delete all sessions
    if (targetAction === 'all') {
      // Safety check - require explicit confirmation
      if (confirmValue !== 'yes' && confirmValue !== 'true') {
        return NextResponse.json(
          {
            message: 'DANGEROUS OPERATION: To delete ALL sessions, you must provide confirm=yes or confirm=true',
            warning: 'This will permanently delete all session data!',
            usage: {
              queryParam: 'DELETE /api/studies?action=all&confirm=yes',
              requestBody: '{ "action": "all", "confirm": "yes" }'
            }
          },
          { status: 400 }
        );
      }

      console.log('⚠️  DELETE ALL SESSIONS REQUESTED - Getting current data stats...');

      // Get statistics before deletion
      const allSessions = await Session.find({});
      const totalSessions = allSessions.length;
      
      let totalSections = 0;
      let totalStudents = 0;
      let totalRounds = 0;
      let totalConcernResponses = 0;

      console.log(`Found ${totalSessions} sessions to delete:`);
      
      allSessions.forEach((session, index) => {
        console.log(`Session ${index + 1}: ${session.sessionId}`);
        totalSections += session.sections.length;
        
        session.sections.forEach((section, sectionIndex) => {
          console.log(`  Section ${section.sectionNumber}: ${section.students.length} students`);
          totalStudents += section.students.length;
          
          section.students.forEach((student) => {
            totalConcernResponses += student.concernResponses.length;
            if (student.rounds) {
              totalRounds += Object.keys(student.rounds).length;
            }
          });
        });
      });

      console.log('📊 DELETION STATS:');
      console.log(`- Sessions: ${totalSessions}`);
      console.log(`- Sections: ${totalSections}`);
      console.log(`- Students: ${totalStudents}`);
      console.log(`- Rounds: ${totalRounds}`);
      console.log(`- Concern Responses: ${totalConcernResponses}`);

      // Perform the deletion
      console.log('🗑️  DELETING ALL SESSIONS...');
      const deleteResult = await Session.deleteMany({});
      
      console.log('✅ Deletion completed:', deleteResult);

      return NextResponse.json(
        {
          message: '🚨 ALL SESSIONS DELETED SUCCESSFULLY! 🚨',
          warning: 'All session data has been permanently removed from the database.',
          statistics: {
            sessionsDeleted: totalSessions,
            sectionsDeleted: totalSections,
            studentsDeleted: totalStudents,
            roundsDeleted: totalRounds,
            concernResponsesDeleted: totalConcernResponses,
            mongoDeleteCount: deleteResult.deletedCount
          },
          deletedAt: new Date().toISOString()
        },
        { status: 200 }
      );
    }

    // Invalid action
    return NextResponse.json(
      {
        message: 'Invalid action. Use one of the following:',
        options: {
          deleteSingle: {
            description: 'Delete a specific session',
            usage: 'DELETE /api/studies?sessionId=individual1'
          },
          deleteAll: {
            description: 'Delete ALL sessions (requires confirmation)',
            usage: 'DELETE /api/studies?action=all&confirm=yes',
            warning: '⚠️  This will permanently delete ALL data!'
          }
        }
      },
      { status: 400 }
    );

  } catch (error) {
    console.error('❌ Error in DELETE operation:', error);
    
    return NextResponse.json(
      { 
        message: 'Internal Server Error', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}






export async function GET(req) {
    try {
      await connectMongoDB();
      
      // Parse query parameters from URL
      const { searchParams } = new URL(req.url);
      const sessionId = searchParams.get('sessionId');
      const studentId = searchParams.get('studentId');
      const selectedSection = parseInt(searchParams.get('selectedSection'));
      
      // Validate required fields - only sessionId and selectedSection are required now
      if (!sessionId || !selectedSection) {
        return NextResponse.json(
          { message: 'Missing required query parameters: sessionId and selectedSection' },
          { status: 400 }
        );
      }
      
      // Validate selectedSection
      if (![1, 2, 3].includes(selectedSection)) {
        return NextResponse.json(
          { message: 'selectedSection must be 1, 2, or 3' },
          { status: 400 }
        );
      }
      
      // Find the session
      let session = await Session.findOne({ sessionId });
      if (!session) {
        return NextResponse.json(
          { message: `Session ${sessionId} not found` },
          { status: 404 }
        );
      }
      
      // Find the section
      const sectionIndex = session.sections.findIndex(
        section => section.sectionNumber === selectedSection
      );
      if (sectionIndex === -1) {
        return NextResponse.json(
          { message: `Section ${selectedSection} not found` },
          { status: 404 }
        );
      }
      
      // If studentId is provided, return data for specific student
      if (studentId) {
        let studentIndex = session.sections[sectionIndex].students.findIndex(
          student => student.studentId === studentId
        );
        if (studentIndex === -1) {
          return NextResponse.json(
            { message: `Student ${studentId} not found in section ${selectedSection}` },
            { status: 404 }
          );
        }
        
        const student = session.sections[sectionIndex].students[studentIndex];
        
        return NextResponse.json(
          {
            message: 'Student rounds data retrieved successfully',
            data: {
              sessionId,
              studentId,
              selectedSection,
              rounds: student.rounds || {
                round1: { option: '', response: '', category: null },
                round2: { option: '', response: '', category: null },
                round3: { option: '', response: '', category: null }
              },
              completedAt: student.completedAt
            }
          },
          { status: 200 }
        );
      }
      
      // If no studentId provided, return data for all students in the section
      const allStudents = session.sections[sectionIndex].students.map(student => ({
        studentId: student.studentId,
        rounds: student.rounds || {
          round1: { option: '', response: '', category: null },
          round2: { option: '', response: '', category: null },
          round3: { option: '', response: '', category: null }
        },
        completedAt: student.completedAt
      }));
      
      return NextResponse.json(
        {
          message: 'All students rounds data retrieved successfully',
          data: {
            sessionId,
            selectedSection,
            totalStudents: allStudents.length,
            students: allStudents
          }
        },
        { status: 200 }
      );
      
    } catch (error) {
      console.error('Error retrieving rounds:', error);
      return NextResponse.json(
        { message: 'Internal Server Error', error: error.message },
        { status: 500 }
      );
    }
}



// Alternative: Create a separate POST endpoint for retrieving data
export async function PATCH(req) {
  try {
    await connectMongoDB();
    
    // Parse request body
    const body = await req.json();
    const { sessionId, studentId, selectedSection } = body;
    
    // Validate required fields
    if (!sessionId || !studentId || !selectedSection) {
      return NextResponse.json(
        { message: 'Missing required fields in request body: sessionId, studentId, and selectedSection' },
        { status: 400 }
      );
    }

    // Validate selectedSection
    if (![1, 2, 3].includes(selectedSection)) {
      return NextResponse.json(
        { message: 'selectedSection must be 1, 2, or 3' },
        { status: 400 }
      );
    }
    
    // Find the session
    let session = await Session.findOne({ sessionId });
    
    if (!session) {
      return NextResponse.json(
        { message: `Session ${sessionId} not found` },
        { status: 404 }
      );
    }
    
    // Find the section
    const sectionIndex = session.sections.findIndex(
      section => section.sectionNumber === selectedSection
    );
    
    if (sectionIndex === -1) {
      return NextResponse.json(
        { message: `Section ${selectedSection} not found` },
        { status: 404 }
      );
    }
    
    // Find the student in the section
    let studentIndex = session.sections[sectionIndex].students.findIndex(
      student => student.studentId === studentId
    );
    
    if (studentIndex === -1) {
      return NextResponse.json(
        { message: `Student ${studentId} not found in section ${selectedSection}` },
        { status: 404 }
      );
    }
    
    // Get the student data
    const student = session.sections[sectionIndex].students[studentIndex];
    
    return NextResponse.json(
      {
        message: 'Rounds data retrieved successfully',
        data: {
          sessionId,
          studentId,
          selectedSection,
          rounds: student.rounds || {
            round1: { option: '', response: '', category: null },
            round2: { option: '', response: '', category: null },
            round3: { option: '', response: '', category: null }
          },
          completedAt: student.completedAt
        }
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error retrieving rounds:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}

/*
Usage Examples:

POST Request Body Examples:

Example 1 - First request (creates round 1):
```json
{
  "sessionId": "session123",
  "studentId": "student456",
  "selectedSection": 1,
  "roundNumber": 1,
  "roundData": {
    "option": "adequate",
    "response": "The methodology appears sound."
  }
}
```

Example 2 - Update same round 1 (updates existing round 1):
```json
{
  "sessionId": "session123",
  "studentId": "student456",
  "selectedSection": 1,
  "roundNumber": 1,
  "roundData": {
    "option": "inadequate",
    "response": "Actually, I found some issues with the methodology.",
    "category": "Opportunity for bias"
  }
}
```

Example 3 - Add new round 2 (creates round 2):
```json
{
  "sessionId": "session123",
  "studentId": "student456",
  "selectedSection": 1,
  "roundNumber": 2,
  "roundData": {
    "option": "adequate",
    "response": "After discussion, this looks better."
  }
}
```

Example 4 - Add new round 4 (creates round 4 - any number):
```json
{
  "sessionId": "session123",
  "studentId": "student456",
  "selectedSection": 1,
  "roundNumber": 4,
  "roundData": {
    "option": "inadequate",
    "response": "Additional concerns discovered.",
    "category": "Risk of underpowered study"
  }
}
```

GET Request Body Example:
```json
{
  "sessionId": "session123",
  "studentId": "student456",
  "selectedSection": 1
}
```

Success Response Examples:

1. Creating new round:
```json
{
  "message": "Round 1 updated successfully for student student456 in section 1",
  "data": {
    "sessionId": "session123",
    "studentId": "student456",
    "selectedSection": 1,
    "roundNumber": 1,
    "updatedRound": {
      "option": "adequate",
      "response": "The methodology appears sound.",
      "category": null
    },
    "allRounds": {
      "round1": {
        "option": "adequate",
        "response": "The methodology appears sound.",
        "category": null
      }
    },
    "action": "updated",
    "updatedAt": "2025-05-22T10:30:00.000Z"
  }
}
```

2. Updating existing round:
```json
{
  "message": "Round 1 updated successfully for student student456 in section 1",
  "data": {
    "sessionId": "session123",
    "studentId": "student456",
    "selectedSection": 1,
    "roundNumber": 1,
    "updatedRound": {
      "option": "inadequate",
      "response": "Actually, I found some issues.",
      "category": "Opportunity for bias"
    },
    "allRounds": {
      "round1": {
        "option": "inadequate",
        "response": "Actually, I found some issues.",
        "category": "Opportunity for bias"
      }
    },
    "action": "updated",
    "updatedAt": "2025-05-22T10:35:00.000Z"
  }
}
```

3. Adding new round number:
```json
{
  "message": "Round 4 updated successfully for student student456 in section 1",
  "data": {
    "sessionId": "session123",
    "studentId": "student456",
    "selectedSection": 1,
    "roundNumber": 4,
    "updatedRound": {
      "option": "adequate",
      "response": "This is a new round.",
      "category": null
    },
    "allRounds": {
      "round1": {
        "option": "inadequate",
        "response": "Actually, I found some issues.",
        "category": "Opportunity for bias"
      },
      "round4": {
        "option": "adequate",
        "response": "This is a new round.",
        "category": null
      }
    },
    "action": "updated",
    "updatedAt": "2025-05-22T10:40:00.000Z"
  }
}
```

Success Response (GET):
{
  "message": "Rounds data retrieved successfully",
  "data": {
    "sessionId": "session123",
    "studentId": "student456",
    "selectedSection": 1,
    "rounds": {
      "round1": {
        "option": "adequate",
        "response": "The methodology appears sound and well-designed."
      }
    },
    "completedAt": "2025-05-22T10:25:00.000Z"
  }
}

Error Response Examples:
{
  "message": "Missing required fields: sessionId, studentId, and selectedSection are required"
}

{
  "message": "roundNumber must be 1, 2, or 3"
}

{
  "message": "Student student456 not found in section 1"
}

{
  "message": "Invalid option. Must be \"adequate\" or \"inadequate\""
}
*/