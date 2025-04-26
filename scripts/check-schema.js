// Script to check tables needed for user onboarding
const { createClient } = require('@supabase/supabase-js');

// Supabase connection details
const supabaseUrl = 'https://psnorowqvedupuievxnh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzbm9yb3dxdmVkdXB1aWV2eG5oIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTU0MzI4NSwiZXhwIjoyMDYxMTE5Mjg1fQ.fLjOD6z0l2XjxGUBOeqKHIwn5WQuVcbdbrvV2GgYt9g';

console.log('Connecting to Supabase...');
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  try {
    // Check tables needed for user onboarding
    const tables = ['students', 'instructor', 'pilot_certifications'];
    
    console.log('Checking tables needed for user onboarding:');
    console.log('------------------------------------------');
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: exists`);
          
          // If there's data, show the first record structure
          if (data && data.length > 0) {
            console.log(`\n${table} table columns:`);
            Object.keys(data[0]).forEach(column => {
              const value = data[0][column];
              const valueType = typeof value;
              const displayValue = value === null ? 'null' : 
                (valueType === 'object' ? JSON.stringify(value).substring(0, 50) : value);
              
              console.log(`  - ${column}: ${valueType} (Example: ${displayValue})`);
            });
            console.log();
          }
        }
      } catch (e) {
        console.log(`❌ Error checking ${table}: ${e.message}`);
      }
    }
    
    // Check certificate options
    console.log('\nChecking pilot certifications:');
    console.log('-----------------------------');
    try {
      const { data, error } = await supabase
        .from('pilot_certifications')
        .select('*')
        .order('certificate_level', { ascending: true })
        .order('category', { ascending: true })
        .order('class', { ascending: true });
      
      if (error) {
        console.log(`❌ Error: ${error.message}`);
      } else {
        console.log(`✅ Found ${data.length} certification options`);
        
        // Group by certificate level
        const certsByLevel = {};
        data.forEach(cert => {
          const level = cert.certificate_level;
          if (!certsByLevel[level]) {
            certsByLevel[level] = [];
          }
          certsByLevel[level].push(cert);
        });
        
        // Display unique certificate levels
        console.log('\nAvailable Certificate Levels:');
        Object.keys(certsByLevel).forEach(level => {
          console.log(`  - ${level} (${certsByLevel[level].length} variants)`);
        });
      }
    } catch (e) {
      console.log(`❌ Error checking certifications: ${e.message}`);
    }
  } catch (error) {
    console.error('General error:', error.message);
  }
}

checkSchema(); 