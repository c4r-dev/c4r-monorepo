import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import StartRaven from './components/startRaven';
import WelcomePage from './components/welcomePage';
import SelectPage from './components/selectPage';
import ClinicalTrial1 from './components/clinicalTrial1';
import ClinicalTrial2 from './components/clinicalTrial2';
import ClinicalTrial3 from './components/clinicalTrial3';
import ClinicalTrialA from './components/clinicalTrialA';
import ClinicalTrialB from './components/clinicalTrialB';
import ClinicalTrialC from './components/clinicalTrialC';
import FinalPage from './components/finalPage';

import ScreenToPdf from './components/screenToPdf';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StartRaven />} />
          <Route path="/welcomePage" element={<WelcomePage />} />
          <Route path="/selectPage" element={<SelectPage />} />
          <Route path="/clinicalTrial1" element={<ClinicalTrial1 />} />
          <Route path="/clinicalTrial2" element={<ClinicalTrial2 />} />
          <Route path="/clinicalTrial3" element={<ClinicalTrial3 />} />
          <Route path="/clinicalTrialA" element={<ClinicalTrialA />} />
          <Route path="/clinicalTrialB" element={<ClinicalTrialB />} />
          <Route path="/clinicalTrialC" element={<ClinicalTrialC />} />
          <Route path="/finalPage" element={<FinalPage />} />

          <Route path="/screenToPdf" element={<ScreenToPdf />} />

        </Routes>
      </BrowserRouter>
    </>
  );
}