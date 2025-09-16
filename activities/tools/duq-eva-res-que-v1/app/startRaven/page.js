'use client'

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Image from 'next/image';

// import Raven1 from '../assets/feedback-button-1.svg';
import Raven1 from '../assets/raven-1-angled.svg';
import IconGroup2 from '../assets/icon-group-2.svg';

// export default function ResQuesThree() {
export default function StartRaven() {
  let selected = 'bs'
  function Search() {
    const searchParams = useSearchParams()
    selected = searchParams.get("rqtool")
    // return <input placeholder="Search..." />
    return;
  }

  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const selected = Search();
    // const searchParams = useSearchParams();
    // const qrTool = searchParams.get("rqtool");
    router.push(`/resQuesOne?selected=${selected}`);
  };

  return (

    <>
      <header>
        <h1>Formulating a Valid Research Question</h1>
      </header>

    {/* Old form-style continue button - keep for testing */}
      {/* <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <button type="submit">
            CONTINUE
          </button>
        </div>
      </form> */}

      <div className="raven-bubble-1">
        <div className="raven-bubble-body">
          <h1>We’ll be evaluating 3 research questions in a row.</h1>
        </div>
        <div className="raven-bubble-triangle"></div>
        <button onClick={handleSubmit} className="continue-button-1">
          CONTINUE
        </button>
      </div>

      {/* Fixed footer Raven */}
      <div>
        <Image
          priority
          src={Raven1}
          alt="Follow us at c4r.io"
          className="raven-footer-1"
        />
      </div>
      {/* <div> */}
        <Image
          priority
          src={IconGroup2}
          alt="Follow us at c4r.io"
          className="microscope-footer-1"
        />
      {/* </div> */}
      <Suspense style={{visibility: 'hidden', display: 'none'}} fallback={<div>Loading...</div>}>
        <Search />
      </Suspense>

    </>
  )
}

export const dynamic = 'force-dynamic';