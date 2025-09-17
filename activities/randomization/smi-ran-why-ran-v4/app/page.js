'use client'

import React from 'react';

// This would be the actual content of your activity
function WhyRanContent() {
  return (
    <div>
      <h1>Activity Content</h1>
      <p>This is the unique content for the 'Why Randomize?' activity.</p>
    </div>
  );
}

export default function Page() {
  return <WhyRanContent />;
}