'use client';

import React, { memo } from 'react';

const TextNode = memo(({ data }) => {
  return (
    <div className="text-node">
      {data.label}
    </div>
  );
});

TextNode.displayName = 'TextNode';

export default TextNode; 