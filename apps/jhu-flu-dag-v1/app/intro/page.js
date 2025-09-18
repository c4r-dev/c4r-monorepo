const logger = require('../../../../packages/logging/logger.js');
'use client'

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from 'next/image';

import './instructions.css';


import SideRaven1 from '../assets2/side-raven-1.svg';
import RavensLineup from '../assets2/ravens-lineup-crop.svg';
import HeaderIcon from '../assets2/header-icon.svg';
import BubbleTail from '../assets2/bubble-tail.svg';



const ContinueButton = () => {

  const searchParams = useSearchParams();
  const labGroupId = searchParams.get('labGroupId');
  logger.app.info('labGroupId', labGroupId);

  const router = useRouter();
  const onContinue = () => {
    // router.push('/drawDag1');

    if (labGroupId) {
      router.push(`/drawDag1?labGroupId=${labGroupId}`);
    } else {
      router.push('/drawDag1');
    }
  }
  return <button onClick={onContinue} className="continue-button dark-button">Continue</button>
}


// export default function ResQuesThree() {
export default function Instructions() {

  const router = useRouter();

  // const onContinue = () => {
  //   router.push('/drawDag1');
  // }


  return (

    <div className="instructions-screen-container">
      {/* <div className="instructions-screen"> */}
        <div className="instructions-screen-header">
          <Image src={HeaderIcon} className="instructions-screen-header-icon" alt="Header Icon" />
          <h1>FluDag</h1>
          {/* <h2>Decide strategies for certain objects in your research process.</h2> */}
        </div>
        <div className="instructions-screen-body">
          <div className="instructions-text-area-1">
            <h3>What causes someone to contract the flu?</h3>
            <p>
            Every flu season, some people get the flu and some people do not. 
            What variables might directly relate to getting the flu? What variables might indirectly relate? What variables are correlations?
            </p>
          </div>

          <div className="bubble-area">
            <div className="bubble-container">
              <Image src={BubbleTail} className="bubble-tail" alt="Bubble Tail" />
              <div className="bubble-text">
                <h3>Brainstorm all the variables you can think of relating to the flu, including your own theories.</h3>
                <p>
                • Do you think weather changes can make you sick?
                </p>
                <p>
                • Do you think vitamin C can prevent you from getting sick?
                </p>
              </div>
              {/* <div className="bubble-tail">
              </div> */}
            </div>
            <div className="button-area">
              <Suspense fallback={<div>Loading...</div>}>
                <ContinueButton />
              </Suspense>
            </div>
          </div>


          <div className="image-area">
            <Image src={SideRaven1} className="left-raven" alt="Side Raven" />
            <Image src={RavensLineup} className="right-raven" alt="Ravens Lineup" />
          </div>




          {/* <div className="instructions-text-area-2">
            <h3>Brainstorm all the variables you can think of relating to the flu, including your own theories.</h3>
            <p>
            • Do you think weather changes can make you sick?
            </p>
            <p>
            • Do you think vitamin C can prevent you from getting sick?
            </p>
          </div> */}
        </div>
        {/* <div className="instructions-screen-footer">
          <button onClick={onContinue}>Continue</button>
        </div> */}
        {/* <div className="instructions-screen-raven">
          <Image src={SideRaven1} className="instructions-screen-raven-image" alt="Side Raven" />
          <Image src={RavensLineup} className="instructions-screen-raven-lineup" alt="Ravens Lineup" />
        </div> */}
      </div>    
    // </div>
  )
}

// export const dynamic = 'force-dynamic';