import connectMongoDB from '../libs/mongodb';
import StickyNote from '../models/stickyNote';
import { NextResponse } from "next/server";

export async function POST(request) {
    const { userID, sessionID, noteScores } = await request.json();
    await connectMongoDB();
    await StickyNote.create({ userID, sessionID, noteScores });
    return NextResponse.json({ message: "Answers Submitted" }, { status: 201 });
}

export async function GET() {
    try {
        await connectMongoDB();
        const stickyNotes = await StickyNote.find();
        return NextResponse.json(stickyNotes);
    } catch (error) {
        return NextResponse.json({ message: "No Answers Read" }, { status: 500 });
    }
}