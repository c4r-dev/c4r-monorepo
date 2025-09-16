'use client'
import { useRouter } from 'next/navigation'
import Header from '../components/Header'
import Box from '@mui/material/Box'

export default function ActivityEnds() {
  const router = useRouter()
  const exitActivity = (e) => {
    e.preventDefault()
    router.push('/')
  }
  const tryActivity = (e) => {
    e.preventDefault()
    router.push('/RandomizeActivityUsers')
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
            <h3>YOU&apos;VE FINISHED THIS ACTIVITY</h3>
            <h1>CONGRATULATIONS</h1>
            <h3> You helped discover a confounding variable in Rigorous Raven’s study. Randomization was the best way for Rigorous Raven to ensure that any treatment effects they find are real. Next, we need to understand about the different types of randomization and how to select a method. </h3>
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
