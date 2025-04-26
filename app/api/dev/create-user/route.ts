import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Only use this for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Log configuration info (without showing the full key)
console.log('API Route - Dev Create User:');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Role Key set:', supabaseServiceKey ? 'Yes (masked)' : 'No');

// Create a client with the service role key that can bypass RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function POST(request: Request) {
  console.log('Received dev user creation request');
  
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      console.log('Blocked: Production environment');
      return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
    }
    
    const data = await request.json();
    console.log('Received data:', {
      ...data,
      // Don't log any sensitive fields completely
      email: data.email ? `${data.email.substring(0, 3)}...` : undefined,
    });
    
    const { role, userId, fullName, email, phone, certHeld, certDesired, isCFI, isCFII } = data;
    
    if (!userId || !fullName || !email || !role) {
      console.log('Missing required fields', { userId: !!userId, fullName: !!fullName, email: !!email, role });
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }
    
    // 1. Create a dummy auth user first (only in dev mode)
    console.log(`DEV MODE: Creating dummy auth user for ${userId}`);
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      id: userId,
      email: email, // Use the provided email
      password: 'password123', // Use a dummy password
      email_confirm: true, // Mark email as confirmed
      user_metadata: { full_name: fullName, role: role } // Add metadata
    });

    if (authError) {
      // Handle potential errors like duplicate emails if testing repeatedly
      if (authError.message.includes('Email rate limit exceeded') || authError.message.includes('User already registered')) {
         console.warn(`DEV MODE: Auth user ${email} likely already exists. Proceeding...`);
      } else {
        console.error('Error creating dummy auth user:', authError);
        return NextResponse.json(
          { error: `Failed to create dummy auth user: ${authError.message}` }, 
          { status: 500 }
        );
      }
    }
    console.log(`DEV MODE: Dummy auth user created (or already existed) for ${userId}`);

    // 2. Insert into the appropriate profile table based on role
    if (role === 'student') {
      console.log('Creating student record');
      
      // First check if the students table has phone or phone_number column
      const { data: studentColumns, error: columnsError } = await supabaseAdmin
        .from('students')
        .select('*')
        .limit(1);
        
      if (columnsError) {
        console.error('Error checking student columns:', columnsError);
      } else {
        console.log('Student table columns:', studentColumns && studentColumns.length > 0 
          ? Object.keys(studentColumns[0]) 
          : 'No rows found');
      }
      
      // Check which column name to use
      const phoneColumnName = studentColumns && studentColumns.length > 0 && 'phone_number' in studentColumns[0] 
        ? 'phone_number' 
        : 'phone';
      
      console.log(`Using student phone column: ${phoneColumnName}`);
      
      const studentData = {
        user_id: userId,
        full_name: fullName,
        email,
        [phoneColumnName]: phone,
        pilot_cert_held: certHeld,
        pilot_cert_desired: certDesired,
      };
      
      console.log('Inserting student data:', studentData);
      
      const { error } = await supabaseAdmin
        .from('students')
        .insert(studentData);
      
      if (error) {
        console.error('Error creating student:', error);
        return NextResponse.json(
          { error: `Failed to create student: ${error.message}` }, 
          { status: 500 }
        );
      }
      console.log('Student record created successfully');
    } else if (role === 'instructor') {
      console.log('Creating instructor record');
      const { error } = await supabaseAdmin
        .from('instructor')
        .insert({
          id: userId,
          user_id: userId,
          full_name: fullName,
          email,
          phone_number: phone,
          pilot_cert_held: certHeld,
          cfi_certified: isCFI,
          cfii_certified: isCFII,
        });
      
      if (error) {
        console.error('Error creating instructor:', error);
        return NextResponse.json(
          { error: `Failed to create instructor: ${error.message}` }, 
          { status: 500 }
        );
      }
      console.log('Instructor record created successfully');
    } else {
      console.log('Invalid role:', role);
      return NextResponse.json(
        { error: 'Invalid role' }, 
        { status: 400 }
      );
    }
    
    console.log('Success - returning user ID:', userId);
    return NextResponse.json({ success: true, userId });
    
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' }, 
      { status: 500 }
    );
  }
} 