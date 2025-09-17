import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RangeSlider from "./components/RangeSlider"
import ShowResults from "./components/ShowResults"

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RangeSlider min={0} max={100} value={0} step={1} />} />
          <Route path="/showResults" element={<ShowResults />} />
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App
