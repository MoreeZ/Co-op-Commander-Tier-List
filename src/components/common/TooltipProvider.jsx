import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import TooltipContext from '../../context/TooltipContext';

const GlobalTooltipContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
`;

const TooltipProvider = ({ children }) => {
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  const showTooltip = useCallback((content, position) => {
    setTooltipContent(content);
    setTooltipPosition(position);
  }, []);
  
  const hideTooltip = useCallback(() => {
    setTooltipContent(null);
  }, []);
  
  return (
    <TooltipContext.Provider value={{ showTooltip, hideTooltip }}>
      {children}
      
      {/* Global tooltip container that's always on top */}
      <GlobalTooltipContainer>
        {tooltipContent && (
          <div 
            style={{
              position: 'absolute',
              top: tooltipPosition.y,
              left: tooltipPosition.x,
              transform: 'translate(-50%, -100%)',
              marginTop: '-10px',
            }}
          >
            {tooltipContent}
          </div>
        )}
      </GlobalTooltipContainer>
    </TooltipContext.Provider>
  );
};

export default TooltipProvider;
