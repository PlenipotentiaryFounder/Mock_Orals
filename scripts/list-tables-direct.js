// Script to list all tables using a direct SQL query
const { createClient } = require('@supabase/supabase-js');

// Supabase connection details
const supabaseUrl = 'https://fhungtciteyhlpuikoai.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodW5ndGNpdGV5aGxwdWlrb2FpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzU5ODE1MywiZXhwIjoyMDUzMTc0MTUzfQ.KgKY62kPopDld3g1mekGqxcKEaw_kmE8nAcG2lqwXxE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllTables() {
  try {
    console.log('Getting list of tables in public schema...');
    
    // Using executeRaw functionality to run SQL directly if available
    // If not, it will throw an error which we'll catch
    try {
      // Approach 1: Using a PostgreSQL query to list tables
      const { data, error } = await supabase.rpc('execute_sql', {
        query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      });
      
      if (error) throw error;
      
      console.log('\nTables in public schema:');
      console.log('-----------------------');
      
      if (data && data.length > 0) {
        data.forEach(row => {
          console.log(`- ${row.table_name}`);
        });
      } else {
        console.log('No tables found.');
      }
    } catch (rpcError) {
      console.log(`RPC method not available: ${rpcError.message}`);
      
      // Let's try a different approach
      console.log('\nTrying to check for specific tables we expect to exist...');
      
      // Check if the 'areas' table exists (from your earlier file structure)
      const { data: areasData, error: areasError } = await supabase
        .from('areas')
        .select('id')
        .limit(1);
      
      if (areasError) {
        console.log(`- areas table: Does NOT exist or no access (${areasError.message})`);
      } else {
        console.log('- areas table: EXISTS');
      }
      
      // Check if the 'templates' table exists
      const { data: templatesData, error: templatesError } = await supabase
        .from('templates')
        .select('id')
        .limit(1);
      
      if (templatesError) {
        console.log(`- templates table: Does NOT exist or no access (${templatesError.message})`);
      } else {
        console.log('- templates table: EXISTS');
      }
      
      // Check if the 'students' table exists
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .limit(1);
      
      if (studentsError) {
        console.log(`- students table: Does NOT exist or no access (${studentsError.message})`);
      } else {
        console.log('- students table: EXISTS');
      }
      
      // Check if the 'sessions' table exists
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('id')
        .limit(1);
      
      if (sessionsError) {
        console.log(`- sessions table: Does NOT exist or no access (${sessionsError.message})`);
      } else {
        console.log('- sessions table: EXISTS');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the function
listAllTables(); 