import connectMongoDB from '../libs/mongodb';
import FinerAnswer from '../models/finerAnswer';
import { NextResponse } from "next/server";

export async function POST(request) {
    const { userID, sessionID, questionNumber, areaOption, evaluation, elaboration } = await request.json();
    await connectMongoDB();
    await FinerAnswer.create({ userID, sessionID, questionNumber, areaOption, evaluation, elaboration });
    return NextResponse.json({ message: "Answers Submitted" }, { status: 201 });
}

export async function GET() {
    try {
        await connectMongoDB();
        const finerAnswers = await FinerAnswer.find();
        return NextResponse.json(finerAnswers);
    } catch (error) {
        return NextResponse.json({ message: "No Answers Read" }, { status: 500 });
    }
}