import { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"

import { createServerClient } from "@/lib/supabase/server"
import { StudentCard } from "./components/student-card"
import { EmptyStudents } from "./components/empty-students"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { StudentData } from "@/lib/supabase/data-fetchers-fix" // Assuming this type is suitable

export const metadata: Metadata = {
  title: "My Students",
  description: "View and manage students assigned to you",
}

// Function to fetch students assigned to the instructor
async function getStudentsForInstructor(instructorId: string): Promise<StudentData[]> {
  const supabase = createServerClient()
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
  const cookieStore = cookies()
  const supabase = createServerClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  // Ensure the user is logged in and get their ID
  const instructorId = session?.user?.id
  if (!instructorId) {
     // This should theoretically be handled by layout/middleware, 
     // but as a fallback, show an empty state or redirect.
     // For now, we'll show the empty state.
     console.warn("Students page accessed without a valid session.")
     return <EmptyStudents message="Please log in to view your students." />
  }
  
  // Fetch students specifically for this instructor
  const students = await getStudentsForInstructor(instructorId)
  
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Students</h2>
          <p className="text-muted-foreground">
            View and manage students assigned to you.
          </p>
        </div>
        <Link href="/students/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </Link>
      </div>
      
      {students.length === 0 ? (
        <EmptyStudents />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  )
} 