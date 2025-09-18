const logger = require('../../../../../packages/logging/logger.js');
'use client'

import React, { useState } from 'react'
import { useQRCode } from 'next-qrcode'
import Link from 'next/link'

export default function ShowQRCode() {
  const [groupId, setGroupId] = useState(
    Math.random().toString(36).substr(2, 9)
  )

  const [uniqueLink, setUniqueLink] = useState(generateUniqueLink())
  const [uniqueInstructorLink, setUniqueInstructorLink] = useState(generateUniqueInstructorLink)

  function generateUniqueLink() {
    return `https://smi-ran-why-ran-v1.vercel.app/RandomizeActivityVariables?selectedGroup=${groupId}`
  }
  function generateUniqueInstructorLink() {
    return `https://smi-ran-why-ran-v1.vercel.app/discussion?selectedGroup=${groupId}`
  }

  const copyLink1 = () => {
    const newLink = generateUniqueLink()
    setUniqueLink(newLink)
    navigator.clipboard.writeText(newLink)
    alert('Copied to clipboard: ' + newLink)
  }

  const copyLink2 = () => {
    const newLink = generateUniqueInstructorLink()
    setUniqueInstructorLink(newLink)
    navigator.clipboard.writeText(newLink)
    alert('Copied to clipboard: ' + newLink)
  }

  function UseQRCode() {
    const { SVG } = useQRCode()
    return (
      <SVG
        text={`https://smi-ran-why-ran-v1.vercel.app/RandomizeActivityVariables?selectedGroup=${groupId}`}
        options={{
          margin: 2,
          width: 200,
          color: {
            dark: '#000000FF',
            light: '#FFFFFFFF',
          },
        }}
      />
    )
  }

  const handleContinue = async (e) => {
    fetch('https://smi-ran-why-ran-v1.vercel.app/api/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grp_id: groupId,
      }),
    })
      .then((response) => {
        // logger.app.info(response)
        response.json()
      })
      .then((data) => logger.app.info(data))
      .catch((error) => logger.app.error('Error:', error))
  }

  return (
    <div className="outer-container">
      <div className="container qr-code-page">
        <div className="header-container">
          <h1>Join the group exploring the data</h1>
          <h3 className="qr-code-text-heading">A) As an Instructor</h3>
        </div>
        <div></div>
        <br />
        <div className="link-container">
          <div className="qr-code-container">{UseQRCode()}</div>
          <div className="or-container">
            <h1>OR</h1>
          </div>
          <div className="copy-link-container">
            <div className="copy-link-box">
              <a target="_blank" href={uniqueInstructorLink}>
                {uniqueInstructorLink}
              </a>
            </div>
            <button className="copy-link-button" onClick={copyLink2}>
              Copy Link
            </button>
          </div>
        </div>
        <br />
        <div className="discussion-lead-container"><b>Instructor</b></div>

        <div className="button-row">
          <Link href="/">
            <button className="cancel-button">Cancel</button>
          </Link>
          <Link href={`/discussion?selectedGroup=${groupId}`}>
            <button onClick={handleContinue}>Continue</button>
          </Link>
        </div>
      </div>
      <h3 style={{ margin: '8px' }}>OR</h3>

      <div className="container qr-code-page">
        <div className="header-container">
          {/* <h1>Join the group exploring the data</h1> */}
          <h3 className='qr-code-text-heading'>B) As a Participant</h3>
        </div>
        <div></div>
        <br />
        <div className="link-container">
          <div className="qr-code-container">{UseQRCode()}</div>
          <div className="or-container">
            <h1>OR</h1>
          </div>
          <div className="copy-link-container">
            <div className="copy-link-box">
              <a target="_blank" href={uniqueLink}>
                {uniqueLink}
              </a>
            </div>
            <button className="copy-link-button" onClick={copyLink1}>
              Copy Link
            </button>
          </div>
        </div>
        <br />
        <div className="discussion-lead-container"><b>Participant</b></div>
        <div className="button-row">
        {/* <div>Participant</div> */}
          <Link href="/">
            <button className="cancel-button">Cancel</button>
          </Link>
          <Link href={`RandomizeActivityVariables/?selectedGroup=${groupId}`}>
            <button onClick={handleContinue}>Continue</button>
          </Link>
        </div>
      </div>
    </div>
  )
}