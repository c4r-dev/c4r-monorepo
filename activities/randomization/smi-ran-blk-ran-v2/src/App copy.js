import React, { useState } from 'react';
import './App.css';

export default function App() {

  const [x, setX] = useState(0)

  let colors = []

  let output = [
    [],
    [0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0],
    [1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1],
    [0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0]
  ]

  // Function to set output colors
  const submitRunClick = () => {
    if (x === 6) {
      colors = output[1]
      colors.forEach((item, index) => {
        if (item === 1) {
          colors[index] = 'rgb(235, 235, 152)'
        } else {
          colors[index] = 'black'
        }
      })
      setX(1)
    } else {
      colors = output[x + 1]
      colors.forEach((item, index) => {
        if (item === 1) {
          colors[index] = 'rgb(235, 235, 152)'
        } else {
          colors[index] = 'black'
        }
      })
      setX(x + 1)
    }
    console.log(colors)
  }

  // Function to render grid items
  const renderGridItems = () => {

    console.log(colors)
    return colors.map((color, index) => (
      <div
        key={index}
        className="grid-item"
        style={{ backgroundColor: color }}
      >
      </div>
    ));
  };

  return (
    <>

      <div><h1>Balanced Randomization</h1></div>
      {/* <br></br> */}
      <div><h2>Feel free to use our Python code for your next experiment.</h2></div>
      <br></br>

      <div className='code'>

        <div><span className='sB'>import</span> numpy <span className='sB'>as</span> np</div>
        <br></br>
        <div><span className='sB'>def</span> assign_to_treatment<span className='sY'>(</span>K<span className='sY'>)</span>:</div>
        <div className='indent'><span className='sG'># Create a zeros vector of length K to represent the untreated</span></div>
        <div className='indent'>untreated = np.zeros<span className='sY'>(</span>K<span className='sY'>)</span></div>
        <br></br>
        <div className='indent'><span className='sG'># Create a ones vector of length K to represent the treated</span></div>
        <div className='indent'>treated = np.ones<span className='sY'>(</span>K<span className='sY'>)</span></div>
        <br></br>
        <div className='indent'><span className='sG'># Concatenate the two vectors to produce a joint population</span></div>
        <div className='indent'>overall_population = np.concatenate<span className='sY'>(</span><span className='sP'>(</span>treated, untreated<span className='sP'>)</span><span className='sY'>)</span></div>
        <br></br>
        <div className='indent'><span className='sG'># Randomly permute who is in which group</span></div>
        <div className='indent'>assignment = np.random.permutation<span className='sY'>(</span>overall_population<span className='sY'>)</span></div>
        <br></br>
        <div className='indent'><span className='sB'>return</span> assignment</div>
        <br></br>
        <div><span className='sG'># Example usage === instead use existing graphic</span></div>
        <div>K = 6</div>
        <div>result = assign_to_treatment<span className='sY'>(</span>K<span className='sY'>)</span></div>
        <div>print<span className='sY'>(</span>result<span className='sY'>)</span></div>
        <br></br>
      </div>
      <br></br>
      <input
        className="button"
        type="button"
        onClick={submitRunClick}
        value="RUN CODE" />
      <br></br>
      <br></br>
      <div>{output[x]}</div>
      <div className="grid-container">
        {renderGridItems()}
      </div>
      <br></br>
    </>
  );
}