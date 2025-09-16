import React from 'react'
import Grid from '@mui/material/Grid'
import Image from 'next/image'
import ravenIcon from '../assets/raven-icon.svg'
import { useRouter } from 'next/navigation'

function Header(props) {
  const router = useRouter()
  const exitActivity = (e) => {
    e.preventDefault()
    router.push(`/`)
  }
  return (
    <>
      <Grid
        container
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
        margin={2}
      >
        <Grid item xs={1}>
          <Image src={ravenIcon} alt="ravenIcon" />
        </Grid>
        <Grid item xs={4}>
          <div>
            <b>Why Randomize</b>
          </div>
        </Grid>
        <Grid
          item
          xs={5}
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div style={{ marginRight: '26px' }} onClick={exitActivity}>
            <b>EXIT ACTIVITY X</b>
          </div>
        </Grid>
      </Grid>
    </>
  )
}

export default Header
