'use client'
import { Suspense, useState } from "react";
import Image from 'next/image';
import CustomModal from '../Components/ui/CustomModal';
import CustomButton from '../Components/ui/CustomButton';
import TreatmentPlot from '../Components/ui/Plots/TreatmentPlot'
import data from "../data/plot_data.json";
import useMediaQuery from '@mui/material/useMediaQuery'
import Grid from '@mui/material/Grid'
import { useTheme } from '@mui/material/styles'
import { useRouter } from "next/navigation";
import Header from '../Components/ui/Header/Header';

// Gender legend component - similar to the screenshot
const GenderLegend = () => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        color:'black !important',
        padding: '8px 20px',
        borderRadius: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        margin: '0',
        width: 'fit-content',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginRight: '24px',
            color:'black !important',
        }}
      >
        <div
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#e78bf5', // Female color from the plot
            marginRight: '8px',
              color:'black !important',
          }}
        ></div>
        <span style={{ fontSize: '16px', fontWeight: '500' }}>Female</span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
            color:'black !important',
        }}
      >
        <div
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#adf802', // Male color from the plot
            marginRight: '8px',
              color:'black !important',
          }}
        ></div>
        <span style={{ fontSize: '16px', fontWeight: '500' }}>Male</span>
      </div>
    </div>
  )
}

const RandomizationPlot = () => {
  const theme = useTheme()

  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // Detect if screen is small (like iPhone 12 Pro)

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleHelpClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleContinueClick = () => {
    router.push("/StratifiedRandomization");
  };

  return (
    <div
      style={{
        backgroundColor: '#f5f5f5',
        minHeight: '100vh',
        width: '100%',
        padding: '16px',
      }}
    >
     {/* Updated header with better centering */}
     <div style={{
       textAlign: 'center',
       alignItems: 'center',
       width: '100%',
       maxWidth: '1000px',
       margin: '0 auto 20px auto',
      //  marginLeft:'720px'
     }}>
                  <CustomModal isOpen={isModalOpen} closeModal={closeModal} />
      
       <Header  onLogoClick={handleLogoClick} onHelpClick={handleHelpClick} text="Assign Zebrafish Using Simple Randomization" />
     </div> 

      {/* Main Content Box */}
      <div
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          padding: '32px',
          position: 'relative',
        }}
      >
        {/* Title Section */}
        <div
          style={{
            margin: '0 0 20px 0',
            width: '100%',
          }}
        >
          <div
            style={{
              padding: '12px 20px',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              What are the results?
            </h2>
          </div>
        </div>

        {/* Chart Section with image */}
        <div
          style={{
            margin: '0 0 20px 0',
            width: '100%',
          }}
        >
          <div
            style={{
              padding: '20px',
              minHeight: '500px',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: '460px' }}>
              {/* <Image
                src="/01_treatment_sex.svg"
                alt="Randomization Results"
                layout="fill"
                objectFit="contain"
                priority
              /> */}
                <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  justifyContent: 'left', // Align to the left
                  height:'395px',
                }}
              >
                <TreatmentPlot
                   isMobile={isMobile}
                  data={data}
                  width={isMobile ? 330 : 550} // Adjust width for mobile
                  height={ isMobile ? 300 :360} // Adjust height for mobile
                  margin={{
                    top:  30,
                    right: 20,
                    bottom:  20,
                    left: 50,
                  }}
                  yDomain={[1, 11]}
                  //  xDomain={[-10,10]}
                  yLabel="Aggression level (1-10)"
                  dotRadius={4}
                  colors={{
                    male: '#adf802',
                    female: '#e78bf5',
                  }}
                  medians={{
                    Control: 5.2,
                    Enrichment: 8.6,
                  }}
                  medianTextColor="#6E00FF"
                  medianText={''}
                  yField={'aggression'}
                  xJitterPositions={{
                    Control: [-20, -10, 0, 10, 20],
                    Enrichment: [-20, -10, 0, 10, 20],
                  }}
                  yJitter={[ -10, 0, 10]}
                />
              </Grid>
              
              {/* Gender legend added below the plot at left corner */}
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px', paddingLeft: '20px' }}>
                <GenderLegend />
              </div>
            </div>
          </div>
        </div>

        {/* Consider Section */}
        <div
          style={{
            margin: '0 0 30px 0',
            width: '100%',
          }}
        >
          <div
            style={{
              padding: '12px 20px',
            }}
          >
            <h3
              style={{
                margin: '0 0 8px 0',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              Consider:
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '16px',
                lineHeight: '1.5',
                color: '#333',
              }}
            >
              Is there are treatment effect? Is there a pattern in the data that
              you didn&apos;t expect?{' '}
              <strong>
                Let&apos;s see what happens if we use stratified randomization
                instead.
              </strong>
            </p>
          </div>
        </div>

        {/* Continue Button - styled exactly like screenshot */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            width: '100%',
          }}
        >
          <CustomButton variant="primary" onClick={handleContinueClick}>
            CONTINUE
          </CustomButton>
        </div>
      </div>
    </div>
  )
}

export default RandomizationPlot