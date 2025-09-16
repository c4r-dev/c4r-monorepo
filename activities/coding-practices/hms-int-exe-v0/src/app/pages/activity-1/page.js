'use client';
import { useEffect, useState, useCallback } from 'react';
import './activity-1.css';
import { TextareaHighlight } from "./TextareaHighlight.js";
import { loadInitialCode, PHASES, INSTRUCTIONS, hasMinimumRegions, EXAMPLE_SOLUTION } from './utils/sharedUtils';
import Header from '../../components/Header/Header';

// Component to format markdown-like text
const FormattedFeedback = ({ text }) => {
  const formatText = (text) => {
    return text
      .split('\n')
      .map((line, index) => {
        // Handle bold text **text**
        let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Handle code blocks `code`
        formattedLine = formattedLine.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        return (
          <div key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} />
        );
      });
  };

  return <div>{formatText(text)}</div>;
};

export default function Activity1Page() {
  const [value, setValue] = useState('');
  const [highlightedRegions, setHighlightedRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(PHASES.IDENTIFICATION);
  const [pyodide, setPyodide] = useState(null);
  const [codeOutput, setCodeOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [hasExecutionError, setHasExecutionError] = useState(false);
  const [originalCode, setOriginalCode] = useState('');
  const [originalRegions, setOriginalRegions] = useState([]);
  const [phase2ModifiedCode, setPhase2ModifiedCode] = useState('');
  const [activeTab, setActiveTab] = useState('updated');
  const [questionAnswers, setQuestionAnswers] = useState({
    goodNames: null,
    simplicity: null,
    readability: null
  });
  const [validationLoading, setValidationLoading] = useState({});
  const [feedbackMessages, setFeedbackMessages] = useState({});
  const [overriddenQuestions, setOverriddenQuestions] = useState({});
  const [isLoadingCode, setIsLoadingCode] = useState(true);
  const [isExplainMode, setIsExplainMode] = useState(false);

  const EXPLANATIONS_DATA = [
  {
    "Line": 6,
    "Code": "f",
    "Description": "This variable represents the file input/output object."
  },
  {
    "Line": 6,
    "Code": "NWBHDF5IO",
    "Description": "This creates the file input/output object."
  },
  {
    "Line": 6,
    "Code": "sub-11-YAaLR_ophys.nwb'",
    "Description": "This is the path to our data file."
  },
  {
    "Line": 6,
    "Code": "\"r\"",
    "Description": "This is the \"mode\" argument of the NWBHDF5IO call, which specifies whether we plan to read the file, write to the file, or do both."
  },
  {
    "Line": 6,
    "Code": "f = NWBHDF5IO('sub-11-YAaLR_ophys.nwb', \"r\")",
    "Description": "In this line, we're leveraging the NWBHDF5IO() object imported fromt he pynwb library to open a .nwb file in \"read\" mode."
  },
  {
    "Line": 8,
    "Code": "fd",
    "Description": "This variable represents the contents read from a file."
  },
  {
    "Line": 8,
    "Code": "f.read()",
    "Description": "Here, we're calling the read() function in order to access the contents of the file \"f\"."
  },
  {
    "Line": 8,
    "Code": "fd = f.read()",
    "Description": "In this line, we're reading the contents of the file \"f\" and assigning them to the variable \"fd\"."
  },
  {
    "Line": 9,
    "Code": "d",
    "Description": "This variable represents our raw image data."
  },
  {
    "Line": 9,
    "Code": "np.transpose",
    "Description": "This function rearranges matrices."
  },
  {
    "Line": 9,
    "Code": ".acquisition",
    "Description": "This selects specifically the microscope acquisition module within the file contents."
  },
  {
    "Line": 9,
    "Code": "['NeuroPALImageRaw']",
    "Description": "This selects a particular image within the acquisition module."
  },
  {
    "Line": 9,
    "Code": ".data[:]",
    "Description": "This selects the raw data within the selected image."
  },
  {
    "Line": 9,
    "Code": "fd.acquisition['NeuroPALImageRaw'].data[:]",
    "Description": "Here we're extracting the file contents associated with the raw data of a particular microscopy image."
  },
  {
    "Line": 9,
    "Code": "(1, 0, 2, 3)",
    "Description": "These are indices describing the order of the axes as represented in the data file (x/width, y/height, z/depth, c/color), and sorted according to our desired order (x/width, y/height, z/depth, and c/color)."
  },
  {
    "Line": 9,
    "Code": "1",
    "Description": "This is the first element in our tuple, and essentially tells the transpose function that we want the first dimension of our new image to be the second dimension of our old image. Because python is zero-indexed, the second dimension is specified by the index 1."
  },
  {
    "Line": 9,
    "Code": "2",
    "Description": "This is the third item in our tuple, and essentially tells the transpose function that we want the third dimension of our new image to be the third dimension of our old image. Because python is zero-indexed, the third dimension is specified by the index 2."
  },
  {
    "Line": 9,
    "Code": "3",
    "Description": "This is the fourth item in our tuple, and essentially tells the transpose function that we want the fourth dimension of our new image to be the fourth dimension fo our old image. Because python is zero-indexed, the third dimension is specified by the index 3."
  },
  {
    "Line": 10,
    "Code": "d = np.transpose(fd.acquisition['NeuroPALImageRaw'].data[:], (1, 0, 2, 3))",
    "Description": "In this line, we're extracting the indices that correspond to the red, green, and blue colors in our image matrix."
  },
  {
    "Line": 10,
    "Code": ".RGBW_channels[:3]",
    "Description": "This selects the first three elements of the \"RGBW_channels\" property of our selected data."
  },
  {
    "Line": 10,
    "Code": "d = d[:, :, :, fd.acquisition['NeuroPALImageRaw'].RGBW_channels[:3]]",
    "Description": "In this line, we're again selecting our target data, but this time we're retrieving metadata that specifies the indices of the red, green, and blue color channels of our image matrix."
  },
  {
    "Line": 11,
    "Code": "f.close()",
    "Description": "This line closes the input/output object. We do this here because we're done reading from the file."
  },
  {
    "Line": 13,
    "Code": "np.argsort",
    "Description": "This function sorts a given array according to size and returns the corresponding indices."
  },
  {
    "Line": 13,
    "Code": "d.shape",
    "Description": "This line retrieves the shape -- that is, the size of each dimension -- of our image array."
  },
  {
    "Line": 13,
    "Code": "np.argsort(d.shape)",
    "Description": "Here we use the imported argsort function to sort the dimensions of our image (width, height, depth, and color) from smallest to biggest."
  },
  {
    "Line": 13,
    "Code": "[1]",
    "Description": "Here we index into the resulting array, grabbing the second element."
  },
  {
    "Line": 13,
    "Code": "np.argsort(d.shape)[1]",
    "Description": "This line first sorts the dimensions of our image array from smallest to biggest, and then grabs the index of the second smallest dimension, which we expect to be the depth dimension."
  },
  {
    "Line": 13,
    "Code": "d = np.max(d, np.argsort(d.shape)[1])",
    "Description": "This compresses the image along its depth dimension by only preserving the maximum pixel intensity along that dimension. We're essentially creating a preview of a 3 dimensional volume by just looking at the brightest pixel for each x-y coordinate. This is commonly called the \"maximum intensity projection\" of our original image."
  },
  {
    "Line": 14,
    "Code": "np.min(d)",
    "Description": "This calculates the smallest pixel value in the entire image."
  },
  {
    "Line": 14,
    "Code": "d - np.min(d)",
    "Description": "This subtracts the smallest pixel value in the image from the entire image, so the range of pixel values should now start at zero."
  },
  {
    "Line": 14,
    "Code": "np.max(d)",
    "Description": "This calculates the largest pixel value in the entire image."
  },
  {
    "Line": 14,
    "Code": "(d - np.min(d)) / (np.max(d) - np.min(d))",
    "Description": "This is our normalization equation. It creates a copy of the image whose pixel values lie completely between 0 and 1."
  },
  {
    "Line": 14,
    "Code": "(1, 0.80, 1)",
    "Description": "This is a tuple describing downsampling factors along each of our remaining image dimensions."
  },
  {
    "Line": 14,
    "Code": "zoom((d - np.min(d)) / (np.max(d) - np.min(d)), (1, 0.80, 1))",
    "Description": "This leverages the zoom() function imported from the scipy library to downsample the image, i.e. lower its resolution."
  },
  {
    "Line": 15,
    "Code": "0.02",
    "Description": "This defines the gaussian sigma. You might understand this as the standard deviation for our gaussian filter. For the purposes of this script, it is essentially a smoothing factor that will blur our image more the higher its value is."
  },
  {
    "Line": 15,
    "Code": "gaussian_filter(d, 0.02)",
    "Description": "This applies a gaussian filter to the image. It is essentially a smoothing function intended to reduce noise."
  },
  {
    "Line": 17,
    "Code": "plt.imshow(a)",
    "Description": "This uses matplotlib's imshow() function to load our image onto a two-dimensional raster."
  },
  {
    "Line": 18,
    "Code": "plt.show()",
    "Description": "This uses matplotlib's show() function to actually display the raster into which we just loaded our image."
  }
];


  // Enhanced state preservation for each phase
  const [phaseStates, setPhaseStates] = useState({
    [PHASES.IDENTIFICATION]: {
      code: '',
      highlightedRegions: [],
      selectedRegion: null
    },
    [PHASES.MODIFICATION]: {
      code: '',
      highlightedRegions: [],
      selectedRegion: null,
      codeOutput: '',
      hasExecutionError: false
    },
    [PHASES.VALIDATION]: {
      activeTab: 'updated',
      questionAnswers: {
        goodNames: null,
        simplicity: null,
        readability: null
      },
      overriddenQuestions: {}
    },
    [PHASES.COMPLETION]: {
      activeTab: 'example'
    }
  });

  // Define hardcoded region for phase 2 tooltip - TEMPORARILY DISABLED
  // const hardcodedRegion = currentPhase === PHASES.MODIFICATION ? {
  //   startLine: 15,
  //   endLine: 20,
  //   tooltipText: "This section contains complex nested operations that make the code hard to read and maintain. Consider breaking this into smaller, clearer steps."
  // } : null;
  const hardcodedRegion = null; // Tooltips disabled for now

  // Helper functions for state preservation
  const saveCurrentPhaseState = useCallback(() => {
    setPhaseStates(prevStates => {
      const currentState = { ...prevStates };
      
      switch (currentPhase) {
        case PHASES.IDENTIFICATION:
          currentState[PHASES.IDENTIFICATION] = {
            code: value,
            highlightedRegions: [...highlightedRegions],
            selectedRegion: selectedRegion
          };
          break;
        case PHASES.MODIFICATION:
          currentState[PHASES.MODIFICATION] = {
            code: value,
            highlightedRegions: [...highlightedRegions],
            selectedRegion: selectedRegion,
            codeOutput: codeOutput,
            hasExecutionError: hasExecutionError
          };
          break;
        case PHASES.VALIDATION:
          currentState[PHASES.VALIDATION] = {
            activeTab: activeTab,
            questionAnswers: { ...questionAnswers },
            overriddenQuestions: { ...overriddenQuestions }
          };
          break;
        case PHASES.COMPLETION:
          currentState[PHASES.COMPLETION] = {
            activeTab: activeTab
          };
          break;
      }
      
      return currentState;
    });
  }, [currentPhase, value, highlightedRegions, selectedRegion, codeOutput, hasExecutionError, activeTab, questionAnswers]);

  const restorePhaseState = useCallback((targetPhase) => {
    setPhaseStates(currentStates => {
      const targetState = currentStates[targetPhase];
      
      switch (targetPhase) {
        case PHASES.IDENTIFICATION:
          if (targetState.code) {
            setValue(targetState.code);
            setHighlightedRegions(targetState.highlightedRegions);
            setSelectedRegion(targetState.selectedRegion);
          } else {
            // First time entering identification phase, use original code
            setValue(originalCode);
            setHighlightedRegions([]);
            setSelectedRegion(null);
          }
          break;
        case PHASES.MODIFICATION:
          if (targetState.code) {
            setValue(targetState.code);
            setHighlightedRegions(targetState.highlightedRegions);
            setSelectedRegion(targetState.selectedRegion);
            setCodeOutput(targetState.codeOutput);
            setHasExecutionError(targetState.hasExecutionError);
          } else {
            // First time entering modification phase, use identification results
            setValue(currentStates[PHASES.IDENTIFICATION].code || originalCode);
            setHighlightedRegions(currentStates[PHASES.IDENTIFICATION].highlightedRegions || originalRegions);
            setSelectedRegion(null);
            setCodeOutput('');
            setHasExecutionError(false);
          }
          break;
        case PHASES.VALIDATION:
          setActiveTab(targetState.activeTab);
          setQuestionAnswers(targetState.questionAnswers);
          setOverriddenQuestions(targetState.overriddenQuestions || {});
          // Set code value to empty since validation uses tab comparison
          setValue('');
          setHighlightedRegions([]);
          setSelectedRegion(null);
          break;
        case PHASES.COMPLETION:
          setActiveTab(targetState.activeTab);
          // Set code value to empty since completion uses tab comparison
          setValue('');
          setHighlightedRegions([]);
          setSelectedRegion(null);
          break;
      }
      
      return currentStates; // Return unchanged states
    });
  }, [originalCode, originalRegions]);

  const handleNextPhase = () => {
    // Save current phase state before transitioning
    saveCurrentPhaseState();
    
    if (currentPhase === PHASES.IDENTIFICATION && hasMinimumRegions(highlightedRegions)) {
      // Store original code and regions for future reference
      setOriginalCode(value);
      setOriginalRegions([...highlightedRegions]);
      
      setCurrentPhase(PHASES.MODIFICATION);
      restorePhaseState(PHASES.MODIFICATION);
    } else if (currentPhase === PHASES.MODIFICATION) {
      // Store the modified code from phase 2
      setPhase2ModifiedCode(value);
      
      setCurrentPhase(PHASES.VALIDATION);
      restorePhaseState(PHASES.VALIDATION);
    } else if (currentPhase === PHASES.VALIDATION) {
      setCurrentPhase(PHASES.COMPLETION);
      restorePhaseState(PHASES.COMPLETION);
    }
  };

  const handleBackPhase = () => {
    // Save current phase state before transitioning
    saveCurrentPhaseState();
    
    if (currentPhase === PHASES.MODIFICATION) {
      setCurrentPhase(PHASES.IDENTIFICATION);
      restorePhaseState(PHASES.IDENTIFICATION);
    } else if (currentPhase === PHASES.VALIDATION) {
      setCurrentPhase(PHASES.MODIFICATION);
      restorePhaseState(PHASES.MODIFICATION);
    } else if (currentPhase === PHASES.COMPLETION) {
      setCurrentPhase(PHASES.VALIDATION);
      restorePhaseState(PHASES.VALIDATION);
    }
  };

  // Handle explain code functionality
  const handleExplainCode = () => {
    setIsExplainMode(!isExplainMode);
  };

  const executeScript = async () => {
    if (!pyodide) {
      const message = 'Python environment not ready. Please wait...';
      setCodeOutput(message);
      console.log('[DEBUG]', message);
      return;
    }

    setIsExecuting(true);
    setCodeOutput('Executing...');
    setHasExecutionError(false);

    console.log('[DEBUG] Starting execution of code:');
    console.log(value);

    try {
      // Setup execution environment with matplotlib interception
      await pyodide.runPython(`
import sys
import traceback
from io import StringIO, BytesIO
import matplotlib
matplotlib.use('Agg')  # Ensure non-interactive backend
import matplotlib.pyplot as plt
import base64

# Create string buffers to capture output
_stdout_buffer = StringIO()
_stderr_buffer = StringIO()
_plot_images = []  # Store generated plots

# Store original streams and plt.show
_original_stdout = sys.stdout
_original_stderr = sys.stderr
_original_plt_show = plt.show

# Custom plt.show that captures the figure as base64
def custom_plt_show(*args, **kwargs):
    try:
        # Get current figure
        fig = plt.gcf()
        
        # Save to BytesIO buffer
        buf = BytesIO()
        fig.savefig(buf, format='png', dpi=100, bbox_inches='tight')
        buf.seek(0)
        
        # Convert to base64
        img_base64 = base64.b64encode(buf.read()).decode('utf-8')
        _plot_images.append(img_base64)
        
        # Clear the figure to prevent memory issues
        plt.clf()
        plt.close('all')
        
        print(f"[Plot generated - {len(_plot_images)} total]")
    except Exception as e:
        print(f"Error capturing plot: {e}")

# Replace plt.show with our custom version
plt.show = custom_plt_show

# Redirect streams
sys.stdout = _stdout_buffer
sys.stderr = _stderr_buffer

print("=== Python Execution Started ===")

# Clear any previous error state
_execution_error = None
_error_traceback = None
_plot_images = []
      `);

      console.log('[DEBUG] Set up output capture with matplotlib interception...');
      
      // Prepare the user code for execution
      const escapedCode = value
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
      
      // Only run syntax checks if needed - removed debug output for clean execution
      
      // Only check for critical syntax errors that would prevent execution
      // Focus on errors users might introduce when editing, not the original messy code
      let syntaxIssues = [];
      
      // Check only for severe syntax issues that break Python execution
      const lines = value.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;
        
        // Skip empty lines and comments
        if (!line.trim() || line.trim().startsWith('#')) {
          continue;
        }
        
        // Only check for critical syntax errors that actually break Python execution
        
        // Check for space before dot operator (e.g., "fd .acquisition", "obj .method")
        const spaceDotMatch = line.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s+\.([a-zA-Z_][a-zA-Z0-9_]*)/g);
        if (spaceDotMatch) {
          spaceDotMatch.forEach(match => {
            const [variable, attribute] = match.split(/\s+\./);
            syntaxIssues.push({
              line: lineNumber,
              type: 'space_before_dot',
              content: line.trim(),
              message: `SyntaxError: invalid syntax - space before dot operator`,
              suggestion: `Use "${variable}.${attribute}" instead of "${variable} .${attribute}"`
            });
          });
        }
        
        // Check for space after dot operator (e.g., "fd. acquisition", "obj. method") 
        const dotSpaceMatch = line.match(/([a-zA-Z_][a-zA-Z0-9_]*)\.\s+([a-zA-Z_][a-zA-Z0-9_]*)/g);
        if (dotSpaceMatch) {
          dotSpaceMatch.forEach(match => {
            const parts = match.split('.');
            const variable = parts[0];
            const attribute = parts[1].trim();
            syntaxIssues.push({
              line: lineNumber,
              type: 'space_after_dot',
              content: line.trim(),
              message: `SyntaxError: invalid syntax - space after dot operator`,
              suggestion: `Use "${variable}.${attribute}" instead of "${variable}. ${attribute}"`
            });
          });
        }
        
        // Check for double commas (this actually breaks Python)
        if (line.includes(',,')) {
          syntaxIssues.push({
            line: lineNumber,
            type: 'double_comma',
            content: line.trim(),
            message: `SyntaxError: invalid syntax - double comma`,
            suggestion: `Remove the extra comma`
          });
        }
        
        // Check for obvious missing closing parentheses that would break execution
        if (line.includes('(') && !line.includes(')') && line.includes('=')) {
          syntaxIssues.push({
            line: lineNumber,
            type: 'missing_paren',
            content: line.trim(),
            message: `SyntaxError: '(' was never closed`,
            suggestion: `Add closing parenthesis ')' to this line`
          });
        }
        
        // Check for missing closing brackets that would break execution
        if (line.includes('[') && !line.includes(']') && !line.includes('#')) {
          syntaxIssues.push({
            line: lineNumber,
            type: 'missing_bracket',
            content: line.trim(),
            message: `SyntaxError: '[' was never closed`,
            suggestion: `Add closing bracket ']' to this line`
          });
        }
      }
      
      // Build comprehensive error message
      let syntaxErrorMessage = '';
      if (syntaxIssues.length > 0) {
        syntaxErrorMessage += `Found ${syntaxIssues.length} syntax issue${syntaxIssues.length > 1 ? 's' : ''}:\n\n`;
        
        syntaxIssues.forEach((issue, index) => {
          syntaxErrorMessage += `${index + 1}. Line ${issue.line}: ${issue.message}\n`;
          syntaxErrorMessage += `   Line content: ${issue.content}\n`;
          syntaxErrorMessage += `   Suggestion: ${issue.suggestion}\n\n`;
        });
      }
      
      // If there are educational syntax issues, show comprehensive error report and stop execution
      if (syntaxIssues.length > 0) {
        setHasExecutionError(true);
        setCodeOutput('=== EDUCATIONAL SYNTAX ERROR ===\n\n' + syntaxErrorMessage);
        setIsExecuting(false);
        return;
      }
      
      // Execute the user's code with clean error capturing
      const executionResult = await pyodide.runPython(`
try:
    # Execute the user code
    exec("""${escapedCode}""")
    _execution_success = True
    _execution_error = None
    _error_traceback = None
except Exception as e:
    _execution_success = False
    _execution_error = str(e)
    _error_traceback = traceback.format_exc()
    print(f"Error occurred: {_execution_error}")
    print("Full traceback:")
    print(_error_traceback)

# Return execution status
_execution_success
      `);
      
      // Removed debug logging for cleaner output
      
      // Get the output, error details, plot images, and restore streams
      const result = await pyodide.runPython(`
print("=== Python Execution Completed ===")

# Get captured output
stdout_content = _stdout_buffer.getvalue()
stderr_content = _stderr_buffer.getvalue()

# Get error details if any
error_info = {
    'error_message': _execution_error if '_execution_error' in globals() else None,
    'error_traceback': _error_traceback if '_error_traceback' in globals() else None,
    'success': _execution_success if '_execution_success' in globals() else False
}

# Restore original streams and plt.show
sys.stdout = _original_stdout
sys.stderr = _original_stderr
plt.show = _original_plt_show

# The numpy.max patch remains in effect to handle ND2Reader objects

# Return comprehensive results including plot images
{
    'stdout': stdout_content,
    'stderr': stderr_content,
    'success': error_info['success'],
    'error_message': error_info['error_message'],
    'error_traceback': error_info['error_traceback'],
    'plot_images': _plot_images if '_plot_images' in globals() else []
}
      `);
      
      console.log('[DEBUG] Captured execution result:', result);
      
      const stdout = result.get('stdout') || '';
      const stderr = result.get('stderr') || '';
      const success = result.get('success');
      const errorMessage = result.get('error_message');
      const errorTraceback = result.get('error_traceback');
      const plotImages = result.get('plot_images') || [];
      
      // Log everything to console for debugging
      if (stdout) {
        console.log('[STDOUT]', stdout);
      }
      if (stderr) {
        console.log('[STDERR]', stderr);
      }
      if (errorMessage) {
        console.log('[ERROR MESSAGE]', errorMessage);
      }
      if (errorTraceback) {
        console.log('[ERROR TRACEBACK]', errorTraceback);
      }
      console.log('[PLOT IMAGES COUNT]', plotImages.length);
      
      // Display the complete output with detailed error information
      let displayOutput = '';
      
      if (!success && (errorMessage || errorTraceback)) {
        // Show detailed error information
        displayOutput = `=== EXECUTION ERROR ===\n\n`;
        
        if (errorTraceback) {
          displayOutput += `${errorTraceback}\n`;
        } else if (errorMessage) {
          displayOutput += `Error: ${errorMessage}\n\n`;
        }
        
        if (stdout) {
          displayOutput += `\n=== OUTPUT BEFORE ERROR ===\n${stdout}`;
        }
        
        setHasExecutionError(true);
        console.log('[DEBUG] Execution failed with detailed error');
      } else {
        // Successful execution
        displayOutput = '';
        
        // Add text output if any
        if (stdout) {
          displayOutput += stdout;
        }
        if (stderr) {
          displayOutput += stderr ? `\n=== WARNINGS/MESSAGES ===\n${stderr}` : '';
        }
        
        // Add plot images if any
        if (plotImages.length > 0) {
          displayOutput += displayOutput ? '\n\n' : '';
          displayOutput += `=== GENERATED PLOTS (${plotImages.length}) ===\n`;
          
          // Create HTML content with embedded images
          let imageHtml = '';
          plotImages.forEach((img, index) => {
            imageHtml += `<div style="margin: 10px 0;">\n`;
            imageHtml += `  <h4>Plot ${index + 1}</h4>\n`;
            imageHtml += `  <img src="data:image/png;base64,${img}" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px;" />\n`;
            imageHtml += `</div>\n`;
          });
          
          // Store the HTML for rendering
          displayOutput += `[PLOT_HTML_START]${imageHtml}[PLOT_HTML_END]`;
        } else if (!stdout && !stderr) {
          displayOutput = 'Code executed successfully (no output)';
        }
        
        setHasExecutionError(false);
        console.log('[DEBUG] Execution completed successfully');
      }
      
      setCodeOutput(displayOutput);
      
    } catch (error) {
      // Fallback for JavaScript/Pyodide errors (not Python execution errors)
      console.error('[DEBUG] JavaScript/Pyodide error:', error);
      
      let detailedError = `=== SYSTEM ERROR ===\n\n`;
      
      // Extract more details from Pyodide/JavaScript error
      if (error.name) {
        detailedError += `Error Type: ${error.name}\n`;
      }
      
      if (error.message) {
        detailedError += `Message: ${error.message}\n`;
      }
      
      // Check if this is a Pyodide Python error
      if (error.toString().includes('PythonError')) {
        detailedError += `\nThis appears to be a Python execution error.\n`;
        detailedError += `Original error: ${error.toString()}\n`;
        
        // Try to get Python traceback from Pyodide
        try {
          const pythonTraceback = await pyodide.runPython(`
import sys
if hasattr(sys, 'last_traceback') and sys.last_traceback:
    import traceback
    traceback.format_exception(sys.last_type, sys.last_value, sys.last_traceback)
else:
    ["No traceback available"]
          `);
          
          if (pythonTraceback && pythonTraceback.length > 0) {
            detailedError += `\nPython Traceback:\n${pythonTraceback.join('')}`;
          }
        } catch (tbError) {
          console.log('[DEBUG] Could not retrieve Python traceback:', tbError);
        }
      }
      
      if (error.stack) {
        detailedError += `\nJavaScript Stack:\n${error.stack}`;
      }
      
      setCodeOutput(detailedError);
      setHasExecutionError(true);
    } finally {
      setIsExecuting(false);
      console.log('[DEBUG] Execution phase completed');
    }
  };

  // Load initial code from file
  useEffect(() => {
    const loadCode = async () => {
      try {
        setIsLoadingCode(true);
        const initialCode = await loadInitialCode();
        setValue(initialCode);
        setOriginalCode(initialCode);
        
        // Initialize phase states with the loaded code
        setPhaseStates(prevStates => ({
          ...prevStates,
          [PHASES.IDENTIFICATION]: {
            ...prevStates[PHASES.IDENTIFICATION],
            code: initialCode
          }
        }));
        
        console.log('[DEBUG] Successfully loaded initial code from file');
      } catch (error) {
        console.error('[DEBUG] Error loading initial code:', error);
      } finally {
        setIsLoadingCode(false);
      }
    };
    
    loadCode();
  }, []);

  // Auto-save current phase state when key variables change (removed to prevent infinite loop)
  // State will be saved explicitly during phase transitions

  // Initialize Pyodide
  useEffect(() => {
    async function loadPyodideScript() {
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
        console.log('Loading Pyodide...');
        await loadPyodideScript();
        const loadPyodide = window.loadPyodide;
        const pyodideInstance = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/"
        });
        
        console.log('Loading Python packages...');
        
        // Load required packages
        await pyodideInstance.loadPackage([
          "numpy", 
          "matplotlib", 
          "scipy",
          "micropip",
          "pillow"  // Required for image handling
        ]);
        
        // Setup matplotlib for browser environment and create mock ND2Reader
        await pyodideInstance.runPythonAsync(`
          import micropip
          import matplotlib
          matplotlib.use('Agg')  # Use non-interactive backend for browser
          import matplotlib.pyplot as plt
          import numpy as np
          from scipy.ndimage import zoom, gaussian_filter
          import io
          import base64
          import sys
          
          # Create mock modules for demonstration
          print("Setting up mock NWB and ND2Reader modules...")
          
          # Create mock modules
          from types import ModuleType
          nd2reader_module = ModuleType('nd2reader')
          pynwb_module = ModuleType('pynwb')
          
          # Define the mock ND2Reader class
          class ND2Reader:
              def __init__(self, filename):
                  print(f"Mock ND2Reader: Loading {filename}")
                  # Create realistic microscopy-like data
                  # Generate a more realistic microscopy image with some structure
                  x = np.linspace(-3, 3, 512)
                  y = np.linspace(-3, 3, 512)
                  X, Y = np.meshgrid(x, y)
                  
                  # Create multiple gaussian blobs to simulate cells or features
                  image = np.zeros((512, 512))
                  
                  # Add some gaussian blobs at random positions
                  np.random.seed(42)  # For reproducibility
                  for _ in range(15):
                      cx, cy = np.random.randn(2) * 1.5
                      blob = np.exp(-((X - cx)**2 + (Y - cy)**2) / (2 * 0.3**2))
                      image += blob * np.random.uniform(100, 255)
                  
                  # Add some noise
                  noise = np.random.randn(512, 512) * 10
                  self.data = np.clip(image + noise, 0, 255)
                  self._shape = self.data.shape
              
              def __getitem__(self, index):
                  return self.data
              
              def __iter__(self):
                  return iter([self.data])
              
              def __array__(self):
                  # This allows numpy functions to work with our object
                  return self.data
              
              def __array_wrap__(self, result):
                  # This ensures numpy operations return numpy arrays, not ND2Reader objects
                  return result
              
              def __len__(self):
                  # Return the number of frames (simulate multiple frames)
                  return 1
              
              # Override numpy methods to handle the messy code properly
              def max(self, axis=None):
                  if axis is None:
                      return np.max(self.data)
                  else:
                      # The messy code does np.max(f, np.argmin(f.shape))
                      # which would be np.max(f, 0) for a (512, 512) array
                      # This reduces to a 1D array, but the zoom expects 2D
                      # Let's return the full 2D data to make it work
                      if axis == 0:
                          # Return the full 2D data instead of reducing dimension
                          # This fixes the zoom dimension mismatch
                          return self.data
                      else:
                          return np.max(self.data, axis=axis)
              
              @property
              def shape(self):
                  return self._shape
          
          # Override numpy.max to handle our ND2Reader but allow some errors for learning
          original_np_max = np.max
          def patched_np_max(a, axis=None, *args, **kwargs):
              if isinstance(a, ND2Reader):
                  # Allow the original messy code to work, but don't fix other errors
                  # Only handle the specific case that makes the demo work
                  if axis == 0:
                      return a.data
                  elif axis is None:
                      return original_np_max(a.data, axis=axis, *args, **kwargs)
                  else:
                      # For other axis values or malformed calls, let numpy handle it
                      # This allows errors to propagate for learning purposes
                      return original_np_max(a.data, axis=axis, *args, **kwargs)
              else:
                  return original_np_max(a, axis=axis, *args, **kwargs)
          
          # Temporarily patch np.max during execution
          np.max = patched_np_max
          
          # Add the class to the module
          nd2reader_module.ND2Reader = ND2Reader
          
          # Install the mock module in sys.modules
          sys.modules['nd2reader'] = nd2reader_module
          
          # Create mock NWBHDF5IO class for pynwb
          class NWBHDF5IO:
              def __init__(self, filename, mode="r"):
                  print(f"Mock NWBHDF5IO: Loading {filename}")
                  self.filename = filename
                  self.mode = mode
                  self._nwb_file = None
              
              def read(self):
                  print("Mock NWBHDF5IO: Reading NWB file data...")
                  return MockNWBFile()
              
              def close(self):
                  print("Mock NWBHDF5IO: File closed")
                  pass
          
          class MockNWBFile:
              def __init__(self):
                  # Create mock acquisition data
                  self.acquisition = {
                      'NeuroPALImageRaw': MockImageData()
                  }
          
          class MockImageData:
              def __init__(self):
                  # Create realistic NWB-style microscopy data
                  # Generate 4D data: (x, y, z, channels)
                  print("Generating mock NWB microscopy data...")
                  
                  # Create structured microscopy data with multiple channels
                  x = np.linspace(-2, 2, 256)
                  y = np.linspace(-2, 2, 256)
                  z = np.linspace(-1, 1, 32)
                  
                  # Create 4D array (256, 256, 32, 4) - RGBW channels
                  data = np.zeros((256, 256, 32, 4), dtype=np.uint16)
                  
                  # Add some structured content to each channel
                  for zi in range(32):
                      X, Y = np.meshgrid(x, y)
                      Z_effect = (zi - 16) / 16  # -1 to 1
                      
                      # Red channel - circular patterns
                      red_pattern = np.exp(-(X**2 + Y**2) / (0.5 + 0.3 * Z_effect**2)) * 30000
                      data[:, :, zi, 0] = red_pattern.astype(np.uint16)
                      
                      # Green channel - diagonal patterns  
                      green_pattern = np.exp(-((X-Y)**2 + (X+Y)**2) / 1.0) * 25000
                      data[:, :, zi, 1] = green_pattern.astype(np.uint16)
                      
                      # Blue channel - random cellular-like structures
                      blue_pattern = np.exp(-(X**2 + Y**2) / 0.8) * np.sin(5*X) * np.cos(5*Y) * 20000
                      data[:, :, zi, 2] = np.abs(blue_pattern).astype(np.uint16)
                      
                      # White channel - background
                      data[:, :, zi, 3] = (5000 + 1000 * np.random.random((256, 256))).astype(np.uint16)
                  
                  self._data = data
                  # RGBW channels - first 3 are RGB
                  self.RGBW_channels = np.array([0, 1, 2, 3])
                  print(f"Mock NWB data ready: shape {data.shape}, dtype {data.dtype}")
              
              @property
              def data(self):
                  return DataSlice(self._data)
          
          class DataSlice:
              def __init__(self, data):
                  self.data = data
              
              def __getitem__(self, key):
                  # Handle [:] slice notation
                  if key == slice(None):
                      return self.data
                  return self.data[key]
          
          # Add classes to the pynwb module
          pynwb_module.NWBHDF5IO = NWBHDF5IO
          
          # Install the mock pynwb module
          sys.modules['pynwb'] = pynwb_module
          
          # Load the nd2 file data into Pyodide's virtual filesystem
          print("Loading .nd2 file into virtual filesystem...")
          try:
              # Fetch the nd2 file from public folder
              from js import fetch
              response = await fetch('/20191010_tail_01.nd2')
              if response.ok:
                  buffer = await response.arrayBuffer()
                  # Create the file in pyodide's virtual filesystem
                  with open('20191010_tail_01.nd2', 'wb') as f:
                      f.write(buffer.to_py())
                  print("Successfully loaded nd2 file into virtual filesystem")
                  # Verify file exists and get size
                  import os
                  if os.path.exists('20191010_tail_01.nd2'):
                      size = os.path.getsize('20191010_tail_01.nd2')
                      print(f"File size: {size} bytes")
                  else:
                      print("Warning: File was not created successfully")
              else:
                  print(f"Could not fetch nd2 file (HTTP {response.status}), will use mock data")
          except Exception as e:
              print(f"Error loading nd2 file: {e}")
              print("Will use mock data instead")
          
          # Create a mock NWB file in the filesystem (just a placeholder)
          print("Creating mock NWB file...")
          try:
              # Create a simple binary file to represent the NWB file
              with open('sub-11-YAaLR_ophys.nwb', 'wb') as f:
                  # Write some mock binary data (doesn't need to be real NWB format)
                  f.write(b'MockNWBFile' * 1000)  # Just placeholder data
              print("Mock NWB file created successfully")
          except Exception as e:
              print(f"Error creating NWB file: {e}")
          
          print("Python environment ready!")
        `);
        
        setPyodide(pyodideInstance);
        console.log('Pyodide and packages loaded successfully!');
      } catch (error) {
        console.error('Error initializing Pyodide:', error);
      }
    }
    initPyodide();
  }, []);

  const getPhaseTitle = () => {
    return "Integration Activity";
  };

  const validateWithAPI = async (question, answer, userCode) => {
    const apiEndpoint = '/api/openAI'; // Use existing OpenAI endpoint
    
    const validationType = question === 'goodNames' ? 'variableNames' : 
                          question === 'simplicity' ? 'simplicity' : 
                          question === 'readability' ? 'logicalGrouping' : question;
    
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          validationType: validationType,
          functionCode: userCode,
          originalCode: originalCode, // The original messy code
          functionName: 'user_modified_code'
        })
      });

      if (!response.ok) {
        // If API endpoint doesn't exist or has server error, use mock response for testing
        if (response.status === 404 || response.status === 500) {
          console.warn(`API error (${response.status}), falling back to mock response`);
          return getMockValidationResponse(question, answer, userCode);
        }
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Format the response from the OpenAI API
      if (data.passes !== undefined && data.explanation) {
        const statusIcon = data.passes ? '✅' : '📝';
        return `${statusIcon} ${data.explanation}`;
      }
      
      return data.explanation || 'Validation completed successfully.';
    } catch (error) {
      console.error('API validation error:', error);
      // If it's a network error, 404, or 500 error, provide mock response for testing
      if (error.message.includes('404') || error.message.includes('500') || error.name === 'TypeError') {
        console.warn('Using mock response due to API error:', error.message);
        return getMockValidationResponse(question, answer, userCode);
      }
      return `Unable to validate at this time. Please try again later. (${error.message})`;
    }
  };

  const handleOverrideAI = (question) => {
    // Mark the question as overridden
    setOverriddenQuestions(prev => ({
      ...prev,
      [question]: true
    }));
    
    // Set a success feedback message
    setFeedbackMessages(prev => ({
      ...prev,
      [question]: `✅ **AI Override Applied**

Your answer has been accepted. The system recognizes that you have manually verified this meets the requirements.`
    }));
  };

  const getNoAnswerFeedback = (question) => {
    const noAnswerResponses = {
      goodNames: `No, it doesn't satisfy good variable naming practices.
Please go back and edit your code again.`,

      simplicity: `No, it doesn't satisfy simplicity requirements.
Please go back and edit your code again.`,

      readability: `No, it doesn't satisfy readability standards.
Please go back and edit your code again.`
    };

    return noAnswerResponses[question] || 
      `No, it doesn't satisfy the requirements.
Please go back and edit your code again.`;
  };

  const getGuidanceForQuestion = async (question, userCode) => {
    // Try to call the API for guidance, with fallback to mock guidance
    try {
      // For now, let's use mock guidance since the API might not have a guidance endpoint
      return getMockGuidanceResponse(question, userCode);
    } catch (error) {
      console.error('Guidance API error:', error);
      return getMockGuidanceResponse(question, userCode);
    }
  };

  const getMockGuidanceResponse = (question, userCode) => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const guidanceResponses = {
          goodNames: `🤔 **How to determine if variable names are descriptive:**

**Look for these patterns in your code:**

✅ **Good variable names:**
• Use full words that describe the purpose: \`target_file\`, \`raw_data\`, \`smoothed_image\`
• Include the data type or unit: \`pixel_count\`, \`file_path\`, \`image_dimensions\`
• Avoid abbreviations: \`nwb_file\` instead of \`nf\`

❌ **Poor variable names to watch for:**
• Single letters: \`f\`, \`d\`, \`a\` (unless used as loop counters)
• Unclear abbreviations: \`img\`, \`data\`, \`temp\`
• Numbers without context: \`var1\`, \`result2\`

**In your code:**
${userCode.match(/\b[a-z]\b/g) ? '• You have some single-letter variables that could be more descriptive' : '• Your variable names look generally descriptive'}
${userCode.includes('target_file') || userCode.includes('raw_data') ? '• You\'re already using some good descriptive names!' : ''}

**Ask yourself:** "If someone else read this code, would they understand what each variable represents without additional explanation?"`,

          simplicity: `🤔 **How to determine if code is simple and not overly nested:**

**Look for these patterns:**

✅ **Signs of simple code:**
• Linear flow with clear steps
• Maximum 2-3 levels of indentation
• One operation per line
• Logical grouping of related operations

❌ **Signs of complex code:**
• Deep nesting (if inside if inside for loop)
• Very long functions (>20 lines)
• Multiple operations crammed into one line
• Unclear flow of logic

**In your code:**
• Function length: ${userCode.split('\n').length} lines ${userCode.split('\n').length > 20 ? '(consider breaking into smaller functions)' : '(good length)'}
• Your code follows a linear processing pipeline which is good for readability

**Ask yourself:** "Can I follow the logic easily from top to bottom without getting confused?"`,

          readability: `🤔 **How to determine if code is readable:**

**Look for these patterns:**

✅ **Signs of readable code:**
• Related operations are grouped together
• Consistent indentation and spacing
• Logical flow from input to output
• Clear separation between different tasks

❌ **Signs of less readable code:**
• Mixing file operations with data processing
• Inconsistent formatting
• Random placement of related operations
• No clear structure

**In your code:**
• File operations: ${userCode.includes('NWBHDF5IO') ? 'Present and grouped' : 'Not found'}
• Data processing: ${userCode.includes('np.transpose') || userCode.includes('zoom') ? 'Present with clear steps' : 'Not found'}
• Visualization: ${userCode.includes('plt.') ? 'Present at the end (good placement)' : 'Not found'}

**Ask yourself:** "Are related lines of code placed near each other, making it easy to understand each section's purpose?"`
        };

        const guidance = guidanceResponses[question] || 
          `🤔 **General guidance:** Look at your code and ask yourself if it follows best practices for clean, maintainable code. Consider readability, clarity, and organization.`;
        
        resolve(guidance);
      }, 1500); // Slightly shorter delay for guidance
    });
  };

  const getMockValidationResponse = (question, answer, userCode) => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponses = {
          goodNames: {
            positive: "✅ Great job! Your variable names are descriptive and follow good naming conventions. Variables like 'target_file', 'io_obj', 'nwb_file', and 'raw_data' clearly indicate their purpose, making your code much more readable and maintainable.",
            suggestions: "📝 Consider these improvements:\n• 'f' could be renamed to 'nwb_io' or 'file_handler'\n• 'd' could be renamed to 'image_data' or 'processed_data'\n• 'a' could be renamed to 'smoothed_image'\n\nDescriptive variable names make code self-documenting and easier for others to understand."
          },
          simplicity: {
            positive: "✅ Your code structure is well-organized! The linear flow and logical grouping of operations make it easy to follow the image processing pipeline.",
            suggestions: "📝 Consider these improvements:\n• Break complex operations into smaller functions\n• Add intermediate variables to explain multi-step calculations\n• Consider extracting image processing steps into separate functions for better modularity."
          },
          readability: {
            positive: "✅ Your code is generally readable! The logical flow and variable naming improvements have enhanced code clarity significantly.",
            suggestions: "📝 Consider these improvements:\n• Add comments explaining the purpose of image transformations\n• Use more whitespace to separate logical sections\n• Consider adding docstrings to explain the overall function purpose."
          }
        };

        // Analyze the code for better feedback
        const hasGoodNames = /target_file|io_obj|nwb_file|raw_data|image_dimensions/.test(userCode);
        const hasPoorNames = /\b[a-z]\b/.test(userCode); // Single letter variables
        
        if (question === 'goodNames') {
          if (hasGoodNames && !hasPoorNames) {
            resolve(mockResponses.goodNames.positive);
          } else {
            resolve(mockResponses.goodNames.suggestions);
          }
        } else if (question === 'simplicity') {
          resolve(mockResponses.simplicity.positive);
        } else if (question === 'readability') {
          resolve(mockResponses.readability.positive);
        } else {
          resolve("✅ Code validation completed successfully. Your improvements are looking good!");
        }
      }, 2000); // 2 second delay to simulate API call
    });
  };

  const handleQuestionAnswer = async (question, answer) => {
    // Set the answer immediately
    setQuestionAnswers(prev => ({
      ...prev,
      [question]: answer
    }));

    // Handle different answer types
    if (answer === 'yes' || answer === 'unsure' || answer === 'no') {
      // Clear previous feedback first
      setFeedbackMessages(prev => ({
        ...prev,
        [question]: null
      }));

      // Reset override state when user selects "yes" again
      if (answer === 'yes') {
        setOverriddenQuestions(prev => ({
          ...prev,
          [question]: false
        }));
      }

      if (answer === 'no') {
        // Provide immediate feedback for "no" answers without API call
        const noAnswerFeedback = getNoAnswerFeedback(question);
        setFeedbackMessages(prev => ({
          ...prev,
          [question]: noAnswerFeedback
        }));
        return;
      }

      // Set loading state for "yes" and "unsure" answers
      setValidationLoading(prev => ({
        ...prev,
        [question]: true
      }));

      try {
        let feedback;
        if (answer === 'yes') {
          // Call validation API with current code
          feedback = await validateWithAPI(question, answer, value);
        } else if (answer === 'unsure') {
          // Provide guidance on how to determine the answer
          feedback = await getGuidanceForQuestion(question, value);
        }
        
        // Set feedback message
        setFeedbackMessages(prev => ({
          ...prev,
          [question]: feedback
        }));
      } finally {
        // Clear loading state
        setValidationLoading(prev => ({
          ...prev,
          [question]: false
        }));
      }
    }
  };

  const canProceedFromCurrentPhase = () => {
    if (currentPhase === PHASES.IDENTIFICATION) {
      return hasMinimumRegions(highlightedRegions);
    } else if (currentPhase === PHASES.MODIFICATION) {
      return !hasExecutionError && codeOutput !== '' && codeOutput !== 'Click "Execute Script" to run your code...';
    } else if (currentPhase === PHASES.VALIDATION) {
      // User must answer "YES" to all three questions OR have them overridden to proceed
      const goodNamesValid = questionAnswers.goodNames === 'yes' || overriddenQuestions.goodNames;
      const simplicityValid = questionAnswers.simplicity === 'yes' || overriddenQuestions.simplicity;
      const readabilityValid = questionAnswers.readability === 'yes' || overriddenQuestions.readability;
      
      return goodNamesValid && simplicityValid && readabilityValid;
    }
    return true; // COMPLETION phase can always proceed
  };

  const getButtonText = () => {
    if (currentPhase === PHASES.IDENTIFICATION) {
      return canProceedFromCurrentPhase() ? 'Continue' : 'Must identify two lines';
    } else if (currentPhase === PHASES.MODIFICATION) {
      return canProceedFromCurrentPhase() ? 'Continue' : 'Must run code successfully';
    } else if (currentPhase === PHASES.VALIDATION) {
      return canProceedFromCurrentPhase() ? 'Finish Activity' : 'Must answer YES to all questions';
    } else {
      return 'Complete Activity';
    }
  };

  const getCurrentTabContent = () => {
    if (currentPhase === PHASES.VALIDATION) {
      return activeTab === 'original' ? originalCode : (phase2ModifiedCode || phaseStates[PHASES.MODIFICATION].code);
    } else if (currentPhase === PHASES.COMPLETION) {
      return activeTab === 'example' ? EXAMPLE_SOLUTION : (phase2ModifiedCode || phaseStates[PHASES.MODIFICATION].code);
    }
    return value;
  };

  const getCurrentTabRegions = () => {
    if (currentPhase === PHASES.VALIDATION && activeTab === 'original') {
      return originalRegions;
    }
    // No regions for other tabs
    return [];
  };

  // Show loading state while code is being loaded
  if (isLoadingCode) {
    return (
      <>
        <Header text="Integration Activity" />
        <div className="container">
          <div className="activity-title">
            <h1>Loading Activity...</h1>
          </div>
          <div className="instructions">
            Loading initial code from file...
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            fontSize: '18px',
            color: '#666'
          }}>
            Please wait while we load the activity content...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header text="Code Refactoring Activity" />
      <div className="container">
        {/* <div className="activity-title">
          <h1>{getPhaseTitle()}</h1>
        </div> */}
        
        <div className="instructions">
          {INSTRUCTIONS[currentPhase]}
        </div>

      <div className="main-content">
        {(currentPhase === PHASES.VALIDATION || currentPhase === PHASES.COMPLETION) ? (
          <div className="comparison-view">
            <div className="tab-container">
              <div className="tab-buttons">
                {currentPhase === PHASES.VALIDATION ? (
                  <>
                    <button 
                      className={`tab-button ${activeTab === 'original' ? 'active' : ''}`}
                      onClick={() => setActiveTab('original')}
                    >
                      ORIGINAL MAIN.PY
                    </button>
                    <button 
                      className={`tab-button ${activeTab === 'updated' ? 'active' : ''}`}
                      onClick={() => setActiveTab('updated')}
                    >
                      UPDATED MAIN.PY
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      className={`tab-button ${activeTab === 'example' ? 'active' : ''}`}
                      onClick={() => setActiveTab('example')}
                    >
                      EXAMPLE SOLUTION
                    </button>
                    <button 
                      className={`tab-button ${activeTab === 'updated' ? 'active' : ''}`}
                      onClick={() => setActiveTab('updated')}
                    >
                      UPDATED MAIN.PY
                    </button>
                  </>
                )}
              </div>
              
              <div className="tab-content">
                <TextareaHighlight
                  name="comparison-textarea"
                  value={getCurrentTabContent()}
                  onValueChange={() => {}} // Read-only
                  numOfLines={30}
                  functions={getCurrentTabRegions()}
                  setFunctions={() => {}} // Read-only
                  selectedFunction={null}
                  setSelectedFunction={() => {}} // Read-only
                  hardcodedRegion={null}
                  readOnly={true}
                  allowRegionCreation={false}
                  isCompletionPhase={currentPhase === PHASES.COMPLETION}
                />
              </div>
            </div>
            
            {currentPhase === PHASES.VALIDATION && (
              <div className="questions-section">
                <div className="question-block">
                  <h3>Do all of your variables have descriptive names?</h3>
                  <div className="answer-buttons">
                    {['yes', 'unsure', 'no'].map(answer => (
                      <button
                        key={answer}
                        className={`answer-button ${questionAnswers.goodNames === answer ? 'selected' : ''} ${validationLoading.goodNames ? 'loading' : ''}`}
                        onClick={() => handleQuestionAnswer('goodNames', answer)}
                        disabled={validationLoading.goodNames}
                      >
                        {validationLoading.goodNames && questionAnswers.goodNames === answer
                          ? (answer === 'yes' ? 'Validating...' : answer === 'unsure' ? 'Getting guidance...' : answer.toUpperCase())
                          : answer === 'yes' ? 'YES' 
                          : answer === 'unsure' ? "I'M NOT SURE"
                          : 'NO'
                        }
                      </button>
                    ))}
                  </div>
                  {/* Feedback block for descriptive names question */}
                  {feedbackMessages.goodNames && (
                    <div className="feedback-block">
                      <div className="feedback-content">
                        <FormattedFeedback text={feedbackMessages.goodNames} />
                        {questionAnswers.goodNames === 'yes' && (
                          <button 
                            className={`answer-button ${overriddenQuestions.goodNames ? 'disabled' : ''}`}
                            onClick={() => handleOverrideAI('goodNames')}
                            disabled={overriddenQuestions.goodNames}
                            style={{ marginTop: '10px' }}
                          >
                            {overriddenQuestions.goodNames ? 'AI Overridden' : 'Override AI'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="question-block">
                  <h3>Is the code written in a way that is sensible, simple, and not overly nested?</h3>
                  <div className="answer-buttons">
                    {['yes', 'unsure', 'no'].map(answer => (
                      <button
                        key={answer}
                        className={`answer-button ${questionAnswers.simplicity === answer ? 'selected' : ''} ${validationLoading.simplicity ? 'loading' : ''}`}
                        onClick={() => handleQuestionAnswer('simplicity', answer)}
                        disabled={validationLoading.simplicity}
                      >
                        {validationLoading.simplicity && questionAnswers.simplicity === answer
                          ? (answer === 'yes' ? 'Validating...' : answer === 'unsure' ? 'Getting guidance...' : answer.toUpperCase())
                          : answer === 'yes' ? 'YES' 
                          : answer === 'unsure' ? "I'M NOT SURE"
                          : 'NO'
                        }
                      </button>
                    ))}
                  </div>
                  {/* Feedback block for simplicity question */}
                  {feedbackMessages.simplicity && (
                    <div className="feedback-block">
                      <div className="feedback-content">
                        <FormattedFeedback text={feedbackMessages.simplicity} />
                        {questionAnswers.simplicity === 'yes' && (
                          <button 
                            className={`answer-button ${overriddenQuestions.simplicity ? 'disabled' : ''}`}
                            onClick={() => handleOverrideAI('simplicity')}
                            disabled={overriddenQuestions.simplicity}
                            style={{ marginTop: '10px' }}
                          >
                            {overriddenQuestions.simplicity ? 'AI Overridden' : 'Override AI'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="question-block">
                  <h3>Is your code structured in a way that keeps functionally related lines close to one another?</h3>
                  <div className="answer-buttons">
                    {['yes', 'unsure', 'no'].map(answer => (
                      <button
                        key={answer}
                        className={`answer-button ${questionAnswers.readability === answer ? 'selected' : ''} ${validationLoading.readability ? 'loading' : ''}`}
                        onClick={() => handleQuestionAnswer('readability', answer)}
                        disabled={validationLoading.readability}
                      >
                        {validationLoading.readability && questionAnswers.readability === answer
                          ? (answer === 'yes' ? 'Validating...' : answer === 'unsure' ? 'Getting guidance...' : answer.toUpperCase())
                          : answer === 'yes' ? 'YES' 
                          : answer === 'unsure' ? "I'M NOT SURE"
                          : 'NO'
                        }
                      </button>
                    ))}
                  </div>
                  {/* Feedback block for readability question */}
                  {feedbackMessages.readability && (
                    <div className="feedback-block">
                      <div className="feedback-content">
                        <FormattedFeedback text={feedbackMessages.readability} />
                        {questionAnswers.readability === 'yes' && (
                          <button 
                            className={`answer-button ${overriddenQuestions.readability ? 'disabled' : ''}`}
                            onClick={() => handleOverrideAI('readability')}
                            disabled={overriddenQuestions.readability}
                            style={{ marginTop: '10px' }}
                          >
                            {overriddenQuestions.readability ? 'AI Overridden' : 'Override AI'}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="editor-section">
              <TextareaHighlight
                name="activity-textarea"
                value={value}
                onValueChange={(newValue) => setValue(newValue)}
                numOfLines={30}
                functions={highlightedRegions}
                setFunctions={setHighlightedRegions}
                selectedFunction={selectedRegion}
                setSelectedFunction={setSelectedRegion}
                hardcodedRegion={hardcodedRegion}
                readOnly={currentPhase === PHASES.IDENTIFICATION}
                allowRegionCreation={currentPhase === PHASES.IDENTIFICATION || currentPhase === PHASES.MODIFICATION}
                showExplainButton={currentPhase === PHASES.MODIFICATION}
                onExplainCode={handleExplainCode}
                isExplainMode={isExplainMode}
                explanationsData={EXPLANATIONS_DATA}
              />
            </div>

            {currentPhase === PHASES.MODIFICATION && (
              <div className="output-section">
                <div className="output-header">
                  <h3>Code Output</h3>
                  <button 
                    className="execute-button"
                    onClick={executeScript}
                    disabled={isExecuting || !pyodide}
                  >
                    {isExecuting ? 'Executing...' : 'Execute Script'}
                  </button>
                </div>
                <div className={`code-output ${hasExecutionError ? 'error' : ''}`}>
                  {codeOutput.includes('[PLOT_HTML_START]') ? (
                    <div>
                      {/* Display text output */}
                      {codeOutput.split('[PLOT_HTML_START]')[0] && (
                        <pre>{codeOutput.split('[PLOT_HTML_START]')[0]}</pre>
                      )}
                      {/* Display plot images */}
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: codeOutput.match(/\[PLOT_HTML_START\]([\s\S]*?)\[PLOT_HTML_END\]/)?.[1] || '' 
                        }} 
                      />
                    </div>
                  ) : (
                    <pre>{codeOutput || 'Click "Execute Script" to run your code...'}</pre>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="phase-controls">
        {currentPhase !== PHASES.IDENTIFICATION && (
          <button 
            className="back-button"
            onClick={handleBackPhase}
          >
            Back
          </button>
        )}
        
        {currentPhase !== PHASES.COMPLETION && (
          <button 
            className={`continue-button ${!canProceedFromCurrentPhase() ? 'disabled' : ''}`}
            onClick={handleNextPhase}
            disabled={!canProceedFromCurrentPhase()}
          >
            {getButtonText()}
          </button>
        )}
        
        {currentPhase === PHASES.COMPLETION && (
          <button 
            className="continue-button"
            onClick={() => {
              // Reset to beginning or show completion message
              console.log('Activity completed!');
            }}
          >
            {getButtonText()}
          </button>
        )}
      </div>
    </div>
    </>
  );
}
