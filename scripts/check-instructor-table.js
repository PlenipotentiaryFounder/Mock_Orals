// Script to check instructor table structure
const { createClient } = require('@supabase/supabase-js');

// Supabase connection details
const supabaseUrl = 'https://psnorowqvedupuievxnh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzbm9yb3dxdmVkdXB1aWV2eG5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTU0MzI4NSwiZXhwIjoyMDYxMTE5Mjg1fQ.fLjOD6z0l2XjxGUBOeqKHIwn5WQuVcbdbrvV2GgYt9g';

console.log('Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInstructorTable() {
  try {
    // Check if instructor table exists
    const { data: instructorData, error: instructorError } = await supabase
      .from('instructor')
      .select('*')
      .limit(1);
    
    if (instructorError) {
      console.log(`❌ Instructor table error: ${instructorError.message}`);
      
      if (instructorError.message.includes('does not exist')) {
        console.log('\nInstructor table needs to be created. Add this to your SQL script:');
        console.log(`
CREATE TABLE public.instructor (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  pilot_cert_held UUID REFERENCES public.pilot_certifications(id),
  is_cfi BOOLEAN DEFAULT false,
  is_cfii BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.instructor ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_instructor ON public.instructor
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY insert_own_instructor ON public.instructor
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY update_own_instructor ON public.instructor
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY delete_own_instructor ON public.instructor
  FOR DELETE USING (auth.uid() = id);
`);
      }
    } else {
      console.log('✅ Instructor table exists');
      
      if (instructorData && instructorData.length > 0) {
        console.log('\nInstructor table columns:');
        Object.keys(instructorData[0]).forEach(column => {
          const value = instructorData[0][column];
          const valueType = typeof value;
          const displayValue = value === null ? 'null' : 
            (valueType === 'object' ? JSON.stringify(value).substring(0, 50) : value);
          
          console.log(`  - ${column}: ${valueType} (Example: ${displayValue})`);
        });
      } else {
        console.log('Instructor table is empty');
      }
    }
    
    // Check students table structure
    const { data: studentsData, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .limit(1);
    
    if (studentsError) {
      console.log(`\n❌ Students table error: ${studentsError.message}`);
    } else {
      console.log('\n✅ Students table exists');
      
      if (studentsData && studentsData.length > 0) {
        console.log('\nStudents table columns:');
        Object.keys(studentsData[0]).forEach(column => {
          const value = studentsData[0][column];
          const valueType = typeof value;
          const displayValue = value === null ? 'null' : 
            (valueType === 'object' ? JSON.stringify(value).substring(0, 50) : value);
          
          console.log(`  - ${column}: ${valueType} (Example: ${displayValue})`);
        });
        
        // Check if the students table has the certificate columns
        const hasHeldCert = 'pilot_cert_held' in studentsData[0];
        const hasDesiredCert = 'pilot_cert_desired' in studentsData[0];
        
        if (!hasHeldCert || !hasDesiredCert) {
          console.log('\nStudents table needs to be updated. Add this to your SQL script:');
          
          if (!hasHeldCert) {
            console.log(`
ALTER TABLE public.students 
ADD COLUMN pilot_cert_held UUID REFERENCES public.pilot_certifications(id);`);
          }
          
          if (!hasDesiredCert) {
            console.log(`
ALTER TABLE public.students 
ADD COLUMN pilot_cert_desired UUID REFERENCES public.pilot_certifications(id);`);
          }
        }
      } else {
        console.log('Students table is empty');
      }
    }
    
    // Check for RLS policies
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('get_policies', { table_name: 'students' })
      .catch(() => ({ error: { message: 'Function get_policies does not exist' } }));
    
    if (rlsError) {
      console.log(`\n❌ Could not check RLS policies: ${rlsError.message}`);
      console.log('\nYou need to enable RLS on your tables and create appropriate policies.');
    } else if (rlsData && rlsData.length > 0) {
      console.log('\n✅ RLS policies exist for students table:');
      rlsData.forEach(policy => {
        console.log(`  - ${policy.policyname}`);
      });
    } else {
      console.log('\n❓ No RLS policies found for students table.');
      console.log('Verify RLS is enabled with proper policies.');
    }
    
  } catch (error) {
    console.error('General error:', error.message);
  }
}

checkInstructorTable(); 