import { NextResponse } from "next/server";
import connectMongoDB from "../libs/mongodb";
import RandomizationNodes from "../models/randomizationNodes";

export async function GET(request) {
  try {
    // Get sessionID from URL parameters
    const { searchParams } = new URL(request.url);
    const sessionID = searchParams.get('sessionID');

    if (!sessionID) {
      return NextResponse.json(
        { message: "Session ID is required" },
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

    // The expected node labels from the grid page (same as in getAveragedNodes)
    const expectedLabels = [
      'Housing location randomization',
      'Treatment administration order',
      'Behavioral testing order',
      'Euthanasia/tissue collection order',
      'Sample processing randomization'
    ];

    // Create a map to store submissions for each node label
    const nodeSubmissionsMap = {};
    
    // Initialize the map with empty arrays for each expected label
    expectedLabels.forEach(label => {
      nodeSubmissionsMap[label] = [];
    });

    // Process all submissions and organize by node label
    submissions.forEach((submission, submissionIndex) => {
      submission.nodes.forEach(node => {
        if (expectedLabels.includes(node.label)) {
          nodeSubmissionsMap[node.label].push({
            id: `submission-${submissionIndex}-${node.label.replace(/\s+/g, '-').toLowerCase()}`,
            type: 'submissionNode',
            position: node.position,
            data: { 
              label: node.label,
              submissionID: submission.submissionID,
              submissionIndex
            }
          });
        }
      });
    });

    // Return all node submissions organized by label
    return NextResponse.json({ 
      nodeSubmissionsMap,
      totalSubmissions: submissions.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching all node submissions:", error);
    return NextResponse.json(
      { message: "Error fetching all node submissions", error: error.message },
      { status: 500 }
    );
  }
} 