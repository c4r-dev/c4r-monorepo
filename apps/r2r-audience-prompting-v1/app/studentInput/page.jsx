const logger = require('../../../../packages/logging/logger.js');
'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import Raven1 from "@/assets/raven-icon-7.svg";

import "../style.css";

export default function R2rStudentInput() {

  const [answerQ1, setAnswerq1] = useState("");

  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!answerQ1) {
      alert("Answer is required.");
      return;
    }

    try {
      const res = await fetch("/api/studentInput", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ answerQ1 }),
      });

      if (res.ok) {
        // router.push("/closeWindow");
        logger.app.info("Answer created successfully");
      } else {
        throw new Error("Failed to create an answer.");
      }
    } catch (error) {
      logger.app.info(error);
    }
  };

  return (
    <div className="outer-container">
      <div className="container student-input-container">
        <form onSubmit={handleSubmit} className="student-input-form">

          <div>
            <div className="text-container">
              {/* <h2>What surprised you about the difference between your</h2>
              <h2>guesses and the Baker findings?</h2> */}
              <h2>What surprised you about the difference between your guesses and the Baker findings?</h2>
            </div>
            {/* <Image
              priority
              src={Raven1}
              alt="Follow us at c4r.io"
            /> */}
          </div>

          <div className="input-container">
            <input
              onChange={(e) => setAnswerq1(e.target.value)}
              value={answerQ1}
              className="text-input"
              type="text"
              placeholder="Your answer."
            />

            <button
            type="submit"
            className="bg-green-600 font-bold text-white py-3 px-6 w-fit"
            > 
            Save Answer
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}