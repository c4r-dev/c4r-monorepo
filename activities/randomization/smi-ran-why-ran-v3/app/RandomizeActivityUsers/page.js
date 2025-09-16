'use client'
/* eslint-disable react-hooks/rules-of-hooks */

import React, { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from "next/image";
import scatter1 from "../assets/01_why-randomize.svg"
import Grid from '@mui/material/Grid'
import ChartGameBox from '../components/ChartGameBox'
import Scatterplot from '../components/Scatterplot'
import ActivityLayout from '../components/ActivityLayout'
import Button from '../components/Button'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

function RandomizeActicityUsers(props) {
  const [selectedGroup, setSelectedGroup] = useState('')
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // Detect if screen is small (like iPhone 12 Pro)

  function Search() {
    const searchParams = useSearchParams()
    setSelectedGroup(searchParams.get('selectedGroupId'))
    return
  }

  // function handleSearch({ onSearch }) {
  //   const searchParams = useSearchParams();
  
  //   useEffect(() => {
  //     const selectedGroupId = searchParams.get('selectedGroupId');
  //     onSearch(selectedGroupId);
  //   }, [searchParams, onSearch]);
  
  //   return null; // or any other JSX if needed
  // }

  const handleUsers = async (e) => {
    e.preventDefault()
    router.push(`/showQRCode`)
  }

  return (
    <>
      <Suspense>
        <Search />
        {/* <Search onSearch={handleSearch} /> */}
      </Suspense>

      <ActivityLayout
      isMobileProp={isMobile}
        headerText={"Rigorous Raven has some great results! They seem to have found a strong treatment effect in their non-randomized study."}
        text={
          'Rigorous Raven has some great results! They seem to have found a strong treatment effect in their non-randomized study.'     }
        subText={
          'What relationships can your lab discover between the variables in the study?'
        }
      oneLineText="Rigorous Raven has some great results! They seem to have found a strong treatment effect in their non-randomized study."
      >
        <Grid
          item
          xs={6}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginLeft: isMobile ? "0px" : "230px",
          }}
        >
          <ChartGameBox oneLineText="Rigorous Raven has some great results! They seem to have found a strong treatment effect in their non-randomized study."  isHeader={true} isActivityUsers={true}
          >
            <Grid
              container
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
              margin={2}
            >
              <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  height: '400px',
                }}
              >
                {/* <Scatterplot   yLabel={"Survival in days"}
                    selectedVariable={"Survival in days"}/> */}
                    <Image
        src={scatter1}
        alt="Description of the image"
         width={isMobile ? 350 :400} 
        // height={300}
      />
              </Grid>
              <Grid
                item
                xs={12}
                sx={{ display: 'flex', justifyContent: 'flex-start' }}
              >
                <Grid
                  container
                  sx={{ display: 'flex', flexDirection: 'row' }}
                  margin={2}
                >
                  <Grid
                    item
                    xs={10}
                    sx={{ display: 'flex', justifyContent: 'center' }}
                  >
                    <b style={{textAlign:'center'}}>
                    {/* Click continue to delegate who in your lab is going explore each of the variables */}
                    Skeptical Stork is not sure that the difference between groups is due to only the difference between treatments. Let&apos;s take a deeper dive into the other variables.
                    </b>
                  </Grid>
                  <Grid
                    item
                    xs={10}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      height: '130px',
                      alignItems: 'center',
                    }}
                  ></Grid>
                  <Grid
                    item
                    xs={10}
                    sx={{ display: 'flex', justifyContent: 'center' }}
                  >
                    <Button
                      text={'Continue'}
                      style={{
                        backgroundColor: '#6E00FF',
                        color: 'white',
                      }}
                      handleFunction={handleUsers}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </ChartGameBox>
        </Grid>
        <Grid
          container
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '16px',
          }}
        >
          {/* <Button
            text={'CONTINUE'}
            style={{
              marginRight: '350px',
              backgroundColor: 'black',
              color: 'white',
            }}
            handleFunction={handleUsers}
          /> */}
        </Grid>
      </ActivityLayout>
    </>
  )
}

export default RandomizeActicityUsers
