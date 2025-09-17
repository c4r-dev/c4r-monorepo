import React, { useState, useRef, useEffect } from "react";
import "./EnhancedPopupWidget.css";

const EnhancedPopupWidget = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const triggerRef = useRef(null);
  const popupRef = useRef(null);
  const timeoutRef = useRef(null);

  const showPopup = () => {
    clearTimeout(timeoutRef.current);
    setIsRendered(true);
    // Slight delay to ensure the popup is rendered before adding the visible class
    setTimeout(() => {
      setIsVisible(true);
    }, 10);
  };

  const hidePopup = () => {
    setIsVisible(false);
    // Wait for the transition to finish before unmounting
    timeoutRef.current = setTimeout(() => {
      setIsRendered(false);
    }, 500); // Match this duration with the CSS transition duration
  };

  // Handle clicking outside to close the popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        hidePopup();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      clearTimeout(timeoutRef.current);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="ew-container">
      <span
        ref={triggerRef}
        className="ew-trigger"
        onMouseEnter={showPopup}
        onMouseLeave={hidePopup}
      >
        Hover over me
      </span>
      {isRendered && (
        <div
          ref={popupRef}
          className={`ew-popup ${isVisible ? "visible" : ""}`}
          onMouseEnter={showPopup}
          onMouseLeave={hidePopup}
        >
          <div className="ew-popup-content">
            <h4 className="ew-popup-title">Enhanced Popup Content</h4>
            <p className="ew-popup-text">
              This popup now appears and disappears slower. It has a colored gradient background,
              rounded edges, a shadow, and an arrow pointing towards the source.
            </p>
            <p className="ew-popup-text">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nunc id aliquam
              tincidunt, nisl nunc tincidunt nunc, vitae aliquam nunc nunc vitae nunc. Sed vitae nunc
              vitae nunc tincidunt tincidunt. Sed vitae nunc vitae nunc tincidunt tincidunt.
            </p>
            <p className="ew-popup-text">
              Scroll to see more content. This demonstrates the scrolling feature of the popup when
              content exceeds the maximum height.
            </p>
          </div>
          <div className="ew-arrow" />
        </div>
      )}
    </div>
  );
};

export default EnhancedPopupWidget;
