// Script to apply database fixes for the registration flow
const { createClient } = require('@supabase/supabase-js');

// Supabase connection details
const supabaseUrl = 'https://psnorowqvedupuievxnh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzbm9yb3dxdmVkdXB1aWV2eG5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTU0MzI4NSwiZXhwIjoyMDYxMTE5Mjg1fQ.fLjOD6z0l2XjxGUBOeqKHIwn5WQuVcbdbrvV2GgYt9g';

console.log('Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Execute SQL statements through Supabase
 */
async function executeSQL(sql, name) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.log(`❌ Failed to execute ${name}: ${error.message}`);
      return false;
    }
    
    console.log(`✅ Successfully executed ${name}`);
    return true;
  } catch (e) {
    console.error(`❌ Error in ${name}: ${e.message}`);
    return false;
  }
}

/**
 * Apply all database fixes
 */
async function applyDatabaseFixes() {
  console.log('Starting database fixes...');
  
  // 1. Check if instructor table exists
  const { data: existingInstructorTable, error: tableError } = await supabase
    .from('instructor')
    .select('*')
    .limit(1);
  
  // 2. Create or modify instructor table
  if (tableError && tableError.message.includes('does not exist')) {
    console.log('Creating instructor table...');
    
    const createInstructorTableSQL = `
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
    `;
    
    await executeSQL(createInstructorTableSQL, 'Create instructor table');
  } else {
    console.log('Instructor table already exists, checking schema...');
    
    // Check columns
    if (existingInstructorTable && existingInstructorTable.length > 0) {
      const row = existingInstructorTable[0];
      
      // Check if id column is UUID
      if (!row.id) {
        console.log('Adding id column to instructor table...');
        await executeSQL(
          'ALTER TABLE public.instructor ADD COLUMN id UUID PRIMARY KEY REFERENCES auth.users(id);',
          'Add id column to instructor'
        );
      } else {
        console.log('✅ Instructor table has id column');
      }
      
      // Check if pilot_cert_held column exists
      if (!('pilot_cert_held' in row)) {
        console.log('Adding pilot_cert_held column to instructor table...');
        await executeSQL(
          'ALTER TABLE public.instructor ADD COLUMN pilot_cert_held UUID REFERENCES public.pilot_certifications(id);',
          'Add pilot_cert_held to instructor'
        );
      } else {
        console.log('✅ Instructor table has pilot_cert_held column');
      }
      
      // Check if CFI/CFII columns exist
      if (!('is_cfi' in row)) {
        console.log('Adding CFI columns to instructor table...');
        await executeSQL(
          'ALTER TABLE public.instructor ADD COLUMN is_cfi BOOLEAN DEFAULT false;',
          'Add is_cfi to instructor'
        );
      } else {
        console.log('✅ Instructor table has is_cfi column');
      }
      
      if (!('is_cfii' in row)) {
        console.log('Adding CFII columns to instructor table...');
        await executeSQL(
          'ALTER TABLE public.instructor ADD COLUMN is_cfii BOOLEAN DEFAULT false;',
          'Add is_cfii to instructor'
        );
      } else {
        console.log('✅ Instructor table has is_cfii column');
      }
    } else {
      console.log('Instructor table exists but is empty');
    }
  }
  
  // 3. Enable RLS on the instructor table
  console.log('Enabling Row Level Security on instructor table...');
  await executeSQL(
    'ALTER TABLE public.instructor ENABLE ROW LEVEL SECURITY;',
    'Enable RLS on instructor'
  );
  
  // 4. Create RLS policies for instructor table
  console.log('Creating RLS policies for instructor table...');
  
  // First check if policies exist
  const { data: policies, error: policiesError } = await supabase.rpc('get_policies', {
    table_name: 'instructor'
  }).catch(() => ({ data: null, error: { message: 'Could not check policies' } }));
  
  if (policiesError) {
    console.log('Could not check existing policies, attempting to create them anyway...');
  }
  
  const hasPolicy = policies && policies.length > 0;
  
  if (!hasPolicy) {
    // Create SELECT policy
    await executeSQL(
      `CREATE POLICY select_own_instructor ON public.instructor
        FOR SELECT USING (auth.uid() = id);`,
      'Create SELECT policy for instructor'
    );
    
    // Create INSERT policy
    await executeSQL(
      `CREATE POLICY insert_own_instructor ON public.instructor
        FOR INSERT WITH CHECK (auth.uid() = id);`,
      'Create INSERT policy for instructor'
    );
    
    // Create UPDATE policy
    await executeSQL(
      `CREATE POLICY update_own_instructor ON public.instructor
        FOR UPDATE USING (auth.uid() = id);`,
      'Create UPDATE policy for instructor'
    );
    
    // Create DELETE policy
    await executeSQL(
      `CREATE POLICY delete_own_instructor ON public.instructor
        FOR DELETE USING (auth.uid() = id);`,
      'Create DELETE policy for instructor'
    );
  } else {
    console.log('✅ Policies already exist for instructor table');
  }
  
  // 5. Create updated_at trigger function if it doesn't exist
  console.log('Ensuring updated_at trigger function exists...');
  await executeSQL(
    `CREATE OR REPLACE FUNCTION public.set_updated_at()
     RETURNS TRIGGER AS $$
     BEGIN
       NEW.updated_at = NOW();
       RETURN NEW;
     END;
     $$ LANGUAGE plpgsql;`,
    'Create updated_at trigger function'
  );
  
  // 6. Create triggers for instructor table
  console.log('Creating updated_at trigger for instructor table...');
  await executeSQL(
    `DROP TRIGGER IF EXISTS set_instructor_updated_at ON public.instructor;
     CREATE TRIGGER set_instructor_updated_at
     BEFORE UPDATE ON public.instructor
     FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();`,
    'Create updated_at trigger for instructor'
  );
  
  // 7. Verify students table schema
  const { data: studentsData, error: studentsError } = await supabase
    .from('students')
    .select('*')
    .limit(1);
  
  if (!studentsError && studentsData) {
    console.log('Checking students table schema...');
    
    // Check if pilot_cert_held exists
    if (studentsData.length > 0) {
      const studentRow = studentsData[0];
      
      if (!('pilot_cert_held' in studentRow)) {
        console.log('Adding pilot_cert_held column to students table...');
        await executeSQL(
          'ALTER TABLE public.students ADD COLUMN pilot_cert_held UUID REFERENCES public.pilot_certifications(id);',
          'Add pilot_cert_held to students'
        );
      } else {
        console.log('✅ Students table has pilot_cert_held column');
      }
      
      if (!('pilot_cert_desired' in studentRow)) {
        console.log('Adding pilot_cert_desired column to students table...');
        await executeSQL(
          'ALTER TABLE public.students ADD COLUMN pilot_cert_desired UUID REFERENCES public.pilot_certifications(id);',
          'Add pilot_cert_desired to students'
        );
      } else {
        console.log('✅ Students table has pilot_cert_desired column');
      }
    }
    
    // Create updated_at trigger for students
    console.log('Creating updated_at trigger for students table...');
    await executeSQL(
      `DROP TRIGGER IF EXISTS set_students_updated_at ON public.students;
       CREATE TRIGGER set_students_updated_at
       BEFORE UPDATE ON public.students
       FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();`,
      'Create updated_at trigger for students'
    );
  } else {
    console.error('❌ Error checking students table:', studentsError?.message);
  }
  
  console.log('\nDatabase fixes completed.');
}

applyDatabaseFixes(); 