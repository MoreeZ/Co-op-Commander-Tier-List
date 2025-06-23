import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor, KeyboardSensor, rectIntersection } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import styled from 'styled-components';
import TierRow from './TierRow';
import DraggableCommander from './DraggableCommander';
import { TIER_NAMES, TIER_NAMES_ORDERED, getEmptyTierList } from '../../constants/tierNames';

const TierListContainer = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background-color: #222;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TierList = memo(({ commanders = [], initialAssignments = {}, isReadOnly = false, onChange = () => {}, hideUnassigned = false }) => {
  // State to track which commanders are in which tiers
  const [tierAssignments, setTierAssignments] = useState(getEmptyTierList());
    
  // Track active dragging commander
  const [activeDragId, setActiveDragId] = useState(null);
  const [activeDragCommander, setActiveDragCommander] = useState(null);
  
  // Set up sensors for drag and drop
  // Using individual sensors outside of the useMemo to avoid React hook rules errors
  const pointerSensor = useSensor(PointerSensor, {
    // Increase activation distance to make dragging more precise
    activationConstraint: {
      distance: 0, // 8px
    },
  });
  
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  
  // Combine sensors
  const sensors = useSensors(pointerSensor, keyboardSensor);
  
  // Initialize tier assignments when commanders or initialAssignments change
  useEffect(() => {
    if (commanders.length > 0) {
      const assignments = {};
      
      // Initialize all tiers
      TIER_NAMES_ORDERED.forEach(tier => {
        assignments[tier] = [];
      });
      
      // Process any existing assignments from initialAssignments
      TIER_NAMES_ORDERED.forEach(tier => {
        if (initialAssignments[tier] && Array.isArray(initialAssignments[tier])) {
          // Check if we have IDs or full commander objects
          if (initialAssignments[tier].length > 0 && 
              typeof initialAssignments[tier][0] === 'object' && 
              initialAssignments[tier][0] !== null) {
            // We already have commander objects
            assignments[tier] = initialAssignments[tier];
          } else {
            // We have IDs, find the commander objects
            assignments[tier] = initialAssignments[tier]
              .map(id => commanders.find(c => c.id === parseInt(id) || c.id === id))
              .filter(Boolean); // Remove any undefined (not found)
          }
        } else {
          assignments[tier] = [];
        }
      });
      
      // Clear the unassigned tier to rebuild it
      assignments[TIER_NAMES.UNASSIGNED] = [];
      
      // Track all assigned prestige combinations (commander_id-prestige_id)
      const allAssignedCombos = [];
      
      // Collect all assigned commander-prestige combinations
      TIER_NAMES_ORDERED.forEach(tier => {
        if (tier !== TIER_NAMES.UNASSIGNED) {
          assignments[tier].forEach(item => {
            const commander = item.commander || item;
            const commanderId = typeof commander === 'object' ? commander.id : commander;
            const prestigeId = item.prestigeId || 'base';
            allAssignedCombos.push(`${commanderId}-${prestigeId}`);
          });
        }
      });
      
      // For each commander, add their unassigned prestiges
      commanders.forEach(commander => {
        if (commander.prestiges && commander.prestiges.length > 0) {
          // Add each prestige that hasn't been assigned yet
          commander.prestiges.forEach(prestige => {
            const comboKey = `${commander.id}-${prestige.id}`;
            if (!allAssignedCombos.includes(comboKey)) {
              assignments[TIER_NAMES.UNASSIGNED].push({
                commander: commander,
                prestigeId: prestige.id,
                prestigeIndex: prestige.index,
                prestigeName: prestige.name
              });
            }
          });
        } else {
          // If no prestiges, add just the commander if not assigned
          const comboKey = `${commander.id}-base`;
          if (!allAssignedCombos.includes(comboKey)) {
            assignments[TIER_NAMES.UNASSIGNED].push({
              commander: commander,
              prestigeId: null,
              prestigeIndex: null,
              prestigeName: null
            });
          }
        }
      });
      
      // Remove console.log statements to improve performance
      
      setTierAssignments(assignments);
    }
  }, [commanders, initialAssignments]);
  
  // Pre-compute a mapping of item IDs to their source tiers and items for faster lookups during drag operations
  const itemLookupMap = useMemo(() => {
    const map = new Map();
    Object.entries(tierAssignments).forEach(([tier, items]) => {
      items.forEach(item => {
        const itemId = `${item.commander.id}-${item.prestigeId || 'default'}`;
        map.set(itemId, { item, tier });
      });
    });
    return map;
  }, [tierAssignments]);

  // Optimized drag start handler using the lookup map
  const handleDragStart = useCallback((event) => {
    const { active } = event;
    setActiveDragId(active.id);
    
    // Use the lookup map for O(1) access instead of iterating through all tiers
    const itemData = itemLookupMap.get(active.id);
    if (itemData) {
      setActiveDragCommander(itemData.item);
    }
  }, [itemLookupMap]);
  
  // Optimized drag end handler using the lookup map
  const handleDragEnd = useCallback((event) => {
    // Reset active drag state
    setActiveDragId(null);
    setActiveDragCommander(null);
    
    if (isReadOnly) return;
    
    const { active, over } = event;
    
    if (!over) return;
    
    const itemId = active.id;
    const targetTier = over.id.replace('tier-', '');
    
    // Use the lookup map for instant access
    const itemData = itemLookupMap.get(itemId);
    if (!itemData) return;
    
    const { item, tier: sourceTier } = itemData;
    
    // Don't do anything if item is dropped in the same tier
    if (!item || !sourceTier || sourceTier === targetTier) return;
    
    // Create new assignments - use functional update to ensure we have the latest state
    setTierAssignments(prevAssignments => {
      const newAssignments = { ...prevAssignments };
      
      // Remove from source tier
      newAssignments[sourceTier] = newAssignments[sourceTier].filter(
        currentItem => `${currentItem.commander.id}-${currentItem.prestigeId || 'default'}` !== itemId
      );
      
      // Add to target tier
      newAssignments[targetTier] = [...newAssignments[targetTier], item];
      
      // Create formatted assignments for the parent component
      // Removed setTimeout which was causing duplicate triggers
      const formattedAssignments = {};
      [...TIER_NAMES_ORDERED, TIER_NAMES.UNASSIGNED].forEach(tier => {
        formattedAssignments[tier] = newAssignments[tier].map(item => ({
          commander: item.commander.id,
          prestigeId: item.prestigeId
        }));
      });
      
      // Call onChange synchronously - only once
      onChange(formattedAssignments);
      
      return newAssignments;
    });
  }, [itemLookupMap, isReadOnly, onChange]);
  
  // Memoized collision detection to prevent recreation on each render
  const customCollisionDetection = useCallback((args) => {
    // Use the built-in rectIntersection which works well for this case
    const intersections = rectIntersection(args);
    
    // If there are multiple intersecting containers, do additional processing
    if (intersections.length > 1) {
      // Get pointer coordinate for vertical position calculation
      const { y } = args.pointerCoordinates;
      
      // Map and score intersections based on vertical position
      return intersections.map(intersection => {
        // Get the rectangle data
        const rect = intersection.data.droppableContainer.rect.current;
        
        // Calculate how far down in the container the pointer is
        const verticalPosition = y - rect.top;
        const verticalRatio = verticalPosition / rect.height;
        
        // Higher score means higher priority
        // When very close to the top of a container (especially tall ones), 
        // reduce the score to prevent accidental drops into tier above
        let score = intersection.data.value;
        
        // Apply adjustment for position - closer to top means lower priority
        if (verticalRatio < 0.2) {
          // Significant reduction in score when very near the top
          score *= 0.5;
        }
        
        return {
          ...intersection,
          score
        };
      }).sort((a, b) => b.score - a.score);
    }
    
    // Return regular intersections when only one container is involved
    return intersections;
  }, []);
  
  // Memoize the filtered tier names to prevent recreation on each render
  // Always include UNASSIGNED (Never Played) tier since we want to keep items there
  const filteredTierNames = useMemo(() => {
    // If hideUnassigned is true, filter out UNASSIGNED tier, otherwise show all tiers
    return TIER_NAMES_ORDERED.filter(tier => !hideUnassigned || tier !== TIER_NAMES.UNASSIGNED);
  }, [hideUnassigned]);

  // Memoize the tier rows to prevent unnecessary re-renders
  const tierRows = useMemo(() => {
    return filteredTierNames.map(tier => (
      <TierRow
        key={tier}
        tier={tier}
        commanders={tierAssignments[tier]}
        isReadOnly={isReadOnly}
      />
    ));
  }, [filteredTierNames, tierAssignments, isReadOnly]);

  // Memoize the drag overlay to prevent unnecessary re-renders
  const dragOverlay = useMemo(() => {
    return (
      <DragOverlay zIndex={1000}>
        {activeDragId && activeDragCommander ? (
          <DraggableCommander 
            item={activeDragCommander} 
            isReadOnly={false} 
          />
        ) : null}
      </DragOverlay>
    );
  }, [activeDragId, activeDragCommander]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <TierListContainer>
        <div style={{ position: 'relative', width: '100%' }}>
          {/* All tiers including unassigned */}
          {tierRows}
        </div>
      </TierListContainer>
      
      {/* Drag Overlay to show the dragged commander on top */}
      {dragOverlay}
    </DndContext>
  );
});

export default TierList;
