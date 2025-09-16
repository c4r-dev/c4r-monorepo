'use client'
import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Button from '../components/Button'
import ActivityLayout from '../components/ActivityLayout'
import Grid from '@mui/material/Grid'
import ChartGameBox from '../components/ChartGameBox'
import { styled } from '@mui/material/styles'
import Paper from '@mui/material/Paper'
import Scatterplot from '../components/Scatterplot'
import Image from 'next/image'
import dag4 from '../assets/dag-4-with-background.svg'
import dag5 from '../assets/dag-5-with-background.svg'
import raven1 from '../assets/raven-1.svg'

function ResultsMultipleLabs(props) {
  const router = useRouter()
  const handleControlVariables = (e) => {
    e.preventDefault()
    router.push('/ControlVariables')
  }
  return (
    <div>
      <ActivityLayout
        isExploreVariables={true}
        headerText={'See your lab Results . Disscuss Together'}
        text={
          'What problems do you see with these relationships? \n What would happen if you "controlled" for some of these variables?'
        }
      >
        <Grid
          item
          xs={9}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginLeft: '230px',
            marginTop: '-400px',
          }}
        >
          <ChartGameBox>
            <Grid
              container
              rowSpacing={1}
              columnSpacing={{ xs: 1, sm: 2, md: 3 }}
            >
              <Grid item xs={6} sx={{ height: '400px' }}>
                <Grid item xs={12}>
                  <h3>
                    Is there a relationship between the AGE of the patients and
                    the type of treatment they received?
                  </h3>
                </Grid>
                <Grid item xs={6}>
                  <Image src={dag5} alt="dag1" />
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <Scatterplot />
              </Grid>
              <Grid item xs={6}>
                <Grid item xs={12}>
                  <h3>
                    Is there a relationship between the AGE of the patients and
                    their survival (in days)?
                  </h3>
                </Grid>
                <Grid item xs={6}>
                  <Image src={dag4} alt="dag1" />
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <Scatterplot />
              </Grid>
            </Grid>
          </ChartGameBox>
        </Grid>
        {/* <button onClick={handleControlVariables}>Continue</button> */}
        <Grid
          container
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '16px',
          }}
        >
          <Button
            text={'CONTINUE'}
            style={{
              marginRight: '250px',
              backgroundColor: 'black',
              color: 'white',
            }}
            handleFunction={handleControlVariables}
          />
        </Grid>
      </ActivityLayout>
    </div>
  )
}

export default ResultsMultipleLabs
