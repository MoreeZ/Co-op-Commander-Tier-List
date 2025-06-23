import React, { useContext, useEffect } from 'react';
import styled from 'styled-components';
import TooltipContext from '../../context/TooltipContext';

// Tooltip content styling

const TooltipContainer = styled.div`
  background-color: #222;
  color: #fff;
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  width: 220px;
  font-size: 14px;
  pointer-events: none; /* Makes the tooltip "click-through" */
  
  /* Arrow at the bottom */
  &:after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    margin-left: -8px;
    border-width: 8px 8px 0;
    border-style: solid;
    border-color: #222 transparent transparent;
  }
`;

const Title = styled.div`
  font-weight: bold;
  margin-bottom: 5px;
  border-bottom: 1px solid #444;
  padding-bottom: 5px;
`;

const Section = styled.div`
  margin-top: 8px;
`;

const SectionTitle = styled.div`
  font-weight: bold;
  color: ${props => props.type === 'advantage' ? '#4caf50' : '#f44336'};
  margin-bottom: 3px;
`;

const Tooltip = ({ visible, title, advantages, disadvantages, position }) => {
  const { showTooltip, hideTooltip } = useContext(TooltipContext);
  
  useEffect(() => {
    if (visible && (advantages || disadvantages)) {
      const tooltipContent = (
        <TooltipContainer>
          {title && <Title>{title}</Title>}
          
          {advantages && (
            <Section>
              <SectionTitle type="advantage">Advantages</SectionTitle>
              <div>{advantages}</div>
            </Section>
          )}
          
          {disadvantages && (
            <Section>
              <SectionTitle type="disadvantage">Disadvantages</SectionTitle>
              <div>{disadvantages}</div>
            </Section>
          )}
        </TooltipContainer>
      );
      
      showTooltip(tooltipContent, position);
    } else {
      hideTooltip();
    }
    
    return () => {
      hideTooltip();
    };
  }, [visible, title, advantages, disadvantages, position, showTooltip, hideTooltip]);
  
  // This component doesn't render anything directly
  return null;
};

export default Tooltip;
