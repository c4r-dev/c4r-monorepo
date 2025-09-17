import * as Plot from '@observablehq/plot'
import PlotFigure from './PlotFigure.jsx'
import data from '../../Data/new-data.json'
// import data from "../../Data/data.json";
// import "./styles.css";

export default function App() {
  // Adjustable plot dimensions
  const plotWidth = 480 // Adjust this value for width
  const plotHeight = 300 // Adjust this value for height

  // Calculate counts
  const aggregatedData = data.reduce((acc, curr) => {
    const key = `${curr.treatmentType}_${curr.litter}`
    if (!acc[key]) {
      acc[key] = { treatmentType: curr.treatmentType, litter: curr.litter, count: 0 }
    }
    acc[key].count += 1
    return acc
  }, {})

  // Convert aggregated data to an array and sort for stacking order (Male first, Female second)
  const plotData = Object.values(aggregatedData).sort((a, b) => {
    if (a.litter === 'B' && b.litter === 'A') return -1 // Male comes first
    if (a.litter === 'A' && b.litter === 'B') return 1 // Female comes second
    return 0
  })

  return (
    <div className="App">
      {/* Centered Horizontal Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              width: '15px',
              height: '15px',
              backgroundColor: '#00C802',
              marginRight: '8px',
            }}
          ></span>
          <span>B</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              width: '15px',
              height: '15px',
              backgroundColor: '#F031DD',
              marginRight: '8px',
            }}
          ></span>
          <span>A</span>
        </div>
      </div>

      {/* Plot */}
      <PlotFigure
        options={{
          marks: [
            Plot.barY(plotData, {
              x: 'treatmentType', // Group by treatment type
              y: 'count', // Count for each category
              fill: (d) => (d.litter === 'B' ? '#00C802' : '#F031DD'), // Custom colors for Male and Female
              title: (d) =>
                `Litter: ${d.litter}\nCount: ${d.count}\nTreatment Type: ${d.treatmentType}`
            }),
            Plot.axisX({ label: 'Treatment Type', labelOffset: 30 }),
            Plot.axisY({ label: 'Count', labelOffset: 30 }),
          ],
          width: plotWidth, // Adjustable width
          height: plotHeight, // Adjustable height
        }}
      />
    </div>
  )
}
