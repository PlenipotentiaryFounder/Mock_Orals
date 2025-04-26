// Script to list all tables in the Supabase database
const { createClient } = require('@supabase/supabase-js');

// Supabase connection details
const supabaseUrl = 'https://fhungtciteyhlpuikoai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodW5ndGNpdGV5aGxwdWlrb2FpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzU5ODE1MywiZXhwIjoyMDUzMTc0MTUzfQ.KgKY62kPopDld3g1mekGqxcKEaw_kmE8nAcG2lqwXxE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  try {
    console.log('Listing all tables in the Supabase database...');
    
    // Query to get all tables in the public schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_schema, table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (error) {
      // If direct query doesn't work, try an alternative approach
      console.log(`Error: ${error.message}`);
      console.log('Trying an alternative approach...');
      
      // Try using a function call if available
      const { data: rpcData, error: rpcError } = await supabase.rpc('list_tables');
      
      if (rpcError) {
        throw new Error(`Failed to list tables: ${rpcError.message}`);
      }
      
      console.log('\nTables in the database:');
      console.log('---------------------');
      
      if (rpcData && rpcData.length > 0) {
        rpcData.forEach(table => {
          console.log(`- ${table.schema}.${table.name}`);
        });
      } else {
        console.log('No tables found or no permission to list tables.');
      }
    } else {
      console.log('\nTables in the database:');
      console.log('---------------------');
      
      if (data && data.length > 0) {
        data.forEach(table => {
          console.log(`- ${table.table_schema}.${table.table_name}`);
        });
        
        console.log(`\nTotal tables found: ${data.length}`);
      } else {
        console.log('No tables found in the public schema.');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the function
listTables(); 