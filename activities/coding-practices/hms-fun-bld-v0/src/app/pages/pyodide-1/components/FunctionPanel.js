import { useState } from 'react';
import { 
  FUNCTION_COLORS, 
  getFunctionContent, 
  getHighlightedFunctionContent 
} from '../utils/sharedUtils';

const FunctionPanel = ({ 
  functions, 
  setFunctions, 
  selectedFunction, 
  setSelectedFunction,
  value 
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [newName, setNewName] = useState('');

  const selectedFunctionData = functions.find(f => f.id === selectedFunction);

  const handleTabClick = (functionId) => {
    setSelectedFunction(functionId);
  };

  const handleNewFunction = () => {
    // This will be handled by text selection in the textarea
    alert('Select text in the editor and click "New Function" to create a function');
  };

  const handleChangeColor = (color) => {
    if (selectedFunctionData) {
      setFunctions(prev => 
        prev.map(f => f.id === selectedFunction ? { ...f, color } : f)
      );
    }
    setShowColorPicker(false);
  };

  const handleChangeName = () => {
    if (selectedFunctionData && newName.trim()) {
      setFunctions(prev => 
        prev.map(f => f.id === selectedFunction ? { ...f, name: newName.trim() } : f)
      );
      setNewName('');
      setShowNameEditor(false);
    }
  };

  const handleDeleteFunction = () => {
    if (selectedFunctionData) {
      const remainingFunctions = functions.filter(f => f.id !== selectedFunction);
      setFunctions(remainingFunctions);
      setSelectedFunction(remainingFunctions.length > 0 ? remainingFunctions[0].id : null);
    }
  };

  return (
    <div className="function-panel">
      <div className="function-tabs">
        {functions.map(func => (
          <button
            key={func.id}
            className={`function-tab ${selectedFunction === func.id ? 'active' : ''}`}
            onClick={() => handleTabClick(func.id)}
            style={{ backgroundColor: func.color }}
          >
            {func.name}
          </button>
        ))}
        <button className="function-tab new-tab" onClick={handleNewFunction}>
          + NEW
        </button>
      </div>
      
      <div className="function-content">
        {selectedFunctionData ? (
          <pre className="function-code-simple">
            {getFunctionContent(selectedFunctionData, value)}
          </pre>
        ) : (
          <div className="no-function">
            Select a function tab to view its content
          </div>
        )}
      </div>
      
      <div className="function-controls">
        <div className="control-group">
          <button 
            className="control-button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            disabled={!selectedFunctionData}
          >
            CHANGE COLOR
          </button>
          {showColorPicker && (
            <div className="color-picker">
              {FUNCTION_COLORS.map(color => (
                <button
                  key={color}
                  className="color-option"
                  style={{ backgroundColor: color }}
                  onClick={() => handleChangeColor(color)}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="control-group">
          <button 
            className="control-button"
            onClick={() => {
              setNewName(selectedFunctionData?.name || '');
              setShowNameEditor(!showNameEditor);
            }}
            disabled={!selectedFunctionData}
          >
            CHANGE NAME
          </button>
          {showNameEditor && (
            <div className="name-editor">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter new name"
                className="name-input"
              />
              <button onClick={handleChangeName} className="save-button">Save</button>
              <button onClick={() => setShowNameEditor(false)} className="cancel-button">Cancel</button>
            </div>
          )}
        </div>
        
        <button 
          className="control-button delete-button"
          onClick={handleDeleteFunction}
          disabled={!selectedFunctionData}
        >
          DELETE FUNCTION
        </button>
      </div>
    </div>
  );
};

export default FunctionPanel; 