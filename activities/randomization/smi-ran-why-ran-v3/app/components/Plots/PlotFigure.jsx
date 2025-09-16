// import * as Plot from "@observablehq/plot";
// import { useEffect, useRef } from "react";

// // For server-side rendering, see https://codesandbox.io/s/plot-react-f1jetw?file=/src/PlotFigure.js:89-195

// export default function PlotFigure({ options }) {
//   const containerRef = useRef();

//   useEffect(() => {
//     if (options == null) return;
//     const plot = Plot.plot(options);
//     containerRef.current.append(plot);
//     return () => plot.remove();
//   }, [options]);

//   return <div ref={containerRef} />;
// }

import * as Plot from "@observablehq/plot";
import { useEffect, useRef } from "react";

export default function PlotFigure({ options }) {
  const containerRef = useRef();

  useEffect(() => {
    if (options == null) return;
    const plot = Plot.plot(options);
    containerRef.current.append(plot);

    // Remove the top and right borders from the frame
    const framePaths = containerRef.current.querySelectorAll(".plot-frame path");
    if (framePaths.length > 0) {
      // Observable Plot typically renders frame paths in this order:
      // 0 - Bottom, 1 - Left, 2 - Top, 3 - Right
      if (framePaths[2]) framePaths[2].remove(); // Remove top border
      if (framePaths[3]) framePaths[3].remove(); // Remove right border
    }

    return () => plot.remove();
  }, [options]);

  return <div ref={containerRef} />;
}
