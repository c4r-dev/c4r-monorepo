import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectMongoDB from '../libs/mongodb'; // Adjust the path to your MongoDB connection file
import Garden from '../models/garden'; // Adjust the path to your Mongoose model
// import mongoose from 'mongoose';


// export async function POST(req) {
//   try {
//     // Connect to MongoDB
//     await connectMongoDB();

//     // Parse the request body to get the data
//     const body = await req.json();
//     const { sessionID, coefficient, hypothesis, yVariables, outcome } = body;

//     // Validate the input
//     if (!sessionID || coefficient === undefined || !hypothesis || !yVariables || !outcome) {
//       return NextResponse.json(
//         { message: 'Missing required fields' },
//         { status: 400 }
//       );
//     }

//     // Update or create the document
//     const updatedSession = await Garden.findOneAndUpdate(
//       { sessionID },
//       {
//         $setOnInsert: {
//           userID: uuidv4(),
//           coefficient,
//           hypothesis,
//           yVariables,
//           outcome,
//           version: "1.0",
//         },
//         $inc: { __v: 1 },
//       },
//       { new: true, upsert: true } // Create if not exists, return the updated document
//     );

//     return NextResponse.json(
//       {
//         message: `Session with sessionID ${sessionID} has been processed successfully. Current version: ${updatedSession.__v}.`,
//         updatedSession,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error saving session data:', error);
//     return NextResponse.json(
//       { message: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }

export async function POST(req) {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Parse the request body to get the data
    const body = await req.json();
    const { sessionID, coefficient, hypothesis, yVariable, xVariable } = body;

    // Validate the input
    if (!sessionID || coefficient === undefined || !hypothesis || !yVariable || !xVariable) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update or create the document
    const updatedSession = await Garden.findOneAndUpdate(
      { sessionID },
      {
        $setOnInsert: {
          userID: uuidv4(),
          coefficient,
          hypothesis,
          yVariable,
          xVariable,
          version: "1.0",
        },
        $inc: { __v: 1 },
      },
      { new: true, upsert: true } // Create if not exists, return the updated document
    );

    return NextResponse.json(
      {
        message: `Session with sessionID ${sessionID} has been processed successfully. Current version: ${updatedSession.__v}.`,
        updatedSession,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error saving session data:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Fetch all documents from the database
    const allData = await Garden.find();

    // Respond with the fetched data
    return NextResponse.json(allData);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

//delete all the data in this route
export async function DELETE() {
  try {
    // Connect to MongoDB
    await connectMongoDB();

    // Delete all documents from the database
    const result = await Garden.deleteMany({});

    return NextResponse.json(
      {
        message: 'All data deleted successfully.',
        deletedCount: result.deletedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting data:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}