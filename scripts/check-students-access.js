// Script to check if we can access student data with the anon key
const { createClient } = require('@supabase/supabase-js');

// Correct Supabase connection details
const supabaseUrl = 'https://psnorowqvedupuievxnh.supabase.co';
// Using anon key to simulate browser client access
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzbm9yb3dxdmVkdXB1aWV2eG5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NDMyODUsImV4cCI6MjA2MTExOTI4NX0.eGnWWq3sGhc3IEjF-n1jburouBNV5HUYqaUF0VT3gvE';

// Using service role key for comparison
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzbm9yb3dxdmVkdXB1aWV2eG5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTU0MzI4NSwiZXhwIjoyMDYxMTE5Mjg1fQ.fLjOD6z0l2XjxGUBOeqKHIwn5WQuVcbdbrvV2GgYt9g';

console.log('Testing access to students table...');

async function checkAccess() {
  try {
    // Create clients with different keys
    const anonClient = createClient(supabaseUrl, anonKey);
    const serviceClient = createClient(supabaseUrl, serviceKey);
    
    // 1. Try anon key access to students
    console.log('\nAnon Key Access Test:');
    console.log('-------------------');
    try {
      const { data: anonData, error: anonError } = await anonClient
        .from('students')
        .select('*');
      
      if (anonError) {
        console.log(`✗ Anon key access denied: ${anonError.message}`);
      } else {
        console.log('✓ Anon key access succeeded');
        if (anonData && anonData.length > 0) {
          console.log(`Found ${anonData.length} student records with anon key.`);
          console.log(`First record: ${JSON.stringify(anonData[0])}`);
        } else {
          console.log('No student records found (empty table or filtered by RLS).');
        }
      }
    } catch (e) {
      console.log(`✗ Anon key access error: ${e.message}`);
    }
    
    // 2. Try service role access to students
    console.log('\nService Role Key Access Test:');
    console.log('--------------------------');
    try {
      const { data: serviceData, error: serviceError } = await serviceClient
        .from('students')
        .select('*');
      
      if (serviceError) {
        console.log(`✗ Service role access denied: ${serviceError.message}`);
      } else {
        console.log('✓ Service role access succeeded');
        if (serviceData && serviceData.length > 0) {
          console.log(`Found ${serviceData.length} student records with service role.`);
          console.log(`First record: ${JSON.stringify(serviceData[0])}`);
        } else {
          console.log('No student records found (empty table).');
        }
      }
    } catch (e) {
      console.log(`✗ Service role access error: ${e.message}`);
    }
    
    // 3. Check specifically for auth.users
    console.log('\nAuth Users Table Check:');
    console.log('--------------------');
    try {
      const { data: authData, error: authError } = await serviceClient
        .from('auth.users')
        .select('*')
        .limit(1);
      
      if (authError) {
        console.log(`✗ Cannot access auth.users: ${authError.message}`);
      } else {
        console.log('✓ Successfully accessed auth.users');
        if (authData && authData.length > 0) {
          console.log(`Found ${authData.length} user(s) in auth.users.`);
        } else {
          console.log('No users found in auth.users.');
        }
      }
    } catch (e) {
      console.log(`✗ Auth users access error: ${e.message}`);
    }
  } catch (error) {
    console.error('General error:', error.message);
  }
}

checkAccess(); 