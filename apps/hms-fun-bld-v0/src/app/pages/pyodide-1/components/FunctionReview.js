import { useState, useRef, useEffect } from 'react';
import { 
  getFunctionContent, 
  getHighlightedFunctionContent,
  MOCK_VARIABLES,
  allQuestionsAnswered,
  formatFunctionName
} from '../utils/sharedUtils';

const FunctionReview = ({ 
  functions, 
  setFunctions, 
  value, 
  onBackToScript,
  onProceed,
  pyodide
}) => {
  const [functionAnswers, setFunctionAnswers] = useState({});
  const [showVariablePicker, setShowVariablePicker] = useState(null);
  const [pickerType, setPickerType] = useState(null); // 'inputs' or 'output'
  const [editingFunctionName, setEditingFunctionName] = useState(null);
  const [tempFunctionName, setTempFunctionName] = useState('');
  const [currentFunctionIndex, setCurrentFunctionIndex] = useState(0);
  
  // New state for feedback and validation
  const [feedbackMessages, setFeedbackMessages] = useState({});
  const [validationLoading, setValidationLoading] = useState({});
  
  // State for custom parameter input
  const [customParameterInput, setCustomParameterInput] = useState('');
  
  // State for edited function content
  const [editedFunctionContent, setEditedFunctionContent] = useState({});

  // Ref for the variable picker to handle click outside
  const variablePickerRef = useRef(null);

  const currentFunction = functions[currentFunctionIndex];

  // Helper function to get function content (edited or original)
  const getCurrentFunctionContent = (func) => {
    return editedFunctionContent[func.id] || getFunctionContent(func, value);
  };

  // Handle function content changes
  const handleFunctionContentChange = (functionId, newContent) => {
    setEditedFunctionContent(prev => ({
      ...prev,
      [functionId]: newContent
    }));
    
    // Clear previous feedback and answers when content changes
    setFeedbackMessages(prev => ({
      ...prev,
      [functionId]: {
        ...prev[functionId],
        singlePurpose: '',
        worksAsIs: '',
        sideEffects: ''
      }
    }));
    
    // Clear previous answers to force re-evaluation
    setFunctionAnswers(prev => ({
      ...prev,
      [functionId]: {
        ...prev[functionId],
        singlePurpose: '',
        worksAsIs: '',
        sideEffects: ''
      }
    }));
  };

  // Reset function content to original
  const handleResetFunctionContent = (functionId) => {
    setEditedFunctionContent(prev => {
      const newState = { ...prev };
      delete newState[functionId];
      return newState;
    });
    
    // Clear feedback and answers when resetting
    setFeedbackMessages(prev => ({
      ...prev,
      [functionId]: {
        ...prev[functionId],
        singlePurpose: '',
        worksAsIs: '',
        sideEffects: ''
      }
    }));
    
    setFunctionAnswers(prev => ({
      ...prev,
      [functionId]: {
        ...prev[functionId],
        singlePurpose: '',
        worksAsIs: '',
        sideEffects: ''
      }
    }));
  };

  // Handle click outside to close variable picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (variablePickerRef.current && !variablePickerRef.current.contains(event.target)) {
        setShowVariablePicker(null);
        setPickerType(null);
        setCustomParameterInput(''); // Clear custom input when clicking outside
      }
    };

    if (showVariablePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showVariablePicker]);

  // OpenAI validation function
  const validateWithOpenAI = async (functionId, validationType = 'singleResponsibility') => {
    const func = functions.find(f => f.id === functionId);
    if (!func) return;

    const loadingKey = validationType === 'sideEffects' ? `${functionId}_sideEffects` : functionId;
    setValidationLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const functionCode = getCurrentFunctionContent(func);
      
      const response = await fetch('/api/openAI', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          functionCode,
          originalCode: value,
          functionName: func.name,
          validationType
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const result = await response.json();
      
      const messageKey = validationType === 'sideEffects' ? 'sideEffects' : 'singlePurpose';
      setFeedbackMessages(prev => ({
        ...prev,
        [functionId]: {
          ...prev[functionId],
          [messageKey]: result.explanation
        }
      }));

      return result;

    } catch (error) {
      console.error('Validation error:', error);
      const messageKey = validationType === 'sideEffects' ? 'sideEffects' : 'singlePurpose';
      setFeedbackMessages(prev => ({
        ...prev,
        [functionId]: {
          ...prev[functionId],
          [messageKey]: 'Unable to validate the function at this time. Please check your code and try again.'
        }
      }));
      return { passes: false, explanation: 'Validation failed. Please try again.' };
    } finally {
      setValidationLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  // Pyodide validation function
  const validateWithPyodide = async (functionId) => {
    const func = functions.find(f => f.id === functionId);
    if (!func || !pyodide) return { passes: false, explanation: 'Pyodide not available for validation.' };

    setValidationLoading(prev => ({ ...prev, [`${functionId}_pyodide`]: true }));

    try {
      const rawFunctionBody = getCurrentFunctionContent(func);
      const functionName = formatFunctionName(func.name);
      const functionInputs = func.inputs || [];
      const functionOutput = func.output || '';
      
      // Construct the proper function definition
      const parametersString = functionInputs.join(', ');
      
      // Normalize indentation: find minimum indentation and remove it, then apply standard 4-space indentation
      const lines = rawFunctionBody.split('\n');
      const nonEmptyLines = lines.filter(line => line.trim() !== '');
      
      // Find the minimum indentation level (number of leading spaces)
      let minIndentation = Infinity;
      nonEmptyLines.forEach(line => {
        const match = line.match(/^(\s*)/);
        if (match) {
          minIndentation = Math.min(minIndentation, match[1].length);
        }
      });
      
      // If no non-empty lines or no indentation found, set to 0
      if (minIndentation === Infinity) {
        minIndentation = 0;
      }
      
      // Remove the base indentation and apply standard 4-space function indentation
      const indentedBody = lines.map(line => {
        if (line.trim() === '') {
          return ''; // Keep empty lines empty
        }
        // Remove the base indentation, then add 4 spaces for function body
        const unindentedLine = line.substring(minIndentation);
        return `    ${unindentedLine}`;
      }).join('\n');
      
      const returnStatement = functionOutput.trim() ? `    return ${functionOutput}` : '    return';
      
      const functionDefinition = `def ${functionName}(${parametersString}):
${indentedBody}
${returnStatement}`;
      
      // Prepare the code with required imports and try-except wrapper
      const codeToRun = `
import numpy as np
import matplotlib.pyplot as plt

# User's function definition
${functionDefinition}

# Test execution wrapper
try:
    # Try to call the function if it appears to be callable
    import inspect
    if '${functionName}' in locals():
        func_obj = locals()['${functionName}']
        if callable(func_obj):
            # Try to get function signature to understand parameters
            try:
                sig = inspect.signature(func_obj)
                param_count = len(sig.parameters)
                
                # Create mock parameters based on the number expected
                mock_params = []
                for i in range(param_count):
                    # Create simple mock data - numpy array for most cases
                    mock_params.append(np.array([[1, 2], [3, 4]]))
                
                # Call the function with mock parameters
                if param_count == 0:
                    result = func_obj()
                else:
                    result = func_obj(*mock_params)
                    
                print("Function executed successfully!")
                execution_result = "SUCCESS"
            except Exception as call_error:
                print(f"Function call error: {str(call_error)}")
                execution_result = f"CALL_ERROR: {str(call_error)}"
        else:
            print("Function definition found but not callable")
            execution_result = "NOT_CALLABLE"
    else:
        print("Function not found in namespace")
        execution_result = "NOT_FOUND"
        
except SyntaxError as e:
    print(f"Syntax error: {str(e)}")
    execution_result = f"SYNTAX_ERROR: {str(e)}"
except NameError as e:
    print(f"Name error: {str(e)}")
    execution_result = f"NAME_ERROR: {str(e)}"
except ImportError as e:
    print(f"Import error: {str(e)}")
    execution_result = f"IMPORT_ERROR: {str(e)}"
except Exception as e:
    print(f"Runtime error: {str(e)}")
    execution_result = f"RUNTIME_ERROR: {str(e)}"

print(f"Final result: {execution_result}")
`;

      // Debug: Log the exact code being executed
      console.log('=== PYODIDE EXECUTION DEBUG ===');
      console.log('Function ID:', functionId);
      console.log('Function Name:', functionName);
      console.log('Function Inputs:', functionInputs);
      console.log('Function Output:', functionOutput);
      console.log('Raw Function Body:', rawFunctionBody);
      console.log('Min Indentation Found:', minIndentation);
      console.log('Normalized & Indented Body:', indentedBody);
      console.log('Constructed Function Definition:', functionDefinition);
      console.log('Complete Code to Execute:', codeToRun);
      console.log('================================');

      // Run the code in Pyodide
      const output = await pyodide.runPythonAsync(codeToRun);
      
      // Get the execution result from Pyodide's namespace
      const executionResult = pyodide.globals.get('execution_result');
      
      let passes = false;
      let explanation = '';
      
      if (executionResult === 'SUCCESS') {
        passes = true;
        explanation = '✅ Great! Your function runs without any errors.';
      } else if (executionResult.startsWith('SYNTAX_ERROR:')) {
        const errorMsg = executionResult.replace('SYNTAX_ERROR: ', '');
        explanation = `❌ **Syntax Error**: ${errorMsg}\n\nThis means there's a problem with the Python syntax in your function. Check for missing colons, incorrect indentation, or typos.`;
      } else if (executionResult.startsWith('NAME_ERROR:')) {
        const errorMsg = executionResult.replace('NAME_ERROR: ', '');
        explanation = `❌ **Name Error**: ${errorMsg}\n\nThis means your function is trying to use a variable or function that hasn't been defined. Make sure all variables are properly declared or passed as parameters.`;
      } else if (executionResult.startsWith('IMPORT_ERROR:')) {
        const errorMsg = executionResult.replace('IMPORT_ERROR: ', '');
        explanation = `❌ **Import Error**: ${errorMsg}\n\nThis means your function is trying to import a module that isn't available. Consider if this import should be moved outside the function or if an alternative approach is needed.`;
      } else if (executionResult.startsWith('CALL_ERROR:')) {
        const errorMsg = executionResult.replace('CALL_ERROR: ', '');
        explanation = `❌ **Runtime Error**: ${errorMsg}\n\nYour function syntax is correct, but it encountered an error when executed. This could be due to incorrect parameter types, mathematical errors, or logic issues.`;
      } else if (executionResult === 'NOT_CALLABLE') {
        explanation = '❌ **Not a Function**: The code doesn\'t define a proper function. Make sure you\'re using the `def` keyword correctly.';
      } else if (executionResult === 'NOT_FOUND') {
        explanation = '❌ **Function Not Found**: The function wasn\'t found after execution. Check that your function name matches and is properly defined.';
      } else {
        explanation = `❌ **Unknown Error**: Something unexpected happened during validation. Result: ${executionResult}`;
      }

      setFeedbackMessages(prev => ({
        ...prev,
        [functionId]: {
          ...prev[functionId],
          worksAsIs: explanation
        }
      }));

      return { passes, explanation };

    } catch (error) {
      console.error('Pyodide validation error:', error);
      const explanation = '❌ **Validation Error**: Unable to validate the function. There might be an issue with the code execution environment.';
      
      setFeedbackMessages(prev => ({
        ...prev,
        [functionId]: {
          ...prev[functionId],
          worksAsIs: explanation
        }
      }));
      
      return { passes: false, explanation };
    } finally {
      setValidationLoading(prev => ({ ...prev, [`${functionId}_pyodide`]: false }));
    }
  };

  // Handle answer selection with different behaviors
  const handleAnswerChange = async (functionId, question, answer) => {
    setFunctionAnswers(prev => ({
      ...prev,
      [functionId]: {
        ...prev[functionId],
        [question]: answer
      }
    }));

    // Clear previous feedback for this question
    setFeedbackMessages(prev => ({
      ...prev,
      [functionId]: {
        ...prev[functionId],
        [question]: ''
      }
    }));

    // Handle specific behaviors for the first question
    if (question === 'singlePurpose') {
      if (answer === 'YES') {
        // Run OpenAI validation - if passes, inform user to move on
        const result = await validateWithOpenAI(functionId);
        if (result && result.passes) {
          setFeedbackMessages(prev => ({
            ...prev,
            [functionId]: {
              ...prev[functionId],
              singlePurpose: '✅ Great! Your function follows the single responsibility principle. You can move on to the next question.'
            }
          }));
        }
      } else if (answer === "I'm NOT SURE") {
        // Run OpenAI validation and explain result
        await validateWithOpenAI(functionId);
      } else if (answer === 'NO') {
        // Require student to go back and re-pick groups
        handleRequireRegrouping(functionId);
      }
    }

    // Handle specific behaviors for the second question
    if (question === 'worksAsIs') {
      if (answer === 'YES') {
        // Run Pyodide validation - if passes then consider question passed, if fails explain results
        const result = await validateWithPyodide(functionId);
        if (result && result.passes) {
          setFeedbackMessages(prev => ({
            ...prev,
            [functionId]: {
              ...prev[functionId],
              worksAsIs: '✅ Excellent! Your function runs successfully without any errors.'
            }
          }));
        }
        // If it fails, the error explanation is already set by validateWithPyodide
      } else if (answer === "I'm NOT SURE") {
        // Run Pyodide validation and explain results
        await validateWithPyodide(functionId);
      } else if (answer === 'NO') {
        // Require student to edit function
        setFeedbackMessages(prev => ({
          ...prev,
          [functionId]: {
            ...prev[functionId],
            worksAsIs: '⚠️ You identified that this function has issues. Please review and edit your function to fix any syntax errors, undefined variables, or other problems before proceeding.'
          }
        }));
             }
     }

     // Handle specific behaviors for the third question
     if (question === 'sideEffects') {
       if (answer === 'YES') {
         // User thinks it has side effects - require editing
         setFeedbackMessages(prev => ({
           ...prev,
           [functionId]: {
             ...prev[functionId],
             sideEffects: '⚠️ You identified that this function affects variables beyond its scope. Functions should ideally only work with their parameters and return values. Please review and edit your function to eliminate side effects.'
           }
         }));
       } else if (answer === "I'm NOT SURE") {
         // Run OpenAI validation and explain results
         await validateWithOpenAI(functionId, 'sideEffects');
       } else if (answer === 'NO') {
         // Run OpenAI validation - if passes, mark correct; if fails, explain
         const result = await validateWithOpenAI(functionId, 'sideEffects');
         if (result && result.passes) {
           setFeedbackMessages(prev => ({
             ...prev,
             [functionId]: {
               ...prev[functionId],
               sideEffects: '✅ Excellent! Your function appears to be free of side effects and only works with its parameters and return values.'
             }
           }));
         }
         // If it fails, the error explanation is already set by validateWithOpenAI
       }
     }
   };

  // Skeleton function for regrouping requirement
  const handleRequireRegrouping = (functionId) => {
    setFeedbackMessages(prev => ({
      ...prev,
      [functionId]: {
        ...prev[functionId],
        singlePurpose: '⚠️ You identified that this function does not follow the single responsibility principle. Please go back to the script editor and reorganize your code into different function groups.'
      }
    }));
    
    // TODO: Implement actual regrouping functionality
    alert('You need to go back and re-pick your function groups. This will redirect you to the script editor.');
  };

  const handleVariableSelection = (variable) => {
    if (showVariablePicker && pickerType === 'inputs') {
      const functionId = showVariablePicker;
      setFunctions(prev => 
        prev.map(f => {
          if (f.id === functionId) {
            const currentInputs = f.inputs || [];
            // Check if variable is already in inputs to avoid duplicates
            if (!currentInputs.includes(variable)) {
              return { ...f, inputs: [...currentInputs, variable] };
            }
            return f;
          }
          return f;
        })
      );
    }
  };

  const handleCloseVariablePicker = () => {
    setShowVariablePicker(null);
    setPickerType(null);
    setCustomParameterInput(''); // Clear custom input when closing
  };

  const handleRemoveInput = (functionId, inputToRemove) => {
    setFunctions(prev => 
      prev.map(f => {
        if (f.id === functionId) {
          const updatedInputs = (f.inputs || []).filter(input => input !== inputToRemove);
          return { ...f, inputs: updatedInputs };
        }
        return f;
      })
    );
  };

  const handleReturnStatementChange = (functionId, returnStatement) => {
    setFunctions(prev => 
      prev.map(f => {
        if (f.id === functionId) {
          return { ...f, output: returnStatement };
        }
        return f;
      })
    );
  };

  const handleAddCustomParameter = () => {
    const trimmedInput = customParameterInput.trim();
    if (!trimmedInput) return;

    const functionId = showVariablePicker;
    setFunctions(prev => 
      prev.map(f => {
        if (f.id === functionId) {
          const currentInputs = f.inputs || [];
          // Check if parameter already exists to avoid duplicates
          if (!currentInputs.includes(trimmedInput)) {
            return { ...f, inputs: [...currentInputs, trimmedInput] };
          }
          return f;
        }
        return f;
      })
    );
    
    // Clear the input field
    setCustomParameterInput('');
  };

  const handleCustomParameterKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomParameter();
    }
  };

  const handleFunctionNameEdit = (functionId, currentName) => {
    setEditingFunctionName(functionId);
    setTempFunctionName(currentName);
  };

  const handleFunctionNameSave = () => {
    if (editingFunctionName && tempFunctionName.trim()) {
      setFunctions(prev => 
        prev.map(f => 
          f.id === editingFunctionName 
            ? { ...f, name: tempFunctionName.trim() }
            : f
        )
      );
    }
    setEditingFunctionName(null);
    setTempFunctionName('');
  };

  const handleFunctionNameCancel = () => {
    setEditingFunctionName(null);
    setTempFunctionName('');
  };

  const handleTabClick = (index) => {
    setCurrentFunctionIndex(index);
    setShowVariablePicker(null);
    setEditingFunctionName(null);
    setCustomParameterInput('');
  };

  const handlePreviousFunction = () => {
    if (currentFunctionIndex > 0) {
      setCurrentFunctionIndex(currentFunctionIndex - 1);
      setShowVariablePicker(null);
      setEditingFunctionName(null);
      setCustomParameterInput('');
    }
  };

  const handleNextFunction = () => {
    if (currentFunctionIndex < functions.length - 1) {
      setCurrentFunctionIndex(currentFunctionIndex + 1);
      setShowVariablePicker(null);
      setEditingFunctionName(null);
      setCustomParameterInput('');
    }
  };

  if (!currentFunction) return null;

  return (
    <div className="function-review">
      <h2>{"Function Builder"}</h2>
      
      <div className="instructions">
        Time to review (and maybe edit!) the functions you&apos;ve designed. In order to 
        proceed, you&apos;ll need to ensure that all your functions have appropriate inputs and 
        outputs, that they obey the single-responsibility principle, and that they don&apos;t 
        cause unintended side effects.
      </div>

      {/* Function Tabs */}
      <div className="function-review-tabs">
        {functions.map((func, index) => (
          <button
            key={func.id}
            className={`review-tab ${index === currentFunctionIndex ? 'active' : ''}`}
            onClick={() => handleTabClick(index)}
          >
            {func.name}
          </button>
        ))}
      </div>

      {/* Function Navigation */}
      <div className="function-navigation">
        <button 
          className="nav-button prev-button"
          onClick={handlePreviousFunction}
          disabled={currentFunctionIndex === 0}
        >
          ← Previous Function
        </button>
        <span className="function-counter">
          Function {currentFunctionIndex + 1} of {functions.length}
        </span>
        <button 
          className="nav-button next-button"
          onClick={handleNextFunction}
          disabled={currentFunctionIndex === functions.length - 1}
        >
          Next Function →
        </button>
      </div>

      {/* Current Function Display */}
      <div className="function-review-item">
        <div className="function-header">
          <span className="line-number">{String(currentFunction.startLine).padStart(2, '0')}</span>
          <span className="function-def">def </span>
          {editingFunctionName === currentFunction.id ? (
            <span className="function-name-editor">
              <input
                type="text"
                value={tempFunctionName}
                onChange={(e) => setTempFunctionName(e.target.value)}
                className="function-name-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFunctionNameSave();
                  if (e.key === 'Escape') handleFunctionNameCancel();
                }}
              />
              <button onClick={handleFunctionNameSave} className="name-save-btn">✓</button>
              <button onClick={handleFunctionNameCancel} className="name-cancel-btn">✗</button>
            </span>
          ) : (
            <span 
              className="function-name editable"
              onClick={() => handleFunctionNameEdit(currentFunction.id, currentFunction.name)}
              title="Click to edit function name"
            >
              {currentFunction.name.toLowerCase().replace(/\s+/g, '_')}
            </span>
          )}
          <span className="function-params">
            (
            <button 
              className="param-selector"
              onClick={() => {
                setShowVariablePicker(currentFunction.id);
                setPickerType('inputs');
                setCustomParameterInput(''); // Clear custom input when opening picker
              }}
            >
              {currentFunction.inputs && currentFunction.inputs.length > 0 
                ? currentFunction.inputs.join(', ') 
                : 'Click to select inputs'
              }
            </button>
            ):
          </span>
        </div>
        
        <div className="function-body">
          <div className="function-body-header">
            <span className="line-number">{String(currentFunction.startLine + 1).padStart(2, '0')}</span>
            {editedFunctionContent[currentFunction.id] && (
              <div className="edit-controls">
                <span className="edited-indicator">✏️ Edited</span>
                <button 
                  className="reset-button"
                  onClick={() => handleResetFunctionContent(currentFunction.id)}
                  title="Reset to original code"
                >
                  ↺ Reset
                </button>
              </div>
            )}
          </div>
          <textarea
            className="function-content-editable"
            value={getCurrentFunctionContent(currentFunction)}
            onChange={(e) => handleFunctionContentChange(currentFunction.id, e.target.value)}
            placeholder="Enter your function code here..."
            rows={Math.max(4, getCurrentFunctionContent(currentFunction).split('\n').length)}
          />
        </div>
        
        <div className="function-return">
          <span className="line-number">{String(currentFunction.endLine).padStart(2, '0')}</span>
          <span className="return-statement">return </span>
          <input
            type="text"
            className="return-input"
            value={currentFunction.output || ''}
            onChange={(e) => handleReturnStatementChange(currentFunction.id, e.target.value)}
            placeholder="Type your return statement..."
          />
        </div>

        {showVariablePicker === currentFunction.id && (
          <div className="variable-picker-overlay">
            <div className="variable-picker" ref={variablePickerRef}>
              <div className="variable-picker-header-row">
                <div className="variable-picker-header">
                  On click, show all (non-built-in) variables returned by globals() call
                </div>
                <button 
                  className="variable-picker-close"
                  onClick={handleCloseVariablePicker}
                  title="Close"
                >
                  ×
                </button>
              </div>
              
              {pickerType === 'inputs' && (
                <div className="custom-parameter-input">
                  <div className="custom-parameter-label">Add custom parameter:</div>
                  <div className="custom-parameter-row">
                    <input
                      type="text"
                      className="custom-parameter-field"
                      value={customParameterInput}
                      onChange={(e) => setCustomParameterInput(e.target.value)}
                      onKeyDown={handleCustomParameterKeyDown}
                      placeholder="Type parameter name..."
                    />
                    <button 
                      className="add-parameter-button"
                      onClick={handleAddCustomParameter}
                      disabled={!customParameterInput.trim()}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}
              
              {pickerType === 'inputs' && currentFunction.inputs && currentFunction.inputs.length > 0 && (
                <div className="selected-inputs">
                  <div className="selected-inputs-label">Selected inputs:</div>
                  <div className="selected-inputs-list">
                    {currentFunction.inputs.map(input => (
                      <span key={input} className="selected-input">
                        {input}
                        <button 
                          className="remove-input"
                          onClick={() => handleRemoveInput(currentFunction.id, input)}
                          title="Remove input"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="variable-list">
                {MOCK_VARIABLES.map(variable => {
                  const isSelected = pickerType === 'inputs' && 
                    currentFunction.inputs && 
                    currentFunction.inputs.includes(variable);
                  
                  return (
                    <button
                      key={variable}
                      className={`variable-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleVariableSelection(variable)}
                      disabled={isSelected}
                    >
                      {variable}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="function-questions">
          <div className="question-group">
            <div className="question">Does this function do one specific thing?</div>
            <div className="answer-buttons">
              {['YES', "I'm NOT SURE", 'NO'].map(answer => (
                <button
                  key={answer}
                  className={`answer-button ${functionAnswers[currentFunction.id]?.singlePurpose === answer ? 'selected' : ''} ${validationLoading[currentFunction.id] ? 'loading' : ''}`}
                  onClick={() => handleAnswerChange(currentFunction.id, 'singlePurpose', answer)}
                  disabled={validationLoading[currentFunction.id]}
                >
                  {validationLoading[currentFunction.id] && functionAnswers[currentFunction.id]?.singlePurpose === answer
                    ? 'Validating...'
                    : answer
                  }
                </button>
              ))}
            </div>
            {/* Feedback block for single purpose question */}
            {feedbackMessages[currentFunction.id]?.singlePurpose && (
              <div className="feedback-block">
                <div className="feedback-content">
                  {feedbackMessages[currentFunction.id].singlePurpose}
                </div>
              </div>
            )}
          </div>

          <div className="question-group">
            <div className="question">Will the code in this function work as-is?</div>
            <div className="answer-buttons">
              {['YES', "I'm NOT SURE", 'NO'].map(answer => (
                <button
                  key={answer}
                  className={`answer-button ${functionAnswers[currentFunction.id]?.worksAsIs === answer ? 'selected' : ''} ${validationLoading[`${currentFunction.id}_pyodide`] ? 'loading' : ''}`}
                  onClick={() => handleAnswerChange(currentFunction.id, 'worksAsIs', answer)}
                  disabled={validationLoading[`${currentFunction.id}_pyodide`]}
                >
                  {validationLoading[`${currentFunction.id}_pyodide`] && functionAnswers[currentFunction.id]?.worksAsIs === answer
                    ? 'Validating...'
                    : answer
                  }
                </button>
              ))}
            </div>
            {/* Feedback block for works as-is question */}
            {feedbackMessages[currentFunction.id]?.worksAsIs && (
              <div className="feedback-block">
                <div className="feedback-content">
                  {feedbackMessages[currentFunction.id].worksAsIs}
                </div>
              </div>
            )}
          </div>

          <div className="question-group">
            <div className="question">Does this function affect variables beyond its own scope?</div>
            <div className="answer-buttons">
              {['YES', "I'm NOT SURE", 'NO'].map(answer => (
                <button
                  key={answer}
                  className={`answer-button ${functionAnswers[currentFunction.id]?.sideEffects === answer ? 'selected' : ''} ${validationLoading[`${currentFunction.id}_sideEffects`] ? 'loading' : ''}`}
                  onClick={() => handleAnswerChange(currentFunction.id, 'sideEffects', answer)}
                  disabled={validationLoading[`${currentFunction.id}_sideEffects`]}
                >
                  {validationLoading[`${currentFunction.id}_sideEffects`] && functionAnswers[currentFunction.id]?.sideEffects === answer
                    ? 'Validating...'
                    : answer
                  }
                </button>
              ))}
            </div>
            {/* Feedback block for side effects question */}
            {feedbackMessages[currentFunction.id]?.sideEffects && (
              <div className="feedback-block">
                <div className="feedback-content">
                  {feedbackMessages[currentFunction.id].sideEffects}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="review-controls">
        <button className="control-button back-button" onClick={onBackToScript}>
          BACK TO SCRIPT
        </button>
        <button 
          className="control-button skip-button"
          onClick={onProceed}
          title="Skip validation questions (temporary - for development)"
        >
          SKIP QUESTIONS
        </button>
        <button 
          className={`control-button proceed-button ${allQuestionsAnswered(functions, functionAnswers) ? '' : 'disabled'}`}
          onClick={onProceed}
          disabled={!allQuestionsAnswered(functions, functionAnswers)}
        >
          {allQuestionsAnswered(functions, functionAnswers) ? 'PROCEED' : 'MUST ANSWER ALL QUESTIONS TO PROCEED'}
        </button>
      </div>
    </div>
  );
};

export default FunctionReview; 