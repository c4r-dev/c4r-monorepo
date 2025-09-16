import React, { useState } from "react";

const Selector = ({children,fields,handleSelected}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const setFieldSelected = (e) => {
    setSelected(e);
    if(handleSelected){
        handleSelected(e)
    }
  };
  return (
    <div className={`${isOpen?'rounded-br-none':''} bg-ui-gray-2 text-white relative rounded-xl  shadow-[0_15px_10px_-10px_rgba(0,0,0,0.4)]`}
    onClick={() => {
        setIsOpen(!isOpen);
      }}
    >
      <div
        className="bg-ui-gray-1 w-[34px] h-[34px] flex items-center justify-center absolute left-0 top-0 cursor-pointer rounded-tl-xl  rounded-bl-xl"
        
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={24}
          height={18}
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
      <div className="text-black width-full-34px flex justify-start items-center relative ml-[34px]">
        
        <div className="h-[34px] flex items-center px-2 cursor-pointer">
          <p>{selected?selected:children}</p>
        </div>
        <div
          className={`${
            isOpen ? "" : "h-0 overflow-hidden"
          } absolute top-[100%] w-full bg-ui-gray-3 rounded-bl-xl rounded-br-xl z-40`}
        >
          {fields && fields.map((e, index) => (
            <div
              className="h-[34px] flex items-center px-2 cursor-pointer"
              key={index}
              onClick={() => setFieldSelected(e)}
            >
              <p>{e}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Selector;
