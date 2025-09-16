"use client"

import Link from "next/link";
import AnswerList from "@/components/AnswerList.jsx";
import "../style.css";


export default function Answers() {


  return (
    <div className="outer-container">
      <div className="answers-container container">
        <div className="answers-header">
          <div className="answers-header-text">
            <h1>What surprised you about the difference between your</h1>
            <h1>guesses and the Baker findings?</h1>
          </div>
        </div>
        <AnswerList />
        <div className="answers-footer">

          <Link href="./">
            <button className="try-again-button">
            TRY AGAIN
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
  

}