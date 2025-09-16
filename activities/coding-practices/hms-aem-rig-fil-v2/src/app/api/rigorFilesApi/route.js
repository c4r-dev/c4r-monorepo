import connectMongoDB from '../libs/mongodb';
import RigorFiles from '../models/rigorFiles';
import { NextResponse } from "next/server";

export async function POST(request) {
    const { sessionID, userInputs } = await request.json();
    await connectMongoDB();
    await RigorFiles.create({ sessionID, userInputs });
    return NextResponse.json({ message: "Rigor Files Submitted" }, { status: 201 });
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionID = searchParams.get('sessionID');
        await connectMongoDB();
        const rigorFiles = await RigorFiles.find({ sessionID });
        return NextResponse.json(rigorFiles[0] || { userInputs: [] });
    } catch (error) {
        return NextResponse.json({ message: "No Rigor Files Read" }, { status: 500 });
    }
}