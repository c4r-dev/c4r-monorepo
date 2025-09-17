'use client';

import React, { useState } from 'react';

export default function Home() {
  const [testData, setTestData] = useState([
    { parameter: '', outcome: '', type: '', expectedValue: '', actualOutput: '' },
    { parameter: '', outcome: '', type: '', expectedValue: '', actualOutput: '' },
    { parameter: '', outcome: '', type: '', expectedValue: '', actualOutput: '' }
  ]);
  const [testsRun, setTestsRun] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [mismatchIdentified, setMismatchIdentified] = useState(false);
  const [activityFinished, setActivityFinished] = useState(false);

  const determineDataType = (value: string): string => {
    if (value === '') return 'NoneType';
    
    // None Type - strict comparison
    if (value === 'None') {
      return 'NoneType';
    }
    
    // Boolean Type - strict comparison for Python booleans
    if (value === 'True' || value === 'False') {
      return 'bool';
    }
    
    // Numeric Types - complex (must check before int/float)
    if (/^[+-]?\d*\.?\d*[+-]\d*\.?\d*j$/.test(value) || /^[+-]?\d*\.?\d*j$/.test(value)) {
      return 'complex';
    }
    
    // Numeric Types - int and float with strict validation
    if (/^[+-]?\d+$/.test(value)) {
      return 'int';
    }
    if (/^[+-]?\d*\.\d+$/.test(value) || /^[+-]?\d+\.\d*$/.test(value)) {
      return 'float';
    }
    
    // Binary Types - bytes
    if ((value.startsWith("b'") && value.endsWith("'")) || (value.startsWith('b"') && value.endsWith('"'))) {
      return 'bytes';
    }
    
    // Binary Types - bytearray
    if (value.startsWith('bytearray(') && value.endsWith(')')) {
      return 'bytearray';
    }
    
    // Binary Types - memoryview
    if (value.startsWith('memoryview(') && value.endsWith(')')) {
      return 'memoryview';
    }
    
    // Sequence Types - range
    if (/^range\(\d+(,\s*\d+)*(,\s*\d+)?\)$/.test(value)) {
      return 'range';
    }
    
    // Set Types - frozenset (check before set)
    if (value.startsWith('frozenset(') && value.endsWith(')')) {
      return 'frozenset';
    }
    
    // Set Types - set
    if (value.startsWith('{') && value.endsWith('}') && !value.includes(':')) {
      // Empty set is set() not {}
      if (value === '{}') {
        return 'invalid data type'; // {} is empty dict, not set
      }
      return 'set';
    }
    if (value.startsWith('set(') && value.endsWith(')')) {
      return 'set';
    }
    
    // Mapping Type - dict
    if (value.startsWith('{') && value.endsWith('}') && value.includes(':')) {
      return 'dict';
    }
    if (value.startsWith('dict(') && value.endsWith(')')) {
      return 'dict';
    }
    
    // Sequence Types - tuple (must have parentheses)
    if (value.startsWith('(') && value.endsWith(')')) {
      return 'tuple';
    }
    
    // Sequence Types - list (must have square brackets)
    if (value.startsWith('[') && value.endsWith(']')) {
      return 'list';
    }
    
    // Text Type - str (with strict quote checking)
    if (typeof value === 'string') {
      // Raw strings
      if ((value.startsWith("r'") && value.endsWith("'")) || (value.startsWith('r"') && value.endsWith('"'))) {
        return 'str';
      }
      // Formatted strings
      if ((value.startsWith("f'") && value.endsWith("'")) || (value.startsWith('f"') && value.endsWith('"'))) {
        return 'str';
      }
      // Regular strings - must have quotes
      if ((value.startsWith("'") && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
        return 'str';
      }
    }
    
    // Default - return invalid data type for unrecognized inputs
    return 'invalid data type';
  };

  const handleParameterChange = (index: number, value: string) => {
    const newTestData = [...testData];
    newTestData[index].parameter = value;
    newTestData[index].type = determineDataType(value);
    setTestData(newTestData);
  };

  const handleOutcomeChange = (index: number, value: string) => {
    const newTestData = [...testData];
    newTestData[index].outcome = value;
    // Always clear expected value when outcome changes
    newTestData[index].expectedValue = '';
    setTestData(newTestData);
  };

  const handleExpectedValueChange = (index: number, value: string) => {
    const newTestData = [...testData];
    newTestData[index].expectedValue = value;
    setTestData(newTestData);
  };

  const isButtonsDisabled = () => {
    return testData.some(row => row.parameter === '' || row.outcome === '');
  };

  const getMismatchCount = () => {
    return testData.filter(row => row.actualOutput !== '' && row.actualOutput !== row.expectedValue).length;
  };

  const isMismatchButtonEnabled = () => {
    return testsRun && getMismatchCount() >= 2;
  };

  const handleMismatchIdentification = () => {
    // Show the results tables
    setActivityFinished(true);
  };

  const addParameter = () => {
    setTestData([...testData, { parameter: '', outcome: '', type: '', expectedValue: '', actualOutput: '' }]);
  };

  const deleteParameter = (index: number) => {
    // Prevent deleting if only one row remains
    if (testData.length <= 1) return;
    
    const newTestData = testData.filter((_, i) => i !== index);
    setTestData(newTestData);
  };

  const runTests = () => {
    const newTestData = testData.map(row => {
      let actualOutput = '';
      
      if (row.outcome === 'execute') {
        // Simulate fibonacci execution based on parameter type
        if (row.type === 'int') {
          try {
            const n = parseInt(row.parameter);
            if (n >= 0) {
              // Calculate fibonacci number
              if (n <= 1) {
                actualOutput = n.toString();
              } else {
                let a = 0, b = 1;
                for (let i = 2; i <= n; i++) {
                  [a, b] = [b, a + b];
                }
                actualOutput = b.toString();
              }
            } else {
              actualOutput = 'ValueError';
            }
          } catch {
            actualOutput = 'TypeError';
          }
        } else {
          actualOutput = 'TypeError';
        }
      } else if (row.outcome === 'will raise error') {
        // For error cases, show what error would actually occur
        if (row.type === 'int') {
          try {
            const n = parseInt(row.parameter);
            if (n < 0) {
              actualOutput = 'ValueError';
            } else {
              actualOutput = 'No Error';
            }
          } catch {
            actualOutput = 'TypeError';
          }
        } else {
          actualOutput = 'TypeError';
        }
      }
      
      return { ...row, actualOutput };
    });
    
    const testResults = newTestData.map(row => {
      if (row.outcome === 'execute') {
        return row.actualOutput === row.expectedValue ? 'Match' : 'No Match';
      } else if (row.outcome === 'will raise error') {
        return row.actualOutput === row.expectedValue ? 'Match' : 'No Match';
      }
      return 'No Match';
    });
    
    setTestData(newTestData);
    setResults(testResults);
    setTestsRun(true);
  };
  const fibonacciCode = `def fibonacci(n):
    """
    Returns the nth Fibonacci number.
    Args: n (int): The position in the Fibonacci sequence (0-indexed)
    Returns: int: The Fibonacci number at position n
    """
    if n <= 1:
        return n
    
    a, b = 0, 1
    for i in range(2, n + 1):
        a, b = b, a + b
    
    return b`;

  return (
    <div className="main-container">
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '15px',
          textAlign: 'left',
          padding: '0',
          fontFamily: 'General Sans, sans-serif'
        }}>
          Test a Function
        </h2>
        
        <div style={{
          width: '100%',
          minHeight: '300px',
          padding: '15px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          backgroundColor: '#f8f8f8',
          whiteSpace: 'pre',
          overflow: 'auto',
          color: '#333',
          resize: 'none',
          cursor: 'default',
          userSelect: 'text'
        }}>
          {fibonacciCode}
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: '20px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          overflow: 'hidden'
        }}>
          {/* Header Row */}
          <div style={{
            display: 'flex',
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold',
            fontFamily: 'General Sans, sans-serif'
          }}>
            <div style={{
              flex: '1',
              padding: '12px',
              borderRight: '1px solid #ddd',
              textAlign: 'center'
            }}>
              Data Type
            </div>
            <div style={{
              flex: '1',
              padding: '12px',
              borderRight: '1px solid #ddd',
              textAlign: 'center'
            }}>
              Parameter
            </div>
            <div style={{
              flex: '1',
              padding: '12px',
              textAlign: 'center'
            }}>
              Outcome
            </div>
            <div style={{
              flex: '1',
              padding: '12px',
              textAlign: 'center'
            }}>
              Expected Value
            </div>
            <div style={{
              flex: '0.5',
              padding: '12px',
              textAlign: 'center'
            }}>
              Action
            </div>
            {testsRun && (
              <>
                <div style={{
                  flex: '1',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  Actual Output
                </div>
                <div style={{
                  flex: '1',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  Results
                </div>
              </>
            )}
          </div>

          {/* Data Rows */}
          {testData.map((row, index) => (
            <div key={index} style={{
              display: 'flex',
              borderBottom: index < testData.length - 1 ? '1px solid #ddd' : 'none',
              fontFamily: 'General Sans, sans-serif'
            }}>
              <div style={{
                flex: '1',
                padding: '12px',
                borderRight: '1px solid #ddd',
                textAlign: 'center'
              }}>
                {row.type}
              </div>
              <div style={{
                flex: '1',
                padding: '8px',
                borderRight: '1px solid #ddd',
                textAlign: 'center'
              }}>
                <input
                  type="text"
                  value={row.parameter}
                  onChange={(e) => handleParameterChange(index, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px 8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontFamily: 'General Sans, sans-serif'
                  }}
                />
              </div>
              <div style={{
                flex: '1',
                padding: '8px',
                textAlign: 'center'
              }}>
                <select
                  value={row.outcome}
                  onChange={(e) => handleOutcomeChange(index, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '4px 8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontFamily: 'General Sans, sans-serif',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Select outcome</option>
                  <option value="execute">execute</option>
                  <option value="will raise error">will raise error</option>
                </select>
              </div>
              <div style={{
                flex: '1',
                padding: '8px',
                textAlign: 'center'
              }}>
                {row.outcome === 'execute' ? (
                  <input
                    type="text"
                    value={row.expectedValue}
                    onChange={(e) => handleExpectedValueChange(index, e.target.value)}
                    placeholder="Enter expected value"
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontFamily: 'General Sans, sans-serif'
                    }}
                  />
                ) : row.outcome === 'will raise error' ? (
                  <select
                    value={row.expectedValue}
                    onChange={(e) => handleExpectedValueChange(index, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '4px 8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      textAlign: 'center',
                      fontFamily: 'General Sans, sans-serif',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select exception</option>
                    <option value="ArithmeticError">ArithmeticError</option>
                    <option value="AssertionError">AssertionError</option>
                    <option value="AttributeError">AttributeError</option>
                    <option value="BaseException">BaseException</option>
                    <option value="BlockingIOError">BlockingIOError</option>
                    <option value="BrokenPipeError">BrokenPipeError</option>
                    <option value="BufferError">BufferError</option>
                    <option value="BytesWarning">BytesWarning</option>
                    <option value="ChildProcessError">ChildProcessError</option>
                    <option value="ConnectionAbortedError">ConnectionAbortedError</option>
                    <option value="ConnectionError">ConnectionError</option>
                    <option value="ConnectionRefusedError">ConnectionRefusedError</option>
                    <option value="ConnectionResetError">ConnectionResetError</option>
                    <option value="DeprecationWarning">DeprecationWarning</option>
                    <option value="EOFError">EOFError</option>
                    <option value="Exception">Exception</option>
                    <option value="FileExistsError">FileExistsError</option>
                    <option value="FileNotFoundError">FileNotFoundError</option>
                    <option value="FloatingPointError">FloatingPointError</option>
                    <option value="FutureWarning">FutureWarning</option>
                    <option value="GeneratorExit">GeneratorExit</option>
                    <option value="ImportError">ImportError</option>
                    <option value="ImportWarning">ImportWarning</option>
                    <option value="IndentationError">IndentationError</option>
                    <option value="IndexError">IndexError</option>
                    <option value="InterruptedError">InterruptedError</option>
                    <option value="IsADirectoryError">IsADirectoryError</option>
                    <option value="KeyError">KeyError</option>
                    <option value="KeyboardInterrupt">KeyboardInterrupt</option>
                    <option value="LookupError">LookupError</option>
                    <option value="MemoryError">MemoryError</option>
                    <option value="ModuleNotFoundError">ModuleNotFoundError</option>
                    <option value="NameError">NameError</option>
                    <option value="NotADirectoryError">NotADirectoryError</option>
                    <option value="NotImplementedError">NotImplementedError</option>
                    <option value="OSError">OSError</option>
                    <option value="OverflowError">OverflowError</option>
                    <option value="PendingDeprecationWarning">PendingDeprecationWarning</option>
                    <option value="PermissionError">PermissionError</option>
                    <option value="ProcessLookupError">ProcessLookupError</option>
                    <option value="RecursionError">RecursionError</option>
                    <option value="ReferenceError">ReferenceError</option>
                    <option value="ResourceWarning">ResourceWarning</option>
                    <option value="RuntimeError">RuntimeError</option>
                    <option value="RuntimeWarning">RuntimeWarning</option>
                    <option value="StopAsyncIteration">StopAsyncIteration</option>
                    <option value="StopIteration">StopIteration</option>
                    <option value="SyntaxError">SyntaxError</option>
                    <option value="SyntaxWarning">SyntaxWarning</option>
                    <option value="SystemError">SystemError</option>
                    <option value="SystemExit">SystemExit</option>
                    <option value="TabError">TabError</option>
                    <option value="TimeoutError">TimeoutError</option>
                    <option value="TypeError">TypeError</option>
                    <option value="UnboundLocalError">UnboundLocalError</option>
                    <option value="UnicodeDecodeError">UnicodeDecodeError</option>
                    <option value="UnicodeEncodeError">UnicodeEncodeError</option>
                    <option value="UnicodeError">UnicodeError</option>
                    <option value="UnicodeTranslateError">UnicodeTranslateError</option>
                    <option value="UnicodeWarning">UnicodeWarning</option>
                    <option value="UserWarning">UserWarning</option>
                    <option value="ValueError">ValueError</option>
                    <option value="Warning">Warning</option>
                    <option value="ZeroDivisionError">ZeroDivisionError</option>
                  </select>
                ) : (
                  <span style={{ color: '#999', fontStyle: 'italic' }}>N/A</span>
                )}
              </div>
              <div style={{
                flex: '0.5',
                padding: '8px',
                textAlign: 'center'
              }}>
                <button
                  onClick={() => deleteParameter(index)}
                  disabled={testData.length <= 1}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #dc3545',
                    borderRadius: '4px',
                    backgroundColor: testData.length <= 1 ? '#f5f5f5' : '#dc3545',
                    color: testData.length <= 1 ? '#999' : 'white',
                    fontFamily: 'General Sans, sans-serif',
                    fontSize: '12px',
                    cursor: testData.length <= 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
              {testsRun && (
                <>
                  <div style={{
                    flex: '1',
                    padding: '12px',
                    textAlign: 'center',
                    backgroundColor: row.actualOutput === row.expectedValue ? '#d4edda' : '#f8d7da',
                    color: row.actualOutput === row.expectedValue ? '#155724' : '#721c24'
                  }}>
                    {row.actualOutput}
                  </div>
                  <div style={{
                    flex: '1',
                    padding: '12px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: results[index] === 'Match' ? '#28a745' : '#dc3545'
                  }}>
                    {results[index]}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        <div style={{
          display: 'flex',
          gap: '10px',
          marginTop: '20px',
          justifyContent: 'center'
        }}>
          <button 
            className="button" 
            onClick={addParameter}
            disabled={isButtonsDisabled()}
          >
            ADD PARAMETER
          </button>
          <button 
            className="button"
            onClick={runTests}
            disabled={isButtonsDisabled()}
          >
            RUN TESTS
          </button>
          {testsRun && (
            <button 
              className="button"
              onClick={handleMismatchIdentification}
              disabled={!isMismatchButtonEnabled()}
              style={{
                backgroundColor: isMismatchButtonEnabled() ? '#28a745' : '#6c757d',
                cursor: isMismatchButtonEnabled() ? 'pointer' : 'not-allowed',
                opacity: isMismatchButtonEnabled() ? 1 : 0.6
              }}
            >
              {isMismatchButtonEnabled() ? 'FINISH ACTIVITY' : 'MUST IDENTIFY 2 MISMATCHED OUTPUTS'}
            </button>
          )}
        </div>
      </div>

      {/* Results Tables - shown after finishing activity */}
      {activityFinished && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* First Table - User's Test Cases */}
          <div style={{
            backgroundColor: 'white',
            border: '2px solid #007bff',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '15px',
              fontFamily: 'General Sans, sans-serif'
            }}>
              Great job finding these test cases:
            </h3>
            
            <div style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              {/* Header Row */}
              <div style={{
                display: 'flex',
                backgroundColor: '#333',
                color: 'white',
                fontWeight: 'bold',
                fontFamily: 'General Sans, sans-serif'
              }}>
                <div style={{
                  flex: '1',
                  padding: '12px',
                  borderRight: '1px solid #555',
                  textAlign: 'center'
                }}>
                  CLASS
                </div>
                <div style={{
                  flex: '1',
                  padding: '12px',
                  borderRight: '1px solid #555',
                  textAlign: 'center'
                }}>
                  INPUT
                </div>
                <div style={{
                  flex: '1',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  EXPECTED OUTPUT
                </div>
              </div>

              {/* Data Rows */}
              {testData.map((row, index) => (
                <div key={index} style={{
                  display: 'flex',
                  borderBottom: index < testData.length - 1 ? '1px solid #ddd' : 'none',
                  fontFamily: 'General Sans, sans-serif'
                }}>
                  <div style={{
                    flex: '1',
                    padding: '12px',
                    borderRight: '1px solid #ddd',
                    textAlign: 'center',
                    backgroundColor: '#666',
                    color: 'white'
                  }}>
                    {row.type}
                  </div>
                  <div style={{
                    flex: '1',
                    padding: '12px',
                    borderRight: '1px solid #ddd',
                    textAlign: 'center',
                    backgroundColor: '#999',
                    color: 'white'
                  }}>
                    {row.parameter}
                  </div>
                  <div style={{
                    flex: '1',
                    padding: '12px',
                    textAlign: 'center',
                    backgroundColor: '#28a745',
                    color: 'white'
                  }}>
                    {row.expectedValue}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Second Table - Missed Test Cases */}
          <div style={{
            backgroundColor: 'white',
            border: '2px solid #007bff',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '15px',
              fontFamily: 'General Sans, sans-serif'
            }}>
              You did, however, miss these:
            </h3>
            
            <div style={{
              border: '1px solid #ddd',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              {/* Header Row */}
              <div style={{
                display: 'flex',
                backgroundColor: '#333',
                color: 'white',
                fontWeight: 'bold',
                fontFamily: 'General Sans, sans-serif'
              }}>
                <div style={{
                  flex: '1',
                  padding: '12px',
                  borderRight: '1px solid #555',
                  textAlign: 'center'
                }}>
                  CLASS
                </div>
                <div style={{
                  flex: '1',
                  padding: '12px',
                  borderRight: '1px solid #555',
                  textAlign: 'center'
                }}>
                  INPUT
                </div>
                <div style={{
                  flex: '1',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  WHY TEST FOR THIS?
                </div>
              </div>

              {/* Static Data Rows */}
              <div style={{
                display: 'flex',
                borderBottom: '1px solid #ddd',
                fontFamily: 'General Sans, sans-serif'
              }}>
                <div style={{
                  flex: '1',
                  padding: '12px',
                  borderRight: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#666',
                  color: 'white'
                }}>
                  string
                </div>
                <div style={{
                  flex: '1',
                  padding: '12px',
                  borderRight: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#999',
                  color: 'white'
                }}>
                  &quot;test&quot;
                </div>
                <div style={{
                  flex: '1',
                  padding: '12px',
                  textAlign: 'center',
                  backgroundColor: '#28a745',
                  color: 'white'
                }}>
                  reason 1
                </div>
              </div>

              <div style={{
                display: 'flex',
                borderBottom: '1px solid #ddd',
                fontFamily: 'General Sans, sans-serif'
              }}>
                <div style={{
                  flex: '1',
                  padding: '12px',
                  borderRight: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#666',
                  color: 'white'
                }}>
                  list
                </div>
                <div style={{
                  flex: '1',
                  padding: '12px',
                  borderRight: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#999',
                  color: 'white'
                }}>
                  [&apos;a&apos;, &apos;b&apos;, &apos;c&apos;]
                </div>
                <div style={{
                  flex: '1',
                  padding: '12px',
                  textAlign: 'center',
                  backgroundColor: '#28a745',
                  color: 'white'
                }}>
                  reason 2
                </div>
              </div>

              <div style={{
                display: 'flex',
                fontFamily: 'General Sans, sans-serif'
              }}>
                <div style={{
                  flex: '1',
                  padding: '12px',
                  borderRight: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#666',
                  color: 'white'
                }}>
                  uint8
                </div>
                <div style={{
                  flex: '1',
                  padding: '12px',
                  borderRight: '1px solid #ddd',
                  textAlign: 'center',
                  backgroundColor: '#999',
                  color: 'white'
                }}>
                  9
                </div>
                <div style={{
                  flex: '1',
                  padding: '12px',
                  textAlign: 'center',
                  backgroundColor: '#28a745',
                  color: 'white'
                }}>
                  reason 3
                </div>
              </div>
            </div>
          </div>

          {/* Finish Activity Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px'
          }}>
            <button 
              className="button"
              style={{
                backgroundColor: '#333',
                color: 'white',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              FINISH ACTIVITY
            </button>
          </div>
        </div>
      )}
    </div>
  );
}