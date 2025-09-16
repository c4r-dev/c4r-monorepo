'use client'

import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextareaAutosize,
  Paper,
  Tooltip,
} from '@mui/material'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import Image from 'next/image'
import { useState, Suspense, useEffect } from 'react'
import CustomModal from '../components/CustomModal'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from '../components/Header/Header'
import CustomButton from '../components/Button/Button'

const data = [
  {
    criteria: 'user 1',
    feature: 'Increased dopamine improves working memory in mice.',
    rating: 'alternative hypothesis 1',
    alt_hyp_2: 'alternative hypothesis 2',
    notes: '',
  },
  {
    criteria: 'user 2',
    feature: 'Neuroplasticity is greater in younger brains.',
    rating: 'alternative hypothesis 1',
    alt_hyp_2: 'alternative hypothesis 2',

    notes: '',
  },
  {
    criteria: 'user 3',
    feature: 'Stress causes brain damage in humans.',
    rating: 'alternative hypothesis 1',
    alt_hyp_2: 'alternative hypothesis 2',

    notes: '',
  },
  {
    criteria: 'user 4',
    feature: 'Exercise makes the brain healthier.',
    rating: 'alternative hypothesis 1',
    alt_hyp_2: 'alternative hypothesis 2',

    notes: '',
  },
  {
    criteria: 'user 5',
    feature: 'Oxytocin is the love hormone in humans.',
    rating: 'alternative hypothesis 1',
    alt_hyp_2: 'alternative hypothesis 2',
    notes: '',
  },
]

function FetchSearchParams({
  setSessionID,
  setSelectedGroup,
  setHypothesisDesc,
  setData,
}) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const session = searchParams.get('sessionID')
    const group = searchParams.get('selectedGroup')
    // const user = searchParams.get('userID');

    setSessionID(session)
    setSelectedGroup(group)
    // setUserId(user);

    if (session && group) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `/api/hypothesis?sessionID=${session}&grpID=${group}`,
          )
          if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`)
          }
          const data = await response.json()
          setData(data.users)
          // setHypothesisDesc(data.hypDesc);
        } catch (error) {
          console.error('Error fetching data:', error)
        }
      }
      fetchData()
    }
  }, [searchParams])

  return null
}

export default function Page() {
  const [isGuideModalVisible, setIsGuideModalVisible] = useState(false)
  const [sessionID, setSessionID] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [data, setData] = useState([]) // State to store API data
  const router = useRouter()
  // const searchParams = useSearchParams()

  // Function to fetch data from API
  // const fetchData = async (sessionID, groupID) => {
  //   try {
  //     const response = await fetch(
  //       `https://hms-cbi-hyp-bot-v1.vercel.app/api/hypothesis?sessionID=${sessionID}&grpID=${groupID}`,
  //     )
  //     if (!response.ok) {
  //       throw new Error(`API error: ${response.statusText}`)
  //     }
  //     const result = await response.json()
  //     setData(result.users) // Update the state with the fetched data
  //   } catch (error) {
  //     console.error('Error fetching data:', error)
  //   }
  // }

  // Effect to extract URL parameters and fetch API data
  // useEffect(() => {
  //   const session = searchParams.get('sessionID')
  //   const group = searchParams.get('selectedGroup')
  //   setSessionID(session)
  //   setSelectedGroup(group)

  //   if (session && group) {
  //     fetchData(session, group)
  //   }
  // }, [searchParams])

  const saveToPDF = () => {
    const content = document.getElementById('table-container')
    html2canvas(content, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight)
      const width = imgWidth * ratio
      const height = imgHeight * ratio

      pdf.addImage(imgData, 'PNG', (pageWidth - width) / 2, 10, width, height)
      pdf.save('table.pdf')
    })
  }

  const closeModal = () => {
    setIsGuideModalVisible(false)
  }

  const openModal = () => {
    setIsGuideModalVisible(true)
  }

  const handleGuideBtn = () => {
    openModal(true)
  }

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <FetchSearchParams
          setSessionID={setSessionID}
          setSelectedGroup={setSelectedGroup}
          setData={setData}
        />
      </Suspense>
      <Box sx={{ padding: 4 }}>
        <Header />

        <Typography
          variant="body1"
          component="h3"
          sx={{
            textWrap: 'balance',
            textAlign: 'center',
            padding: '3px',
            marginBottom: 3,
            fontWeight: 600,
          }}
        >
          This table shows how you developed alternative hypotheses throughout
          this exercise. <br />
          Hover over an entry to see the question that prompted it.
        </Typography>
        <CustomModal isOpen={isGuideModalVisible} closeModal={closeModal} />
        {/* Table */}
        <TableContainer
          id="table-container"
          component={Paper}
          sx={{
            backgroundColor: '#f9f9f9',
            marginBottom: 4,
            border: '1px solid #d1d5db',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                {/* <TableCell>
                  <b>User Name</b>
                </TableCell> */}
                <TableCell>
                  <b>Initial Hypothesis</b>
                </TableCell>
                <TableCell>
                  <b>Alternative Hypothesis 1</b>
                </TableCell>
                <TableCell>
                  <b>Alternative Hypothesis 2</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.slice().reverse().map((row, index) => (
                <TableRow key={index}>
                  {/* <TableCell>{row.userID}</TableCell> */}
                  <TableCell>{row.hypDesc}</TableCell>
                  <TableCell>
                    <Tooltip
                      title={row.q1 ? row.q1 : 'No question available'}
                      arrow
                    >
                      <Typography
                        sx={{
                          backgroundColor: '#d9f2d9',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          display: 'inline-block',
                          fontWeight: 'bold',
                          color: '#000',
                        }}
                      >
                        {row.hyp1 || 'N/A'}{' '}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  {/* <TableCell>hyp1</TableCell> */}
                  <TableCell>
                    <Tooltip
                      title={row.q2 ? row.q2 : 'No question available'}
                      arrow
                    >
                      <Typography
                        sx={{
                          backgroundColor: '#d9f2d9',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          display: 'inline-block',
                          fontWeight: 'bold',
                          color: '#000',
                        }}
                      >
                        {row.hyp2 || 'N/A'}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          {/* <Button
            variant="contained"
            sx={{ marginTop: 5 }}
            style={{
              marginTop: '20px',
              backgroundColor: 'purple',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '5px',
              fontWeight: '600',
              border: 'none',
            }}
            onClick={saveToPDF}
          >
            Export to PDF
          </Button> */}

          <CustomButton
            ariaLabel="Test button"
            // disabled={!input}
            variant="purple"
            customStyles={{
              padding: '10px 20px',
              marginTop: '20px',

              borderRadius: '5px',
              fontWeight: '600',
              fontWeight: 'bold',
              // cursor: input ? 'pointer' : 'not-allowed',
            }}
            onClick={saveToPDF}
            className=""
          >
            Export to pdf
          </CustomButton>
        </Box>
      </Box>
    </>
  )
}
