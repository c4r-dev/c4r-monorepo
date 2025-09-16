import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';

import Randomize1 from './components/randomize1';
import Randomize2 from './components/randomize2';
import FinalPage from './components/finalPage';

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Randomize1 />} />
          <Route path="/randomize2" element={<Randomize2 />} />
          <Route path="/finalpage" element={<FinalPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}