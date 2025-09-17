import React, { Fragment, useEffect, useState } from "react";

import Image from 'next/image';
import Raven1 from "@/components/raven-icon-7.svg";
import Raven2 from "@/components/raven-group.svg";
import "../app/style.css";

let output

const AnswerList = () => {

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/studentInput");

        const data = await res.json();
        output = data.r2rstudentinput
        setLoading(false)
      } catch (error) {
        console.log("Error loading student answers: ", error);
        setLoading(false)
      }
    };

    fetchData()
  }, []);

  return (
    <Fragment>
      {loading ? (
        <div>Answer List Loading...</div>
      ) : (
        <div className="answers-page">
          <h1>Answers</h1>
          <ol className="answer-list">
            {output.map((answer, index) => (
              <li
                key={answer._id}
                className={`answer-item ${index % 2 === 0 ? 'left' : 'right'}`}
              >
                <div className="bubble">
                  <Image
                    priority
                    src={Raven1}
                    alt="Follow us at c4r.io"
                    className="answer-icon"

                  />
                  <div className="answer-text">{answer.answerQ1}</div>
                  <div className="answer-meta">
                  {/* by {answer.author}  &bull; */}
                   {new Date(answer.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Fragment>
  );
};

export default AnswerList;