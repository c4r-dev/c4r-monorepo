const logger = require('../../../../../packages/logging/logger.js');
import * as React from 'react'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Paper from '@mui/material/Paper'

function createData(name, value) {
  return { name, value }
}
/* eslint-disable react/display-name */
const BasicTable = React.forwardRef((rowObj, ref) => {
   //logger.app.info(JSON.stringify(rowObj) + 'this is rowObj')
  const rows = Object.entries(rowObj.rows).map(([key, value]) =>
    createData(key, value)
  )
  return (
    <TableContainer component={Paper}>
      <Table sx={{ width: '300px' }} size="small" aria-label="a dense table">
        <TableBody>
          {rows.map((row) => {
            // logger.app.info(row, 'this is row')
            return (
              <TableRow
                key={`${row.name} + " " + ${row.value}`}
                sx={{
                  '&:last-child td, &:last-child th': { border: 0 },
                  //  height: '40px',
                }}
              >
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right">
                  <b>{row.value}</b>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
})

export default BasicTable
