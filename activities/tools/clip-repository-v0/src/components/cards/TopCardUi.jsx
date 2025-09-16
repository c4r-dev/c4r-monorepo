import Image from "next/image";
import React, { useState } from "react";
import VideoListCardLayout from "./VideoListCardTopLayout";

const TopCardUi = () => {
  const question = "hello";
  const [answerShow, setAnswerShow] = useState(false);
  const toggleAnswerShow = () => {
    setAnswerShow(!answerShow);
  };
  return (
    <VideoListCardLayout imageurl={"/imoje-charecters/Raven-investigating.png"}>
      <div>
      <h4 className="text-[33px] leading-[64px] text-center font-bold text-black">
        Let’s put a face to this.
      </h4>
      <p className="text-[18px] leading-[24px] text-center font-normal text-black">
      The cost of lacking rigor is not always visible, so we’ve collected testimonials volunteered by rigor champions from all walks of life to highlight the real human impact these issues often have.
      </p>
      <p className="text-[14px] leading-[24px] text-center font-bold text-black mt-1">
      Based on your background, we recommend these...
      </p>
      </div>
    </VideoListCardLayout>
  );
};

export default TopCardUi;
