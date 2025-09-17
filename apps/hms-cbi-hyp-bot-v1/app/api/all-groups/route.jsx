import { NextResponse } from 'next/server';
import connectMongoDB from '../libs/mongodb'
import Hypothesis from '../models/hypothesis'; // Replace with the correct import path for your schema

//get api to view all the data

// export async function GET(req) {
//     try {
//       await connectMongoDB();
  
//       // Retrieve all grpIDs and users from the database
//       const hypothesisDocs = await Hypothesis.find({}, { grpID: 1, users: 1 });
  
//       if (!hypothesisDocs.length) {
//         return NextResponse.json(
//           { message: 'No groups or users found in the database.' },
//           { status: 404 }
//         );
//       }
  
//       // Simplify the response structure
//       const response = hypothesisDocs.map((doc) => ({
//         grpID: doc.grpID,
//         users: doc.users.map((user) => ({
//           userID: user.userID,
//           hypNumber: user.hypNumber,
//           hypDesc: user.hypDesc,
//           q1: user.q1,
//           q2: user.q2,
//           q3: user.q3,
//           hyp1: user.hyp1,
//           hyp2: user.hyp2,
//           hyp3: user.hyp3,
//           __v: user.__v,
//         })),
//       }));
  
//       return NextResponse.json(response);
//     } catch (error) {
//       console.error('Error fetching group data:', error);
//       return NextResponse.json(
//         { message: 'Internal Server Error' },
//         { status: 500 }
//       );
//     }
//   }
  

export async function GET(req) {
  try {
    await connectMongoDB();

    // Retrieve all sessionIDs, grpIDs, and users
    const hypothesisDocs = await Hypothesis.find({}, { sessionID: 1, grpID: 1, users: 1 });

    if (!hypothesisDocs.length) {
      return NextResponse.json(
        { message: 'No groups or users found in the database.' },
        { status: 404 }
      );
    }

    // Map the response to include sessionID
    const response = hypothesisDocs.map((doc) => ({
      sessionID: doc.sessionID,
      grpID: doc.grpID,
      users: doc.users.map((user) => ({
        userID: user.userID,
        hypNumber: user.hypNumber,
        hypDesc: user.hypDesc,
        q1: user.q1,
        q2: user.q2,
        q3: user.q3,
        hyp1: user.hyp1,
        hyp2: user.hyp2,
        hyp3: user.hyp3,
        __v: user.__v,
      })),
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching group data:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
