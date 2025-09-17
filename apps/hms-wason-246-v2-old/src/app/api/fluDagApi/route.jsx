import connectMongoDB from '../libs/mongodb';
import FluDag from "../models/fludag";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { flow, groupId, userId, userName, description } = await request.json();
  await connectMongoDB();
  await FluDag.create({ flow, groupId, userId, userName, description });
  return NextResponse.json({ message: "Dag Submitted" }, { status: 201 });
}

export async function GET() {
  try {
  await connectMongoDB();
  // Only fetching the results from last 48 hours
  // const fludagData = await FluDag.find({ createdAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) } });

  // All results
  const fludagData = await FluDag.find();
  
  return NextResponse.json(fludagData);
  } catch (error) {
    return NextResponse.json({ message: "No Answers Read"});
  }
}