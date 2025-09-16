'use client';
import { useEffect, useState } from 'react';
import './pyodide-3.css';

export default function PyodideDemo3() {
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [filesCreated, setFilesCreated] = useState([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);

  // Python file contents for our demo
  const pythonFiles = {
    'math_utils.py': `"""
Math utilities module - demonstrates basic mathematical operations
"""

def add_numbers(a, b):
    """Add two numbers together"""
    result = a + b
    print(f"Adding {a} + {b} = {result}")
    return result

def multiply_numbers(a, b):
    """Multiply two numbers"""
    result = a * b
    print(f"Multiplying {a} * {b} = {result}")
    return result

def calculate_area(length, width):
    """Calculate area of a rectangle"""
    area = multiply_numbers(length, width)
    print(f"Area of rectangle ({length} x {width}) = {area}")
    return area

def fibonacci(n):
    """Generate fibonacci sequence up to n terms"""
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    sequence = [0, 1]
    for i in range(2, n):
        sequence.append(add_numbers(sequence[i-1], sequence[i-2]))
    
    print(f"Fibonacci sequence ({n} terms): {sequence}")
    return sequence

# Module-level variable
PI = 3.14159265359

def circle_area(radius):
    """Calculate area of a circle"""
    area = multiply_numbers(PI, multiply_numbers(radius, radius))
    print(f"Area of circle (radius {radius}) = {area}")
    return area
`,

    'data_processor.py': `"""
Data processing module - demonstrates importing and using another module
"""
import math_utils

def process_rectangle_data(rectangles):
    """Process a list of rectangle dimensions and calculate total area"""
    print("\\n=== Processing Rectangle Data ===")
    total_area = 0
    
    for i, (length, width) in enumerate(rectangles, 1):
        print(f"\\nRectangle {i}:")
        area = math_utils.calculate_area(length, width)
        total_area = math_utils.add_numbers(total_area, area)
    
    print(f"\\nTotal area of all rectangles: {total_area}")
    return total_area

def analyze_fibonacci_data(terms):
    """Analyze fibonacci sequence data"""
    print("\\n=== Analyzing Fibonacci Data ===")
    sequence = math_utils.fibonacci(terms)
    
    if len(sequence) > 0:
        total = sum(sequence)
        average = total / len(sequence)
        
        print(f"Sum of fibonacci sequence: {total}")
        print(f"Average of fibonacci sequence: {average:.2f}")
        print(f"Largest number in sequence: {max(sequence)}")
        
        return {
            'sequence': sequence,
            'sum': total,
            'average': average,
            'max': max(sequence)
        }
    return None

def process_circle_data(radii):
    """Process circle data using math_utils"""
    print("\\n=== Processing Circle Data ===")
    total_area = 0
    
    for i, radius in enumerate(radii, 1):
        print(f"\\nCircle {i}:")
        area = math_utils.circle_area(radius)
        total_area = math_utils.add_numbers(total_area, area)
    
    print(f"\\nTotal area of all circles: {total_area}")
    return total_area

def compare_areas(rectangles, circles):
    """Compare total areas of rectangles vs circles"""
    print("\\n=== Area Comparison ===")
    
    rect_area = process_rectangle_data(rectangles)
    circle_area = process_circle_data(circles)
    
    print(f"\\nComparison Results:")
    print(f"Total rectangle area: {rect_area}")
    print(f"Total circle area: {circle_area}")
    
    if rect_area > circle_area:
        difference = math_utils.add_numbers(rect_area, -circle_area)
        print(f"Rectangles have {difference:.2f} more area than circles")
    else:
        difference = math_utils.add_numbers(circle_area, -rect_area)
        print(f"Circles have {difference:.2f} more area than rectangles")
    
    return {
        'rectangle_total': rect_area,
        'circle_total': circle_area,
        'difference': abs(rect_area - circle_area)
    }
`,

    'main.py': `"""
Main application - demonstrates importing and orchestrating multiple modules
"""
import math_utils
import data_processor

def run_demo():
    """Run the complete multi-file Python demo"""
    print("🐍 PYODIDE MULTI-FILE PYTHON DEMO 🐍")
    print("=" * 50)
    print("This demo shows multiple Python files working together!")
    print()
    
    # Test basic math operations
    print("1. Testing basic math operations from math_utils:")
    math_utils.add_numbers(10, 25)
    math_utils.multiply_numbers(7, 8)
    
    # Test fibonacci
    print("\\n2. Testing fibonacci sequence:")
    fib_data = data_processor.analyze_fibonacci_data(8)
    
    # Test rectangle processing
    print("\\n3. Testing rectangle processing:")
    rectangles = [(5, 10), (3, 7), (12, 4)]
    rect_total = data_processor.process_rectangle_data(rectangles)
    
    # Test circle processing
    print("\\n4. Testing circle processing:")
    circles = [2, 5, 3.5]
    circle_total = data_processor.process_circle_data(circles)
    
    # Compare areas
    print("\\n5. Comparing rectangle vs circle areas:")
    comparison = data_processor.compare_areas(rectangles, circles)
    
    # Final summary
    print("\\n" + "=" * 50)
    print("DEMO COMPLETE! 🎉")
    print("✅ Successfully demonstrated:")
    print("  • Multiple Python files working together")
    print("  • Cross-module function calls")
    print("  • Shared data processing")
    print("  • Virtual file system in Pyodide")
    print("=" * 50)
    
    return {
        'fibonacci': fib_data,
        'area_comparison': comparison,
        'demo_complete': True
    }

# Run the demo when this file is executed
if __name__ == "__main__":
    result = run_demo()
`
  };

  const steps = [
    {
      title: "Initialize Pyodide",
      description: "Loading Pyodide runtime and preparing environment"
    },
    {
      title: "Create Virtual Python Files", 
      description: "Mount multiple Python files in the virtual file system"
    },
    {
      title: "Import and Test Modules",
      description: "Import our custom modules and test inter-file communication"
    },
    {
      title: "Run Complete Demo",
      description: "Execute the full demo showing multiple files working together"
    }
  ];

  useEffect(() => {
    async function initPyodide() {
      try {
        setLoading(true);
        setOutput('Initializing Pyodide...\n');
        
        // Load Pyodide
        const pyodideInstance = await window.loadPyodide();
        setPyodide(pyodideInstance);
        
        setOutput(prev => prev + '✅ Pyodide loaded successfully!\n');
        setCurrentStep(1);
        setLoading(false);
        
      } catch (err) {
        setError(`Failed to load Pyodide: ${err.message}`);
        setLoading(false);
      }
    }

    // Load Pyodide script if not already loaded
    if (!window.loadPyodide) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';
      script.onload = initPyodide;
      script.onerror = () => setError('Failed to load Pyodide script');
      document.head.appendChild(script);
    } else {
      initPyodide();
    }
  }, []);

  const createVirtualFiles = async () => {
    if (!pyodide) return;
    
    try {
      setCurrentStep(2);
      setOutput(prev => prev + '\n📁 Creating virtual Python files...\n');
      
      const createdFiles = [];
      
      // Create each Python file in the virtual file system
      for (const [filename, content] of Object.entries(pythonFiles)) {
        pyodide.FS.writeFile(filename, content);
        createdFiles.push(filename);
        setOutput(prev => prev + `✅ Created: ${filename}\n`);
      }
      
      setFilesCreated(createdFiles);
      setOutput(prev => prev + `\n✅ All ${createdFiles.length} Python files created successfully!\n`);
      
    } catch (err) {
      setError(`Error creating virtual files: ${err.message}`);
    }
  };

  const testModuleImports = async () => {
    if (!pyodide) return;
    
    try {
      setCurrentStep(3);
      setOutput(prev => prev + '\n🔗 Testing module imports and basic functions...\n');
      
      // Test importing our modules
      setOutput(prev => prev + '\nImporting math_utils module:\n');
      pyodide.runPython(`
import math_utils
print("✅ math_utils imported successfully")

# Test a simple function
result = math_utils.add_numbers(15, 27)
print(f"Test function result: {result}")
      `);
      
      setOutput(prev => prev + '\nImporting data_processor module:\n');
      pyodide.runPython(`
import data_processor
print("✅ data_processor imported successfully")

# Test fibonacci analysis
fib_result = data_processor.analyze_fibonacci_data(5)
print(f"Fibonacci analysis complete: {fib_result}")
      `);
      
      setOutput(prev => prev + '\n✅ Module imports and basic testing complete!\n');
      
    } catch (err) {
      setError(`Error testing module imports: ${err.message}`);
    }
  };

  const runFullDemo = async () => {
    if (!pyodide) return;
    
    try {
      setCurrentStep(4);
      setOutput(prev => prev + '\n🚀 Running complete multi-file demo...\n\n');
      
      // Capture Python output
      pyodide.runPython(`
import sys
from io import StringIO

# Redirect stdout to capture print statements
old_stdout = sys.stdout
sys.stdout = captured_output = StringIO()
      `);
      
      // Run the main demo
      pyodide.runPython(`
import main
result = main.run_demo()
      `);
      
      // Get the captured output
      const capturedOutput = pyodide.runPython(`
output = captured_output.getvalue()
sys.stdout = old_stdout
output
      `);
      
      setOutput(prev => prev + capturedOutput + '\n');
      setOutput(prev => prev + '🎉 Multi-file Python demo completed successfully!\n');
      
    } catch (err) {
      setError(`Error running full demo: ${err.message}`);
    }
  };

  const nextStep = () => {
    switch(currentStep) {
      case 1:
        createVirtualFiles();
        break;
      case 2:
        testModuleImports();
        break;
      case 3:
        runFullDemo();
        break;
      default:
        break;
    }
  };

  const resetDemo = () => {
    setCurrentStep(1);
    setOutput('');
    setError('');
    setFilesCreated([]);
    setSelectedFileIndex(0);
  };

  return (
    <div className="container">
      <h1>🐍 Pyodide Multi-File Python Demo</h1>
      
      <div className="instructions">
        <h3>Multi-File Python Demonstration</h3>
        <p>
          This demo showcases Pyodide&apos;s ability to work with multiple Python files that import and call functions from each other. 
          We&apos;ll create a virtual file system with three Python modules:
        </p>
        <ul>
          <li><strong>math_utils.py</strong> - Basic mathematical operations and utilities</li>
          <li><strong>data_processor.py</strong> - Data processing functions that import and use math_utils</li>
          <li><strong>main.py</strong> - Main orchestrator that imports both modules and runs the demo</li>
        </ul>
        <p>
          This demonstrates real-world Python project structure running entirely in the browser using Pyodide&apos;s virtual file system.
        </p>
      </div>

      {loading && (
        <div className="output-section">
          <h3>Loading...</h3>
          <pre>Initializing Pyodide runtime...</pre>
        </div>
      )}

      {error && (
        <div className="output-section" style={{borderColor: '#dc3545', backgroundColor: '#f8d7da'}}>
          <h3>Error</h3>
          <pre style={{color: '#721c24'}}>{error}</pre>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="phase-controls">
            <div style={{textAlign: 'center', marginBottom: '2rem'}}>
              <h3>Demo Progress</h3>
              <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem'}}>
                {steps.map((step, index) => (
                  <div 
                    key={index}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      backgroundColor: currentStep > index ? '#28a745' : currentStep === index ? '#007bff' : '#6c757d',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Step {index + 1}: {step.title}
                  </div>
                ))}
              </div>
              <p style={{fontSize: '16px', color: '#495057', margin: '0 0 1rem 0'}}>
                {steps[currentStep] ? steps[currentStep].description : 'Demo complete!'}
              </p>
            </div>
            
            {currentStep < 4 && (
              <button className="next-button" onClick={nextStep}>
                {currentStep === 0 ? 'Start Demo' : `Execute Step ${currentStep + 1}`}
              </button>
            )}
            
            {currentStep >= 4 && (
              <button className="next-button" onClick={resetDemo}>
                Reset Demo
              </button>
            )}
          </div>

          {filesCreated.length > 0 && (
            <div className="function-review">
              <h2>📁 Created Virtual Python Files {filesCreated.length > 0 && `(${selectedFileIndex + 1}/${filesCreated.length})`}</h2>
              <div className="function-review-tabs">
                {filesCreated.map((filename, index) => (
                  <button 
                    key={filename}
                    className={`review-tab ${index === selectedFileIndex ? 'active' : ''}`}
                    onClick={() => setSelectedFileIndex(index)}
                    title={`Click to view ${filename}`}
                  >
                    {filename}
                  </button>
                ))}
              </div>
              <div className="function-review-item">
                <div className="function-body">
                  <div className="function-content">
                    <pre className="function-code-simple">
{filesCreated[selectedFileIndex] && `# ${filesCreated[selectedFileIndex]}\n${pythonFiles[filesCreated[selectedFileIndex]]}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {output && (
            <div className="output-section">
              <h3>Demo Output</h3>
              <pre>{output}</pre>
            </div>
          )}

          <div className="instructions" style={{marginTop: '2rem'}}>
            <h3>🔍 What This Demo Demonstrates</h3>
            <ul>
              <li><strong>Virtual File System:</strong> Creating Python files in Pyodide&apos;s virtual file system</li>
              <li><strong>Module Imports:</strong> Python files importing and using functions from other files</li>
              <li><strong>Cross-Module Communication:</strong> Functions in one file calling functions in another</li>
              <li><strong>Project Structure:</strong> Realistic Python project organization with multiple modules</li>
              <li><strong>Shared State:</strong> Modules sharing data and working together on complex tasks</li>
              <li><strong>Real-time Execution:</strong> All running live in the browser without a Python server</li>
            </ul>
            <p>
              This showcases Pyodide&apos;s powerful capability to run complex, multi-file Python projects 
              entirely in the browser, making it perfect for educational tools, data science applications, 
              and interactive Python environments.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
