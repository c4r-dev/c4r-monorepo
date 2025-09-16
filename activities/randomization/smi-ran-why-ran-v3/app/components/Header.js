import React from 'react'
import Grid from '@mui/material/Grid'
import Image from 'next/image'
import ravenIcon from '../assets/raven-icon.svg'
import { useRouter } from 'next/navigation'

function Header({oneLineText = '',isMobile=false}) {
  console.log(oneLineText, "this is one line text in header component")
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
          justifyContent: 'center',
          alignItems: 'center',
        }}
        // margin={2}
      >
        {/* <Grid item xs={1}>
          <Image src={ravenIcon} alt="ravenIcon" />
        </Grid> */}
        <Grid item xs={10}>
          <div style={{marginLeft:isMobile ? '10px' : '0px'}}>
            <b>{oneLineText}</b>
            {/* <b>Rigorous Raven has some great results! They seem to have found a strong treatment effect in their non-randomized study.</b> */}
          </div>
        </Grid>
        {/* <Grid
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
        </Grid> */}
      </Grid>
    </>
  )
}

export default Header
