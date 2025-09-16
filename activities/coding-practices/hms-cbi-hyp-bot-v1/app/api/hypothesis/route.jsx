import { NextResponse } from 'next/server';
import connectMongoDB from '../libs/mongodb'
import Hypothesis from '../models/hypothesis'; // Replace with the correct import path for your schema


//does not increment __v number
export async function POST(req) {
  try {
    await connectMongoDB();

    // Parse the request body
    const body = await req.json();
    const { sessionID, grpID, userID, hypNumber, hypDesc, q1, q2, q3, hyp1, hyp2, hyp3 } = body;

    // Validate required fields for initialization
    if (!sessionID || !grpID || !userID) {
      return NextResponse.json(
        { message: 'Missing required fields: sessionID, grpID, or userID.' },
        { status: 400 }
      );
    }

    // Find the document for the given sessionID and grpID
    let hypothesisDoc = await Hypothesis.findOne({ sessionID, grpID });

    if (!hypothesisDoc) {
      // If the document doesn't exist, create a new one
      hypothesisDoc = new Hypothesis({
        sessionID,
        grpID,
        users: [],
      });
    }

    // Check if the user already exists in the users array
    const existingUser = hypothesisDoc.users.find((user) => user.userID === userID);

    if (!existingUser) {
      // If user does not exist, add a new user entry with the initial details
      hypothesisDoc.users.push({
        userID,
        hypNumber,
        hypDesc,
        q1: q1 || null,
        q2: q2 || null,
        q3: q3 || null,
        hyp1: hyp1 || null,
        hyp2: hyp2 || null,
        hyp3: hyp3 || null,
      });
    } else {
      // If user exists, update their details with additional information
      if (q1 !== undefined) existingUser.q1 = q1;
      if (q2 !== undefined) existingUser.q2 = q2;
      if (q3 !== undefined) existingUser.q3 = q3;
      if (hyp1 !== undefined) existingUser.hyp1 = hyp1;
      if (hyp2 !== undefined) existingUser.hyp2 = hyp2;
      if (hyp3 !== undefined) existingUser.hyp3 = hyp3;
    }

    // Save the updated document to the database
    await hypothesisDoc.save();

    // Respond with the updated document
    return NextResponse.json(hypothesisDoc);
  } catch (error) {
    console.error('Error handling request:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}


// export async function POST(req) {
//   try {
//     await connectMongoDB();

//     // Parse the request body
//     const body = await req.json();
//     const { sessionID, grpID, userID, hypNumber, hypDesc, q1, q2, q3, hyp1, hyp2, hyp3 } = body;

//     if (!sessionID || !grpID || !userID) {
//       return NextResponse.json(
//         { message: 'Missing required fields: sessionID, grpID, or userID.' },
//         { status: 400 }
//       );
//     }

//     // Find the document by sessionID and grpID
//     const hypothesisDoc = await Hypothesis.findOne({ sessionID, grpID });

//     if (!hypothesisDoc) {
//       // If no document exists, create a new one with the initial user data
//       const newDoc = new Hypothesis({
//         sessionID,
//         grpID,
//         users: [
//           {
//             userID,
//             hypNumber,
//             hypDesc,
//             q1: q1 || null,
//             q2: q2 || null,
//             q3: q3 || null,
//             hyp1: hyp1 || null,
//             hyp2: hyp2 || null,
//             hyp3: hyp3 || null,
//           },
//         ],
//       });

//       await newDoc.save();

//       return NextResponse.json(newDoc, { status: 201 });
//     }

//     // Find the user in the existing document
//     const userIndex = hypothesisDoc.users.findIndex((user) => user.userID === userID);

//     if (userIndex === -1) {
//       // If the user doesn't exist, add a new user object
//       hypothesisDoc.users.push({
//         userID,
//         hypNumber,
//         hypDesc,
//         q1: q1 || null,
//         q2: q2 || null,
//         q3: q3 || null,
//         hyp1: hyp1 || null,
//         hyp2: hyp2 || null,
//         hyp3: hyp3 || null,
//       });
//     } else {
//       // Update the existing user object
//       const user = hypothesisDoc.users[userIndex];
//       if (hypNumber !== undefined) user.hypNumber = hypNumber;
//       if (hypDesc !== undefined) user.hypDesc = hypDesc;
//       if (q1 !== undefined) user.q1 = q1;
//       if (q2 !== undefined) user.q2 = q2;
//       if (q3 !== undefined) user.q3 = q3;
//       if (hyp1 !== undefined) user.hyp1 = hyp1;
//       if (hyp2 !== undefined) user.hyp2 = hyp2;
//       if (hyp3 !== undefined) user.hyp3 = hyp3;

//       // Increment the __v field for the updated user object
//       hypothesisDoc.users[userIndex].__v += 1;
//     }

//     // Save the updated document
//     await hypothesisDoc.save();

//     return NextResponse.json(hypothesisDoc);
//   } catch (error) {
//     console.error('Error handling request:', error);
//     return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
//   }
// }



export async function GET(req) {
  try {
    await connectMongoDB();

    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const sessionID = searchParams.get('sessionID');
    const grpID = searchParams.get('grpID');
    const userID = searchParams.get('userID');

    // Validate required parameters
    if (!sessionID || !grpID) {
      return NextResponse.json(
        { message: 'Missing required query parameters: sessionID or grpID.' },
        { status: 400 }
      );
    }

    // Fetch the hypothesis document for the given sessionID and grpID
    const hypothesisDoc = await Hypothesis.findOne({ sessionID, grpID });

    if (!hypothesisDoc) {
      return NextResponse.json(
        { message: `No data found for sessionID: ${sessionID} and grpID: ${grpID}.` },
        { status: 404 }
      );
    }

    // If userID is provided, filter the users array to return only the relevant user data
    if (userID) {
      const user = hypothesisDoc.users.find((user) => user.userID === userID);
      if (!user) {
        return NextResponse.json(
          { message: `No data found for userID: ${userID} in the specified group.` },
          { status: 404 }
        );
      }
      return NextResponse.json(user); // Return only the user's data
    }

    // If no userID is provided, return the entire hypothesis document
    return NextResponse.json(hypothesisDoc);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}


//delete all the data in the api
export async function DELETE(req) {
  try {
    await connectMongoDB();

    // Delete all documents from the Hypothesis collection
    const deleteResult = await Hypothesis.deleteMany({});

    if (deleteResult.deletedCount === 0) {
      return NextResponse.json(
        { message: 'No data found in the database to delete.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `All data deleted successfully. Total records deleted: ${deleteResult.deletedCount}`,
    });
  } catch (error) {
    console.error('Error deleting data:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

//delete specific records
// export async function DELETE(req) {
//   try {
//     await connectMongoDB();

//     // Extract query parameters
//     const { searchParams } = new URL(req.url);
//     const sessionID = searchParams.get('sessionID');
//     const grpID = searchParams.get('grpID');
//     const userID = searchParams.get('userID');

//     // Validate required parameters
//     if (!sessionID || !grpID) {
//       return NextResponse.json(
//         { message: 'Missing required query parameters: sessionID or grpID.' },
//         { status: 400 }
//       );
//     }

//     // Find the document based on sessionID and grpID
//     const hypothesisDoc = await Hypothesis.findOne({ sessionID, grpID });

//     if (!hypothesisDoc) {
//       return NextResponse.json(
//         { message: `No data found for sessionID: ${sessionID} and grpID: ${grpID}.` },
//         { status: 404 }
//       );
//     }

//     if (userID) {
//       // If userID is provided, remove the specific user from the users array
//       const updatedUsers = hypothesisDoc.users.filter(
//         (user) => user.userID !== userID
//       );

//       if (updatedUsers.length === hypothesisDoc.users.length) {
//         return NextResponse.json(
//           { message: `No user found with userID: ${userID} in the specified group.` },
//           { status: 404 }
//         );
//       }

//       hypothesisDoc.users = updatedUsers;
//       await hypothesisDoc.save();

//       return NextResponse.json(
//         { message: `User with userID: ${userID} removed successfully.` },
//         { status: 200 }
//       );
//     }

//     // If no userID is provided, delete the entire document
//     await Hypothesis.deleteOne({ sessionID, grpID });

//     return NextResponse.json(
//       { message: `Data for sessionID: ${sessionID} and grpID: ${grpID} deleted successfully.` },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error deleting data:', error);
//     return NextResponse.json(
//       { message: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }
