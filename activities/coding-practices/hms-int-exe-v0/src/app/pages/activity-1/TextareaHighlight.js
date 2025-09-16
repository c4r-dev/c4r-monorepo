import React, { useMemo, useRef, useState, useEffect } from "react";
import styled, { css } from "styled-components";
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import 'highlight.js/styles/vs2015.css'; // You can change this to other themes
import { generateColor, getLineFromPosition } from './utils/sharedUtils';

// Register the Python language
hljs.registerLanguage('python', python);

/**
 * TextareaHighlight Component
 * A custom textarea component that allows users to select and highlight sections of text as functions.
 * Features:
 * - Line numbers
 * - Function highlighting with different colors
 * - Text selection to create new functions
 * - Synchronized scrolling between line numbers and text
 * - Python syntax highlighting
 * - Hardcoded highlighted regions with tooltips
 */

const StyledTextareaWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'isCompletionPhase',
})`
  border: 1px solid grey;
  border-radius: 2px;
  width: ${props => props.isCompletionPhase ? 'min(1400px, 90vw)' : '100%'};
  max-width: ${props => props.isCompletionPhase ? 'none' : 'min(65vw, 700px)'};
  height: 700px;
  position: relative;
  margin: 0 !important;
  padding: 0 !important;
`;

const StyledButtonWrapper = styled.div`
  padding: 8px;
  border-bottom: 1px solid grey;
  background-color: #f5f5f5;
`;

const StyledButton = styled.button`
  background-color: #000000;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  font-family: 'General Sans Semibold', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  &:hover:not(:disabled) {
    background-color: rgb(98, 0, 238);
  }
  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const StyledTextareaContainer = styled.div`
  height: ${(props) => props.$hasButtonWrapper ? 'calc(100% - 40px)' : '100%'};
  position: relative;
`;

const StyledHighlightLayer = styled.div`
  position: absolute;
  top: 0;
  left: 3.5rem;
  width: calc(100% - 3.5rem);
  height: 100%;
  pointer-events: none;
  z-index: 1;
  padding: 10px 0;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-y: hidden;
  overflow-x: hidden;
`;

const StyledHighlightLine = styled.div`
  background-color: ${(props) => props.$backgroundColor || "transparent"};
  height: 1.5em;
  width: 100%;
  position: relative;
  border: none !important;
  box-sizing: border-box;
`;

const StyledSyntaxHighlightLayer = styled.div`
  position: absolute;
  top: 0;
  left: 3.5rem;
  width: calc(100% - 3.5rem);
  height: 100%;
  pointer-events: none;
  z-index: 2;
  padding: 10px 0;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-y: hidden;
  overflow-x: hidden;
  white-space: pre;
  
  pre {
    margin: 0;
    padding: 0;
    background: transparent !important;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    white-space: pre;
    word-wrap: normal;
    overflow: visible;
  }
  
  code {
    background: transparent !important;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    padding: 0;
    margin: 0;
    white-space: pre;
  }
`;

const StyledTooltip = styled.div`
  position: fixed;
  background-color: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-family: 'General Sans Semibold', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 300px;
  white-space: normal;
  word-wrap: break-word;
  z-index: 9999;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  line-height: 1.4;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: var(--arrow-left, 50%);
    margin-left: var(--arrow-margin, -5px);
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }
`;

const StyledCharacterHighlightLayer = styled.div`
  position: absolute;
  top: 0;
  left: 3.5rem;
  width: calc(100% - 3.5rem);
  height: 100%;
  pointer-events: none;
  z-index: 3.5; // Above everything except hover layer
  padding: 10px 0;
  margin: 0;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-y: hidden;
  overflow-x: hidden;
  white-space: pre;
`;

const StyledHoverLayer = styled.div`
  position: absolute;
  top: 0;
  left: 3.5rem;
  width: calc(100% - 3.5rem);
  height: 100%;
  z-index: 3;
  padding: 10px 0;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  overflow-y: hidden;
  overflow-x: hidden;
  pointer-events: auto;
`;

const StyledHoverLine = styled.div`
  height: 1.5em;
  width: 100%;
  cursor: ${(props) => props.$isHardcoded ? 'help' : 'default'};
`;

const sharedStyle = css`
  margin: 0;
  padding: 10px 0;
  height: 100%;
  border-radius: 0;
  resize: none;
  outline: none;
  font-family: monospace;
  font-size: 16px;
  line-height: 1.2;
  &:focus-visible {
    outline: none;
  }
`;

const StyledTextarea = styled.textarea`
  ${sharedStyle}
  padding-left: 3.5rem;
  width: calc(100% - 3.5rem);
  border: none;
  background: transparent;
  position: relative;
  z-index: 4;
  color: transparent;
  caret-color: black;
  &::placeholder {
    color: grey;
  }
  &::selection {
    background: rgba(0, 123, 255, 0.3);
  }
`;

const StyledNumbers = styled.div`
  margin: 0;
  padding: 10px 4px 10px 4px;
  height: 100%;
  border-radius: 0;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  text-align: right;
  box-shadow: none;
  position: absolute;
  color: grey;
  border: none;
  background-color: lightgrey;
  width: 1.5rem;
  z-index: 5;
  top: 0;
`;

const StyledNumber = styled.div`
  color: ${(props) => (props.$active ? "blue" : "inherit")};
  background-color: ${(props) => props.$backgroundColor || "transparent"};
  padding: 0;
  border-radius: 2px;
  height: 1.5em;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  line-height: 1.5;
  font-size: 14px;
  font-family: monospace;
`;

export const TextareaHighlight = ({
  value,
  numOfLines,
  onValueChange,
  placeholder = "Enter Message",
  name,
  functions,
  setFunctions,
  selectedFunction,
  setSelectedFunction,
  hardcodedRegion = null, // { startLine, endLine, tooltipText }
  readOnly = false,
  allowRegionCreation = true, // Allow creating highlighted regions even when readOnly
  isCompletionPhase = false,
  showExplainButton = false, // Show explain code button in modification phase
  onExplainCode = null, // Callback for explain code functionality
  isExplainMode = false, // Whether explain mode is active
  explanationsData = [], // Array of explanation data
}) => {
  const [hasSelection, setHasSelection] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '', arrowOffset: null });
  
  const lineCount = useMemo(() => value.split("\n").length, [value]);
  const linesArr = useMemo(
    () =>
      Array.from({ length: Math.max(numOfLines, lineCount) }, (_, i) => i + 1),
    [lineCount, numOfLines]
  );

  const lineCounterRef = useRef(null);
  const textareaRef = useRef(null);
  const highlightLayerRef = useRef(null);
  const syntaxHighlightLayerRef = useRef(null);
  const hoverLayerRef = useRef(null);
  const characterHighlightLayerRef = useRef(null);

  // Generate syntax highlighted HTML
  const highlightedCode = useMemo(() => {
    if (!value.trim()) return '';
    try {
      const result = hljs.highlight(value, { language: 'python' });
      return result.value;
    } catch (error) {
      console.warn('Syntax highlighting failed:', error);
      return value; // Fallback to plain text
    }
  }, [value]);

  // Enhanced function to recalculate line numbers when text changes
  const recalculateFunctionLines = (newValue) => {
    if (functions.length === 0) return functions;
    
    const oldLines = value.split('\n');
    const newLines = newValue.split('\n');
    
    // Calculate the change - find where new lines were inserted
    const changeDetection = detectLineChanges(oldLines, newLines);
    
    return functions.map((func) => {
      // Apply line number shifts based on where changes occurred
      let newStartLine = func.startLine;
      let newEndLine = func.endLine;
      
      // If changes occurred before this selection, shift the selection down
      changeDetection.insertions.forEach(insertion => {
        if (insertion.position < func.startLine) {
          newStartLine += insertion.count;
          newEndLine += insertion.count;
        } else if (insertion.position >= func.startLine && insertion.position <= func.endLine) {
          // Insertion within the selection - only shift the end line
          newEndLine += insertion.count;
        }
      });
      
      // Handle deletions
      changeDetection.deletions.forEach(deletion => {
        if (deletion.position < func.startLine) {
          newStartLine -= deletion.count;
          newEndLine -= deletion.count;
        } else if (deletion.position >= func.startLine && deletion.position <= func.endLine) {
          // Deletion within the selection - only shift the end line
          newEndLine -= deletion.count;
        }
      });
      
      // Ensure line numbers don't go below 1
      newStartLine = Math.max(1, newStartLine);
      newEndLine = Math.max(newStartLine, newEndLine);
      
      // For character-level selections, recalculate character positions
      if (func.isCharacterLevel && func.originalContent) {
        const targetLine = newLines[newStartLine - 1];
        if (targetLine && targetLine.includes(func.originalContent)) {
          const startChar = targetLine.indexOf(func.originalContent);
          if (startChar >= 0) {
            return {
              ...func,
              startLine: newStartLine,
              endLine: newStartLine,
              startChar: startChar,
              endChar: startChar + func.originalContent.length
            };
          }
        }
      }
      
      return {
        ...func,
        startLine: newStartLine,
        endLine: newEndLine
      };
    });
  };

  // Helper function to detect where lines were inserted or deleted
  const detectLineChanges = (oldLines, newLines) => {
    const insertions = [];
    const deletions = [];
    
    const oldLength = oldLines.length;
    const newLength = newLines.length;
    
    if (newLength > oldLength) {
      // Lines were inserted - find where
      for (let i = 0; i < Math.min(oldLength, newLength); i++) {
        if (oldLines[i] !== newLines[i]) {
          // Found the insertion point
          insertions.push({
            position: i + 1, // Convert to 1-based line number
            count: newLength - oldLength
          });
          break;
        }
      }
      
      // If no difference found in common lines, insertion was at the end
      if (insertions.length === 0) {
        insertions.push({
          position: oldLength + 1,
          count: newLength - oldLength
        });
      }
    } else if (newLength < oldLength) {
      // Lines were deleted - find where
      for (let i = 0; i < Math.min(oldLength, newLength); i++) {
        if (oldLines[i] !== newLines[i]) {
          // Found the deletion point
          deletions.push({
            position: i + 1, // Convert to 1-based line number
            count: oldLength - newLength
          });
          break;
        }
      }
      
      // If no difference found in common lines, deletion was at the end
      if (deletions.length === 0) {
        deletions.push({
          position: newLength + 1,
          count: oldLength - newLength
        });
      }
    }
    
    return { insertions, deletions };
  };

  const handleTextareaChange = (event) => {
    if (!readOnly) {
      const newValue = event.target.value;
      
      // Update functions to maintain their position relative to content
      const updatedFunctions = recalculateFunctionLines(newValue);
      setFunctions(updatedFunctions);
      
      onValueChange(newValue);
    }
  };

  const handleTextareaClick = (event) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Get cursor position after a small delay to ensure it's updated
    setTimeout(() => {
      const cursorPosition = textarea.selectionStart;
      const cursorLine = getLineFromPosition(cursorPosition, value);
      
      // Get mouse click position
      const rect = textarea.getBoundingClientRect();
      const mouseY = event.clientY - rect.top;
      
      // Get actual computed styles
      const textareaStyle = window.getComputedStyle(textarea);
      const textareaLineHeight = parseFloat(textareaStyle.lineHeight);
      const textareaPaddingTop = parseFloat(textareaStyle.paddingTop);
      const scrollTop = textarea.scrollTop;
      
      const clickedLineNumber = Math.floor((mouseY + scrollTop - textareaPaddingTop) / textareaLineHeight) + 1;
      
      // Only log mismatches with detailed info
      if (clickedLineNumber !== cursorLine) {
        console.log('🚨 MISMATCH DETECTED:');
        console.log('Mouse Y:', mouseY);
        console.log('Line Height:', textareaLineHeight);
        console.log('Padding Top:', textareaPaddingTop);
        console.log('Calculation: (' + mouseY + ' + ' + scrollTop + ' - ' + textareaPaddingTop + ') / ' + textareaLineHeight + ' + 1');
        console.log('Calculated Line:', clickedLineNumber);
        console.log('Actual Cursor Line:', cursorLine);
        console.log('Difference:', clickedLineNumber - cursorLine);
        console.log('Text at cursor position:', value.substring(Math.max(0, cursorPosition - 20), cursorPosition + 20));
      }
    }, 10); // Small delay to let cursor position update
  };


  const handleTextareaScroll = () => {
    if (lineCounterRef.current && textareaRef.current && highlightLayerRef.current && syntaxHighlightLayerRef.current && hoverLayerRef.current && characterHighlightLayerRef.current) {
      const scrollTop = textareaRef.current.scrollTop;
      const scrollLeft = textareaRef.current.scrollLeft;
      lineCounterRef.current.scrollTop = scrollTop;
      highlightLayerRef.current.scrollTop = scrollTop;
      highlightLayerRef.current.scrollLeft = scrollLeft;
      syntaxHighlightLayerRef.current.scrollTop = scrollTop;
      syntaxHighlightLayerRef.current.scrollLeft = scrollLeft;
      hoverLayerRef.current.scrollTop = scrollTop;
      hoverLayerRef.current.scrollLeft = scrollLeft;
      characterHighlightLayerRef.current.scrollTop = scrollTop;
      characterHighlightLayerRef.current.scrollLeft = scrollLeft;
    }
  };

  const handleSelectionChange = () => {
    if (textareaRef.current) {
      const { selectionStart, selectionEnd } = textareaRef.current;
      setHasSelection(selectionStart !== selectionEnd);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const { selectionStart, selectionEnd } = textarea;
      const newValue = value.substring(0, selectionStart) + '\t' + value.substring(selectionEnd);
      
      onValueChange(newValue);
      
      // Set cursor position after tab
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
      }, 0);
    }
  };

  const createNewFunction = () => {
    if (!allowRegionCreation || !textareaRef.current) return;
    
    const { selectionStart, selectionEnd } = textareaRef.current;
    if (selectionStart === selectionEnd) return;

    let adjustedSelectionEnd = selectionEnd;
    let selectedText = value.substring(selectionStart, selectionEnd);
    
    // If selection ends with newline(s), trim them to keep within single line
    if (selectedText.endsWith('\n')) {
      selectedText = selectedText.replace(/\n+$/, '');
      adjustedSelectionEnd = selectionStart + selectedText.length;
    }
    
    const startLine = getLineFromPosition(selectionStart, value);
    const endLine = getLineFromPosition(adjustedSelectionEnd, value);
    
    console.log('🔍 SELECTION DEBUG:');
    console.log('Original Selection:', selectionStart, 'to', selectionEnd);
    console.log('Adjusted Selection:', selectionStart, 'to', adjustedSelectionEnd);
    console.log('Start Line:', startLine, 'End Line:', endLine);
    console.log('Selected text (trimmed):', JSON.stringify(selectedText));
    
    // Calculate character positions for sub-line selections
    const lines = value.split('\n');
    
    // Find start character position within its line
    let charCountToStartLine = 0;
    for (let i = 0; i < startLine - 1; i++) {
      charCountToStartLine += lines[i].length + 1; // +1 for newline
    }
    const startChar = selectionStart - charCountToStartLine;
    
    // Find end character position within its line  
    let charCountToEndLine = 0;
    for (let i = 0; i < endLine - 1; i++) {
      charCountToEndLine += lines[i].length + 1; // +1 for newline
    }
    const endChar = adjustedSelectionEnd - charCountToEndLine;
    
    // Simpler approach: if it's a single line and the selection is small, it's character-level
    const lineContent = lines[startLine - 1] || '';
    
    // Character-level if: single line AND selection is less than half the line length or 50 characters max
    const isCharacterLevel = (startLine === endLine) && 
                             (selectedText.length <= Math.min(50, Math.floor(lineContent.length / 2)));
    
    const newFunction = {
      id: Date.now(),
      name: `Function ${functions.length + 1}`,
      startLine: startLine,
      endLine: endLine,
      startChar: isCharacterLevel ? startChar : undefined,
      endChar: isCharacterLevel ? endChar : undefined,
      isCharacterLevel,
      color: generateColor(functions.length),
      originalContent: selectedText // Store the original selected text
    };


    setFunctions(prev => [...prev, newFunction]);
    setSelectedFunction(newFunction.id);
    setHasSelection(false);
    
    // Clear the selection
    textareaRef.current.setSelectionRange(adjustedSelectionEnd, adjustedSelectionEnd);
  };

  const isLineInHardcodedRegion = (lineNumber) => {
    return hardcodedRegion && 
           lineNumber >= hardcodedRegion.startLine && 
           lineNumber <= hardcodedRegion.endLine;
  };

  const getLineBackgroundColor = (lineNumber) => {
    // Check hardcoded region first (grey background)
    if (isLineInHardcodedRegion(lineNumber)) {
      return '#e0e0e0'; // Light grey background
    }
    
    // Show background for line-level selections, but only for non-empty lines
    const containingFunction = functions.find(
      func => lineNumber >= func.startLine && lineNumber <= func.endLine && !func.isCharacterLevel
    );
    
    if (containingFunction) {
      // Check if this line is empty or only contains whitespace
      const lines = value.split('\n');
      const currentLine = lines[lineNumber - 1];
      
      // Only highlight lines that have actual content (not just whitespace)
      if (currentLine && currentLine.trim().length > 0) {
        return containingFunction.color;
      }
    }
    
    return undefined;
  };


  // Render character highlights using absolute positioning to match text exactly
  const renderCharacterHighlights = () => {
    const characterFunctions = functions.filter(func => func.isCharacterLevel);
    if (characterFunctions.length === 0) return null;
    
    return characterFunctions.map(func => {
      const lineNumber = func.startLine;
      const startChar = func.startChar;
      const endChar = func.endChar;
      
      const lines = value.split('\n');
      const line = lines[lineNumber - 1] || '';
      const highlightText = line.substring(startChar, endChar);
      
      // Use exact same measurements as the textarea/text layers
      // These measurements should match the monospace font exactly
      const fontSize = 14; // Match the textarea font size
      const lineHeight = 1.5; // Match the textarea line height
      const charWidth = 8.4; // Approximate width of monospace character at 14px
      
      // Calculate position in pixels to match exactly with text
      // Account for the 10px top padding that all text layers have
      const topPx = (lineNumber - 1) * fontSize * lineHeight + 10;
      const leftPx = startChar * charWidth;
      const widthPx = (endChar - startChar) * charWidth;
      
      console.log(`Character highlight debug:
        Line: ${lineNumber} (text: "${line}")
        Chars: ${startChar}-${endChar} (text: "${highlightText}")
        Position: top=${topPx}px, left=${leftPx}px, width=${widthPx}px
        Target text: "${highlightText}"`);
      
      return (
        <div
          key={func.id}
          style={{
            position: 'absolute',
            top: `${topPx}px`,
            left: `${leftPx}px`,
            width: `${widthPx}px`,
            height: `${fontSize * lineHeight}px`,
            backgroundColor: func.color,
            color: 'black',
            fontWeight: 'bold',
            borderRadius: '2px',
            border: '1px solid rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${fontSize}px`,
            fontFamily: 'monospace',
            lineHeight: lineHeight,
            boxSizing: 'border-box',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        >
          {highlightText}
        </div>
      );
    });
  };

  // Find explanation for specific code at a line
  const findExplanation = (lineNumber, hoveredText, currentLine, charPosition) => {
    if (!isExplainMode || !explanationsData.length) return null;
    
    // First try to find exact code match at the cursor position
    const lineExplanations = explanationsData.filter(exp => exp.Line === lineNumber);
    
    for (const exp of lineExplanations) {
      const code = exp.Code.trim();
      const codeIndex = currentLine.indexOf(code);
      
      // Check if cursor is within the bounds of this code snippet
      if (codeIndex !== -1 && 
          charPosition >= codeIndex && 
          charPosition <= codeIndex + code.length) {
        return exp;
      }
    }
    
    // Fallback to line-based explanation
    const lineMatch = explanationsData.find(exp => exp.Line === lineNumber);
    return lineMatch;
  };

  // Handle mouse events on textarea to show tooltips in explain mode
  const handleTextareaMouseMove = (event) => {
    if (!isExplainMode) {
      setTooltip({ visible: false, x: 0, y: 0, text: '', arrowOffset: null });
      return;
    }

    const textarea = textareaRef.current;
    if (!textarea) return;

    // Get mouse position relative to textarea
    const rect = textarea.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Calculate line height and current line
    const lineHeight = 14 * 1.5; // font-size * line-height
    const scrollTop = textarea.scrollTop;
    const paddingTop = 10; // padding from styled component
    const paddingLeft = 3.5 * 16; // 3.5rem in pixels
    
    const lineNumber = Math.floor((mouseY + scrollTop - paddingTop) / lineHeight) + 1;
    
    // Get the current line text for context
    const lines = value.split('\n');
    const currentLine = lines[lineNumber - 1];
    
    if (currentLine) {
      // Calculate character position within the line
      const charWidth = 8.4; // Approximate monospace character width
      const charPosition = Math.floor((mouseX - paddingLeft) / charWidth);
      
      // Get a small snippet around the cursor for matching
      const startChar = Math.max(0, charPosition - 5);
      const endChar = Math.min(currentLine.length, charPosition + 5);
      const hoveredText = currentLine.substring(startChar, endChar);
      
      const explanation = findExplanation(lineNumber, hoveredText, currentLine, charPosition);
      
      if (explanation) {
        // Calculate position relative to the textarea, not the entire page
        const textareaRect = textarea.getBoundingClientRect();
        
        // Find the exact position of the code snippet on the line
        const code = explanation.Code.trim();
        const codeIndex = currentLine.indexOf(code);
        
        let tooltipX, tooltipY;
        
        if (codeIndex !== -1) {
          // Calculate the center of the code snippet for arrow pointing
          const codeStartX = textareaRect.left + paddingLeft + (codeIndex * charWidth);
          const codeEndX = textareaRect.left + paddingLeft + ((codeIndex + code.length) * charWidth);
          const codeCenterX = (codeStartX + codeEndX) / 2;
          
          // Calculate actual number of lines in tooltip text more accurately
          const tooltipText = explanation.Description;
          const tooltipWidth = 300;
          const avgCharWidth = 7; // Approximate character width in pixels at 12px font
          const availableWidth = tooltipWidth - 24; // Subtract padding (12px * 2)
          const charsPerLine = Math.floor(availableWidth / avgCharWidth);
          
          // Split text by words and calculate actual line breaks
          const words = tooltipText.split(' ');
          let currentLine = '';
          let lineCount = 1;
          
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (testLine.length > charsPerLine && currentLine) {
              lineCount++;
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          
          // Fixed distance for consistent arrow positioning
          const fixedArrowDistance = 10; // Consistent gap between code and arrow for all tooltips
          const tooltipLineHeight = 16.8; // 12px font * 1.4 line-height
          const tooltipPadding = 16; // 8px top + 8px bottom padding
          const calculatedTooltipHeight = (lineCount * tooltipLineHeight) + tooltipPadding;
          
          // Position tooltip so arrow is always at fixed distance, but tooltip extends upward as needed
          tooltipX = codeCenterX - (tooltipWidth / 2); // Center tooltip horizontally over the code
          const arrowY = textareaRect.top + paddingTop + ((lineNumber - 1) * 21) - scrollTop - fixedArrowDistance;
          tooltipY = arrowY - calculatedTooltipHeight;
          
          // Keep tooltip within viewport bounds
          if (tooltipX + tooltipWidth > window.innerWidth - 10) {
            tooltipX = window.innerWidth - tooltipWidth - 10;
          }
          if (tooltipX < 10) {
            tooltipX = 10;
          }
          
          // Calculate arrow position to point at the code center
          const arrowOffsetFromLeft = codeCenterX - tooltipX;
          
          setTooltip({
            visible: true,
            x: tooltipX,
            y: tooltipY,
            text: explanation.Description,
            arrowOffset: Math.max(10, Math.min(290, arrowOffsetFromLeft))
          });
          return; // Exit early to avoid the general setTooltip call
        } else {
          // Fallback to cursor position if code not found
          const tooltipText = explanation.Description;
          const tooltipWidth = 300;
          const avgCharWidth = 7;
          const availableWidth = tooltipWidth - 24;
          const charsPerLine = Math.floor(availableWidth / avgCharWidth);
          
          // Calculate line count for fallback case
          const words = tooltipText.split(' ');
          let currentLine = '';
          let lineCount = 1;
          
          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (testLine.length > charsPerLine && currentLine) {
              lineCount++;
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }
          
          // Fixed distance for fallback case too
          const fixedArrowDistance = 10;
          const tooltipLineHeight = 16.8;
          const tooltipPadding = 16;
          const calculatedTooltipHeight = (lineCount * tooltipLineHeight) + tooltipPadding;
          
          tooltipX = textareaRect.left + paddingLeft + (charPosition * charWidth) - 150;
          const arrowY = textareaRect.top + paddingTop + ((lineNumber - 1) * 21) - scrollTop - fixedArrowDistance;
          tooltipY = arrowY - calculatedTooltipHeight;
        }
        
        // Keep tooltip within viewport bounds
        const tooltipWidth = 300; // max-width from CSS
        const tooltipHeight = 60; // approximate height
        
        // Adjust X position if tooltip would go off-screen
        if (tooltipX + tooltipWidth > window.innerWidth) {
          tooltipX = window.innerWidth - tooltipWidth - 10;
        }
        if (tooltipX < 10) {
          tooltipX = 10;
        }
        
        // Adjust Y position if tooltip would go above viewport
        if (tooltipY < 10) {
          tooltipY = textareaRect.top + paddingTop + (lineNumber * lineHeight) - scrollTop + 30; // Show below instead with margin
        }
        
        setTooltip({
          visible: true,
          x: tooltipX,
          y: tooltipY,
          text: explanation.Description,
          arrowOffset: null
        });
      } else {
        setTooltip({ visible: false, x: 0, y: 0, text: '', arrowOffset: null });
      }
    } else {
      setTooltip({ visible: false, x: 0, y: 0, text: '', arrowOffset: null });
    }
  };

  const handleTextareaMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, text: '', arrowOffset: null });
  };

  // TEXTAREA TOOLTIP HANDLERS TEMPORARILY DISABLED
  // // Handle mouse events on textarea to show tooltip for hardcoded regions
  // const handleTextareaMouseMove = (event) => {
  //   if (!hardcodedRegion) return;

  //   const textarea = textareaRef.current;
  //   if (!textarea) return;

  //   // Get mouse position relative to textarea
  //   const rect = textarea.getBoundingClientRect();
  //   const mouseY = event.clientY - rect.top;
    
  //   // Calculate line height and current line
  //   const lineHeight = 16 * 1.2; // font-size * line-height
  //   const scrollTop = textarea.scrollTop;
  //   const paddingTop = 10; // padding from styled component
    
  //   const lineNumber = Math.floor((mouseY + scrollTop - paddingTop) / lineHeight) + 1;
    
  //   // console.log('Textarea mouse move - Line:', lineNumber, 'Is hardcoded:', isLineInHardcodedRegion(lineNumber));

  //   if (isLineInHardcodedRegion(lineNumber) && hardcodedRegion?.tooltipText) {
  //     // console.log('Showing tooltip for hardcoded region from textarea');
      
  //     // Calculate position above the highlighted region
  //     const regionStartY = (hardcodedRegion.startLine - 1) * lineHeight + paddingTop - scrollTop;
  //     const tooltipY = rect.top + regionStartY - 35; // Position well above the first line
  //     const tooltipX = rect.left + rect.width / 2; // Center horizontally over the textarea
      
  //     setTooltip({
  //       visible: true,
  //       x: tooltipX,
  //       y: tooltipY,
  //       text: hardcodedRegion.tooltipText
  //     });
  //   } else {
  //     setTooltip({ visible: false, x: 0, y: 0, text: '' });
  //   }
  // };

  // const handleTextareaMouseLeave = () => {
  //   // console.log('Textarea mouse leave');
  //   setTooltip({ visible: false, x: 0, y: 0, text: '' });
  // };

  return (
    <StyledTextareaWrapper isCompletionPhase={isCompletionPhase}>
      {allowRegionCreation && (
        <StyledButtonWrapper>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <StyledButton 
              onClick={createNewFunction} 
              disabled={!hasSelection}
            >
              Select Code
            </StyledButton>
            {showExplainButton && (
              <StyledButton 
                onClick={() => onExplainCode && onExplainCode()}
              >
                {isExplainMode ? 'Exit Explain Mode' : 'Explain Code'}
              </StyledButton>
            )}
          </div>
          {functions.length > 0 && (
            <span style={{ 
              marginLeft: '10px', 
              fontSize: '12px', 
              color: '#666',
              fontFamily: 'General Sans Semibold, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
            }}>
              Selections Made: {functions.length}
            </span>
          )}
        </StyledButtonWrapper>
      )}
              <StyledTextareaContainer $hasButtonWrapper={allowRegionCreation}>
          <StyledNumbers ref={lineCounterRef}>
          {linesArr.map((count) => (
            <StyledNumber 
              $active={count <= lineCount} 
              key={count}
              $backgroundColor={getLineBackgroundColor(count)}
            >
              {count}
            </StyledNumber>
          ))}
        </StyledNumbers>
        <StyledSyntaxHighlightLayer 
          ref={syntaxHighlightLayerRef}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
        <StyledCharacterHighlightLayer ref={characterHighlightLayerRef}>
          {renderCharacterHighlights()}
        </StyledCharacterHighlightLayer>
        <StyledHighlightLayer ref={highlightLayerRef}>
          {linesArr.map((count) => (
            <StyledHighlightLine 
              key={count}
              $backgroundColor={getLineBackgroundColor(count)}
            />
          ))}
        </StyledHighlightLayer>
        <StyledHoverLayer ref={hoverLayerRef}>
          {linesArr.map((count) => (
            <StyledHoverLine
              key={count}
              $isHardcoded={isLineInHardcodedRegion(count)}
              // TOOLTIP MOUSE EVENTS TEMPORARILY DISABLED
              // onMouseEnter={(e) => handleMouseEnter(count, e)}
              // onMouseLeave={handleMouseLeave}
            />
          ))}
        </StyledHoverLayer>
        <StyledTextarea
          name={name}
          onChange={handleTextareaChange}
          onScroll={handleTextareaScroll}
          onSelect={handleSelectionChange}
          onMouseUp={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          onKeyDown={handleKeyDown}
          onClick={handleTextareaClick}
          onMouseMove={handleTextareaMouseMove}
          onMouseLeave={handleTextareaMouseLeave}
          placeholder={placeholder}
          ref={textareaRef}
          value={value}
          wrap="off"
          readOnly={readOnly}
          spellCheck={false}
        />
        {tooltip.visible && (
          <StyledTooltip
            style={{
              left: tooltip.x,
              top: tooltip.y,
              '--arrow-left': tooltip.arrowOffset ? `${tooltip.arrowOffset}px` : '50%',
              '--arrow-margin': tooltip.arrowOffset ? '0' : '-5px'
            }}
          >
            {tooltip.text}
          </StyledTooltip>
        )}
      </StyledTextareaContainer>
    </StyledTextareaWrapper>
  );
};
