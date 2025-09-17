import connectMongoDB from '../libs/mongodb';
import BiasMapping from "../models/biasMapping";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { flow, sessionID, biasNumber, submissionInstance } = await request.json();
  await connectMongoDB();
  await BiasMapping.create({ flow, sessionID, biasNumber, submissionInstance });
  return NextResponse.json({ message: "Bias Mapping Submitted" }, { status: 201 });
}

export async function GET() {
  try {
  await connectMongoDB();
  // Only fetching the results from last 48 hours
  // const fludagData = await FluDag.find({ createdAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) } });

  // All results
  const biasMappingData = await BiasMapping.find();
  
  return NextResponse.json(biasMappingData);
  } catch (error) {
    return NextResponse.json({ message: "No Answers Read"});
  }
}