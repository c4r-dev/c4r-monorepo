import { NextResponse } from "next/server";
import connectMongoDB from "../libs/mongodb";
import RandomizationNodes from "../models/randomizationNodes";

export async function POST(request) {
  try {
    // Ensure database connection
    await connectMongoDB();

    // Parse the request body
    const { nodes, submissionID, sessionID } = await request.json();

    // Basic validation (can be expanded)
    if (!nodes || !Array.isArray(nodes)) {
      return NextResponse.json({ message: "Invalid node data provided." }, { status: 400 });
    }
    if (!submissionID || !sessionID) {
        return NextResponse.json({ message: "Missing submissionID or sessionID." }, { status: 400 });
    }

    // Create a new document using the Mongoose model
    await RandomizationNodes.create({
        nodes: nodes, 
        submissionID: submissionID, 
        sessionID: sessionID
        // timestamp is handled automatically by mongoose
    });

    // Return a success response
    return NextResponse.json({ message: "Flowchart saved successfully." }, { status: 201 });

  } catch (error) {
    console.error("Error saving flowchart:", error);
    // Return an error response
    return NextResponse.json({ message: "Error saving flowchart.", error: error.message }, { status: 500 });
  }
} 