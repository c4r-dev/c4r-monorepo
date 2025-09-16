import connectMongoDB from '../libs/mongodb';
import NumberRuleGuess from "../models/numberRuleGuess";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { guessID, guessList, finalGuess, actualAnswer, isCorrect } = await request.json();
  await connectMongoDB();
  await NumberRuleGuess.create({ guessID, guessList, finalGuess, actualAnswer, isCorrect });
  return NextResponse.json({ message: "Answers Submitted" }, { status: 201 });
}

export async function GET() {
  // const { guessID } = request.params;
  try {
    await connectMongoDB();
    const numberRuleGuess = await NumberRuleGuess.find();
    // const numberRuleGuess = await NumberRuleGuess.findOne({ guessID });
    return NextResponse.json(numberRuleGuess);
  } catch (error) {
    return NextResponse.json({ message: "No Answers Read"});
  }
}