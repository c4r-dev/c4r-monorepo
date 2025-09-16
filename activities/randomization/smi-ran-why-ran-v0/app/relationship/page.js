'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import dag1 from '../assets/dag-option-7.svg'
import dag2 from '../assets/dag-option-8.svg'
import dag3 from '../assets/dag-option-9.svg'
import Grid from '@mui/material/Grid'
import ChartGameBox from '../components/ChartGameBox'
import Scatterplot from '../components/Scatterplot'
import ActivityLayout from '../components/ActivityLayout'
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined'

function Relationship(props) {
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedVariable, setSelectedVariable] = useState('')
  const [isOptionSelected, setIsOptionSelected] = useState(false)
  const [selectedOption, setSelectedOption] = useState('')

  const router = useRouter()

  const handleUsers = async (e) => {
    e.preventDefault()
    router.push(`/RandomizeActivityVariables?selectedUser=${selectedUser}`)
  }

  const renderDAG = () => {
    //console.log('in renderDAG')
    if (isOptionSelected) {
      if (selectedOption === 1) {
        return <Image src={dag1} alt="dag1" />
      } else if (selectedOption === 2) {
        return <Image src={dag2} alt="dag1" />
      } else {
        return <Image src={dag3} alt="dag1" />
      }
    } else {
      return <b>Select one of the option above for the DAG to appear</b>
    }
  }

  const handleResults = (e) => {
    e.preventDefault()
    router.push(
      `/RelationshipSecond?selectedUser=${selectedUser}&selectedVariable=${selectedVariable}&selectedOption=${selectedOption}`
    )
  }

  function Search() {
    const searchParams = useSearchParams()
    setSelectedUser(searchParams.get('selectedUser'))
    setSelectedVariable(searchParams.get('selectedVariable'))
    // selectUser(selectedUser)
    return
  }

  // useEffect(() => {
  //   console.log(selectedOption, 'the selected option is')
  // }, [selectedOption])

  return (
    <>
      <Suspense>
        <Search />
      </Suspense>
      <ActivityLayout
        headerText={'How do I know it is real?'}
        text={
          'Rigorous Raven’s experiment has some great results! They asked you to review their data. Click on the figure below to explore the details behind their experiment.'
        }
        subText={
          ' What relationships between these variables can your lab discover?'
        }
      >
        <Grid
          item
          xs={6}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginLeft: '230px',
          }}
        >
          <ChartGameBox>
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
                <Scatterplot yLabel={selectedVariable} />
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
                    <b>
                      Is there a relationship between the BMI of the patients
                      and their survival (in days)?
                    </b>
                  </Grid>
                  <Grid
                    container
                    sx={{ display: 'flex', flexDirection: 'row' }}
                    margin={2}
                  >
                    <Grid
                      onClick={() => {
                        setIsOptionSelected(true)
                        setSelectedOption(1)
                      }}
                      sx={{
                        border: '1px solid black',
                        //   backgroundColor: '#D4D4D4',
                        backgroundColor:
                          selectedOption === 1 ? '#F3F3F3' : '#D4D4D4',
                      }}
                      xs={4}
                    >
                      I see a Relationship
                    </Grid>
                    <Grid
                      onClick={() => {
                        setIsOptionSelected(true)
                        setSelectedOption(2)
                      }}
                      sx={{
                        border: '1px solid black',
                        backgroundColor:
                          selectedOption === 2 ? '#F3F3F3' : '#D4D4D4',
                      }}
                      xs={3}
                    >
                      {' '}
                      I am not Sure
                    </Grid>
                    <Grid
                      onClick={() => {
                        setIsOptionSelected(true)
                        setSelectedOption(3)
                      }}
                      sx={{
                        border: '1px solid black',
                        backgroundColor:
                          selectedOption === 3 ? '#F3F3F3' : '#D4D4D4',
                      }}
                      xs={5}
                    >
                      {' '}
                      I Don't see a Relationship
                    </Grid>
                    <Grid
                      container
                      sx={{
                        border: '1px solid black',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '200px',
                      }}
                      margin={2}
                    >
                      {renderDAG()}
                      {/* {isOptionSelected ? (
                      <Image
                        src={dag1}
                        alt="dag1"
                        style={{ marginTop: '-46px' }}
                      />
                    ) : (
                      'Select one option above, a DAG will appear to iilustrate the answer...'
                    )} */}
                    </Grid>
                    <button
                      style={{ color: 'white', backgroundColor: 'black' }}
                      onClick={handleResults}
                    >
                      SUBMIT
                    </button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </ChartGameBox>
        </Grid>
        {/* <button onClick={handleUsers}>
          <ArrowForwardIosOutlinedIcon />
        </button> */}
      </ActivityLayout>
    </>
  )
}

export default Relationship
