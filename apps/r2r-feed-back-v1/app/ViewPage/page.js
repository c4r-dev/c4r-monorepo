"use client";

import { useEffect, useState } from "react";

export default function ViewPage() {
  const [studentInputs, setStudentInputs] = useState([]);

  useEffect(() => {
    fetch("/api/studentInput")
      .then((response) => response.json())
      .then((data) => setStudentInputs(data.studentInputs));
  }, []);

  return (
    <div>
      <h1>All feedback</h1>
      <ul>
        {studentInputs.map((input) => (
          <li key={input._id}>
            <p>Activity Name: {input.activityName}</p>
            <p>Feedback: {input.answerQ1}</p>
            <p>Comment: {input.fbtool}</p>
            <p>Date: {input.createdAt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
