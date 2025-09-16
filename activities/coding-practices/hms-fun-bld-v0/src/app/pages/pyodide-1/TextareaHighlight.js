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
 */

const StyledTextareaWrapper = styled.div`
  border: 1px solid grey;
  border-radius: 2px;
  width: 900px;
  // height: 700px;
  position: relative;
`;

const StyledButtonWrapper = styled.div`
  padding: 8px;
  border-bottom: 1px solid grey;
  background-color: #f5f5f5;
`;

const StyledButton = styled.button`
  background-color: rgb(10, 13, 10);
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  &:hover {
    background-color: #45a049;
  }
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const StyledTextareaContainer = styled.div`
  height: calc(100% - 40px);
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
  font-size: 16px;
  line-height: 1.2;
  overflow-y: hidden;
  overflow-x: hidden;
`;

const StyledHighlightLine = styled.div`
  background-color: ${(props) => props.$backgroundColor || "transparent"};
  height: 1.2em;
  width: 100%;
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
  font-size: 16px;
  line-height: 1.2;
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
  z-index: 3;
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
  ${sharedStyle}
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
  text-align: right;
  box-shadow: none;
  position: absolute;
  color: grey;
  border: none;
  background-color: lightgrey;
  padding: 10px;
  width: 1.5rem;
  z-index: 4;
`;

const StyledNumber = styled.div`
  color: ${(props) => (props.$active ? "blue" : "inherit")};
  background-color: ${(props) => props.$backgroundColor || "transparent"};
  padding: 0 4px;
  border-radius: 2px;
  height: 1.2em;
  display: flex;
  align-items: center;
  justify-content: flex-end;
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
  setSelectedFunction
}) => {
  const [hasSelection, setHasSelection] = useState(false);
  
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

  const handleTextareaChange = (event) => {
    onValueChange(event.target.value);
  };

  const handleTextareaScroll = () => {
    if (lineCounterRef.current && textareaRef.current && highlightLayerRef.current && syntaxHighlightLayerRef.current) {
      const scrollTop = textareaRef.current.scrollTop;
      const scrollLeft = textareaRef.current.scrollLeft;
      lineCounterRef.current.scrollTop = scrollTop;
      highlightLayerRef.current.scrollTop = scrollTop;
      highlightLayerRef.current.scrollLeft = scrollLeft;
      syntaxHighlightLayerRef.current.scrollTop = scrollTop;
      syntaxHighlightLayerRef.current.scrollLeft = scrollLeft;
    }
  };

  const handleSelectionChange = () => {
    if (textareaRef.current) {
      const { selectionStart, selectionEnd } = textareaRef.current;
      setHasSelection(selectionStart !== selectionEnd);
    }
  };

  const createNewFunction = () => {
    if (!textareaRef.current) return;
    
    const { selectionStart, selectionEnd } = textareaRef.current;
    if (selectionStart === selectionEnd) return;

    const startLine = getLineFromPosition(selectionStart, value);
    const endLine = getLineFromPosition(selectionEnd, value);
    
    const newFunction = {
      id: Date.now(),
      name: `Function ${functions.length + 1}`,
      startLine: Math.min(startLine, endLine),
      endLine: Math.max(startLine, endLine),
      color: generateColor(functions.length)
    };

    setFunctions(prev => [...prev, newFunction]);
    setSelectedFunction(newFunction.id);
    setHasSelection(false);
    
    // Clear the selection
    textareaRef.current.setSelectionRange(selectionEnd, selectionEnd);
  };

  const getLineBackgroundColor = (lineNumber) => {
    // Find the function that contains this line number
    const containingFunction = functions.find(
      func => lineNumber >= func.startLine && lineNumber <= func.endLine
    );
    return containingFunction ? containingFunction.color : undefined;
  };

  return (
    <StyledTextareaWrapper>
      <StyledButtonWrapper>
        <StyledButton 
          onClick={createNewFunction} 
          disabled={!hasSelection}
        >
          New Function
        </StyledButton>
        {functions.length > 0 && (
          <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
            Functions: {functions.length}
          </span>
        )}
      </StyledButtonWrapper>
      <StyledTextareaContainer>
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
        <StyledHighlightLayer ref={highlightLayerRef}>
          {linesArr.map((count) => (
            <StyledHighlightLine 
              key={count}
              $backgroundColor={getLineBackgroundColor(count)}
            />
          ))}
        </StyledHighlightLayer>
        <StyledTextarea
          name={name}
          onChange={handleTextareaChange}
          onScroll={handleTextareaScroll}
          onSelect={handleSelectionChange}
          onMouseUp={handleSelectionChange}
          onKeyUp={handleSelectionChange}
          placeholder={placeholder}
          ref={textareaRef}
          value={value}
          wrap="off"
        />
      </StyledTextareaContainer>
    </StyledTextareaWrapper>
  );
};
