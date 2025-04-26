// Using proper credentials for Supabase
const { createClient } = require('@supabase/supabase-js');

// Updated Supabase connection details
const supabaseUrl = 'https://fhungtciteyhlpuikoai.supabase.co';
// Using service role key for comprehensive access
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZodW5ndGNpdGV5aGxwdWlrb2FpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzU5ODE1MywiZXhwIjoyMDUzMTc0MTUzfQ.KgKY62kPopDld3g1mekGqxcKEaw_kmE8nAcG2lqwXxE';

console.log('Connecting to Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudentsTable() {
  try {
    console.log('Querying students table...');
    
    // Try to fetch a single row from students
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .limit(5);
    
    if (error) {
      throw new Error(`Failed to query students table: ${error.message}`);
    }
    
    console.log('\nResults from students table:');
    console.log('------------------------');
    
    if (data && data.length > 0) {
      console.log(`Found ${data.length} records in students table!`);
      
      // Display the first record
      const sampleRow = data[0];
      console.log('\nStudents Table Columns:');
      Object.keys(sampleRow).forEach(column => {
        console.log(`- ${column}: ${typeof sampleRow[column]} (Sample value: ${JSON.stringify(sampleRow[column])})`);
      });
      
      // Check if there's a user_id column connecting to auth.users
      if (Object.keys(sampleRow).includes('user_id')) {
        console.log("\nThe 'students' table has a 'user_id' column that can be used for RLS policies.");
      } else {
        console.log("\nWARNING: The 'students' table does NOT have a 'user_id' column.");
        console.log("You need to add a 'user_id' column to link students to auth.users for proper RLS.");
      }
    } else {
      console.log('No data found in students table.');
    }
    
    // Check table structure from information schema
    console.log('\nQuerying table structure from information schema...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'students')
      .order('ordinal_position');
    
    if (columnsError) {
      console.log(`Could not query information schema: ${columnsError.message}`);
    } else if (columns && columns.length > 0) {
      console.log('\nStudents Table Structure (from information schema):');
      console.log('---------------------------------------------');
      
      columns.forEach(column => {
        console.log(`Column: ${column.column_name}`);
        console.log(`  Data Type: ${column.data_type}`);
        console.log(`  Nullable: ${column.is_nullable}`);
        console.log(`  Default: ${column.column_default}`);
        console.log('');
      });
      
      // Check for user_id column
      const hasUserIdColumn = columns.some(col => col.column_name === 'user_id');
      if (hasUserIdColumn) {
        console.log("The 'students' table has a 'user_id' column that can be used for RLS policies.");
      } else {
        console.log("WARNING: The 'students' table does NOT have a 'user_id' column.");
        console.log("You need to add a 'user_id' column to link students to auth.users for proper RLS.");
      }
    } else {
      console.log('No column information found for students table.');
    }
    
    // Check if RLS is enabled on the students table
    console.log('\nChecking RLS status...');
    const { data: rlsData, error: rlsError } = await supabase
      .from('pg_catalog.pg_class')
      .select('relrowsecurity')
      .eq('relname', 'students')
      .single();
    
    if (rlsError) {
      console.log(`Could not check RLS status from pg_catalog: ${rlsError.message}`);
      
      // Alternative approach
      console.log('Trying alternative approach for RLS status...');
      const { data: rlsInfo, error: rlsInfoError } = await supabase.rpc('get_rls_status', { 
        table_name: 'students'
      });
      
      if (rlsInfoError) {
        console.log(`RPC check failed: ${rlsInfoError.message}`);
        console.log('You will need to check RLS status through the Supabase dashboard.');
      } else if (rlsInfo !== null) {
        console.log(`Row Level Security (RLS) is ${rlsInfo ? 'ENABLED' : 'DISABLED'} on the students table.`);
      }
    } else if (rlsData) {
      console.log(`Row Level Security (RLS) is ${rlsData.relrowsecurity ? 'ENABLED' : 'DISABLED'} on the students table.`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the function
checkStudentsTable(); 