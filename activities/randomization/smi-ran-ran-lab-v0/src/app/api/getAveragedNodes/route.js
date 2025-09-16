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

    // The expected node labels from the grid page
    const expectedLabels = [
      'Housing location randomization',
      'Treatment administration order',
      'Behavioral testing order',
      'Euthanasia/tissue collection order',
      'Sample processing randomization'
    ];

    // Initialize objects to store sum of positions and counts for each node label
    const positionSums = {};
    const nodeCounts = {};
    // Store all positions for each node to calculate agreement later
    const allPositionsByLabel = {};

    // Initialize with expected labels
    expectedLabels.forEach(label => {
      positionSums[label] = { x: 0, y: 0 };
      nodeCounts[label] = 0;
      allPositionsByLabel[label] = [];
    });

    // Sum up the positions for each node across all submissions
    submissions.forEach(submission => {
      submission.nodes.forEach(node => {
        if (expectedLabels.includes(node.label)) {
          positionSums[node.label].x += node.position.x;
          positionSums[node.label].y += node.position.y;
          nodeCounts[node.label]++;
          
          // Store the individual position for agreement calculation
          allPositionsByLabel[node.label].push(node.position);
        }
      });
    });

    // Calculate averages, mean prioritization, and group agreement for each node
    const nodeData = expectedLabels.map((label, index) => {
      const count = nodeCounts[label];
      
      // If no occurrences were found, return null position
      if (count === 0) {
        return {
          id: `node-${index + 1}`,
          label,
          position: null,
          count: 0,
          meanPrioritization: 0,
          groupAgreement: 0
        };
      }

      // Calculate average position
      const avgPosition = {
        x: positionSums[label].x / count,
        y: positionSums[label].y / count
      };

      // Calculate mean prioritization: (xPos + (-1 * yPos)) / 2
      const meanPrioritization = (avgPosition.x + (-1 * avgPosition.y)) / 2;
      
      // Calculate group agreement (similarity score between 0-1)
      let groupAgreement = 1; // Default to perfect agreement
      
      if (count > 1) {
        // Get all positions for this label
        const positions = allPositionsByLabel[label];
        
        // Calculate variance of x and y positions
        let xVariance = 0;
        let yVariance = 0;
        
        // Calculate the sum of squared differences from the mean
        positions.forEach(pos => {
          xVariance += Math.pow(pos.x - avgPosition.x, 2);
          yVariance += Math.pow(pos.y - avgPosition.y, 2);
        });
        
        // Average the variances
        xVariance /= count;
        yVariance /= count;
        
        // Calculate standard deviation
        const stdDev = Math.sqrt((xVariance + yVariance) / 2);
        
        // Calculate bounds of canvas (for normalization)
        // Assuming the canvas spans roughly 1000px in each direction for now
        const canvasScale = 1000;
        
        // Create an agreement score that decreases as standard deviation increases
        // Normalize to 0-1 range with exponential decay
        groupAgreement = Math.exp(-stdDev / (canvasScale / 5));
        
        // Ensure the value is between 0 and 1
        groupAgreement = Math.min(Math.max(groupAgreement, 0), 1);
      }

      return {
        id: `node-${index + 1}`,
        label,
        position: avgPosition,
        count,
        meanPrioritization,
        groupAgreement
      };
    });

    // Sort nodes by mean prioritization (descending)
    nodeData.sort((a, b) => b.meanPrioritization - a.meanPrioritization);

    // Return the node data with statistics
    return NextResponse.json({ 
      nodeData,
      totalSubmissions: submissions.length
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching averaged node positions:", error);
    return NextResponse.json(
      { message: "Error fetching averaged node positions", error: error.message },
      { status: 500 }
    );
  }
} 