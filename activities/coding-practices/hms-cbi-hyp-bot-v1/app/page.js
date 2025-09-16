'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SessionConfigPopup from './components/SessionPopup/SessionConfigPopup'

function PageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [sessionID, setSessionID] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [showPopup, setShowPopup] = useState(false)

  // Generate or extract sessionID and selectedGroup from URL
  useEffect(() => {
    const urlSessionID = searchParams.get('sessionID')
    const urlSelectedGroup = searchParams.get('selectedGroup')
    
    let newSessionID = urlSessionID
    let newSelectedGroup = urlSelectedGroup
    let needsUpdate = false

    if (!urlSessionID) {
      // Generate new sessionID if not in URL
      newSessionID = Math.random().toString(36).substring(2, 15)
      needsUpdate = true
    }

    if (!urlSelectedGroup) {
      // Generate new selectedGroup if not in URL
      newSelectedGroup = Math.random().toString(36).substring(2, 9)
      needsUpdate = true
    }

    setSessionID(newSessionID)
    setSelectedGroup(newSelectedGroup)

    // Update URL with the new parameters if needed
    if (needsUpdate) {
      router.replace(`/?sessionID=${newSessionID}&selectedGroup=${newSelectedGroup}`)
    }
    
    setShowPopup(true)
  }, [searchParams, router])

  const handleClosePopup = () => {
    setShowPopup(false)
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h1>Welcome to Hypothesis Explorer</h1>
      <p>Please select how you want to participate in this activity.</p>
      
      <SessionConfigPopup 
        open={showPopup}
        onClose={handleClosePopup}
        sessionID={sessionID}
        selectedGroup={selectedGroup}
      />
    </div>
  )
}

export default function ShowQRCode() {
  return (
    <Suspense fallback={<div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h2>Loading...</h2>
      <p>Setting up your session...</p>
    </div>}>
      <PageContent />
    </Suspense>
  )
}
