import connectMongoDB from '../libs/mongodb';
import RigorFilesAdvice from '../models/rigorFilesAdvice';
import { NextResponse } from "next/server";

export async function POST(request) {
    const { sessionID, advice1, advice2, advice3, advice4 } = await request.json();
    await connectMongoDB();
    await RigorFilesAdvice.create({ sessionID, advice1, advice2, advice3, advice4 });
    return NextResponse.json({ message: "Rigor Files Advice Submitted" }, { status: 201 });
}

// Rigor Files API Endpoint
// Purpose: Handles CRUD operations for user session data
// Security: No authentication currently implemented
// Note: Consider adding rate limiting and input validation
// for production use
export async function GET(request) {
    try {
        // Fetch submission based on current sessionID
        // const { searchParams } = new URL(request.url);
        // const sessionID = searchParams.get('sessionID');
        // await connectMongoDB();
        // const rigorFilesAdvice = await RigorFilesAdvice.find({ sessionID });

         // Fetch submission regardless of sessionID
         await connectMongoDB();
         const rigorFilesAdvice = await RigorFilesAdvice.find({});
        
        // Return all submissions instead of just the first one
        return NextResponse.json(rigorFilesAdvice || []);
    } catch (error) {
        return NextResponse.json({ message: "No Rigor Files Read" }, { status: 500 });
    }
}