import React, { useState } from 'react';
import './App.css';

export default function App() {

  const [x, setX] = useState(0)
  const [colors, setColors] = useState([]); // Make colors part of the state

  const output = [
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
    let newColors;
    if (x === 6) {
      newColors = output[1].map(item => (item === 1 ? 'rgb(235, 235, 152)' : 'black'));
      setX(1);
    } else {
      newColors = output[x + 1].map(item => (item === 1 ? 'rgb(235, 235, 152)' : 'black'));
      setX(x + 1);
    }
    setColors(newColors); // Update colors state
  }

  // Function to render grid items
  const renderGridItems = () => {
    console.log(colors)
    return colors.map((color, index) => (
      <div
        key={index}
        style={{
          backgroundColor: color,
          border: '1px solid red',
          width: '7vw',
          height: '7vw',
          marginLeft: index === 0 ? '3px' : '0px', // Add marginLeft to the first item
        }}
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
      {/* <div>{output[x]}</div> */}

      {/* Legend Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', border: '1px solid red', backgroundColor: 'rgb(235, 235, 152)' }}></div>
          <span>Treatment</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', border: '1px solid red', backgroundColor: 'black' }}></div>
          <span>Control</span>
        </div>
      </div>
      <div><br></br></div>
      <div
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gap: '1px'
        }}
      >
        {renderGridItems()}
      </div>
      <br></br>
    </>
  );
}