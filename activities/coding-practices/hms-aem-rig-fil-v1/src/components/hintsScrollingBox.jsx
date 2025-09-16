import React from 'react';

import Hints from "../hintsScaffold.json"

export default function HintsScrollingBox() {

  return (
    <div className='scrolling-box'>
      <ul className='ulNoDot'>
        {Hints.map((hint) => (
          <li key={hint.number}>
            <h3>{hint.number}. {hint.hint} <br></br></h3>
            <b><h4>Answer: {hint.explanation}</h4></b>
          </li>
        ))}
      </ul>
    </div>
  );
};