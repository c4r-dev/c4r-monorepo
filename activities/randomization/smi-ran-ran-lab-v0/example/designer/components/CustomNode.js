/**
 * CustomNode Component
 * 
 * Features:
 * - Configurable node with various interactive elements
 * - Supports labels, text boxes, toggles, dropdowns, and input fields
 * - Customizable styling and connections (handles)
 * - State management for interactive elements
 */

import React, { useRef, useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';

const CustomNode = ({ id, data, selected, isConnectable, updateNode }) => {
  // Local state for input field values
  const [inputValues, setInputValues] = useState({});
  
  // Initialize local input values from data when the component mounts or data changes
  useEffect(() => {
    if (data?.elements?.inputFields) {
      const initialValues = {};
      data.elements.inputFields.forEach((field, index) => {
        initialValues[index] = field.value || '';
      });
      setInputValues(initialValues);
    }
  }, [data?.elements?.inputFields]);

  // Determine node state class
  const getNodeStateClass = () => {
    if (data.state === 'active') return 'active';
    if (data.state === 'double-active') return 'double-active';
    if (data.important) return 'important';
    return '';
  };

  const nodeClasses = `custom-node ${selected ? 'selected' : ''} ${getNodeStateClass()}`;

  const nodeStyle = {
    backgroundColor: data.bgColor || '#f2f2f2',
    color: data.textColor || '#333333',
  };

  // Prevent event propagation to avoid ReactFlow interference
  const stopPropagation = (e) => {
    e.stopPropagation();
  };

  // Handle toggle change
  const handleToggleChange = (e, index) => {
    e.stopPropagation();
    if (!updateNode) return;
    
    const updatedToggles = [...data.elements.toggles];
    updatedToggles[index] = {
      ...updatedToggles[index],
      value: !updatedToggles[index].value
    };
    
    updateNode(id, {
      ...data,
      elements: {
        ...data.elements,
        toggles: updatedToggles
      }
    });
  };

  // Handle dropdown change
  const handleDropdownChange = (e, index, value) => {
    e.stopPropagation();
    if (!updateNode) return;
    
    const updatedDropdowns = [...data.elements.dropdowns];
    updatedDropdowns[index] = {
      ...updatedDropdowns[index],
      selected: value
    };
    
    updateNode(id, {
      ...data,
      elements: {
        ...data.elements,
        dropdowns: updatedDropdowns
      }
    });
  };

  // Handle local input field change (updates local state only)
  const handleLocalInputChange = (e, index) => {
    e.stopPropagation();
    const newValue = e.target.value;
    
    setInputValues(prev => ({
      ...prev,
      [index]: newValue
    }));
  };
  
  // Update node data only when input loses focus
  const handleInputBlur = (index) => {
    if (!updateNode) return;
    
    const updatedInputFields = [...data.elements.inputFields];
    updatedInputFields[index] = {
      ...updatedInputFields[index],
      value: inputValues[index] || ''
    };
    
    updateNode(id, {
      ...data,
      elements: {
        ...data.elements,
        inputFields: updatedInputFields
      }
    });
  };

  // Prepare an ordered list of all visible elements to render
  const renderElements = () => {
    if (!data.elements) return null;
    
    const orderedElements = [];
    
    // Add label if visible
    if (data.elements.label && data.elements.label.visible) {
      orderedElements.push({
        type: 'label',
        content: (
          <div key="label" className="node-header">
            {data.elements.label.text}
          </div>
        )
      });
    }
    
    // Add text boxes
    if (data.elements.textBoxes) {
      data.elements.textBoxes.forEach((textBox, index) => {
        if (textBox.visible) {
          orderedElements.push({
            type: 'textBox',
            content: (
              <div key={`textbox-${index}`} className="node-content">
                {textBox.text}
              </div>
            )
          });
        }
      });
    }
    
    // Add toggles
    if (data.elements.toggles) {
      data.elements.toggles.forEach((toggle, index) => {
        if (toggle.visible) {
          orderedElements.push({
            type: 'toggle',
            content: (
              <div key={`toggle-${index}`} className="node-toggle" onClick={stopPropagation}>
                <span className="node-toggle-label">{toggle.text}</span>
                <div className="toggle-switch" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={toggle.value}
                    onChange={(e) => handleToggleChange(e, index)}
                    className="interactive-element"
                    onClick={stopPropagation}
                  />
                  <span className="toggle-slider" onClick={(e) => {
                    e.stopPropagation();
                    handleToggleChange(e, index);
                  }}></span>
                </div>
              </div>
            )
          });
        }
      });
    }
    
    // Add dropdowns
    if (data.elements.dropdowns) {
      data.elements.dropdowns.forEach((dropdown, index) => {
        if (dropdown.visible) {
          orderedElements.push({
            type: 'dropdown',
            content: (
              <div key={`dropdown-${index}`} className="node-dropdown" onClick={stopPropagation}>
                <div>{dropdown.label}</div>
                <select 
                  className="form-control interactive-element" 
                  value={dropdown.selected} 
                  onChange={(e) => handleDropdownChange(e, index, e.target.value)}
                  onClick={stopPropagation}
                  onMouseDown={stopPropagation}
                  onFocus={stopPropagation}
                >
                  {dropdown.options.map((option, optionIndex) => (
                    <option key={optionIndex} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )
          });
        }
      });
    }
    
    // Add input fields - using local state instead of directly updating node data
    if (data.elements.inputFields) {
      data.elements.inputFields.forEach((inputField, index) => {
        if (inputField.visible) {
          orderedElements.push({
            type: 'inputField',
            content: (
              <div key={`input-${index}`} className="node-input" onClick={stopPropagation}>
                <input
                  type="text"
                  className="form-control interactive-element"
                  placeholder={inputField.placeholder}
                  value={inputValues[index] !== undefined ? inputValues[index] : (inputField.value || '')}
                  onChange={(e) => handleLocalInputChange(e, index)}
                  onBlur={() => handleInputBlur(index)}
                  onClick={stopPropagation}
                  onMouseDown={stopPropagation}
                  onKeyDown={stopPropagation}
                  onFocus={stopPropagation}
                />
              </div>
            )
          });
        }
      });
    }
    
    // Return all content elements in order
    return orderedElements.map(element => element.content);
  };

  return (
    <div className={nodeClasses} style={nodeStyle}>
      {data.hasInputHandle && (
        <Handle
          type="target"
          position={Position.Left}
          id="input"
          style={{ background: '#555' }}
          isConnectable={isConnectable}
        />
      )}
      
      {/* Added Top Input Handle */}
      {data.hasTopInputHandle && (
        <Handle
          type="target"
          position={Position.Top}
          id="input-top"
          style={{ background: '#555' }}
          isConnectable={isConnectable}
        />
      )}

      {/* Added Bottom Input Handle */}
      {data.hasBottomInputHandle && (
        <Handle
          type="target"
          position={Position.Bottom}
          id="input-bottom"
          style={{ background: '#555' }}
          isConnectable={isConnectable}
        />
      )}
      
      {/* Render all elements in order */}
      {renderElements()}
      
      {data.hasOutputHandle && (
        <Handle
          type="source"
          position={Position.Right}
          id="output"
          style={{ background: '#555' }}
          isConnectable={isConnectable}
        />
      )}

      {/* Added Top Output Handle */}
      {data.hasTopOutputHandle && (
        <Handle
          type="source"
          position={Position.Top}
          id="output-top"
          style={{ background: '#555' }}
          isConnectable={isConnectable}
        />
      )}

      {/* Added Bottom Output Handle */}
      {data.hasBottomOutputHandle && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="output-bottom"
          style={{ background: '#555' }}
          isConnectable={isConnectable}
        />
      )}
    </div>
  );
};

export default CustomNode; 