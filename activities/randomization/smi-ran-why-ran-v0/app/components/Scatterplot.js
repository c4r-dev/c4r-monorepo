'use client'

import React, { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Table from '../components/Table'
import Tooltip from '@mui/material/Tooltip'
import { ScatterChart } from '@mui/x-charts/ScatterChart'
import scatterChartsParameters from '../ScatterParams/scatterparams.json'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

const ScatterClickNoSnap = ({
  isControlVariables = false,
  yLabel = 'Survival in days',
}) => {
  const [scatterChartsParams, setScatterChartsParams] = useState(
    scatterChartsParameters
  )
  let variable = `prevPatient.${yLabel}`
  function createData(name, value) {
    return { name, value }
  }
  // useEffect(() => {
  //   // Update y to always have the value of yLabel
  //   setScatterChartsParams((prevPatient) => ({
  //     ...prevPatient,
  //     y: `prevPatient.${yLabel}`,
  //   }))
  // }, [yLabel])

  const [data, setData] = useState()

  const { axis, item, ...other } = data ?? {}

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={{ xs: 0, md: 4 }}
      sx={{ width: '100%', marginTop: isControlVariables ? '100px' : '0px' }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <ScatterChart
          colors={['#A0FF00', '#FF7EF2']}
          {...scatterChartsParams}
          yAxis={[
            {
              label: yLabel,
            },
            {
              labelStyle: { fontWeight: 'bold' },
            },
          ]}
          //  onItemClick={(event, d) => setData(d)}
          tooltip={{
            itemContent: (params) => {
              // const rowsData = params?.series?.data?.[0]?.rows
              //console.log(params.series.data[0] + 'this is item content')

              return (
                <Tooltip key={params.index}>
                  <Table rows={params.series.data[0]} />
                </Tooltip>
              )
            },
          }}
        />
      </Box>
    </Stack>
  )
}

export default ScatterClickNoSnap
