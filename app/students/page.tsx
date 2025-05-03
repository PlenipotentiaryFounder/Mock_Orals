import { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"

import { createClient } from "@/lib/supabase/utils" // Use the correct server-side client
import { StudentCard } from "./components/student-card"
import { EmptyStudents } from "./components/empty-students"
import { Button } from "@/components/ui/button"
import { PlusCircle, Users } from "lucide-react"
import { StudentData } from "@/lib/supabase/data-fetchers-fix" // Assuming this type is suitable

export const metadata: Metadata = {
  title: "My Students",
  description: "View and manage students assigned to you",
}

// Function to fetch students assigned to the instructor
async function getStudentsForInstructor(supabase: any, instructorId: string): Promise<StudentData[]> {
  const { data, error } = await supabase
    .from('students')
    .select('*') // Select all columns for now, adjust as needed
    .eq('instructor_id', instructorId)
    .order("full_name", { ascending: true })
    
  if (error) {
    console.error("Error fetching students for instructor:", error)
    // Handle error appropriately, maybe return empty array or throw
    return []
  }
  
  return data || []
}

export default async function StudentsPage() {
  const cookieStore = cookies() // Use cookies() synchronously
  const supabase = createClient(cookieStore)

  // Use getUser for secure authentication
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.warn("Students page accessed without a valid session.", userError)
    return <EmptyStudents />
  }

  const instructorId = user.id

  // Fetch students specifically for this instructor
  const students = await getStudentsForInstructor(supabase, instructorId)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header Section */}
      <div className="w-full bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 py-8 px-4 md:px-12 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-8 mb-8 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-blue-200 rounded-full p-3 flex items-center justify-center">
            <Users className="h-8 w-8 text-blue-700" />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-1">My Students</h2>
            <p className="text-blue-700 text-base md:text-lg">View and manage students assigned to you.</p>
          </div>
        </div>
        <div className="ml-auto w-full md:w-auto flex justify-center md:justify-end">
          <Link href="/students/new">
            <Button size="lg" className="shadow-md">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add Student
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 pb-12">
        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <EmptyStudents />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {students.map((student) => (
              <StudentCard key={student.user_id || student.id} student={student} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 