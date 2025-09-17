import connectMongoDB from '../libs/mongodb';
import RigorFiles from '../models/rigorFiles';
import { NextResponse } from "next/server";

export async function POST(request) {
    const { sessionID, userInputs } = await request.json();
    await connectMongoDB();
    await RigorFiles.create({ sessionID, userInputs });
    return NextResponse.json({ message: "Rigor Files Submitted" }, { status: 201 });
}

// Rigor Files API Endpoint
// Purpose: Handles CRUD operations for user session data
// Security: No authentication currently implemented
// Note: Consider adding rate limiting and input validation
// for production use
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionID = searchParams.get('sessionID');
        await connectMongoDB();
        
        // Fetch all documents that match the sessionID
        const rigorFiles = await RigorFiles.find({ sessionID });
        
        // Extract all userInputs from the documents and flatten them into a single array
        const allUserInputs = rigorFiles.reduce((acc, doc) => {
            // If doc.userInputs is an array, spread it; if single object, wrap in array
            const inputs = Array.isArray(doc.userInputs) ? doc.userInputs : [doc.userInputs];
            return [...acc, ...inputs];
        }, []);

        return NextResponse.json({ userInputs: allUserInputs });
    } catch (error) {
        console.error("Error fetching Rigor Files:", error);
        return NextResponse.json({ message: "No Rigor Files Read", userInputs: [] }, { status: 500 });
    }
}