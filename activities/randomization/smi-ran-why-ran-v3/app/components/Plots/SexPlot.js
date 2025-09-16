import * as Plot from '@observablehq/plot'
import PlotFigure from './PlotFigure.jsx'
import data from '../../Data/data.json'
// import "./styles.css";

export default function App() {
  // Adjustable plot dimensions
  const plotWidth = 480 // Adjust this value for width
  const plotHeight = 300 // Adjust this value for height

  // Calculate counts
  const aggregatedData = data.reduce((acc, curr) => {
    const key = `${curr.treatmentType}_${curr.sex}`
    if (!acc[key]) {
      acc[key] = { treatmentType: curr.treatmentType, sex: curr.sex, count: 0 }
    }
    acc[key].count += 1
    return acc
  }, {})

  // Convert aggregated data to an array and sort for stacking order (Male first, Female second)
  const plotData = Object.values(aggregatedData).sort((a, b) => {
    if (a.sex === 'Male' && b.sex === 'Female') return -1 // Male comes first
    if (a.sex === 'Female' && b.sex === 'Male') return 1 // Female comes second
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
              backgroundColor: '#adf802',
              marginRight: '8px',
            }}
          ></span>
          <span>Male</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              width: '15px',
              height: '15px',
              backgroundColor: '#e78bf5',
              marginRight: '8px',
            }}
          ></span>
          <span>Female</span>
        </div>
      </div>

      {/* Plot */}
      <PlotFigure
        options={{
          marks: [
            Plot.barY(plotData, {
              x: 'treatmentType', // Group by treatment type
              y: 'count', // Count for each category
              fill: (d) => (d.sex === 'Male' ? '#adf802' : '#e78bf5'), // Custom colors for Male and Female
              title: (d) =>
                `Sex: ${d.sex}\nCount: ${d.count}\nTreatment Type: ${d.treatmentType}`
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
