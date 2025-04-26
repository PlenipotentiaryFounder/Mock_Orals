// Simple JavaScript version without requiring TypeScript compilation
const { Client } = require('pg');

const connectionString = 'postgresql://postgres:B9bB1lh0oGvp4Ekk@db.psnorowqvedupuievxnh.supabase.co:5432/postgres';

async function checkStudentsTable() {
  const client = new Client({
    connectionString,
  });

  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();
    
    // Query to get the column information for public.students table
    const columnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'students'
      ORDER BY ordinal_position;
    `);
    
    console.log('\nStudents Table Structure:');
    console.log('------------------------');
    
    columnsResult.rows.forEach(column => {
      console.log(`Column: ${column.column_name}`);
      console.log(`  Data Type: ${column.data_type}`);
      console.log(`  Nullable: ${column.is_nullable}`);
      console.log(`  Default: ${column.column_default}`);
      console.log('');
    });
    
    // Check if there's a user_id column connecting to auth.users
    const userIdResult = await client.query(`
      SELECT 
          COUNT(*) AS has_user_id_column
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'students'
      AND column_name = 'user_id';
    `);
    
    const userIdCount = parseInt(userIdResult.rows[0].has_user_id_column);
    
    if (userIdCount > 0) {
      console.log("The 'students' table has a 'user_id' column that can be used for RLS policies.");
    } else {
      console.log("WARNING: The 'students' table does NOT have a 'user_id' column.");
      console.log("You need to add a 'user_id' column to link students to auth.users for proper RLS.");
    }
    
    // Check if RLS is enabled on the students table
    const rlsResult = await client.query(`
      SELECT 
          nspname || '.' || relname AS table_name,
          relrowsecurity AS rls_enabled
      FROM pg_class
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
      WHERE nspname = 'public' AND relname = 'students';
    `);
    
    console.log('\nRLS Status:');
    if (rlsResult.rows.length > 0) {
      const isEnabled = rlsResult.rows[0].rls_enabled;
      if (isEnabled) {
        console.log("Row Level Security (RLS) is ENABLED on the students table.");
      } else {
        console.log("Row Level Security (RLS) is DISABLED on the students table.");
      }
    } else {
      console.log("Could not determine RLS status.");
    }
  } catch (error) {
    console.error('Error querying PostgreSQL:', error);
  } finally {
    // Close the connection
    await client.end();
    console.log('\nDatabase connection closed.');
  }
}

// Run the function
checkStudentsTable(); 