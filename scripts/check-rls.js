// Script to check RLS status on students table
const { createClient } = require('@supabase/supabase-js');

// Correct Supabase connection details
const supabaseUrl = 'https://psnorowqvedupuievxnh.supabase.co';
// Using service role key for admin access
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzbm9yb3dxdmVkdXB1aWV2eG5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTU0MzI4NSwiZXhwIjoyMDYxMTE5Mjg1fQ.fLjOD6z0l2XjxGUBOeqKHIwn5WQuVcbdbrvV2GgYt9g';

console.log('Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRlsStatus() {
  try {
    // Direct SQL query to check RLS status
    const { data, error } = await supabase.rpc('admin_query', {
      query: `
        SELECT 
          c.relname as table_name,
          CASE WHEN c.relrowsecurity THEN 'enabled' ELSE 'disabled' END as rls_status
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind = 'r'
        ORDER BY c.relname;
      `
    });
    
    if (error) {
      console.log(`Error checking RLS status through RPC: ${error.message}`);
      console.log('Trying alternative approach...');
      
      // Let's just try to access the students table with the anon key
      const anonClient = createClient(
        supabaseUrl, 
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzbm9yb3dxdmVkdXB1aWV2eG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NDMyODUsImV4cCI6MjA2MTExOTI4NX0.eGnWWq3sGhc3IEjF-n1jburouBNV5HUYqaUF0VT3gvE'
      );
      
      console.log('\nAttempting to access students table with anon key (if RLS is enabled without policies, this should fail)...');
      const { data: anonData, error: anonError } = await anonClient
        .from('students')
        .select('*')
        .limit(1);
      
      if (anonError) {
        console.log(`Access denied with anon key: ${anonError.message}`);
        console.log('This suggests RLS is enabled but no policy allows anonymous access.');
      } else {
        console.log('Access succeeded with anon key.');
        if (anonData && anonData.length > 0) {
          console.log(`Retrieved ${anonData.length} record(s).`);
          console.log('This suggests either RLS is disabled or a policy allows anonymous access.');
        } else {
          console.log('No records found, but no permission error either.');
        }
      }
    } else {
      console.log('\nRLS Status for Tables:');
      console.log('---------------------');
      
      if (data && data.length > 0) {
        data.forEach(row => {
          console.log(`- ${row.table_name}: RLS ${row.rls_status}`);
        });
      } else {
        console.log('No tables found or RPC returned empty result.');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkRlsStatus(); 