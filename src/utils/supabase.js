import { createClient } from '@supabase/supabase-js';

// Get Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Global statistics will not be available.');
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Increment global listening time
 * @param {number} seconds - Number of seconds to add
 */
export async function incrementGlobalListeningTime(seconds) {
  if (!supabase) return null;
  
  try {
    // First, get current value
    const { data: currentData, error: fetchError } = await supabase
      .from('global_stats')
      .select('total_listening_seconds')
      .eq('id', 1)
      .single();
    
    if (fetchError) {
      console.error('Error fetching current stats:', fetchError);
      return null;
    }
    
    // Update with new value (atomic increment)
    const newValue = (parseFloat(currentData.total_listening_seconds) || 0) + seconds;
    const { error: updateError } = await supabase
      .from('global_stats')
      .update({ 
        total_listening_seconds: newValue,
        updated_at: new Date().toISOString()
      })
      .eq('id', 1);
    
    if (updateError) {
      console.error('Error updating global listening time:', updateError);
      return null;
    }
    
    return true;
  } catch (error) {
    console.error('Error incrementing global listening time:', error);
    return null;
  }
}

/**
 * Get global listening time statistics
 * @returns {Promise<{totalSeconds: number} | null>}
 */
export async function getGlobalListeningStats() {
  if (!supabase) {
    console.warn('Supabase not initialized. Check your environment variables.');
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('global_stats')
      .select('total_listening_seconds')
      .eq('id', 1)
      .single();
    
    if (error) {
      console.error('Error fetching global stats:', error);
      // If table doesn't exist or row doesn't exist, return 0 instead of null
      if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
        return { totalSeconds: 0 };
      }
      return null;
    }
    
    return {
      totalSeconds: parseFloat(data?.total_listening_seconds) || 0
    };
  } catch (error) {
    console.error('Error fetching global stats:', error);
    return null;
  }
}

