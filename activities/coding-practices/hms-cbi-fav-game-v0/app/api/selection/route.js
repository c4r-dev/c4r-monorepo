 import { NextResponse } from 'next/server';
import connectMongoDB from '../libs/mongodb'; // Adjust the import path as needed
import Selection from '../models/selection'; // Adjust the import path to your Session model

// export async function POST(req) {
//   try {
//     // Connect to MongoDB
//     await connectMongoDB();

//     // Parse the request body
//     const body = await req.json();
//     const { sessionId, subsessionId, roundsData } = body;

//     // Validate required fields
//     if (!sessionId || !subsessionId || !roundsData) {
//       return NextResponse.json(
//         { message: 'Missing required fields: sessionId, subsessionId, or roundsData.' },
//         { status: 400 }
//       );
//     }

//     // Validate that roundsData is an array of exactly 4 rounds
//     if (!Array.isArray(roundsData) || roundsData.length !== 4) {
//       return NextResponse.json(
//         { message: 'roundsData must be an array of exactly 4 rounds.' },
//         { status: 400 }
//       );
//     }

//     // Find the session document by sessionId
//     let sessionDoc = await Selections.findOne({ sessionId });
//     if (!sessionDoc) {
//       // Create a new session document if one doesn't exist
//       sessionDoc = new Selections({
//         sessionId,
//         subsessions: []
//       });
//     }

//     // Check if the subsession already exists
//     const subsessionIndex = sessionDoc.subsessions.findIndex(
//       (ss) => ss.subsessionId === subsessionId
//     );

//     if (subsessionIndex === -1) {
//       // If the subsession doesn't exist, add it with the roundsData
//       sessionDoc.subsessions.push({
//         subsessionId,
//         rounds: roundsData
//       });
//     } else {
//       // If the subsession exists, update its rounds
//       sessionDoc.subsessions[subsessionIndex].rounds = roundsData;
//     }

//     // Save the updated session document
//     await sessionDoc.save();

//     // Return the updated document as the response
//     return NextResponse.json(sessionDoc);
//   } catch (error) {
//     console.error('Error handling POST request:', error);
//     return NextResponse.json(
//       { message: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }

// export async function GET(req) {
//     try {
//       // Connect to MongoDB
//       await connectMongoDB();
  
//       // Extract query parameters from the request URL
//       const { searchParams } = new URL(req.url);
//       const sessionId = searchParams.get('sessionId');
  
//       // Validate that sessionId is provided
//       if (!sessionId) {
//         return NextResponse.json(
//           { message: 'Missing required query parameter: sessionId.' },
//           { status: 400 }
//         );
//       }
  
//       // Find the session document by sessionId
//       const sessionDoc = await Selection.findOne({ sessionId });
//       if (!sessionDoc) {
//         return NextResponse.json(
//           { message: `Session with sessionId "${sessionId}" not found.` },
//           { status: 404 }
//         );
//       }
  
//       // Return the found document
//       return NextResponse.json(sessionDoc);
//     } catch (error) {
//       console.error('Error handling GET request:', error);
//       return NextResponse.json(
//         { message: 'Internal Server Error' },
//         { status: 500 }
//       );
//     }
//   }


// export async function GET(req) {
//   try {
//     // Connect to MongoDB
//     await connectMongoDB();

//     // Fetch all documents from the Selection collection
//     const allSessions = await Selection.find();

//     // Check if there is any data
//     if (!allSessions || allSessions.length === 0) {
//       return NextResponse.json(
//         { message: 'No data found in the database.' },
//         { status: 404 }
//       );
//     }

//     // Return all the documents
//     return NextResponse.json(allSessions);
//   } catch (error) {
//     console.error('Error handling GET request:', error);
//     return NextResponse.json(
//       { message: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }


export async function GET(req) {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Extract query parameters from the request URL
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // If sessionId is provided, fetch the specific session
      const sessionDoc = await Selection.findOne({ sessionId });

      if (!sessionDoc) {
        return NextResponse.json(
          { message: `Session with sessionId "${sessionId}" not found.` },
          { status: 404 }
        );
      }

      return NextResponse.json(sessionDoc);
    } else {
      // If no sessionId is provided, fetch all sessions
      const allSessions = await Selection.find();

      if (!allSessions || allSessions.length === 0) {
        return NextResponse.json(
          { message: 'No data found in the database.' },
          { status: 404 }
        );
      }

      return NextResponse.json(allSessions);
    }
  } catch (error) {
    console.error('Error handling GET request:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}


// app/api/session/route.js
// import { NextResponse } from 'next/server';

// export async function POST(req) {
//   // Minimal POST handler for testing
//   const body = await req.json();
//   console.log('Request body:', body);
//   return NextResponse.json({ message: 'POST route works', received: body });
// }


// export async function POST(req) {
//   try {
//     await connectMongoDB();

//     // Parse the request body
//     const body = await req.json();
//     const { sessionId, subsessionId, roundsData, biasText } = body;

//     console.log('Received body:', { sessionId, subsessionId, roundsData, biasText });

//     // Always require sessionId and subsessionId.
//     if (!sessionId || !subsessionId) {
//       return NextResponse.json(
//         { message: 'Missing required fields: sessionId or subsessionId.' },
//         { status: 400 }
//       );
//     }

//     // Find the document for the given sessionId.
//     let selectionsDoc = await Selection.findOne({ sessionId });
//     console.log('Before update, document:', selectionsDoc);
//     if (!selectionsDoc) {
//       // If the document does not exist, we require roundsData.
//       if (!roundsData) {
//         return NextResponse.json(
//           { message: 'Missing required field: roundsData is required for creating a new document.' },
//           { status: 400 }
//         );
//       }
//       if (!Array.isArray(roundsData) || roundsData.length !== 4) {
//         return NextResponse.json(
//           { message: 'roundsData must be an array of exactly 4 rounds.' },
//           { status: 400 }
//         );
//       }
//       // Create a new document with one subsession.
//       selectionsDoc = new Selection({
//         sessionId,
//         subsessions: [{
//           subsessionId,
//           rounds: roundsData,
//           biasText: biasText || ""
//         }]
//       });
//     } else {
//       // Document exists. Look for an existing subsession.
//       const subsessionIndex = selectionsDoc.subsessions.findIndex(
//         (ss) => ss.subsessionId === subsessionId
//       );

//       if (subsessionIndex === -1) {
//         // Subsession does not exist. To create a new subsession, roundsData is required.
//         if (!roundsData) {
//           return NextResponse.json(
//             { message: 'Missing required field: roundsData is required to create a new subsession.' },
//             { status: 400 }
//           );
//         }
//         if (!Array.isArray(roundsData) || roundsData.length !== 4) {
//           return NextResponse.json(
//             { message: 'roundsData must be an array of exactly 4 rounds.' },
//             { status: 400 }
//           );
//         }
//         selectionsDoc.subsessions.push({
//           subsessionId,
//           rounds: roundsData,
//           biasText: biasText || ""
//         });
//       } else {
//         // Subsession exists—update its biasText if provided.
//         if (biasText !== undefined) {
//           selectionsDoc.subsessions[subsessionIndex].biasText = biasText;
//           console.log('Updated biasText to:', biasText);
//         }
//         // Optionally update roundsData if provided.
//         if (roundsData) {
//           if (!Array.isArray(roundsData) || roundsData.length !== 4) {
//             return NextResponse.json(
//               { message: 'roundsData must be an array of exactly 4 rounds.' },
//               { status: 400 }
//             );
//           }
//           selectionsDoc.subsessions[subsessionIndex].rounds = roundsData;
//         }
//       }
//     }

//     // Save the updated document
//     await selectionsDoc.save();
//     console.log('After update, document:', selectionsDoc);

//     return NextResponse.json(selectionsDoc);
//   } catch (error) {
//     console.error('Error handling POST request:', error);
//     return NextResponse.json(
//       { message: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }


// export async function POST(req) {
//   try {
//     await connectMongoDB();

//     // Parse the request body
//     const body = await req.json();
//     const { sessionId, subsessionId, roundsData, biasText, selectedmatchup } = body;

//     console.log('Received body:', { sessionId, subsessionId, roundsData, biasText, selectedmatchup });

//     // Validate required fields: sessionId and subsessionId must be provided.
//     if (!sessionId || !subsessionId) {
//       return NextResponse.json(
//         { message: 'Missing required fields: sessionId or subsessionId.' },
//         { status: 400 }
//       );
//     }

//     // Find the document for the given sessionId.
//     let selectionsDoc = await Selections.findOne({ sessionId });
//     console.log('Before update, document:', selectionsDoc);

//     // Helper to check if roundsData is valid
//     const isValidRoundsData = roundsData =>
//       Array.isArray(roundsData) && roundsData.length === 4;

//     if (!selectionsDoc) {
//       // Document does not exist.
//       // For a new document, we require at least one of roundsData or selectedmatchup.
//       if (!roundsData && !selectedmatchup) {
//         return NextResponse.json(
//           { message: 'Missing required field: roundsData or selectedmatchup is required for creating a new document.' },
//           { status: 400 }
//         );
//       }
//       // If roundsData is provided, validate it.
//       if (roundsData && !isValidRoundsData(roundsData)) {
//         return NextResponse.json(
//           { message: 'roundsData must be an array of exactly 4 rounds.' },
//           { status: 400 }
//         );
//       }
//       // Create a new document with one subsession.
//       selectionsDoc = new Selections({
//         sessionId,
//         subsessions: [{
//           subsessionId,
//           rounds: roundsData && isValidRoundsData(roundsData) ? roundsData : [],
//           biasText: biasText || "",
//           selectedMatchup: selectedmatchup || {}
//         }]
//       });
//     } else {
//       // Document exists. Look for an existing subsession.
//       const subsessionIndex = selectionsDoc.subsessions.findIndex(
//         (ss) => ss.subsessionId === subsessionId
//       );

//       if (subsessionIndex === -1) {
//         // Subsession does not exist.
//         // For creating a new subsession, require at least one of roundsData or selectedmatchup.
//         if (!roundsData && !selectedmatchup) {
//           return NextResponse.json(
//             { message: 'Missing required field: roundsData or selectedmatchup is required to create a new subsession.' },
//             { status: 400 }
//           );
//         }
//         if (roundsData && !isValidRoundsData(roundsData)) {
//           return NextResponse.json(
//             { message: 'roundsData must be an array of exactly 4 rounds.' },
//             { status: 400 }
//           );
//         }
//         selectionsDoc.subsessions.push({
//           subsessionId,
//           rounds: roundsData && isValidRoundsData(roundsData) ? roundsData : [],
//           biasText: biasText || "",
//           selectedMatchup: selectedmatchup || {}
//         });
//       } else {
//         // Subsession exists—update fields if provided.
//         if (biasText !== undefined) {
//           selectionsDoc.subsessions[subsessionIndex].biasText = biasText;
//           console.log('Updated biasText to:', biasText);
//         }
//         if (roundsData) {
//           if (!isValidRoundsData(roundsData)) {
//             return NextResponse.json(
//               { message: 'roundsData must be an array of exactly 4 rounds.' },
//               { status: 400 }
//             );
//           }
//           selectionsDoc.subsessions[subsessionIndex].rounds = roundsData;
//         }
//         if (selectedmatchup !== undefined) {
//           selectionsDoc.subsessions[subsessionIndex].selectedMatchup = selectedmatchup;
//           console.log('Updated selectedMatchup to:', selectedmatchup);
//         }
//       }
//     }

//     // Save the updated document to the database.
//     await selectionsDoc.save();
//     console.log('After update, document:', selectionsDoc);

//     return NextResponse.json(selectionsDoc);
//   } catch (error) {
//     console.error('Error handling POST request:', error);
//     return NextResponse.json(
//       { message: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }


// export async function POST(req) {
//   try {
//     await connectMongoDB();

//     // Parse the request body
//     const body = await req.json();
//     const { sessionId, subsessionId, roundsData, biasText, selectedmatchup } = body;

//     console.log('Received body:', { sessionId, subsessionId, roundsData, biasText, selectedmatchup });

//     // Validate required fields: sessionId and subsessionId must be provided.
//     if (!sessionId || !subsessionId) {
//       return NextResponse.json(
//         { message: 'Missing required fields: sessionId or subsessionId.' },
//         { status: 400 }
//       );
//     }

//     // Find the document for the given sessionId.
//     let selectionsDoc = await Selection.findOne({ sessionId });
//     console.log('Before update, document:', selectionsDoc);

//     // Helper to check if roundsData is valid
//     const isValidRoundsData = roundsData =>
//       Array.isArray(roundsData) && roundsData.length === 4;

//     if (!selectionsDoc) {
//       // Document does not exist.
//       // For a new document, we require at least one of roundsData or selectedmatchup.
//       if (!roundsData && !selectedmatchup) {
//         return NextResponse.json(
//           { message: 'Missing required field: roundsData or selectedmatchup is required for creating a new document.' },
//           { status: 400 }
//         );
//       }
//       // If roundsData is provided, validate it.
//       if (roundsData && !isValidRoundsData(roundsData)) {
//         return NextResponse.json(
//           { message: 'roundsData must be an array of exactly 4 rounds.' },
//           { status: 400 }
//         );
//       }
//       // Create a new document with one subsession.
//       selectionsDoc = new Selection({
//         sessionId,
//         subsessions: [{
//           subsessionId,
//           rounds: roundsData && isValidRoundsData(roundsData) ? roundsData : [],
//           biasText: biasText || "",
//           selectedMatchup: selectedmatchup || {}
//         }]
//       });
//     } else {
//       // Document exists. Look for an existing subsession.
//       const subsessionIndex = selectionsDoc.subsessions.findIndex(
//         (ss) => ss.subsessionId === subsessionId
//       );

//       if (subsessionIndex === -1) {
//         // Subsession does not exist.
//         // For creating a new subsession, require at least one of roundsData or selectedmatchup.
//         if (!roundsData && !selectedmatchup) {
//           return NextResponse.json(
//             { message: 'Missing required field: roundsData or selectedmatchup is required to create a new subsession.' },
//             { status: 400 }
//           );
//         }
//         if (roundsData && !isValidRoundsData(roundsData)) {
//           return NextResponse.json(
//             { message: 'roundsData must be an array of exactly 4 rounds.' },
//             { status: 400 }
//           );
//         }
//         selectionsDoc.subsessions.push({
//           subsessionId,
//           rounds: roundsData && isValidRoundsData(roundsData) ? roundsData : [],
//           biasText: biasText || "",
//           selectedMatchup: selectedmatchup || {}
//         });
//       } else {
//         // Subsession exists—update fields if provided.
//         if (biasText !== undefined) {
//           selectionsDoc.subsessions[subsessionIndex].biasText = biasText;
//           console.log('Updated biasText to:', biasText);
//         }
//         if (roundsData) {
//           if (!isValidRoundsData(roundsData)) {
//             return NextResponse.json(
//               { message: 'roundsData must be an array of exactly 4 rounds.' },
//               { status: 400 }
//             );
//           }
//           selectionsDoc.subsessions[subsessionIndex].rounds = roundsData;
//         }
//         if (selectedmatchup !== undefined) {
//           selectionsDoc.subsessions[subsessionIndex].selectedMatchup = selectedmatchup;
//           console.log('Updated selectedMatchup to:', selectedmatchup);
//         }
//       }
//     }

//     // Save the updated document to the database.
//     await selectionsDoc.save();
//     console.log('After update, document:', selectionsDoc);

//     return NextResponse.json(selectionsDoc);
//   } catch (error) {
//     console.error('Error handling POST request:', error);
//     return NextResponse.json(
//       { message: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }


export async function POST(req) {
  try {
    await connectMongoDB();

    // Parse the request body
    const body = await req.json();
    const { sessionId, subsessionId, roundsData, biasText, selectedMatchupBiasText } = body;

    console.log('Received body:', { sessionId, subsessionId, roundsData, biasText, selectedMatchupBiasText });

    // Validate required fields: sessionId and subsessionId must be provided.
    if (!sessionId || !subsessionId) {
      return NextResponse.json(
        { message: 'Missing required fields: sessionId or subsessionId.' },
        { status: 400 }
      );
    }

    // Find the document for the given sessionId.
    let selectionsDoc = await Selection.findOne({ sessionId });
    console.log('Before update, document:', selectionsDoc);

    // Helper to check if roundsData is valid
    const isValidRoundsData = (roundsData) =>
      Array.isArray(roundsData) && roundsData.length === 3;

    if (!selectionsDoc) {
      // If no session exists, create a new one with the first subsession.
      selectionsDoc = new Selection({
        sessionId,
        subsessions: [
          {
            subsessionId,
            rounds: isValidRoundsData(roundsData) ? roundsData : [],
            biasText: biasText || "",
            selectedMatchupBiasText: selectedMatchupBiasText || null
          },
        ],
      });
    } else {
      // If session exists, find the correct subsession.
      let subsession = selectionsDoc.subsessions.find(
        (ss) => ss.subsessionId === subsessionId
      );

      if (!subsession) {
        // If subsession doesn't exist, create a new one
        selectionsDoc.subsessions.push({
          subsessionId,
          rounds: isValidRoundsData(roundsData) ? roundsData : [],
          biasText: biasText || "",
          selectedMatchupBiasText: selectedMatchupBiasText || null
        });
      } else {
        // If subsession exists, update fields accordingly
        if (biasText !== undefined) {
          subsession.biasText = biasText;
        }

        if (selectedMatchupBiasText) {
          subsession.selectedMatchupBiasText = selectedMatchupBiasText; // Replaces the existing one
        }
      }
    }

    // Save the updated document to the database (MongoDB automatically updates __v)
    await selectionsDoc.save();
    console.log('After update, document:', selectionsDoc);

    return NextResponse.json(selectionsDoc);
  } catch (error) {
    console.error('Error handling POST request:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
