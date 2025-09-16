import { NextResponse } from "next/server";
import connectMongoDB from "../libs/mongodb";
import RandomizationNodes from "../models/randomizationNodes";

export async function GET(request) {
  try {
    // Get sessionID and nodeLabel from URL parameters
    const { searchParams } = new URL(request.url);
    const sessionID = searchParams.get('sessionID');
    const nodeLabel = searchParams.get('nodeLabel');

    if (!sessionID || !nodeLabel) {
      return NextResponse.json(
        { message: "Session ID and Node Label are required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Find all submissions with the given sessionID
    const submissions = await RandomizationNodes.find({ sessionID });

    if (!submissions || submissions.length === 0) {
      return NextResponse.json(
        { message: "No submissions found for this session" },
        { status: 404 }
      );
    }

    // Extract all instances of the requested node from all submissions
    let nodeSubmissions = [];
    let submissionCounter = 0;

    submissions.forEach(submission => {
      submission.nodes.forEach(node => {
        if (node.label === nodeLabel) {
          nodeSubmissions.push({
            id: `submission-${submissionCounter}-${nodeLabel.replace(/\s+/g, '-').toLowerCase()}`,
            type: 'submissionNode',
            position: node.position,
            data: { 
              label: node.label,
              submissionID: submission.submissionID,
              submissionIndex: submissionCounter
            }
          });
        }
      });
      submissionCounter++;
    });

    // Return the node submissions data
    return NextResponse.json({ 
      nodeSubmissions,
      totalSubmissions: submissions.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching node submissions:", error);
    return NextResponse.json(
      { message: "Error fetching node submissions", error: error.message },
      { status: 500 }
    );
  }
} 