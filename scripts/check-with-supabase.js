// Using the Supabase client that's already installed
const { createClient } = require('@supabase/supabase-js');

// Supabase connection details
const supabaseUrl = 'https://psnorowqvedupuievxnh.supabase.co';
const supabaseKey = 'B9bB1lh0oGvp4Ekk'; // This is the anon key from your .env
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStudentsTable() {
  try {
    console.log('Connecting to Supabase...');
    
    // Get the column information for public.students table using rpc
    const { data: columns, error: columnsError } = await supabase.rpc('get_table_columns', {
      p_schema: 'public',
      p_table: 'students'
    });
    
    if (columnsError) {
      // If RPC doesn't work, try direct query (might not work with anon key)
      console.log('Trying direct query instead...');
      
      const { data: directColumns, error: directError } = await supabase
        .from('students')
        .select('*')
        .limit(1);
      
      if (directError) {
        throw new Error(`Direct query failed: ${directError.message}`);
      }
      
      console.log('\nStudents Table Columns (based on sample row):');
      console.log('-------------------------------------');
      
      if (directColumns && directColumns.length > 0) {
        const sampleRow = directColumns[0];
        Object.keys(sampleRow).forEach(columnName => {
          console.log(`Column: ${columnName}`);
          console.log(`  Value Type: ${typeof sampleRow[columnName]}`);
          console.log('');
        });
        
        // Check if there's a user_id column
        if (Object.keys(sampleRow).includes('user_id')) {
          console.log("The 'students' table has a 'user_id' column that can be used for RLS policies.");
        } else {
          console.log("WARNING: The 'students' table does NOT have a 'user_id' column.");
          console.log("You need to add a 'user_id' column to link students to auth.users for proper RLS.");
        }
      } else {
        console.log('No data found in students table.');
      }
    } else {
      // If RPC worked
      console.log('\nStudents Table Structure:');
      console.log('------------------------');
      
      columns.forEach(column => {
        console.log(`Column: ${column.column_name}`);
        console.log(`  Data Type: ${column.data_type}`);
        console.log(`  Nullable: ${column.is_nullable === 'YES' ? 'YES' : 'NO'}`);
        console.log('');
      });
      
      // Check if there's a user_id column connecting to auth.users
      const hasUserIdColumn = columns.some(col => col.column_name === 'user_id');
      
      if (hasUserIdColumn) {
        console.log("The 'students' table has a 'user_id' column that can be used for RLS policies.");
      } else {
        console.log("WARNING: The 'students' table does NOT have a 'user_id' column.");
        console.log("You need to add a 'user_id' column to link students to auth.users for proper RLS.");
      }
    }
    
    // Try to check RLS status (might not work with anon key)
    console.log('\nAttempting to check RLS status...');
    const { data: rlsStatus, error: rlsError } = await supabase.rpc('check_rls_enabled', {
      p_schema: 'public',
      p_table: 'students'
    });
    
    if (rlsError) {
      console.log('Could not check RLS status through RPC.');
      console.log('Note: RLS status checking typically requires more privileges than the anon key provides.');
      console.log('You will need to check RLS status through the Supabase dashboard.');
    } else {
      console.log(`Row Level Security (RLS) is ${rlsStatus ? 'ENABLED' : 'DISABLED'} on the students table.`);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the function
checkStudentsTable(); 