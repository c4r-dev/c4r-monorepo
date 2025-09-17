'use client'

import React, { useState, useEffect } from "react";

import { useSearchParams } from "next/navigation";

import Questions from "../questions/questions.json"

import Image from 'next/image';

import Raven1 from "../assets/feedback-button-1.svg";

export default function SummaryCalc() {

  const searchParams = useSearchParams()
  const selected = searchParams.get("selected")

  const [outputs, setOutput] = useState(null)
  const [is1Visible, setIs1Visible] = useState(false);
  const [is2Visible, setIs2Visible] = useState(false);
  const [is3Visible, setIs3Visible] = useState(false);

  let question1 = ''
  let question2 = ''
  let question3 = ''
  let number1 = ''
  let number2 = ''
  let number3 = ''

  Questions.forEach(function (elem) {
    if (elem.category === selected) {
      if (elem.number === "1") {
        number1 = elem.number
        question1 = elem.question
      } else if (elem.number === "2") {
        number2 = elem.number
        question2 = elem.question
      } else {
        number3 = elem.number
        question3 = elem.question
      }
    }
  })

  useEffect(() => {

    const fetchData = async () => {

      try {
        const response = await fetch("/api/studentInput");
        const result = await response.json();
        setOutput(result);

      } catch (error) {
        console.log("Error loading student answers: ", error);

      }
    };

    fetchData()

  }, []);

  if (!outputs) return <div>Loading...</div>;

  let Q = {
    goodcnt: 0,
    bettercnt: 0,
    greatcnt: 0,
    goodpct: 0,
    betterpct: 0,
    greatpct: 0,
    totalcnt: 0
  }
  let q1 = Object.create(Q)
  let q2 = Object.create(Q)
  let q3 = Object.create(Q)
  let q1Answers = []
  let q2Answers = []
  let q3Answers = []
  let q1a = []
  let q2a = []
  let q3a = []

  outputs.forEach((item) => {
    if (item.category === selected) {
      if (item.number === "1") {
        if (item.fbtool === "Good") {
          q1.goodcnt++
        } else if (item.fbtool === "Better") {
          q1.bettercnt++
        } else {
          q1.greatcnt++
        }
        q1.totalcnt++
        if (q1.totalcnt <= 10) {
          q1a = item.questionAnswer
          q1Answers.push(q1a)
        }
      } else if (item.number === "2") {
        if (item.fbtool === "Good") {
          q2.goodcnt++
        } else if (item.fbtool === "Better") {
          q2.bettercnt++
        } else {
          q2.greatcnt++
        }
        q2.totalcnt++
        if (q2.totalcnt <= 10) {
          q2a = item.questionAnswer
          q2Answers.push(q2a)
        }
      } else {
        if (item.fbtool === "Good") {
          q3.goodcnt++
        } else if (item.fbtool === "Better") {
          q3.bettercnt++
        } else {
          q3.greatcnt++
        }
        q3.totalcnt++
        if (q3.totalcnt <= 10) {
          q3a = item.questionAnswer
          q3Answers.push(q3a)
        }
      }
    }
  });

  q1.goodpct = Math.round(q1.goodcnt / q1.totalcnt * 100)
  q1.betterpct = Math.round(q1.bettercnt / q1.totalcnt * 100)
  q1.greatpct = Math.round(q1.greatcnt / q1.totalcnt * 100)

  q2.goodpct = Math.round(q2.goodcnt / q2.totalcnt * 100)
  q2.betterpct = Math.round(q2.bettercnt / q2.totalcnt * 100)
  q2.greatpct = Math.round(q2.greatcnt / q2.totalcnt * 100)

  q3.goodpct = Math.round(q3.goodcnt / q3.totalcnt * 100)
  q3.betterpct = Math.round(q3.bettercnt / q3.totalcnt * 100)
  q3.greatpct = Math.round(q3.greatcnt / q3.totalcnt * 100)

  const toggle1Visibility = () => {
    setIs1Visible(!is1Visible)
  };

  const toggle2Visibility = () => {
    setIs2Visible(!is2Visible)
  };

  const toggle3Visibility = () => {
    setIs3Visible(!is3Visible)
  };

  return (

    <>

      <div>
        <h1>Formulating a Valid Research Question</h1>
        <h2>What did other students think:</h2>
      </div>

      <div>
        <h2>Research Question {number1}</h2>
        <h2>{question1}</h2>
        <div>
          <h1>Good : Better : Great</h1>
          <h1>{q1.goodpct}% {q1.betterpct}% {q1.greatpct}%</h1>
          <button onClick={toggle1Visibility}>
            {is1Visible ? 'HIDE ' : 'SHOW '} ANSWERS
          </button>
          {is1Visible && (
            <div>
              <br></br>
              {q1Answers.map((item, index) => (
               <li key={index}>{item}</li>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2>Research Question {number2}</h2>
        <h2>{question2}</h2>
        <div>
          <h1>Good : Better : Great</h1>
          <h1>{q2.goodpct}% {q2.betterpct}% {q2.greatpct}%</h1>
          <button onClick={toggle2Visibility}>
            {is2Visible ? 'HIDE ' : 'SHOW '} ANSWERS
          </button>
          {is2Visible && (
            <div>
              <br></br>
              <ul>
                {q2Answers.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2>Research Question {number3}</h2>
        <h2>{question3}</h2>
        <div>
          <h1>Good : Better : Great</h1>
          <h1>{q3.goodpct}% {q3.betterpct}% {q3.greatpct}%</h1>
          <button onClick={toggle3Visibility}>
            {is3Visible ? 'HIDE ' : 'SHOW '} ANSWERS
          </button>
          {is3Visible && (
            <div>
              <br></br>
              <ul>
                {q3Answers.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div>
        <br></br>
      </div>

      <div>
        <Image
          priority
          src={Raven1}
          alt="Follow us at c4r.io"
        />
      </div>

    </>
  );
}