'use client'

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Questions from "../questions/questions.json"

import Image from 'next/image';

import Raven1 from "../assets/feedback-button-1.svg";
import Raven2 from "../assets/feedback-button-2.svg";
import Raven3 from "../assets/feedback-button-3.svg";

import FeedbackForm from "../components/FeedbackForm";

export default function ResQuesOne() {

  const [questionAnswer, setQuestionAnswer] = useState("");
  const [fbtool, setFBTool] = useState('')
  const [selected, setSelected] = useState('')
  const [question, setQuestion] = useState('')
  const [number, setNumber] = useState('')
  const [category, setCategory] = useState('')

  function Search() {
    const searchParams = useSearchParams()
    setSelected(searchParams.get("selected"))
    Questions.forEach(function (elem) {
      if (elem.category === selected && elem.number === "1") {
        setCategory(elem.category)
        setNumber(elem.number)
        setQuestion(elem.question)
      }
    })
    return
  }

  const Seach = () => {
    const searchParams = useSearchParams()
    setSelected(searchParams.get("selected"))
    Questions.forEach(function (elem) {
      if (elem.category === selected && elem.number === "1") {
        setCategory(elem.category)
        setNumber(elem.number)
        setQuestion(elem.question)
      }
    })
    return (
      <div>
      </div>
    )
  }

  const router = useRouter()

  const onValueChange = (event) => {
    setFBTool(event.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!questionAnswer || !fbtool) {
      alert("Selection and Answer is required to Submit.");
      return;
    }

    try {
      const res = await fetch("/api/studentInput", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: JSON.stringify({ category, number, fbtool, questionAnswer }),
      });

      if (res.ok) {
        router.push(`/resQuesTwo?selected=${selected}`);
      } else {
        throw new Error("Failed to create an answer.");
      }
    } catch (error) {
      console.log(error);
    }
  };

/*
  return (
    <>
      <Suspense>
        <Search />
      </Suspense>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <h1>Formulating a Valid Research Question</h1>
          <h2>Question {number}</h2>
        </div>

        <p>
          {question}
        </p>

        <div><br></br></div>
        <div><h2>How good is this research question?</h2></div>
        <div><br></br></div>

        <div className="flex-container">

          <input
            type="radio"
            name="fbtoolanswer"
            id="fbtoolns"
            value={"Good"}
            checked={fbtool === 'Good'}
            onChange={onValueChange}
          />
          <label htmlFor="fbtoolns">
            <Image
              priority
              src={Raven1}
              alt="Follow us at c4r.io"
            />
            Good
          </label>

          <input
            type="radio"
            name="fbtoolanswer"
            id="fbtoolgd"
            value={"Better"}
            checked={fbtool === 'Better'}
            onChange={onValueChange}
          />
          <label htmlFor="fbtoolgd">
            <Image
              priority
              src={Raven2}
              alt="Follow us at c4r.io"
            />
            Better
          </label>

          <input
            type="radio"
            name="fbtoolanswer"
            id="fbtoolgr"
            value={"Great"}
            checked={fbtool === 'Great'}
            onChange={onValueChange}
          />
          <label htmlFor="fbtoolgr">
            <Image
              priority
              src={Raven3}
              alt="Follow us at c4r.io"
            />
            Great
          </label>

        </div>

        <div className="flex-container2">
          <input
            onChange={(e) => setQuestionAnswer(e.target.value)}
            value={questionAnswer}
            className="border border-slate-500 px-8 py-2"
            type="text"
            placeholder="Your answer."
          />
          <button type="submit">
            SUBMIT RESPONSE and GO TO QUESTION 2
          </button>
        </div>
      </form>
    </>
  );
  */

  return (
    <div>
      {/* <div className="suspense-container"> */}
        {/* <Suspense>
          <Search />
        </Suspense> */}
      {/* </div> */}
      <Suspense>
        <FeedbackForm category={category}/>
      </Suspense>
    </div>
  )
}

export const dynamic = 'force-dynamic';