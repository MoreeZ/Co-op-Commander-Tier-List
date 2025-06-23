import React, { useState, useCallback, memo, useRef, useEffect, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import styled from 'styled-components';
import Tooltip from '../common/Tooltip';

const CommanderItem = styled.div`
  background-color: #1a1a1a;
  border: 2px solid ${props => {
    switch(props.faction) {
      case 'terran': return '#0066cc';
      case 'zerg': return '#8800cc';
      case 'protoss': return '#ffcc00';
      default: return '#444';
    }
  }};
  border-radius: 8px;
  padding: 8px;
  margin: 5px;
  width: 80px;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  user-select: none;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
  position: relative; /* Add relative positioning for tooltip */
  
  &:hover {
    transform: ${props => props.isDragging ? 'scale(1.05)' : 'scale(1.02)'};
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
`;

const CommanderImage = styled.div`
  width: 50px;
  height: 50px;
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  margin-bottom: 5px;
  background-color: ${props => 
    props.faction === 'terran' ? '#0066cc' : 
    props.faction === 'zerg' ? '#8800cc' : 
    props.faction === 'protoss' ? '#ffcc00' : '#444'};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const CommanderName = styled.div`
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
`;

const PrestigeBadge = styled.div`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: #ffcc00;
  color: #000;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const PrestigeName = styled.div`
  font-size: 10px;
  color: #aaa;
  text-align: center;
  margin-top: 2px;
  max-width: 75px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DraggableCommander = memo(({ item, isReadOnly = false }) => {
  // Initialize state and callbacks unconditionally
  const [imageError, setImageError] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const commanderRef = useRef(null);
  
  // Generate initials for fallback using useCallback to prevent recreation on each render
  const getInitials = useCallback((name) => {
    return name
      ? name
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
      : '';
  }, []);
  
  // Handle image error with useCallback
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);
  
  // Safe extraction of commander and prestige info using useMemo to prevent recalculation
  const commander = useMemo(() => item?.commander || item || {}, [item]);
  const prestigeId = item?.prestigeId;
  const prestigeIndex = item?.prestigeIndex;
  const prestigeName = item?.prestigeName;
  
  // Use useMemo for derived values to prevent recalculation on every render
  const faction = useMemo(() => commander?.faction?.toLowerCase() || 'default', [commander]);
  const commanderId = useMemo(() => commander?.id || 'unknown', [commander]);
  
  // Use useMemo for prestige advantages and disadvantages as strings
  const prestigeAdvantages = useMemo(() => {
    return item?.prestigeAdvantages || commander?.prestiges?.find(p => p.id === prestigeId)?.advantages || null;
  }, [item, commander, prestigeId]);
  
  const prestigeDisadvantages = useMemo(() => {
    return item?.prestigeDisadvantages || commander?.prestiges?.find(p => p.id === prestigeId)?.disadvantages || null;
  }, [item, commander, prestigeId]);
  
  // Initialize draggable functionality - must be called unconditionally
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    // Create a unique ID that includes both commander and prestige
    id: `${commanderId}-${prestigeId || 'default'}`,
    data: {
      item
    },
    disabled: isReadOnly || !item
  });
  
  // Handle mouse events for tooltip
  const handleMouseEnter = useCallback((e) => {
    if (prestigeId && (prestigeAdvantages || prestigeDisadvantages)) {
      const rect = e.currentTarget.getBoundingClientRect();
      // Calculate position relative to viewport
      setTooltipPosition({
        x: rect.left + (rect.width / 2),
        y: rect.top
      });
      setShowTooltip(true);
    }
  }, [prestigeId, prestigeAdvantages, prestigeDisadvantages]);
  
  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false);
  }, []);
  
  // Hide tooltip when dragging starts
  useEffect(() => {
    if (isDragging) {
      setShowTooltip(false);
    }
  }, [isDragging]);
  
  // Check if item is undefined or null after hooks
  if (!item) {
    console.error('DraggableCommander received undefined or null item');
    return null; // Return null to prevent rendering
  }
  
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <CommanderItem
        ref={(node) => {
          // Combine refs - both for dragging and for tooltip positioning
          setNodeRef(node);
          commanderRef.current = node;
        }}
        style={style}
        {...attributes}
        {...listeners}
        isDragging={isDragging}
        faction={faction}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {commander.image_url && !imageError ? (
          <CommanderImage 
            style={{ backgroundImage: `url(${commander.image_url})` }}
            onError={handleImageError}
            faction={faction}
          />
        ) : (
          <CommanderImage faction={faction}>
            <span style={{ 
              color: '#fff', 
              fontWeight: 'bold',
              fontSize: '18px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}>
              {getInitials(commander.name)}
            </span>
          </CommanderImage>
        )}
        <CommanderName>{commander.name}</CommanderName>
        {prestigeIndex !== null && (
          <PrestigeBadge>{prestigeIndex}</PrestigeBadge>
        )}
        {prestigeName && (
          <PrestigeName title={prestigeName}>{prestigeName}</PrestigeName>
        )}
      </CommanderItem>
      
      {/* Global tooltip system */}
      <Tooltip
        visible={showTooltip && !isDragging}
        position={tooltipPosition}
        title={`${commander.name} - ${prestigeName || 'Base Commander'}`}
        advantages={prestigeAdvantages}
        disadvantages={prestigeDisadvantages}
      />
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if these props change
  if (!prevProps.item || !nextProps.item) return false;
  
  const prevCommander = prevProps.item.commander || prevProps.item;
  const nextCommander = nextProps.item.commander || nextProps.item;
  const prevPrestigeId = prevProps.item.prestigeId;
  const nextPrestigeId = nextProps.item.prestigeId;
  
  return (
    prevCommander.id === nextCommander.id &&
    prevPrestigeId === nextPrestigeId &&
    prevProps.isReadOnly === nextProps.isReadOnly
  );
});

export default DraggableCommander;
