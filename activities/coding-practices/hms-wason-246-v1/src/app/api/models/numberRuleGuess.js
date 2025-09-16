import mongoose, { Schema } from "mongoose";

/*
guessID: string
guessList: array of objects with the following properties:
    - guessNumber: integer
    - guessValue1: integer
    - guessValue2: integer
    - guessValue3: integer
    - matchesRule: boolean
    - guessHypothesis: string
finalGuess: string
actualAnswer: string
isCorrect: boolean
*/

const numberRuleGuessSchema = new Schema(
  {
    guessID: String,
    guessList: Array,
    finalGuess: String,
    actualAnswer: String,
    isCorrect: Boolean,
  },
  {
    timestamps: true,
  }
);
  
export default mongoose.models.NumberRuleGuess || mongoose.model("NumberRuleGuess", numberRuleGuessSchema);
