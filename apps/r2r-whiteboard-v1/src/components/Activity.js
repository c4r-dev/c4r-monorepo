const logger = require('../../../../packages/logging/logger.js');
'use client'

import { useState } from 'react';
import InitialScreen from './InitialScreen';
import InputScreen from './InputScreen';
import ResourceScreen from './ResourceScreen';

import localFont from 'next/font/local';
const myFont = localFont({ src: './GeneralSans-Regular.ttf' });


export default function Main() {
    const [showInitScreen, setShowInitScreen] = useState(true);
    const [showInputScreen, setShowInputScreen] = useState(false);
    const [showReviewScreen, setShowReviewScreen] = useState(false);
    const [showResourceScreen, setShowResourceScreen] = useState(false);
    const [showEndScreen, setShowEndScreen] = useState(false);

    const startActivity = () => {
        setShowInitScreen(false);
        setShowInputScreen(true);
        setShowReviewScreen(false);
        setShowResourceScreen(false);
        setShowEndScreen(false);
    }

    const reviewActivity = () => {
        setShowInitScreen(false);
        setShowInputScreen(false);
        setShowReviewScreen(true);
        setShowResourceScreen(false);
        setShowEndScreen(false);
    }

    const showResource = () => {
        logger.app.info("showResource");
        setShowInitScreen(false);
        setShowInputScreen(false);
        setShowReviewScreen(false);
        setShowResourceScreen(true);
        setShowEndScreen(false);
    }

    const endActivity = () => {
        setShowInitScreen(false);
        setShowInputScreen(false);
        setShowReviewScreen(true);
        setShowResourceScreen(false);
        setShowEndScreen(true);
    }

  return (
    <div>
      {showInitScreen && <InitialScreen startActivity={startActivity} />}
      {showInputScreen && <InputScreen reviewActivity={reviewActivity} showResource={showResource} />}
      {showReviewScreen && <ReviewScreen showResource={showResource} />}
      {showResourceScreen && <ResourceScreen endActivity={endActivity} />}
      {showEndScreen && <EndScreen />}
    </div>
  );
}