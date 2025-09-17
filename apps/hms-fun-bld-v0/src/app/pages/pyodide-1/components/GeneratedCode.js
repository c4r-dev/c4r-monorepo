import { useState, useEffect } from 'react';

const GeneratedCode = ({ 
  functions, 
  originalValue, 
  onBackToReview,
  onFinish,
  pyodide 
}) => {
  const [generatedCode, setGeneratedCode] = useState('');
  const [output, setOutput] = useState('');
  const [plotImage, setPlotImage] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Generate the new code with function definitions
  const generateModifiedCode = () => {
    const lines = originalValue.split('\n');
    let newCode = '';
    let currentLineIndex = 0;
    
    // Sort functions by start line to process them in order
    const sortedFunctions = [...functions].sort((a, b) => a.startLine - b.startLine);
    
    // First, add all function definitions at the top (after imports)
    let importEndIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('import ') || line.startsWith('from ')) {
        importEndIndex = i + 1;
      } else if (line === '' || line.startsWith('#')) {
        // Skip empty lines and comments
        continue;
      } else {
        break;
      }
    }
    
    // Add imports first
    for (let i = 0; i < importEndIndex; i++) {
      newCode += lines[i] + '\n';
    }
    
    if (importEndIndex > 0) {
      newCode += '\n# Generated Functions\n';
    }
    
    // Add all function definitions
    sortedFunctions.forEach((func) => {
      const functionName = func.name.toLowerCase().replace(/\s+/g, '_');
      const inputs = func.inputs && func.inputs.length > 0 ? func.inputs.join(', ') : '';
      const output = func.output || 'result';
      
      // Get the original function content
      const functionLines = lines.slice(func.startLine - 1, func.endLine);
      
      // Indent the function body
      const indentedBody = functionLines
        .map(line => '    ' + line)
        .join('\n');
      
      // Create the complete function
      newCode += `def ${functionName}(${inputs}):\n`;
      newCode += `${indentedBody}\n`;
      newCode += `    return ${output}\n\n`;
    });
    
    newCode += '# Main execution code\n';
    
    // Now add the main code with function calls
    currentLineIndex = importEndIndex;
    
    sortedFunctions.forEach((func) => {
      // Add lines before this function
      while (currentLineIndex < func.startLine - 1) {
        newCode += lines[currentLineIndex] + '\n';
        currentLineIndex++;
      }
      
      // Add function call instead of original code
      const functionName = func.name.toLowerCase().replace(/\s+/g, '_');
      const inputs = func.inputs && func.inputs.length > 0 ? func.inputs.join(', ') : '';
      const output = func.output || 'result';
      
      newCode += `${output} = ${functionName}(${inputs})\n`;
      
      // Skip the original lines that were replaced
      currentLineIndex = func.endLine;
    });
    
    // Add remaining lines after the last function
    while (currentLineIndex < lines.length) {
      newCode += lines[currentLineIndex] + '\n';
      currentLineIndex++;
    }
    
    return newCode.trim();
  };

  useEffect(() => {
    const code = generateModifiedCode();
    setGeneratedCode(code);
  }, [functions, originalValue]);

  const handleCodeChange = (event) => {
    setGeneratedCode(event.target.value);
  };

  const runGeneratedCode = async () => {
    if (!pyodide) {
      setOutput('❌ Pyodide not loaded yet. Please wait...');
      return;
    }
    
    setIsRunning(true);
    
    try {
      setOutput('Running generated code...');
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
      
      // Run the user's generated code with better error handling
      let result;
      let executionError = null;
      
      try {
        result = pyodide.runPython(`
try:
    exec('''${generatedCode.replace(/'/g, "\\'")}''')
    "Generated code executed successfully"
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
      
      setOutput(fullOutput || '✅ Generated code executed successfully (no output)');
      
    } catch (error) {
      setOutput(`💥 SYSTEM ERROR: ${error.message}\n\nStack trace:\n${error.stack}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="generated-code">
      <h2>Generated Code</h2>
      
      <div className="instructions">
        Here&apos;s your refactored code with proper function definitions. The isolated 
        regions have been converted into functions with the inputs and outputs you specified. 
        You can edit this code as needed before finalizing.
      </div>

      <div className="code-summary">
        <h3>Functions Created:</h3>
        <ul>
          {functions.map((func) => (
            <li key={func.id}>
              <strong>{func.name.toLowerCase().replace(/\s+/g, '_')}</strong>
              {func.inputs && func.inputs.length > 0 && (
                <span> - Inputs: {func.inputs.join(', ')}</span>
              )}
              {func.output && (
                <span> - Output: {func.output}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="generated-code-section">
        <h3>Modified Code:</h3>
        <textarea
          value={generatedCode}
          onChange={handleCodeChange}
          className="generated-code-textarea"
          rows={25}
          placeholder="Generated code will appear here..."
        />
        
        <div className="code-execution-controls">
          <button 
            onClick={runGeneratedCode} 
            className="run-generated-button"
            disabled={isRunning || !pyodide}
          >
            {isRunning ? 'Running...' : 'Run Generated Code'}
          </button>
        </div>
      </div>

      {output && (
        <div className="generated-output-section">
          <h3>Output:</h3>
          <pre className="generated-code-output">{output}</pre>
        </div>
      )}

      {plotImage && (
        <div className="generated-plot-section">
          <h3>Generated Plot:</h3>
          <img src={plotImage} alt="Generated matplotlib plot" className="generated-plot-image" />
        </div>
      )}

      <div className="generated-controls">
        <button className="control-button back-button" onClick={onBackToReview}>
          BACK TO REVIEW
        </button>
        <button className="control-button finish-button" onClick={onFinish}>
          FINISH
        </button>
      </div>
    </div>
  );
};

export default GeneratedCode; 