const logger = require('../../../packages/logging/logger.js');
"use client";

import Header from "./components/Header/Header";
import CustomButton from "./components/CustomButton";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="full-page">
      <Header /> {/* Header component */}
      <div className="page-content">

        <h2>Welcome to the C4R Activity Template</h2>

        <h3>Example Buttons</h3>
        {/* Example using our MUI CustomButton component */}
        <CustomButton
          variant="primary" // primary, tertiary, blue, grey, etc.
          onClick={() => {
            logger.app.info("Button clicked");
          }}>
          Click me
        </CustomButton>

        <CustomButton
          variant="grey" 
          onClick={() => {
            logger.app.info("Button clicked");
          }}>
          Click me
        </CustomButton>

        <CustomButton
          variant="blue" 
          onClick={() => {
            logger.app.info("Navigate to example page");
            router.push('/examplePage?sessionID=1234567890');
          }}>
          Navigate to Example Page
        </CustomButton>

      </div>
    </div>
  );
}
