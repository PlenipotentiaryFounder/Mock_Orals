import { createSupabaseBrowserClient } from "./client"

// Add StudentData type definition (or use the existing one)
export type StudentData = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  created_at: string
  updated_at: string
  user_id?: string // Make user_id optional since it doesn't exist yet
}

// Modified function to get students that works with the current database structure
export const getStudentsByUserIdFallback = async (userId: string): Promise<StudentData[]> => {
  const supabase = createSupabaseBrowserClient()
  
  try {
    // First try with the expected user_id filter
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", userId) // This will fail if the column doesn't exist
      .order("created_at", { ascending: false })
    
    if (!error) {
      console.log("Successfully fetched students by user_id")
      return data || []
    }
    
    // If there's an error (like missing user_id column), fetch all students
    console.log("Falling back to fetching all students (missing user_id column?):", error.message)
    const { data: allData, error: allError } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false })
    
    if (allError) {
      console.error("Error fetching all students:", allError)
      return []
    }
    
    return allData || []
  } catch (error) {
    console.error("Error in getStudentsByUserIdFallback:", error)
    return []
  }
}

// Fetch scenarios linked to a specific template
export async function getScenariosForTemplate(templateId: string) {
  if (!templateId) {
    console.log("getScenariosForTemplate called without a templateId");
    return []; // Return empty if no templateId is provided
  }

  // Use the client component helper to create a Supabase client instance
  // IMPORTANT: This assumes data-fetchers are intended to be called from client components.
  // If they need to be called from server-side, you'd use createServerClient here.
  const supabase = createSupabaseBrowserClient(); 

  const { data, error } = await supabase
    .from('scenarios')
    .select('*') // Select all scenario columns, adjust if needed
    .eq('template_id', templateId)
    .order('title'); // Optional: Order scenarios by title

  if (error) {
    console.error('Error fetching scenarios for template:', error);
    // Depending on requirements, you might throw the error or return empty
    // throw new Error(`Failed to fetch scenarios: ${error.message}`);
    return []; 
  }

  return data || [];
} 

// Function to fetch all templates
export async function getTemplates() {
  // Use client Supabase instance, assuming called from client component
  const supabase = createSupabaseBrowserClient(); 
  const { data, error } = await supabase
    .from('templates')
    .select('id, name') // Select only needed fields
    .order('name'); // Order by name

  if (error) {
    console.error("Error fetching templates:", error);
    // Handle error appropriately
    return [];
  }
  return data || [];
}

// Type for the session payload
// Ensure this matches the structure expected by your 'sessions' table
type SessionPayload = {
  session_name: string;
  template_id: string;
  student_id: string; // Expecting user_id of the student
  instructor_id: string; // Expecting user_id of the instructor
  scenario_id: string | null;
  notes: string | null;
  // Add other fields with appropriate types if needed
};

// Function to create a new session
export async function createNewSession(payload: SessionPayload) {
  // Use client Supabase instance, assuming called from client component
  const supabase = createSupabaseBrowserClient(); 

  const { data, error } = await supabase
    .from('sessions')
    .insert(payload)
    .select()
    .single(); // Assuming you want the created session back

  if (error) {
    console.error('Error creating session:', error);
    // Rethrow or handle as needed, returning null indicates failure here
    // throw new Error(`Failed to create session: ${error.message}`);
    return null;
  }

  return data;
} 