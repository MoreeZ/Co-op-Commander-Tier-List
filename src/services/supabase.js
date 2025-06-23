import { createClient } from '@supabase/supabase-js';
import { TIER_NAMES, getEmptyTierList } from '../constants/tierNames';

// Initialize the Supabase client
// Use the correct Supabase URL format
const supabaseUrl = `https://${import.meta.env.VITE_SUPABASE_URL}.supabase.co`;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Commander-related functions
export const getCommanders = async () => {
  // First fetch all commanders
  const { data: commandersData, error: commandersError } = await supabase
    .from('commanders')
    .select('*')
    .order('id');
  
  if (commandersError) {
    console.error('Error fetching commanders:', commandersError);
    return [];
  }

  // Then fetch all prestiges with advantages and disadvantages
  const { data: prestigesData, error: prestigesError } = await supabase
    .from('prestiges')
    .select('id, commander_id, name, index, advantages, disadvantages')
    .order('index');

  if (prestigesError) {
    console.error('Error fetching prestiges:', prestigesError);
    return commandersData || [];
  }

  // Attach prestiges to their respective commanders
  const commandersWithPrestiges = commandersData.map(commander => {
    const commanderPrestiges = prestigesData.filter(prestige => prestige.commander_id === commander.id);
    return {
      ...commander,
      prestiges: commanderPrestiges
    };
  });
  
  return commandersWithPrestiges || [];
};

// User identification and submission functions
export const checkUserSubmission = async (fingerprint) => {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('fingerprint', fingerprint)
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
    console.error('Error checking user submission:', error);
    return null;
  }
  
  return data ? data.id : null;
};

// Get a user's existing submission
export const getUserSubmission = async (userId) => {
  if (!userId) return null;
  
  try {
    // Get entries from submission_entries table
    const { data: entriesData, error: entriesError } = await supabase
      .from('submission_entries')
      .select('commander_id, tier, prestige_id')
      .eq('user_id', userId);
    
    if (entriesError) {
      console.error('Error fetching user submission entries:', entriesError);
      return null;
    }
    
    // If we have entries, format them into the expected structure
    if (entriesData && entriesData.length > 0) {
      // Get all commanders to ensure we have complete data
      const { data: commandersData, error: commandersError } = await supabase
        .from('commanders')
        .select('id, name, image_url, faction');
        
      // Get all prestiges
      const { data: prestigesData, error: prestigesError } = await supabase
        .from('prestiges')
        .select('id, name, advantages, disadvantages, index, commander_id');
        
      if (prestigesError) {
        console.error('Error fetching prestiges:', prestigesError);
        return null;
      }
      
      if (commandersError) {
        console.error('Error fetching commanders:', commandersError);
        return null;
      }
      
      // Create the submission data structure with the new tier names
      const submissionData = getEmptyTierList();
      
      // Using tier name mapping from constants
      
      // Track which commander-prestige combinations have been assigned
      const assignedCombinations = new Set();
      
      // Add each commander with prestige to its assigned tier
      entriesData.forEach(entry => {
        const commander = commandersData.find(c => c.id === entry.commander_id);
        const prestige = prestigesData.find(p => p.id === entry.prestige_id);
        // Use the tier directly as we no longer need to map old tier names
        const targetTier = entry.tier;
        
        if (commander) {
          // Create a unique key for this commander-prestige combination
          const combinationKey = `${commander.id}-${prestige ? prestige.id : 'default'}`;
          
          // Add to the appropriate tier (including UNASSIGNED/Never Played tier)
          if (submissionData[targetTier]) {
            submissionData[targetTier].push({
              commander: commander,
              prestigeId: prestige ? prestige.id : null,
              prestigeIndex: prestige ? prestige.index : null,
              prestigeName: prestige ? prestige.name : null
            });
            
            // Mark this combination as assigned
            assignedCombinations.add(combinationKey);
          }
        }
      });
      
      // Collect unassigned commanders with their prestiges
      const unassignedItems = [];
      
      commandersData.forEach(commander => {
        const commanderPrestiges = prestigesData.filter(p => p.commander_id === commander.id);
        
        // If there are prestiges, check each one separately
        if (commanderPrestiges.length > 0) {
          // Sort prestiges by ID first
          const sortedPrestiges = [...commanderPrestiges].sort((a, b) => {
            // Convert prestigeId to number for numeric comparison if they're strings
            const aId = typeof a.id === 'string' ? parseInt(a.id, 10) : a.id;
            const bId = typeof b.id === 'string' ? parseInt(b.id, 10) : b.id;
            return aId - bId;
          });
          
          sortedPrestiges.forEach(prestige => {
            const combinationKey = `${commander.id}-${prestige.id}`;
            
            // Only add if this combination hasn't been assigned to any tier yet
            if (!assignedCombinations.has(combinationKey)) {
              unassignedItems.push({
                commander: commander,
                prestigeId: prestige.id,
                prestigeIndex: prestige.index,
                prestigeName: prestige.name
              });
            }
          });
        } else {
          // If no prestiges, check the default commander
          const combinationKey = `${commander.id}-default`;
          
          // Only add if this combination hasn't been assigned to any tier yet
          if (!assignedCombinations.has(combinationKey)) {
            unassignedItems.push({
              commander: commander,
              prestigeId: null,
              prestigeIndex: null,
              prestigeName: null
            });
          }
        }
      });
      
      // Sort all unassigned items by commander ID and then by prestige ID
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
      submissionData[TIER_NAMES.UNASSIGNED] = unassignedItems;
      
      return submissionData;
    }
    
    return null;
  } catch (error) {
    console.error('Error in getUserSubmission:', error);
    return null;
  }
};

export const createUser = async (userData) => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select('id')
    .single();
  
  if (error) {
    console.error('Error creating user:', error);
    return null;
  }
  
  return data.id;
};

export const submitTierList = async (userId, submissionData) => {
  if (!userId || !submissionData) {
    console.error('Missing required parameters for submission');
    return false;
  }
  
  try {
    // Prepare submission entries for the submission_entries table
    const submissionEntries = [];
    Object.entries(submissionData).forEach(([tier, items]) => {
      if (tier !== TIER_NAMES.UNASSIGNED) {
        items.forEach(item => {
          // Handle both object format and ID format
          const commanderId = typeof item.commander === 'object' ? item.commander.id : item.commander;
          const prestigeId = item.prestigeId;
          
          submissionEntries.push({
            user_id: userId,
            commander_id: commanderId,
            tier: tier,
            prestige_id: prestigeId
          });
        });
      }
    });
    
    // Use a transaction to ensure all operations succeed or fail together
    const { error: transactionError } = await supabase.rpc('handle_submission_transaction', {
      p_user_id: userId,
      p_entries: JSON.stringify(submissionEntries)
    });
    
    if (transactionError) {
      console.warn('Transaction method failed, falling back to manual method:', transactionError);
      
      // First, delete all existing entries for this user
      const { error: deleteError } = await supabase
        .from('submission_entries')
        .delete()
        .eq('user_id', userId);
      
      if (deleteError) {
        console.error('Error deleting existing entries:', deleteError);
        return false;
      }
      
      // Then insert the new entries using upsert to handle potential duplicates
      if (submissionEntries.length > 0) {
        const { error: upsertError } = await supabase
          .from('submission_entries')
          .upsert(submissionEntries, { 
            onConflict: ['user_id', 'commander_id', 'prestige_id'],
            ignoreDuplicates: true
          });
        
        if (upsertError) {
          console.error('Error upserting submission entries:', upsertError);
          return false;
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error submitting tier list:', error);
    return false;
  }
};

// New function to handle a single tier change
export const submitSingleTierChange = async (userId, commanderId, prestigeId, newTier) => {
  if (!userId || !commanderId || newTier === undefined) {
    console.error('Missing required parameters for tier change submission');
    return false;
  }
  
  try {
    // First, check if this commander+prestige already exists in the database
    const { data: existingEntry, error: checkError } = await supabase
      .from('submission_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('commander_id', commanderId)
      .eq('prestige_id', prestigeId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
      console.error('Error checking existing entry:', checkError);
      return false;
    }
    
    // If entry exists, update it; otherwise insert a new one
    if (existingEntry) {
      // Update the existing entry with the new tier
      const { error: updateError } = await supabase
        .from('submission_entries')
        .update({ tier: newTier })
        .eq('user_id', userId)
        .eq('commander_id', commanderId)
        .eq('prestige_id', prestigeId);
      
      if (updateError) {
        console.error('Error updating tier entry:', updateError);
        return false;
      }
    } else {
      const newEntry = {
        user_id: userId,
        commander_id: commanderId,
        prestige_id: prestigeId,
        tier: newTier
      };
      
      const { error: insertError } = await supabase
        .from('submission_entries')
        .insert([newEntry]);
      
      if (insertError) {
        console.error('Error inserting new tier entry:', insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error submitting tier change:', error);
    return false;
  }
};

export const getAggregatedTierList = async () => {
  try {
    // First try to use the stored procedure
    try {
      const { data, error } = await supabase.rpc('get_most_common_tiers_for_commanders');
      
      if (!error && data) {
        // Process the stored procedure results
        return await processRawTierData(data);
      }
    } catch (procError) {
      console.warn('Stored procedure error:', procError);
      // Continue to fallback methods
    }
    
    console.warn('Stored procedure not available, using client-side aggregation');
    
    // Fetch all submission entries
    const { data: allEntries, error: entriesError } = await supabase
      .from('submission_entries')
      .select('commander_id, tier, prestige_id');
    
    if (entriesError || !allEntries) {
      console.error('Error fetching all entries:', entriesError);
      return getEmptyTierList();
    }
    
    // Process the entries on the client side
    return await processClientSideAggregation(allEntries);
  } catch (error) {
    console.error('Error in getAggregatedTierList:', error);
    return getEmptyTierList();
  }
};

// Helper function to process entries on the client side
async function processClientSideAggregation(entries) {
  // Group entries by commander_id and tier
  const tierCounts = {};
  
  entries.forEach(entry => {
    const commanderId = entry.commander_id;
    const prestigeId = entry.prestige_id || null;
    // Use the tier directly as we no longer need to map old tier names
    const tier = entry.tier;
    
    // Create a unique key for commander+prestige combination
    const commanderKey = `${commanderId}-${prestigeId || 'base'}`;
    
    if (!tierCounts[commanderKey]) {
      tierCounts[commanderKey] = {};
    }
    
    if (!tierCounts[commanderKey][tier]) {
      tierCounts[commanderKey][tier] = 0;
    }
    
    tierCounts[commanderKey][tier]++;
  });
  
  // Find the most common tier for each commander
  const result = getEmptyTierList();
  const processedCommanders = new Set();
  
  // Process each commander's tier counts
  Object.entries(tierCounts).forEach(([commanderKey, tiers]) => {
    let maxCount = 0;
    let mostCommonTier = null;
    
    // Find the tier with the highest count
    Object.entries(tiers).forEach(([tier, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommonTier = tier;
      }
    });
    
    if (mostCommonTier && result[mostCommonTier]) {
      // Parse the commander key back into commander ID and prestige ID
      const [commanderId, prestigeId] = commanderKey.split('-');
      
      // Create an item with both commander ID and prestige ID
      const item = {
        commander: parseInt(commanderId),
        prestigeId: prestigeId === 'base' ? null : parseInt(prestigeId)
      };
      
      result[mostCommonTier].push(item);
      processedCommanders.add(parseInt(commanderId));
    }
  });
  
  // Get all commanders to ensure we include unassigned ones
  return await addUnassignedCommanders(result, processedCommanders);
}

// Helper function to process raw tier data from SQL query
async function processRawTierData(data) {
  // Format the data into the expected structure
  const result = getEmptyTierList();
  
  if (!data || data.length === 0) {
    return result;
  }
  
  // Track commanders we've already processed (by commander_id and prestige_id)
  const processedCommanderKeys = new Set();
  const processedCommanders = new Set();
  
  // Process the data to find the most common tier for each commander + prestige combination
  data.forEach(item => {
    const commanderId = typeof item.commander_id === 'string' 
      ? parseInt(item.commander_id) 
      : item.commander_id;
    
    const prestigeId = item.prestige_id || null;
    // Handle both old and new stored procedure formats
    const tier = item.tier || item.most_common_tier;
    
    if (result[tier]) {
      // Create a unique key for this commander + prestige combination
      const commanderKey = `${commanderId}-${prestigeId || 'base'}`;
      
      // Only add if we haven't processed this exact commander + prestige combination
      if (!processedCommanderKeys.has(commanderKey)) {
        // Create an item with both commander ID and prestige ID
        const commanderItem = {
          commander: commanderId,
          prestigeId: prestigeId
        };
        
        result[tier].push(commanderItem);
        processedCommanderKeys.add(commanderKey);
        processedCommanders.add(commanderId);
      }
    }
  });
  
  // Add any unassigned commanders
  return await addUnassignedCommanders(result, processedCommanders);
}

// Helper function to add unassigned commanders
async function addUnassignedCommanders(result, processedCommanders) {
  try {
    // Get all commanders
    const { data: allCommanders, error } = await supabase
      .from('commanders')
      .select('id');
    
    if (error || !allCommanders) {
      console.error('Error fetching all commanders:', error);
      return result;
    }
    
    // Add any commanders that haven't been assigned to a tier
    allCommanders.forEach(commander => {
      if (!processedCommanders.has(commander.id)) {
        // Add as an object with commander ID and no prestige
        result[TIER_NAMES.UNASSIGNED].push({
          commander: commander.id,
          prestigeId: null
        });
      }
    });
    
    return result;
  } catch (error) {
    console.error('Error adding unassigned commanders:', error);
    return result;
  }
}

// Using getEmptyTierList imported from constants/tierNames.js
