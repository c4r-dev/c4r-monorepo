"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import "./instructions.css";
import Logo from '../assets2/logo-sideways.svg';
import RavenIceCream from '../assets2/raven-ice-cream.svg';

const ContinueButton = () => {
    const searchParams = useSearchParams();
    const labGroupId = searchParams.get("labGroupId");

    const router = useRouter();
    const onContinue = () => {
        if (labGroupId) {
            router.push(`/phase1?labGroupId=${labGroupId}`);
        } else {
            router.push("/phase1");
        }
    };
    return (
        <button onClick={onContinue} className="continue-button">
            Continue
        </button>
    );
};

export default function Instructions() {
    return (
        <div className="instructions-screen-container">
          <div className="activity-header">
            <Image src={Logo} alt="Logo" className="logo-sideways" />
          </div>

            <div className="instructions-screen-body">
              <div className="instructions-screen-header">
                  <h1>Did Ice Cream Cause Polio?</h1>
              </div>
                <div className="instructions-text-area-1">
                    <h3>Why were kids who ate ice cream getting polio?</h3>
                    <p>
                        The health administration in San Francisco in the 1920s
                        observed a spike in ice cream consumption and polio
                        cases in children.
                    </p>
                    <div className="video-container">
                        <iframe
                            src="https://www.youtube.com/embed/lbODqslc4Tg"
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>

                    <div className="button-area">
                        <Suspense fallback={<div>Loading...</div>}>
                            <ContinueButton />
                        </Suspense>
                    </div>                

                {/* <div className="bubble-area">
                    <div className="bubble-container">
                        <div className="bubble-text">
                            <h3>Watch this clip to learn about the story.</h3>
                        </div>
                    </div>
                </div> */}



            </div>

                  <div className="raven-area">
                    <Image src={RavenIceCream} alt="Raven Ice Cream" className="raven-ice-cream" />
                    <div className="speech-bubble-container">
                      <div className="speech-bubble">
                        <h3>Watch this clip to learn about the story.</h3>
                      </div>
                      <div className="speech-bubble-tail"></div>
                    </div>
                  </div>

        </div>
    );
}
