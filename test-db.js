import { supabase } from './src/integrations/supabase/client';

const testConnection = async () => {
  console.log('Testing Supabase connection...');

  if (!supabase) {
    console.error('Supabase client is null');
    return;
  }

  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('cities')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('Connection test failed:', error);
      return;
    }

    console.log('Connection successful! Cities count:', data?.length || 0);

    // Test getting actual cities data
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('*')
      .limit(5);

    if (citiesError) {
      console.error('Error fetching cities:', citiesError);
      return;
    }

    console.log('Sample cities data:', cities);
    console.log('Cities found:', cities?.length || 0);
  } catch (err) {
    console.error('Unexpected error:', err);
  }
};

// Auto-run in browser console
testConnection();