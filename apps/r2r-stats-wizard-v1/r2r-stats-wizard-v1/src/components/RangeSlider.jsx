import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ReactComponent as Raven1 } from "../assets/ravens_dots_and_clouds/raven-phase-1.svg";
import { ReactComponent as Raven2 } from "../assets/ravens_dots_and_clouds/raven-phase-2.svg";
import { ReactComponent as Raven3 } from "../assets/ravens_dots_and_clouds/raven-phase-3.svg";
import { ReactComponent as Raven4 } from "../assets/ravens_dots_and_clouds/raven-phase-4.svg";
import { ReactComponent as Raven5 } from "../assets/ravens_dots_and_clouds/raven-phase-5.svg";

import "./range-slider.css";

function RangeSlider({ min, max, value, step }) {
    const [sliderRange, setSliderRange] = useState(value);
    const [inputValue, setInputValue] = useState(value);
    const sliderRef = useRef(null);

    const navigate = useNavigate();

    const submitButtonClick = () => {
        console.log(inputValue);
        sessionStorage.setItem("guess", inputValue);
        navigate("/showResults");
    };

    const setImage = () => {
        /*
      // Non-animated version
      if (inputValue < 25) {
        return <Raven1 style={{ width: "100%", margin: "0 auto" }} />;
      }
      else if (inputValue < 50 && inputValue >= 25) {
        return <Raven2 style={{ width: "100%", margin: "0 auto" }} />;
      }
      else if (inputValue < 75 && inputValue >= 50) {
        return <Raven3 style={{ width: "100%", margin: "0 auto" }} />;
      }
      else if (inputValue < 90 && inputValue >= 75) {
        return <Raven4 style={{ width: "100%", margin: "0 auto" }} />;
      }
      else {
        return <Raven5 style={{ width: "100%", margin: "0 auto" }} />;
      }
     */
    const ravenStyle = {
        width: "100%",
        height: "100%",
        // maxWidth: "300px",
        position: "absolute",
        top: 0,
        left: 0,
        opacity: 0,
        transition: "opacity 0.5s",
    }


        const images = [
            {
                component: (
                    <Raven1
                        style={ravenStyle}
                    />
                ),
                threshold: 25,
            },
            {
                component: (
                    <Raven2
                        style={ravenStyle}
                    />
                ),
                threshold: 50,
            },
            {
                component: (
                    <Raven3
                        style={ravenStyle}
                    />
                ),
                threshold: 75,
            },
            {
                component: (
                    <Raven4
                        style={ravenStyle}
                    />
                ),
                threshold: 90,
            },
            {
                component: (
                    <Raven5
                        style={ravenStyle}
                    />
                ),
                threshold: 101,
            },
        ];

        return (
            <div
                style={{ position: "relative", width: "100%", height: "100%" }}
            >
                {images.map((image, index) => {
                    const isVisible =
                        inputValue < image.threshold &&
                        (index === 0 ||
                            inputValue >= images[index - 1].threshold);
                    return React.cloneElement(image.component, {
                        style: {
                            ...image.component.props.style,
                            opacity: isVisible ? 1 : 0,
                        },
                    });
                })}
            </div>
        );
    };

    function handleSliderInput() {
        //Get range between max & min values
        const range = max - min;
        //Get distance between value and min value
        const distance = sliderRef.current.value - min;
        //Turn into percentage
        const percentage = (distance / range) * 100;
        //Set slider range to percentage
        setSliderRange(percentage);
        //Set input value for number input to slider value
        setInputValue(sliderRef.current.value);
    }

    function handleNumberInput(e) {
        //Set number input value to a new variable
        const newValue = parseInt(e.target.value);
        //Check if it's below the min value
        if (newValue < min) {
            //Set it to the min value
            setInputValue(min);
            //Set slider to the beginning
            setSliderRange(0);
            //Check if it's above the max value
        } else if (newValue > max) {
            //Set it to the max value
            setInputValue(max);
            //Set slider to the end
            setSliderRange(100);
        } else {
            //Set number input value to the new variable
            setInputValue(newValue);
            //Redo calculation from before for the slider range
            const range = max - min;
            const distance = newValue - min;
            const percentage = (distance / range) * 100;
            setSliderRange(percentage);
        }
    }

    /*Run function when slider reference is set*/
    useEffect(() => {
        handleSliderInput();
    }, [sliderRef]);

    return (
        <div className="content-container">
            <h1>
                What percentage of researchers do you think believe that there
                is a reproducibility crisis?
            </h1>
            
            <div className="content-container-raven">{setImage()}</div>

            <div className="range-slider">
                {/* <div className="slider-values">
                    <small>{min}%</small>
                    <small>{max}%</small>
                </div> */}
                <div className="slider-value">
                    <small>{min}%</small>
                </div>
                <div className="slider-container">
                    <input
                        type="range"
                        onInput={handleSliderInput}
                        value={inputValue}
                        className="slider"
                        min={min}
                        max={max}
                        ref={sliderRef}
                        step={step}
                    />
                    <div
                        className="slider-thumb"
                        style={{ left: `calc(${sliderRange}% - 0.5em)` }}
                    ></div>
                    <div
                        className="progress"
                        style={{ width: `${sliderRange}%` }}
                    ></div>
                </div>
                <div className="slider-value">
                    <small>{max}%</small>
                </div>
            </div>

            <div className="percent-display">
                <p>{inputValue}%</p>
            </div>
            <div className="submit-button-container">
                <input
                    type="button"
                    onClick={submitButtonClick}
                    value="SUBMIT"
                    className="submit-button"
                />
            </div>
        </div>
    );
}

export default RangeSlider;
