'use client'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Box from '@mui/material/Box'

export default function ActivityEnds() {
  const router = useRouter()
  const exitActivity = (e) => {
    e.preventDefault()
    router.push(`/`)
  }
  const tryActivity = (e) => {
    e.preventDefault()
    router.push(`/RandomizeActivityUsers`)
  }
  return (
    <>
      <Box
        sx={{
          width: 1300,
          height: 1200,
          backgroundColor: 'lightgrey',
          boxShadow: 3,
          borderRadius: 2,
          margin: '30px',
        }}
      >
        <Header />
        <div className="finalPage">
          <div className="finalPageCenter">
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <h3>YOU'VE FINISHED THIS ACTIVITY</h3>
            <h1>CONGRATULATIONS</h1>
            <h3>** place holder for additional text **</h3>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button onClick={tryActivity}>Try Again</button>
            <button onClick={exitActivity}>Exit Activity</button>
          </div>
        </div>
      </Box>
    </>
  )
}
