import React, { useState } from "react";

const Checkbox = ({children,handleChecked}) => {
  const [isChecked, setIsChecked] = useState(false);
  const toggleCheckbox =()=> {
    setIsChecked(!isChecked)
    handleChecked(!isChecked)
}
  return (
    <div className="relative h-[34px] pl-[34px] flex items-center shadow-[0_15px_10px_-10px_rgba(0,0,0,0.4)] cursor-pointer">
      <svg
      className="absolute left-0 top-0"
        xmlns="http://www.w3.org/2000/svg"
        width={34}
        height={34}
        viewBox="0 0 34 34"
        fill="none"
        onClick={toggleCheckbox}
      >
        <g filter="url(#filter0_i_33_3)">
          <rect width={34} height={34} fill="#828282" />
        </g>
        <rect
          x="1.5"
          y="1.5"
          width={31}
          height={31}
          stroke="#C7C7C7"
          strokeWidth={3}
        />
        {isChecked && (
          <path
            d="M7.68457 18.4588L10.4885 15.6449L15.0922 20.1691L25.3039 9.99719L28.1278 12.8111L15.0922 25.777L7.68457 18.4588Z"
            fill="#404040"
          />
        )}

        <defs>
          <filter
            id="filter0_i_33_3"
            x={0}
            y={0}
            width={34}
            height={34}
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity={0} result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feMorphology
              radius={4}
              operator="erode"
              in="SourceAlpha"
              result="effect1_innerShadow_33_3"
            />
            <feOffset />
            <feGaussianBlur stdDeviation="0.5" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend
              mode="normal"
              in2="shape"
              result="effect1_innerShadow_33_3"
            />
          </filter>
        </defs>
      </svg>
        <p className="pl-2 w-full text-ui-gray-2">{children}</p>
    </div>
  );
};

export default Checkbox;
