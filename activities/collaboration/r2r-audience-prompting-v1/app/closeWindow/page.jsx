'use client'

import Image from 'next/image';
import Raven1 from "./raven-icon-4.svg";

export default function closeWindow() {

  return (
    <>
      <div>
        <h1>Thank you for your response.</h1>
        <h1>You may now close this window.</h1>
        <Image
          priority
          src={Raven1}
          alt="Follow us at c4r.io"
        />
      </div>
    </>
  )
}

