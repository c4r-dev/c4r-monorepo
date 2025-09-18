const logger = require('../../../../../../../packages/logging/logger.js');
'use client';
import { useEffect, useState } from 'react';
import styles from './pyodide-1.css';

export default function PyodideDemo() {
  const defaultCode = `import numpy as np
import matplotlib.pyplot as plt
from nd2reader import ND2Reader
from scipy.ndimage import zoom, gaussian_filter
from tifffile import imread


def load_image(file_path):
    if file_path.endswith('.nd2'):
        microscopy_data = ND2Reader(file_path)
        raw_image = microscopy_data[0]
        downsampling_factor = 0.5
        blur_factor = 1

    elif file_path.endswith('.tiff') or file_path.endswith('.tif'):
        raw_image = imread(file_path)
        downsampling_factor = 0.3
        blur_factor = 2

    else:
        raise ValueError(f"Unsupported file format: {file_path}")

    return raw_image, downsampling_factor, blur_factor


def normalize_image(image):
    lowest_pixel_value = np.min(image)
    highest_pixel_value = np.max(image)

    pixel_value_range = highest_pixel_value - lowest_pixel_value
    bottom_capped_image = image - lowest_pixel_value

    normalized_image = bottom_capped_image / pixel_value_range

    return normalized_image


def downsample_image(image, factor):
    downsampled_image = zoom(image, (factor, factor))
    return downsampled_image


def smooth_image(image, factor):
    smoothed_image = gaussian_filter(image, sigma=factor)
    return smoothed_image


def preprocess_image(raw_image, downsampling_factor, gaussian_sigma):
    normalized_image = normalize_image(raw_image)
    downsampled_image = downsample_image(normalized_image, downsampling_factor)
    smoothed_image = smooth_image(downsampled_image, gaussian_sigma)

    return smoothed_image


def plot_images(raw_images, processed_images):
    num_images = len(raw_images)
    fig, axes = plt.subplots(num_images, 2, figsize=(12, 6 * num_images))

    for i in range(num_images):
        axes[i, 0].imshow(raw_images[i], cmap='gray')
        axes[i, 0].set_title(f'Raw Image {i + 1}')
        axes[i, 0].axis('off')

        axes[i, 1].imshow(processed_images[i], cmap='gray')
        axes[i, 1].set_title(f'Processed Image {i + 1}')
        axes[i, 1].axis('off')

    plt.show()


if __name__ == "__main__":
    file_paths = ['microscopy_volume1.nd2', 'microscopy_volume2.nd2', 'microscopy_volume3.tiff']

    raw_images = []
    processed_images = []

    for file_path in file_paths:
        raw_image, downsampling_factor, blur_factor = load_image(file_path)

        processed_image = preprocess_image(raw_image, downsampling_factor, blur_factor)

        raw_images.append(raw_image)
        processed_images.append(processed_image)

    plot_images(raw_images, processed_images)`;

  const [pyodide, setPyodide] = useState(null);
  const [plotImage, setPlotImage] = useState(null);
  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPyodideScript() {
      // Load Pyodide script if not already loaded
      if (!window.loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';
        script.async = true;
        document.head.appendChild(script);
        
        return new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }
    }

    async function initPyodide() {
      try {
        setOutput('Loading Pyodide...');
        await loadPyodideScript();
        const loadPyodide = window.loadPyodide;
        const pyodideInstance = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/"
        });
        
        setOutput('Loading Python packages...');
        
        // Load required packages
        await pyodideInstance.loadPackage([
          "numpy", 
          "matplotlib", 
          "scipy",
          "micropip"
        ]);
        
        // Install additional packages via micropip that aren't in the standard Pyodide distribution
        try {
          await pyodideInstance.runPythonAsync(`
            import micropip
            await micropip.install(["tifffile"])
            print("Successfully installed tifffile")
          `);
        } catch (e) {
          logger.app.info("Could not install tifffile:", e.message);
        }
        
        try {
          await pyodideInstance.runPythonAsync(`
            import micropip
            await micropip.install(["nd2reader"])
            print("Successfully installed nd2reader")
          `);
        } catch (e) {
          logger.app.info("Could not install nd2reader:", e.message);
        }
        
        setPyodide(pyodideInstance);
        setOutput('Pyodide and packages loaded successfully! Ready to run Python code.');
        setLoading(false);
      } catch (error) {
        logger.app.error('Error initializing Pyodide:', error);
        setOutput(`Error initializing Pyodide: ${error.message}`);
        setLoading(false);
      }
    }
    initPyodide();
  }, []);

  const runCode = async () => {
    if (!pyodide) return;
    
    try {
      setOutput('Running code...');
      setPlotImage(null); // Clear any previous plot
      
      // Setup matplotlib for web display and override plt.show()
      pyodide.runPython(`
        import sys
        from io import StringIO
        import matplotlib
        matplotlib.use('Agg')  # Use non-interactive backend
        import matplotlib.pyplot as plt
        import io
        import base64
        import traceback
        
        # Setup output capture for both stdout and stderr
        sys.stdout = StringIO()
        sys.stderr = StringIO()
        
        # Clear any existing plots
        plt.clf()
        
        # Store the original show function
        _original_show = plt.show
        
        # Override plt.show to prevent warnings and capture plot
        def custom_show(*args, **kwargs):
            # Don't actually show, just pass
            pass
        
        plt.show = custom_show
      `);
      
      // Setup mock data and patch file loading functions for the new microscopy code
      pyodide.runPython(`
        import numpy as np
        
        # Create mock microscopy data
        def create_mock_nd2_data():
            """Create mock ND2-like data"""
            x, y = np.meshgrid(np.linspace(-1, 1, 200), np.linspace(-1, 1, 200))
            # Simulate cell-like structures
            return np.exp(-(x**2 + y**2) * 1.5) + 0.2 * np.random.random((200, 200))
        
        def create_mock_tiff_data():
            """Create mock TIFF-like data"""
            x, y = np.meshgrid(np.linspace(-2, 2, 150), np.linspace(-2, 2, 150))
            # Simulate different microscopy patterns
            return np.sin(3*x) * np.cos(3*y) * np.exp(-(x**2 + y**2) * 0.5) + 0.3 * np.random.random((150, 150))
        
        # Mock ND2Reader class
        class MockND2Reader:
            def __init__(self, file_path):
                self.data = create_mock_nd2_data()
            
            def __getitem__(self, index):
                return self.data
        
        # Mock tifffile.imread function
        def mock_imread(file_path):
            return create_mock_tiff_data()
        
        # Patch the imports
        import sys
        from types import ModuleType
        
        # Create mock modules
        nd2reader_module = ModuleType('nd2reader')
        nd2reader_module.ND2Reader = MockND2Reader
        sys.modules['nd2reader'] = nd2reader_module
        
        tifffile_module = ModuleType('tifffile')
        tifffile_module.imread = mock_imread
        sys.modules['tifffile'] = tifffile_module
        
        print("Mock file loading functions initialized")
      `);

      // Run the user's code with better error handling
      let result;
      let executionError = null;
      
      try {
        result = pyodide.runPython(`
try:
    exec('''${code.replace(/'/g, "\\'")}''')
    "Code executed successfully"
except Exception as e:
    import traceback
    error_details = {
        'type': type(e).__name__,
        'message': str(e),
        'traceback': traceback.format_exc()
    }
    print(f"ERROR: {error_details['type']}: {error_details['message']}")
    print("\\nFull traceback:")
    print(error_details['traceback'])
    f"Python Error: {error_details['type']}: {error_details['message']}"
        `);
        
        if (result && result.includes('Python Error:')) {
          executionError = result;
        }
      } catch (jsError) {
        executionError = `JavaScript Error: ${jsError.message}`;
      }
      
      // Get captured stdout and stderr
      const stdout = pyodide.runPython("sys.stdout.getvalue()");
      const stderr = pyodide.runPython("sys.stderr.getvalue()");
      
      // Try to capture and display any matplotlib plots
      let plotOutput = '';
      let plotError = null;
      
      try {
        const plotData = pyodide.runPython(`
          import matplotlib.pyplot as plt
          import io
          import base64
          
          # Debug: Check if there are any figures
          fig_nums = plt.get_fignums()
          
          if fig_nums:
              # Get the current figure
              fig = plt.gcf()
              
              buf = io.BytesIO()
              plt.savefig(buf, format='png', bbox_inches='tight', dpi=150)
              buf.seek(0)
              img_base64 = base64.b64encode(buf.getvalue()).decode()
              plt.close('all')  # Close all figures
              img_base64
          else:
              None
        `);
        
        if (plotData) {
          plotOutput = `\n\n--- Plot Generated Successfully ---\n`;
          setPlotImage(`data:image/png;base64,${plotData}`);
        } else {
          plotOutput = `\n\n--- No Plot Generated ---\n`;
          setPlotImage(null);
        }
      } catch (plotErr) {
        plotError = `Plot Error: ${plotErr.message}`;
        plotOutput = `\n\n--- ${plotError} ---\n`;
        setPlotImage(null);
      }
      
      // Combine all outputs with better formatting
      let fullOutput = '';
      
      if (stdout) {
        fullOutput += `📤 STDOUT:\n${stdout}\n`;
      }
      
      if (stderr) {
        fullOutput += `❌ STDERR:\n${stderr}\n`;
      }
      
      if (executionError) {
        fullOutput += `🚨 EXECUTION ERROR:\n${executionError}\n`;
      }
      
      if (result && !executionError) {
        fullOutput += `✅ EXECUTION RESULT:\n${result}\n`;
      }
      
      if (plotError) {
        fullOutput += `📊 PLOT ERROR:\n${plotError}\n`;
      }
      
      fullOutput += plotOutput;
      
      setOutput(fullOutput || '✅ Code executed successfully (no output)');
      
    } catch (error) {
      setOutput(`💥 SYSTEM ERROR: ${error.message}\n\nStack trace:\n${error.stack}`);
    }
  };

  return (
    <div className="container">
      <h1>Python Code Executor</h1>
      
      {loading ? (
        <p>Loading Pyodide...</p>
      ) : (
        <>
          <div className="code-section">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter Python code here..."
              rows={20}
            />
          </div>
          <button onClick={runCode} className="run-button">
            Run Code
          </button>
          <div className="output-section">
            <h3>Output:</h3>
            <pre className="code-output">{output}</pre>
          </div>
          {plotImage && (
            <div className="plot-section">
              <h3>Generated Plot:</h3>
              <img src={plotImage} alt="Generated matplotlib plot" className="plot-image" />
            </div>
          )}
        </>
      )}
    </div>
  );
} 
