const logger = require('../../../../packages/logging/logger.js');
// import React from 'react'
// import Grid from '@mui/material/Grid'
// import Image from 'next/image'
// import ravenIcon from '../assets/raven-icon.svg'
// import { useRouter } from 'next/navigation'

// function Header({oneLineText = '',isMobile=false}) {
//   logger.app.info(oneLineText, "this is one line text in header component")
//   const router = useRouter()
//   const exitActivity = (e) => {
//     e.preventDefault()
//     router.push(`/`)
//   }
//   return (
//     <>
//       <Grid
//         container
//         sx={{
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//         }}
//         // margin={2}
//       >
//         {/* <Grid item xs={1}>
//           <Image src={ravenIcon} alt="ravenIcon" />
//         </Grid> */}
//         <Grid item xs={10}>
//           <div style={{marginLeft:isMobile ? '10px' : '0px'}}>
//             <b>{oneLineText}</b>
//             {/* <b>Rigorous Raven has some great results! They seem to have found a strong treatment effect in their non-randomized study.</b> */}
//           </div>
//         </Grid>
//         {/* <Grid
//           item
//           xs={5}
//           sx={{
//             display: 'flex',
//             justifyContent: 'flex-end',
//           }}
//         >
//           <div style={{ marginRight: '26px' }} onClick={exitActivity}>
//             <b>EXIT ACTIVITY X</b>
//           </div>
//         </Grid> */}
//       </Grid>
//     </>
//   )
// }

// export default Header

import React from 'react'
import Image from 'next/image'
import './header.css'
// import logo from "@/public/logo-sideways.svg";
import logo from '@/public/01_RR_Large.png'
import helpTooltip from '@/public/help-tooltip-fix.svg'

const Header = ({
  onLogoClick,
  onHelpClick,
  oneLineText = '',
  isMobile = false,
  isControlVariables = false,
}) => {
  const handleLogoClick = () => {
    if (onLogoClick) {
      logger.app.info('Logo clicked, calling onLogoClick')
      onLogoClick()
    } else {
      logger.app.info('No onLogoClick function provided')
    }
  }

  const handleHelpClick = () => {
    if (onHelpClick) {
      logger.app.info('Help clicked, calling onHelpClick')
      onHelpClick()
    } else {
      logger.app.info('No onHelpClick function provided')
    }
  }

  return (
    <header className="header-container">
      <div className="header-bar">
        <Image
          src={logo}
          alt="Logo"
          className="logo logo-mobile clickable-logo"
          onClick={handleLogoClick}
        />

        {isControlVariables ? null : (
          <div className="logo-desktop">
            <Image
              src={logo}
              alt="Logo"
              className="logo clickable-logo"
              onClick={handleLogoClick}
            />
            <h1 className="header-title"> {oneLineText} </h1>
            <button className="header-guide-button" onClick={handleHelpClick}>
              <Image
                src={helpTooltip}
                alt="Guide"
                className="help-tooltip-image"
              />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
