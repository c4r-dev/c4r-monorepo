import React from 'react';

import RFTS from "../referenceTool.json"

export default function RefToolScrollingBox() {

  return (
    <div className='rtscrolling-box'>
      <ul className='ulNoDot'>
        {RFTS.map((rft) => (
          <li key={rft.number}>
            <h3>{rft.number}</h3>
            <b><h4>{rft.rule1}</h4></b>
            <b><h4>{rft.rule2}</h4></b>
          </li>
        ))}
      </ul>
    </div>
  );
};