// Script to check tables with the correct Supabase credentials
const { createClient } = require('@supabase/supabase-js');

// Correct Supabase connection details
const supabaseUrl = 'https://psnorowqvedupuievxnh.supabase.co';
// Using service role key for comprehensive access
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzbm9yb3dxdmVkdXB1aWV2eG5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTU0MzI4NSwiZXhwIjoyMDYxMTE5Mjg1fQ.fLjOD6z0l2XjxGUBOeqKHIwn5WQuVcbdbrvV2GgYt9g';

console.log('Connecting to Supabase:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  try {
    console.log('\nChecking for specific tables...');
    
    // Check each expected table
    const tablesToCheck = [
      'students', 
      'sessions', 
      'areas', 
      'tasks', 
      'elements', 
      'templates', 
      'instructor_notes', 
      'sample_questions', 
      'scenarios', 
      'session_elements', 
      'session_tasks'
    ];
    
    const existingTables = [];
    const missingTables = [];
    
    for (const table of tablesToCheck) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`- ${table}: Does NOT exist or no access (${error.message})`);
          missingTables.push(table);
        } else {
          console.log(`- ${table}: EXISTS`);
          existingTables.push(table);
        }
      } catch (e) {
        console.log(`- ${table}: Error checking (${e.message})`);
        missingTables.push(table);
      }
    }
    
    console.log('\nSummary:');
    console.log(`Existing tables: ${existingTables.length === 0 ? 'None' : existingTables.join(', ')}`);
    console.log(`Missing tables: ${missingTables.length === 0 ? 'None' : missingTables.join(', ')}`);
    
    // If students table exists, check its structure
    if (existingTables.includes('students')) {
      console.log('\nChecking students table structure...');
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .limit(1);
      
      if (!error && data && data.length > 0) {
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
        console.log('No data found in students table or error accessing it.');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the function
listTables(); 