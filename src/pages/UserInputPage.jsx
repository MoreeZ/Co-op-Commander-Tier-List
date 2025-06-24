import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import TierList from "../components/tierlist/TierList";
import DraggableCommander from "../components/tierlist/DraggableCommander";
import {
  getCommanders,
  checkUserSubmission,
  createUser,
  getUserSubmission,
  submitSingleTierChange,
} from "../services/supabase";
import { TIER_NAMES, getEmptyTierList } from "../constants/tierNames";
import SEO from "../components/common/SEO";
import MetaTags from "../components/common/MetaTags";
import { generateBreadcrumbData } from "../utils/structuredData";
import {
  checkMultiLayerSubmission,
  createUserIdentificationData,
  markAsSubmitted,
  storeUserId,
  getStoredUserId,
  generateFingerprint,
} from "../utils/userIdentification";

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
  color: #00bfff;
  text-shadow: 0 0 10px rgba(0, 191, 255, 0.3);
`;

const Description = styled.p`
  text-align: center;
  margin-bottom: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
  color: #ccc;
`;

const SubmitButton = styled.button`
  display: block;
  margin: 2rem auto;
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  background-color: #00bfff;
  color: #000;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #0099cc;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 191, 255, 0.4);
  }

  &:disabled {
    background-color: #555;
    color: #888;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const Message = styled.div`
  text-align: center;
  padding: 2rem;
  margin: 2rem auto;
  max-width: 800px;
  background-color: ${(props) =>
    props.type === "success"
      ? "rgba(0, 128, 0, 0.2)"
      : props.type === "info"
      ? "rgba(255, 165, 0, 0.2)"
      : "rgba(255, 0, 0, 0.2)"};
  border-radius: 8px;
  border-left: 5px solid
    ${(props) =>
      props.type === "success"
        ? "green"
        : props.type === "info"
        ? "orange"
        : "red"};
  color: ${(props) =>
    props.type === "success"
      ? "#8AFF8A"
      : props.type === "info"
      ? "#FFD700"
      : "#FF8A8A"};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #aaa;
`;

const UserInputPage = () => {
  const [commanders, setCommanders] = useState([]);
  const [tierAssignments, setTierAssignments] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [_hasSubmitted, setHasSubmitted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const lastSubmissionRef = useRef({ timestamp: 0, itemId: null });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Fetch commanders
        const commandersData = await getCommanders();
        setCommanders(commandersData);

        // Initialize tier assignments with all commanders in unassigned
        const initialTierAssignments = getEmptyTierList();

        // Add commanders with their prestiges to unassigned
        initialTierAssignments[TIER_NAMES.UNASSIGNED] = [];
        
        // First collect all commander-prestige combinations
        const unassignedItems = [];
        
        commandersData.forEach((commander) => {
          if (commander.prestiges && commander.prestiges.length > 0) {
            // Sort prestiges by ID first
            const sortedPrestiges = [...commander.prestiges].sort((a, b) => {
              // Convert prestigeId to number for numeric comparison if they're strings
              const aId = typeof a.id === 'string' ? parseInt(a.id, 10) : a.id;
              const bId = typeof b.id === 'string' ? parseInt(b.id, 10) : b.id;
              return aId - bId;
            });
            
            // Add each prestige as a separate item
            sortedPrestiges.forEach((prestige) => {
              unassignedItems.push({
                commander: commander,
                prestigeId: prestige.id,
                prestigeIndex: prestige.index,
                prestigeName: prestige.name,
              });
            });
          } else {
            // If no prestiges, add just the commander
            unassignedItems.push({
              commander: commander,
              prestigeId: null,
              prestigeIndex: null,
              prestigeName: null,
            });
          }
        });
        
        // Sort all items by commander ID and then by prestige ID
        unassignedItems.sort((a, b) => {
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
          
          return aId - bId;
        });
        
        // Add sorted items to the unassigned tier
        initialTierAssignments[TIER_NAMES.UNASSIGNED] = unassignedItems;

        // Check if user has already submitted
        const storedUserId = getStoredUserId();
        let existingUserId = storedUserId;
        let hasSubmittedBefore = false;

        if (!existingUserId) {
          // First check if user has submitted before
          hasSubmittedBefore = await checkMultiLayerSubmission(
            checkUserSubmission
          );

          // If they have, we need to get their actual user ID
          if (hasSubmittedBefore) {
            // Generate fingerprint and use it to get the actual user ID
            const fingerprint = await generateFingerprint();
            if (fingerprint) {
              existingUserId = await checkUserSubmission(fingerprint);
            }
          }
        }

        if (existingUserId) {
          setUserId(existingUserId);
          setHasSubmitted(true);

          // Store the user ID for future use
          storeUserId(existingUserId);

          // Try to fetch the user's existing submission
          const existingSubmission = await getUserSubmission(existingUserId);

          if (existingSubmission) {
            console.log("Found existing submission:", existingSubmission);

            // The submission data is now directly in the format we need
            const populatedTierAssignments = { ...initialTierAssignments };

            // Clear the unassigned array since we'll rebuild it
            populatedTierAssignments[TIER_NAMES.UNASSIGNED] = [];

            // Track which commander-prestige combinations have been assigned
            const assignedCombinations = new Set();

            // Populate tiers from submission data
            Object.entries(existingSubmission).forEach(([tier, items]) => {
              if (tier !== TIER_NAMES.UNASSIGNED && Array.isArray(items)) {
                // Store the full items (commander with prestige)
                populatedTierAssignments[tier] = items;

                // Track the assigned commander-prestige combinations
                items.forEach((item) => {
                  if (item && item.commander && item.commander.id) {
                    const key = `${item.commander.id}-${
                      item.prestigeId || "default"
                    }`;
                    assignedCombinations.add(key);
                  }
                });
              }
            });

            // Add any unassigned commanders with their prestiges
            populatedTierAssignments[TIER_NAMES.UNASSIGNED] = [];
            commandersData.forEach((commander) => {
              if (commander.prestiges && commander.prestiges.length > 0) {
                // Add each prestige as a separate item if not already assigned
                commander.prestiges.forEach((prestige) => {
                  const key = `${commander.id}-${prestige.id}`;
                  if (!assignedCombinations.has(key)) {
                    populatedTierAssignments[TIER_NAMES.UNASSIGNED].push({
                      commander: commander,
                      prestigeId: prestige.id,
                      prestigeIndex: prestige.index,
                      prestigeName: prestige.name,
                    });
                  }
                });
              } else {
                // If no prestiges, add just the commander if not already assigned
                const key = `${commander.id}-default`;
                if (!assignedCombinations.has(key)) {
                  populatedTierAssignments[TIER_NAMES.UNASSIGNED].push({
                    commander: commander,
                    prestigeId: null,
                    prestigeIndex: null,
                    prestigeName: null,
                  });
                }
              }
            });
            setTierAssignments(populatedTierAssignments);
          } else {
            setTierAssignments(initialTierAssignments);
          }
        } else {
          setTierAssignments(initialTierAssignments);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setMessage({
          text: "Error loading data. Please try again later.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTierChange = async (newAssignments) => {
    // First, detect what has changed by comparing with current state
    // We need to identify a single item that was moved from one tier to another
    let movedItem = null;
    let targetTier = null;

    // Find the moved item by comparing new assignments with current state
    Object.entries(newAssignments).forEach(([tier, items]) => {
      // For each tier in the new assignments, check if there's a new item
      const newItems = items.filter(newItem => {
        // If this tier in current state doesn't exist yet, all items are new
        if (!tierAssignments[tier]) return true;
        
        // Check if this item wasn't in this tier before
        return !tierAssignments[tier].some(existingItem => 
          existingItem.commander.id === newItem.commander && 
          existingItem.prestigeId === newItem.prestigeId
        );
      });
      
      if (newItems.length > 0) {
        targetTier = tier;
        movedItem = newItems[0]; // Just take the first moved item we find
      }
    });
    
    // Update local state with all the new assignments
    setTierAssignments((prevAssignments) => {
      const updatedAssignments = { ...prevAssignments };

      // Update each tier with the new assignments
      Object.entries(newAssignments).forEach(([tier, items]) => {
        // Convert the simplified items back to full objects
        updatedAssignments[tier] = items
          .map((item) => {
            const commander = commanders.find((c) => c.id === item.commander);
            let prestige = null;

            if (commander && commander.prestiges && item.prestigeId) {
              prestige = commander.prestiges.find(
                (p) => p.id === item.prestigeId
              );
            }

            return {
              commander: commander,
              prestigeId: item.prestigeId,
              prestigeIndex: prestige ? prestige.index : null,
              prestigeName: prestige ? prestige.name : null,
            };
          })
          .filter((item) => item.commander); // Remove any items without commanders
      });

      return updatedAssignments;
    });
    
    // If we couldn't determine what moved, don't try to update the DB
    if (!movedItem || !targetTier) return;
    
    // Don't submit if we're still loading or already submitting
    if (loading || submitting) return;
    
    // Create a unique identifier for this submission to prevent duplicates
    const itemId = `${movedItem.commander}-${movedItem.prestigeId || 'default'}-${targetTier}`;
    const now = Date.now();
    
    // Check if this is a duplicate submission (same item moved to same tier within 1 second)
    if (
      lastSubmissionRef.current.itemId === itemId && 
      now - lastSubmissionRef.current.timestamp < 1000
    ) {
      console.log('Preventing duplicate submission');
      return;
    }
    
    // Update the last submission reference
    lastSubmissionRef.current = {
      timestamp: now,
      itemId: itemId
    };
    
    setSubmitting(true);
    
    try {      
      let currentUserId = userId;
      
      // Create a new user if needed
      if (!currentUserId) {
        // Generate user identification data
        const userData = await createUserIdentificationData();
        
        // Create user in database
        currentUserId = await createUser(userData);
        
        if (!currentUserId) {
          console.error("Failed to create user");
          return;
        }
        
        // Store the user ID for future editing
        storeUserId(currentUserId);
        setUserId(currentUserId);
      }
      
      // Submit only the change for this specific item
      const success = await submitSingleTierChange(
        currentUserId,
        movedItem.commander,
        movedItem.prestigeId,
        targetTier
      );
      
      if (success) {
        // Mark as submitted locally
        markAsSubmitted();
        setHasSubmitted(true);
      }
    } catch (error) {
      console.error("Error updating tier list:", error);
      setMessage({
        text: "Error updating your tier list. Your changes will be saved locally but may not be synced to the server.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };



  // Create breadcrumb structured data for SEO
  const breadcrumbItems = [
    { name: "Home", path: "/" },
    { name: "Create Tier List", path: "/create" }
  ];
  const breadcrumbData = generateBreadcrumbData(breadcrumbItems);
  
  return (
    <PageContainer>
      <MetaTags data={breadcrumbData} />
      <SEO 
        title="Contribute to the Co-op Commander Tier List" 
        description="Contribute to the personal StarCraft 2 Co-op Commander tier list. Rank commanders from S to F tier and contribute to the community rankings."
      />
      <Title>
        Co-op Commander Tier List
      </Title>
      <Description>
        Drag and drop the commanders to contribute to the tier list for StarCraft II Co-op missions. 
        Place each commander in the tier you believe they belong to. 
        Your submission will automatically contribute to the community tier list!
      </Description>

      {message.text && <Message type={message.type}>{message.text}</Message>}

      {loading ? (
        <LoadingMessage>Loading commanders data...</LoadingMessage>
      ) : (
        <TierList
          commanders={commanders}
          initialAssignments={tierAssignments}
          onChange={handleTierChange}
          isReadOnly={false}
          hideUnassigned={false}
        />
      )}
    </PageContainer>
  );
};

export default UserInputPage;
