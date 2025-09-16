import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';

import StartActivity from "./StartActivity"
import IdentifyResearchQues from "./IdentifyResearchQues"
import BSQues from './BSQues';

function App() {
  return (
    <div className="App">
     <BrowserRouter>
        <Routes>
          <Route path="/" element={<StartActivity/>} />
          <Route path="/IdentifyResearchQues" element={<IdentifyResearchQues/>} />
          <Route path="/bsQues" element={<BSQues/>} />
          </Routes>
          </BrowserRouter>
    </div>
  );
}

export default App;
