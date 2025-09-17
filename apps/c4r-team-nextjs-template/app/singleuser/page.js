'use client'

import { useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from 'react';

import Image from 'next/image';
import Raven1 from "../assets/feedback-button-1.svg"

export default function SingleUser() {

  const [name, setName] = useState('')

  const GetParams = () => {
    const searchParams = useSearchParams()
    setName(searchParams.get("name"))
  }

  const [data, setData] = useState('')

  useEffect(() => {

    const fetchData = async () => {

      try {
        const response = await fetch(`/api/singleuser?name=${name}`)
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [name]);

  if (!data) {
    return <div>Loading...</div>;   
  }

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <GetParams />
      </Suspense>

      <div>
        <h1>data.name: {data.name}</h1>
        <h1>data.type: {data.type}</h1>
      </div>

      <br></br>
      <Image
        priority
        src={Raven1}
        alt="Follow us at c4r.io"
      />

    </>
  );
}