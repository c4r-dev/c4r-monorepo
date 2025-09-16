import React from 'react';

// This component is used to display individual node submissions
// It has a different style from the result nodes
const SubmissionNode = ({ data }) => (
  <div className="submission-node" title={`Submission #${data.submissionIndex + 1}`}>
    <div className="submission-node-label">{data.label}</div>
    <div className="submission-node-index">#{data.submissionIndex + 1}</div>
  </div>
);

export default SubmissionNode; 