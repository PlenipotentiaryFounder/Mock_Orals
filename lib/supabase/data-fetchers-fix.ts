import { createClient } from "./client"

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
  const supabase = createClient()
  
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