import { NextResponse } from "next/server";
import connectMongoDB from "../libs/mongodb";
import RandomizationIdeas from "../models/randomizationIdeas";

export async function GET(request) {
  try {
    // Get sessionID from the URL
    const { searchParams } = new URL(request.url);
    const sessionID = searchParams.get('sessionID');

    // Validate session ID
    if (!sessionID) {
      return NextResponse.json({ message: "Missing sessionID parameter." }, { status: 400 });
    }

    // Connect to database
    await connectMongoDB();

    // Find the ideas for the given sessionID
    // Sort by most recent first (createdAt) and take the first result
    const ideasData = await RandomizationIdeas.findOne({ sessionID })
      .sort({ createdAt: -1 })
      .exec();

    // If no ideas found for this sessionID
    if (!ideasData) {
      return NextResponse.json({ message: "No randomization ideas found for this session." }, { status: 404 });
    }

    // Return the ideas
    return NextResponse.json({ 
      ideas: ideasData.ideas,
      createdAt: ideasData.createdAt
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching randomization ideas:", error);
    return NextResponse.json({ message: "Error fetching randomization ideas.", error: error.message }, { status: 500 });
  }
} 