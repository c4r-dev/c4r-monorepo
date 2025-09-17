import connectMongoDB from '../libs/mongodb';
import ExampleModel from "../models/exampleModel";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { sessionID, exampleInteger, exampleString, exampleBoolean, exampleArray, exampleObject } = await request.json();
  await connectMongoDB();
  await ExampleModel.create({ 
    sessionID, 
    exampleInteger, 
    exampleString, 
    exampleBoolean, 
    exampleArray, 
    exampleObject 
  });
  return NextResponse.json({ message: "Example Model Created" }, { status: 201 });
}

export async function GET() {
  try {
    await connectMongoDB();
    const examples = await ExampleModel.find();
    return NextResponse.json(examples);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching examples" }, { status: 500 });
  }
}