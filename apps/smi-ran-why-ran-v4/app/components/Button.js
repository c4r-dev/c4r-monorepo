import React from 'react'

const Button = ({ text, style, handleFunction, disabled = false }) => {
  return (
    <button
      style={style}
      onClick={(e) => {
        handleFunction(e)
      }}
      disabled={disabled}
    >
      {text}
    </button>
  )
}

export default Button
