"use client"
import React, { createRef, useRef, useState } from "react";

const MultipleSelector = ({ children, fields, handleSelected }) => {
  const selectorBtnEl = useRef(null);
  const inputElement = useRef(null);
  const [isOnList, setIsOnList] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  // Create a 2D array of refs
  const divRefs = useRef(
    Array.from({ length: fields.length }, () => createRef())
  );

  // Create a 2D array of state to track click status
  const [scheduleClicked, setScheduleClicked] = useState(
    Array.from({ length: fields.length }, () => false)
  );

  // Function to handle the click event on a div
  const handleClick = (rowIndex) => {
    // Toggle the click status
    const updatedClicked = [...scheduleClicked];
    updatedClicked[rowIndex] = !updatedClicked[rowIndex];
    setScheduleClicked(updatedClicked);
    setFieldSelected(updatedClicked);
  };
  const setFieldSelected = (e) => {
    setSelected(e);
    const selectedValues = [];
    if (handleSelected) {
      selectedValues.length = 0;
      for (let i in fields) {
        if (e[i]) {
          selectedValues.push(fields[i]);
        }
      }
      handleSelected(selectedValues);
    }
  };
  const btnblur=()=>{
    setIsOpen(false);
  }
  return (
    <button ref={selectorBtnEl} onBlur={btnblur} className="relative w-full">
      <div
        className={`${
          isOpen ? "rounded-b-none" : ""
        } bg-ui-gray-2 text-white relative rounded-xl shadow-[0_15px_10px_-10px_rgba(0,0,0,0.4)]`}
      >
        <div
          ref={inputElement}
          className={`${
            isOpen ? "z-0" : "z-50"
          } h-[26px] px-2 cursor-pointer w-full absolute top-0 left-0 opacity-0`}
          type="text"
          onFocus={() => {
            setIsOpen(true);
          }}
        ></div>
        <div
          className="bg-ui-gray-1 w-[26px] h-[26px] flex items-center justify-center absolute left-0 top-0 cursor-pointer rounded-tl-xl  rounded-bl-xl"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={18}
            viewBox="0 0 24 18"
            fill="none"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M22.6066 7.51472L13.0606 17.0607C12.4748 17.6464 11.5251 17.6464 10.9393 17.0607L1.39335 7.51472C0.807567 6.92893 0.807567 5.97918 1.39335 5.3934C1.97914 4.80761 2.92889 4.80761 3.51467 5.3934L10.5 12.3787L10.5 -4.68425e-07L13.5 -3.56415e-07L13.5 12.3787L20.4852 5.3934C21.071 4.80761 22.0208 4.80761 22.6066 5.3934C23.1923 5.97918 23.1923 6.92893 22.6066 7.51472Z"
              fill="#404040"
            />
          </svg>
        </div>
        <div className="text-black width-full-26px flex justify-start items-center relative ml-[26px] z-50">
          <div
            className="h-[26px] flex items-center px-2 cursor-pointer w-full"
            onClick={() => {
              setIsOpen(!isOpen);
            }}
          >
            <p>{children}</p>
          </div>
        </div>
      </div>

      <div
        onMouseOver={() => setIsOnList(false)}
        onMouseLeave={() => setIsOnList(true)}
        className={`${
          isOpen ? "" : "h-0 overflow-hidden"
        } absolute text-black top-[100%] w-full bg-ui-gray-3 rounded-bl-xl rounded-br-xl z-[1000]`}
      >
        {fields &&
          divRefs.current.map((ref, index) => (
            <div
              className={`${
                scheduleClicked[index] ? "bg-ui-gray-2/90" : ""
              } h-[26px] flex items-center px-2 cursor-pointer relative`}
              key={index}
              ref={ref}
              onClick={() => handleClick(index)}
            >
              <div className="absolute left-0 top-0 w-[26px] h-[26px] flex items-center justify-center">
                {scheduleClicked[index] && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={15}
                    viewBox="0 0 20 15"
                    fill="none"
                  >
                    <path
                      d="M0.0227051 7.81251L1.53407 6.26138L6.78407 11.4318L17.642 0.613647L19.1932 2.16478L6.78407 14.5341L0.0227051 7.81251Z"
                      fill="#A5A5A5"
                    />
                  </svg>
                )}
              </div>
              <p className="pl-[24px]">{fields[index]}</p>
            </div>
          ))}
      </div>
    </button>
  );
};

export default MultipleSelector;
