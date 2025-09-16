'use client'

import React, { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import Table from '../components/Table'
import Tooltip from '@mui/material/Tooltip'
import { ScatterChart } from '@mui/x-charts/ScatterChart'
import scatterChartsParameters from '../ScatterParams/scatterparamsActual.json'


const ScatterClickNoSnap = ({
  isControlVariables = false,
  yLabel = 'Survival in days',
  selectedVariable = 'Survival_in_days',
  selectedXVariable = null,
  xLabel = ''
}) => {
 // console.log(yLabel, selectedVariable, selectedXVariable , 'THESE ARE PROPS')
  const [scatterChartsParams, setScatterChartsParams] = useState(
    scatterChartsParameters
  )
 // console.log('selected variable is ',selectedVariable)
  



  useEffect(() => {
    const updatedSeries = scatterChartsParams.series.map((seriesItem) => {
      const updatedData = seriesItem.data.map((item) => ({
        ...item,
        y: item[selectedVariable],
        x:selectedXVariable? item[selectedXVariable] : item.x
      }));
      return {
        ...seriesItem,
        data: updatedData,
      };
    });

    setScatterChartsParams((prevParams) => ({
      ...prevParams,
      series: updatedSeries,
    }));
  }, [selectedVariable,selectedXVariable]);


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
          xAxis={[
            {
              label: xLabel,
            },
            {
              labelStyle: { fontWeight: 'bold' },
            },
          ]}
          //  onItemClick={(event, d) => setData(d)}
          tooltip={{
            itemContent: (params) => {
            //  console.log(params,'this is para for each item')
              // const rowsData = params?.series?.data?.[0]?.rows
              //console.log(JSON.stringify(params.series.data[params.itemData.dataIndex]) + 'this is item content')
             // console.log(index + 'this is index' + params.index)
             // console.log('THIS IS PARAMS' +" " + JSON.stringify(params.series.data[params.itemData.dataIndex]))
              return (
                <Tooltip key={params.index}>
                  <Table rows={params.series.data[params.itemData.dataIndex]} />
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
