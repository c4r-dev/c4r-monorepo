import connectMongoDB from "@/libs/mongodb";
import StudentInput from "@/models/studentFeedbackWidget";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { answerQ1, fbtool, activityName } = await request.json();
  await connectMongoDB();
  await StudentInput.create({ answerQ1, fbtool, activityName });
  return NextResponse.json({ message: "Feedback Submitted" }, { status: 201 });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');
  const fromTime = searchParams.get('fromTime');
  const toTime = searchParams.get('toTime');
  
  await connectMongoDB();
  
  const query = {};
  
  // Add source filter if provided
  if (source) {
    query.activityName = source;
  }
  
  // Add date range filter if provided
  if (fromDate || toDate) {
    query.createdAt = {};
    if (fromDate) {
      const fromDateTime = fromTime 
        ? new Date(`${fromDate}T${fromTime}`)
        : new Date(fromDate);
      query.createdAt.$gte = fromDateTime;
    }
    if (toDate) {
      const toDateTime = toTime 
        ? new Date(`${toDate}T${toTime}`)
        : new Date(toDate);
      query.createdAt.$lte = toDateTime;
    }
  }
  
  const studentInputs = await StudentInput.find(query).sort({ createdAt: -1 });
  
  return NextResponse.json({ studentInputs });
}
