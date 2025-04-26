// Use the project's supabase client configuration
const { createClient } = require('@supabase/supabase-js');

// Get connection details from environment variables if available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://psnorowqvedupuievxnh.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzbm9yb3dxdmVkdXB1aWV2eG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQ2NjI2NzYsImV4cCI6MjAzMDIzODY3Nn0.1bk_Ks2d0_vIbcvj0o1_nDf9dOCKZYPQGDdVMKoVLws';

console.log('Connecting with URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudentsTable() {
  try {
    console.log('Querying Supabase...');
    
    // Try to fetch a single row from students to check the table structure
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .limit(1);
    
    if (error) {
      throw new Error(`Failed to query students table: ${error.message}`);
    }
    
    console.log('\nResults from students table:');
    console.log('------------------------');
    
    if (data && data.length > 0) {
      console.log('Found records in students table!');
      
      // Display the columns present in the data
      const sampleRow = data[0];
      console.log('\nStudents Table Columns:');
      Object.keys(sampleRow).forEach(column => {
        console.log(`- ${column}: ${typeof sampleRow[column]} (Sample value: ${sampleRow[column]})`);
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
    
    // Try to fetch RLS status - this may not work with anon key
    console.log('\nAttempting to check RLS status... (may not work with anon key)');
    try {
      const { data: rlsData, error: rlsError } = await supabase
        .from('pg_class')
        .select('relrowsecurity')
        .eq('relname', 'students')
        .single();
      
      if (rlsError) {
        console.log(`Could not check RLS status: ${rlsError.message}`);
        console.log('You will need to check RLS status through the Supabase dashboard.');
      } else if (rlsData) {
        console.log(`Row Level Security (RLS) is ${rlsData.relrowsecurity ? 'ENABLED' : 'DISABLED'} on the students table.`);
      }
    } catch (rlsCheckError) {
      console.log('RLS status check failed. This is expected with anon key.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the function
checkStudentsTable(); 