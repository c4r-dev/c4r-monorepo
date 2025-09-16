"use client"

import React from 'react'
import { useQRCode } from 'next-qrcode'

export default function UseQRCode() {
  const { SVG } = useQRCode()

  return (
    <SVG
      text={'https://r2r-audience-prompting-v1.vercel.app/studentInput'}
      options={{
        margin: 2,
        width: 200,
        color: {
          dark: '#000000FF',
          light: '#FFFFFFFF',
        },
      }}
    />
  )
}