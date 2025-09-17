"use client"

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import Image from 'next/image';
import Raven1 from "./assets/feedback-button-1.svg";

export default function Home() {

  const router = useRouter();

  const [inputValue, setInputValue] = useState('');

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleNavigation = () => {
    router.push(`/singleuser?name=${inputValue}`);
  }

  return (
    <>
      <div>
        <h1>Login Page</h1>
      </div>

      <div>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="Input Login Name"
        />
      </div>
      <div>
        <br></br>
        <button onClick={handleNavigation}>Login</button>
      </div>
      <div>
        <br></br>
        <Image
          priority
          src={Raven1}
          alt="Follow us at c4r.io"
        />
      </div>
    </>
  );
}
