import React, { useMemo, memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import styled from 'styled-components';
import DraggableCommander from './DraggableCommander';
import { TIER_NAMES } from '../../constants/tierNames';

const TierRowContainer = styled.div`
  display: flex;
  margin-bottom: 10px;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  position: relative;
  z-index: 0;
`;

const TierLabel = styled.div`
  width: 100%; /* Fixed width for all tier labels */
  max-width: 120px; /* Fixed width for all tier labels */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-align: center;
  padding: 10px; /* Add consistent padding */
  min-height: 80px; /* Ensure consistent height for all labels */
  flex-direction: column; /* Make sure multi-word labels appear in one column */
  background-color: ${props => {
    switch (props.tier) {
      case TIER_NAMES.BROKEN: return '#00CC66';
      case TIER_NAMES.SUPER_STRONG: return '#99CC00';
      case TIER_NAMES.STRONG: return '#FFD500';
      case TIER_NAMES.WEAK: return '#FF5E5E';
      case TIER_NAMES.DOGSHIT: return '#000000';
      case TIER_NAMES.UNASSIGNED: return '#5D5D5D'; /* Same treatment as other tiers */
      default: return '#888888';
    }
  }};
  /* Add word-wrap to handle longer tier names */
  word-wrap: break-word;
  hyphens: auto;
`;

const CommandersContainer = styled.div`
  flex-grow: 1;
  min-height: 100px;
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start; /* Changed from center to flex-start for better distribution */
  background-color: ${props => props.isOver ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)'};
  border: 2px dashed ${props => props.isOver ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.1)'};
  transition: background-color 0.2s, border 0.2s;
  width: 100%; /* Ensure it takes full width */
  min-width: 0; /* Prevent flex items from overflowing */
  /* Make sure the drop area is always visible */
  &:hover {
    border: 2px dashed rgba(255, 255, 255, 0.3);
  }
`;

const TierRow = memo(({ tier, commanders = [], isReadOnly = false }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `tier-${tier}`,
    data: {
      tier
    },
    disabled: isReadOnly
  });

  // Memoize the sorted commanders to prevent unnecessary recalculations during drag
  const sortedCommanders = useMemo(() => {
    return [...commanders].sort((a, b) => {
      // First sort by commander id
      if (a.commander.id !== b.commander.id) {
        return a.commander.id - b.commander.id;
      }
      
      // Then sort by prestige id
      // Handle null/undefined prestigeId values (put them first)
      if (a.prestigeId === null || a.prestigeId === undefined) return -1;
      if (b.prestigeId === null || b.prestigeId === undefined) return 1;
      
      // Convert prestigeId to number for numeric comparison if they're strings
      const aId = typeof a.prestigeId === 'string' ? parseInt(a.prestigeId, 10) : a.prestigeId;
      const bId = typeof b.prestigeId === 'string' ? parseInt(b.prestigeId, 10) : b.prestigeId;
      
      // Ensure numeric comparison for prestige IDs
      return aId - bId;
    });
  }, [commanders]);

  // Memoize the commander components to prevent unnecessary re-renders during drag
  const commanderItems = useMemo(() => {
    return sortedCommanders.map(commander => (
      <DraggableCommander 
        key={`${commander.commander.id}-${commander.prestigeId || 'base'}`} 
        item={commander} 
        isReadOnly={isReadOnly}
      />
    ));
  }, [sortedCommanders, isReadOnly]);

  return (
    <TierRowContainer>
      <TierLabel tier={tier}>{tier}</TierLabel>
      <CommandersContainer ref={setNodeRef} isOver={isOver}>
        {commanderItems}
      </CommandersContainer>
    </TierRowContainer>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if these specific props change
  
  // Early checks for obvious changes
  if (prevProps.tier !== nextProps.tier || 
      prevProps.isReadOnly !== nextProps.isReadOnly ||
      prevProps.commanders.length !== nextProps.commanders.length) {
    return false; // Props are different, do re-render
  }
  
  // Check if commanders array has changed
  // Since each commander is an object, we need to do a deep comparison on relevant properties
  for (let i = 0; i < prevProps.commanders.length; i++) {
    const prevCommander = prevProps.commanders[i];
    const nextCommander = nextProps.commanders[i];
    
    if (prevCommander.commander.id !== nextCommander.commander.id ||
        prevCommander.prestigeId !== nextCommander.prestigeId) {
      return false; // Commander changed, do re-render
    }
  }
  
  return true; // No changes, skip re-render
});

export default TierRow;
