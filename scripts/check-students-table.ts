import sql from '../lib/postgres'

// Self-invoking async function to allow for await
;(async () => {
  try {
    console.log('Connecting to PostgreSQL database...')
    
    // Query to get the column information for public.students table
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'students'
      ORDER BY ordinal_position;
    `
    
    console.log('\nStudents Table Structure:')
    console.log('------------------------')
    
    columns.forEach(column => {
      console.log(`Column: ${column.column_name}`)
      console.log(`  Data Type: ${column.data_type}`)
      console.log(`  Nullable: ${column.is_nullable}`)
      console.log(`  Default: ${column.column_default}`)
      console.log('')
    })
    
    // Check if there's a user_id column connecting to auth.users
    const hasUserIdColumn = await sql`
      SELECT 
          COUNT(*) AS has_user_id_column
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = 'students'
      AND column_name = 'user_id';
    `
    
    const userIdCount = parseInt(hasUserIdColumn[0].has_user_id_column)
    
    if (userIdCount > 0) {
      console.log("The 'students' table has a 'user_id' column that can be used for RLS policies.")
    } else {
      console.log("WARNING: The 'students' table does NOT have a 'user_id' column.")
      console.log("You need to add a 'user_id' column to link students to auth.users for proper RLS.")
    }
    
    // Check if RLS is enabled on the students table
    const rlsStatus = await sql`
      SELECT 
          nspname || '.' || relname AS table_name,
          relrowsecurity AS rls_enabled
      FROM pg_class
      JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
      WHERE nspname = 'public' AND relname = 'students';
    `
    
    console.log('\nRLS Status:')
    if (rlsStatus.length > 0) {
      const isEnabled = rlsStatus[0].rls_enabled
      if (isEnabled) {
        console.log("Row Level Security (RLS) is ENABLED on the students table.")
      } else {
        console.log("Row Level Security (RLS) is DISABLED on the students table.")
      }
    } else {
      console.log("Could not determine RLS status.")
    }
    
    // Close the connection pool
    await sql.end()
    console.log('\nDatabase connection closed.')
  } catch (error) {
    console.error('Error querying PostgreSQL:', error)
  }
})() 