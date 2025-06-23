import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import TierList from '../components/tierlist/TierList';
import DraggableCommander from '../components/tierlist/DraggableCommander';
import { getCommanders, getAggregatedTierList } from '../services/supabase';
import { supabase } from '../services/supabase';
import { TIER_NAMES, getEmptyTierList } from '../constants/tierNames';
import SEO from '../components/common/SEO';
import { generateTierListData } from '../utils/structuredData';
import MetaTags from '../components/common/MetaTags';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 2rem;
  color: #00BFFF;
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

const StatsContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-around;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: bold;
  color: #00BFFF;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #aaa;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.2rem;
  color: #aaa;
`;

// Helper function to calculate stats from tier assignments
const calculateStatsFromTiers = async (tierAssignments, commandersData) => {
  // Calculate a score for each commander based on their tier
  const tierScores = {
    [TIER_NAMES.BROKEN]: 5,
    [TIER_NAMES.SUPER_STRONG]: 4,
    [TIER_NAMES.STRONG]: 3,
    [TIER_NAMES.WEAK]: 2,
    [TIER_NAMES.DOGSHIT]: 1,
    [TIER_NAMES.UNASSIGNED]: 0
  };
  
  const commanderScores = {};
  
  // Process each tier and assign scores
  Object.entries(tierAssignments).forEach(([tier, commanderItems]) => {
    if (tier !== TIER_NAMES.UNASSIGNED && Array.isArray(commanderItems)) {
      commanderItems.forEach(item => {
        // Handle both object format and ID format
        const commanderId = typeof item === 'object' ? 
          (typeof item.commander === 'object' ? item.commander.id : item.commander) : 
          item;
        
        const commander = commandersData.find(c => c.id === commanderId);
        if (commander) {
          // Use commander ID as key for stats
          commanderScores[commanderId] = {
            name: commander.name,
            score: tierScores[tier]
          };
        }
      });
    }
  });
  
  // Find top and bottom commanders
  let topCommander = 'None';
  let bottomCommander = 'None';
  let topScore = -1;
  let bottomScore = Number.MAX_SAFE_INTEGER;
  
  Object.values(commanderScores).forEach(data => {
    if (data.score > topScore) {
      topScore = data.score;
      topCommander = data.name;
    }
    
    if (data.score < bottomScore && data.score > 0) { // Ignore unassigned
      bottomScore = data.score;
      bottomCommander = data.name;
    }
  });
  
  // Count the number of submissions by counting rows in the users table
  let totalSubmissions = 0;
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (!error && count !== null) {
      totalSubmissions = count;
    }
  } catch (countError) {
    console.error('Error counting users:', countError);
    // Fallback to fetching all users and counting them
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1000); // Set a reasonable limit
      
      if (!error && data) {
        totalSubmissions = data.length;
      }
    } catch (fallbackError) {
      console.error('Error in fallback count:', fallbackError);
    }
  }
  
  return {
    totalSubmissions,
    topCommander,
    bottomCommander
  };
};

const SummaryPage = () => {
  const [commanders, setCommanders] = useState([]);
  const [tierAssignments, setTierAssignments] = useState(getEmptyTierList());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    topCommander: '',
    bottomCommander: ''
  });
  const [structuredData, setStructuredData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // Fetch commanders with prestiges
        const commandersData = await getCommanders();
        setCommanders(commandersData);

        // Fetch aggregated tier list data
        const tierData = await getAggregatedTierList();

        if (tierData && commandersData) {
          // Process tier data to include full commander and prestige information
          const processedTierData = {};
          
          // Initialize with empty tiers
          Object.keys(tierData).forEach(tier => {
            processedTierData[tier] = [];
          });
          
          // Process each tier's commanders
          Object.entries(tierData).forEach(([tier, items]) => {
            if (Array.isArray(items)) {
              const processedItems = items.map(item => {
                // Get the commander ID (either directly or from the object)
                const commanderId = typeof item === 'object' ? 
                  (item.commander || item.commander_id) : 
                  item;
                
                // Find the full commander object
                const commander = commandersData.find(c => c.id === commanderId);
                
                if (commander) {
                  // Get the prestige ID if available
                  const prestigeId = typeof item === 'object' ? item.prestigeId : null;
                  
                  // Find the prestige object if a prestige ID is provided
                  let prestige = null;
                  if (prestigeId && commander.prestiges) {
                    prestige = commander.prestiges.find(p => p.id === prestigeId);
                  }
                  
                  // Return a properly formatted item
                  return {
                    commander: commander,
                    prestigeId: prestigeId,
                    prestigeIndex: prestige ? prestige.index : null,
                    prestigeName: prestige ? prestige.name : null,
                    advantages: prestige ? prestige.advantages : null,
                    disadvantages: prestige ? prestige.disadvantages : null
                  };
                }
                return null;
              }).filter(Boolean); // Remove any null items
              
              processedTierData[tier] = processedItems;
            }
          });
          
          setTierAssignments(processedTierData);

          // Calculate stats based on the tier assignments
          const statsData = await calculateStatsFromTiers(tierData, commandersData);
          setStats(statsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Define styled components outside of the render function
  const UnassignedSection = styled.div`
    margin-top: 20px;
    padding: 15px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    border: 2px dashed rgba(255, 255, 255, 0.2);
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
  `;
  
  const UnassignedTitle = styled.h3`
    color: #ccc;
    margin-bottom: 10px;
    text-align: center;
  `;
  
  const CommandersContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    margin-top: 10px;
    width: 100%;
  `;
  
  // Create structured data for SEO when tier assignments are loaded
  useEffect(() => {
    if (!loading && Object.keys(tierAssignments).length > 0) {
      // Format commanders with their tiers for structured data
      const commandersWithTiers = [];
      
      Object.entries(tierAssignments).forEach(([tier, items]) => {
        if (Array.isArray(items)) {
          items.forEach(item => {
            if (item.commander) {
              commandersWithTiers.push({
                name: item.commander.name,
                tier: tier
              });
            }
          });
        }
      });
      
      // Create structured data for the tier list using the new utility
      setStructuredData(generateTierListData(commandersWithTiers));
    }
  }, [loading, tierAssignments]);

  return (
    <PageContainer>
      {/* SEO Component */}
      <SEO 
        title="Community Co-op Commander Tier List" 
        description="Community-driven tier list for StarCraft 2 Co-op Commanders. See which commanders rank highest based on player submissions."
        structuredData={structuredData}
      />
      <Title>StarCraft II Co-op Commander Tier List</Title>
      <Description>
        This tier list represents the community's opinion on the relative power level of each commander.
        It is calculated based on all user submissions, showing the most common tier for each commander.
      </Description>
      
      {loading ? (
        <LoadingMessage>Loading tier list data...</LoadingMessage>
      ) : (
        <>
          <StatsContainer>
            <StatItem>
              <StatValue>{stats.totalSubmissions}</StatValue>
              <StatLabel>Total Submissions</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.topCommander || 'N/A'}</StatValue>
              <StatLabel>Highest Rated Commander</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{stats.bottomCommander || 'N/A'}</StatValue>
              <StatLabel>Lowest Rated Commander</StatLabel>
            </StatItem>
          </StatsContainer>
          
          <TierList 
            isReadOnly={true} 
            commanders={commanders}
            initialAssignments={tierAssignments}
            hideUnassigned={true} /* Hide the 'Never Played' tier on summary page */
            renderCommander={(item) => (
              <DraggableCommander 
                key={`${item.commander.id}-${item.prestigeId || 'base'}`}
                item={item}
                isReadOnly={true}
              />
            )}
          />
        </>
      )}
    </PageContainer>
  );
};

export default SummaryPage;
