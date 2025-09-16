'use client'
import React, { useState } from 'react'
import ActivityLayout from '../components/ActivityLayout'
import { useRouter, useSearchParams } from 'next/navigation'
import Grid from '@mui/material/Grid'
import ChartGameBox from '../components/ChartGameBox'
import Scatterplot from '../components/Scatterplot'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormHelperText from '@mui/material/FormHelperText'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import Variables from '../variables/variables.json'
import Button from '../components/Button'

function ControlVariables(props) {
  const [controlVariable, setControlVariable] = useState('')
  const router = useRouter()
  const handleActivityEnd = (e) => {
    e.preventDefault()
    router.push('/ActivityEnds')
  }
  const handleChange = (event) => {
    setControlVariable(event.target.value)
  }
  return (
    <div>
      <ActivityLayout
        isExploreVariables={false}
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
          <ChartGameBox isControlVariables={true}>
            <FormControl
              required
              sx={{ m: 1, width: '350px', textAlign: 'center' }}
            >
              <InputLabel id="demo-simple-select-required-label">
                Control Variable
              </InputLabel>
              <Select
                labelId="demo-simple-select-required-label"
                id="demo-simple-select-required"
                value={controlVariable}
                label="Control Variable *"
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {Variables.map((variable) => {
                  return (
                    <MenuItem value={variable.variableName} key={variable.id}>
                      {variable.variableName}
                    </MenuItem>
                  )
                })}
              </Select>
              <FormHelperText>Required</FormHelperText>
            </FormControl>
            <Scatterplot isControlVariables={true} yLabel={controlVariable} />
          </ChartGameBox>
        </Grid>
        {/* <button onClick={handleActivityEnd}>Continue</button> */}
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
            handleFunction={handleActivityEnd}
          />
        </Grid>
      </ActivityLayout>
    </div>
  )
}

export default ControlVariables
