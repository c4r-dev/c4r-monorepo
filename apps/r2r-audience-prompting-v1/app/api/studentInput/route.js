import connectMongoDB from "@/libs/mongodb";
import R2rStudentInput from "@/models/r2rstudentinput";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { answerQ1 } = await request.json();
  await connectMongoDB();
  await R2rStudentInput.create({ answerQ1 });
  return NextResponse.json({ message: "Answer Created" }, { status: 201 });
}

export async function GET() {
  await connectMongoDB();
  const r2rstudentinput = await R2rStudentInput.find();
  return NextResponse.json({ r2rstudentinput });
}