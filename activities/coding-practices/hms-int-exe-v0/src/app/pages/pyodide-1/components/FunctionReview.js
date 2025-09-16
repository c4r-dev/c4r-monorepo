import { useState } from 'react';
import { 
  getFunctionContent, 
  getHighlightedFunctionContent,
  MOCK_VARIABLES,
  allQuestionsAnswered 
} from '../utils/sharedUtils';

const FunctionReview = ({ 
  functions, 
  setFunctions, 
  value, 
  onBackToScript,
  onProceed 
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

  const currentFunction = functions[currentFunctionIndex];

  // OpenAI validation function
  const validateWithOpenAI = async (functionId, validationType = 'singleResponsibility') => {
    const func = functions.find(f => f.id === functionId);
    if (!func) return;

    setValidationLoading(prev => ({ ...prev, [functionId]: true }));

    try {
      const functionCode = getFunctionContent(func, value);
      
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
      
      setFeedbackMessages(prev => ({
        ...prev,
        [functionId]: {
          ...prev[functionId],
          singlePurpose: result.explanation
        }
      }));

      return result;

    } catch (error) {
      console.error('Validation error:', error);
      setFeedbackMessages(prev => ({
        ...prev,
        [functionId]: {
          ...prev[functionId],
          singlePurpose: 'Unable to validate the function at this time. Please check your code and try again.'
        }
      }));
      return { passes: false, explanation: 'Validation failed. Please try again.' };
    } finally {
      setValidationLoading(prev => ({ ...prev, [functionId]: false }));
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
    if (showVariablePicker && pickerType) {
      const functionId = showVariablePicker;
      setFunctions(prev => 
        prev.map(f => {
          if (f.id === functionId) {
            if (pickerType === 'inputs') {
              const currentInputs = f.inputs || [];
              return { ...f, inputs: [...currentInputs, variable] };
            } else if (pickerType === 'output') {
              return { ...f, output: variable };
            }
          }
          return f;
        })
      );
    }
    setShowVariablePicker(null);
    setPickerType(null);
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
  };

  const handlePreviousFunction = () => {
    if (currentFunctionIndex > 0) {
      setCurrentFunctionIndex(currentFunctionIndex - 1);
      setShowVariablePicker(null);
      setEditingFunctionName(null);
    }
  };

  const handleNextFunction = () => {
    if (currentFunctionIndex < functions.length - 1) {
      setCurrentFunctionIndex(currentFunctionIndex + 1);
      setShowVariablePicker(null);
      setEditingFunctionName(null);
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
          <span className="line-number">{String(currentFunction.startLine + 1).padStart(2, '0')}</span>
          <pre className="function-content-simple">
            {getFunctionContent(currentFunction, value)}
          </pre>
        </div>
        
        <div className="function-return">
          <span className="line-number">{String(currentFunction.endLine).padStart(2, '0')}</span>
          <span className="return-statement">return </span>
          <button 
            className="return-selector"
            onClick={() => {
              setShowVariablePicker(currentFunction.id);
              setPickerType('output');
            }}
          >
            {currentFunction.output || 'Click to select output'}
          </button>
        </div>

        {showVariablePicker === currentFunction.id && (
          <div className="variable-picker">
            <div className="variable-picker-header">
              {pickerType === 'inputs' 
                ? 'On click, show all (non-built-in) variables returned by globals() call'
                : 'On click, show all (non-built-in) variables returned by locals() call'
              }
            </div>
            <div className="variable-list">
              {MOCK_VARIABLES.map(variable => (
                <button
                  key={variable}
                  className="variable-option"
                  onClick={() => handleVariableSelection(variable)}
                >
                  {variable}
                </button>
              ))}
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
                  className={`answer-button ${functionAnswers[currentFunction.id]?.worksAsIs === answer ? 'selected' : ''}`}
                  onClick={() => handleAnswerChange(currentFunction.id, 'worksAsIs', answer)}
                >
                  {answer}
                </button>
              ))}
            </div>
          </div>

          <div className="question-group">
            <div className="question">Does this function affect variables beyond its own scope?</div>
            <div className="answer-buttons">
              {['YES', "I'm NOT SURE", 'NO'].map(answer => (
                <button
                  key={answer}
                  className={`answer-button ${functionAnswers[currentFunction.id]?.sideEffects === answer ? 'selected' : ''}`}
                  onClick={() => handleAnswerChange(currentFunction.id, 'sideEffects', answer)}
                >
                  {answer}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="review-controls">
        <button className="control-button back-button" onClick={onBackToScript}>
          BACK TO SCRIPT
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