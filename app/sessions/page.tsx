import Link from "next/link"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

// Helper component for displaying empty state
const EmptySessions = ({ message = "No sessions found" }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
    <h3 className="mt-4 text-lg font-semibold">No Sessions Yet</h3>
    <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    <Link href="/sessions/new" className="mt-4">
      <Button>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create New Session
      </Button>
    </Link>
  </div>
)

// Session card component
function SessionCard({ session }: { session: any }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg line-clamp-1">
            {session.session_name}
          </CardTitle>
          <Badge variant={session.date_completed ? "outline" : "secondary"}>
            {session.date_completed ? "Completed" : "In Progress"}
          </Badge>
        </div>
        <CardDescription>
          Started: {formatDate(session.date_started)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm mb-2">
          {session.student_name && (
            <p>Student: {session.student_name}</p>
          )}
          {session.template_name && (
            <p>Template: {session.template_name}</p>
          )}
        </div>
        <Link href={`/sessions/${session.id}`}>
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default async function SessionsPage() {
  // Get the user session
  const cookieStore = cookies()
  const supabase = createServerClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  // If no user is logged in, show the empty state
  if (!session?.user) {
    return <EmptySessions message="Please log in to view your sessions" />
  }
  
  const userId = session.user.id
  
  // Get the user's role from the auth.users metadata
  // This is stored when the user signs up or when their role is assigned
  const { data: userData, error: userError } = await supabase
    .from('auth.users')
    .select('role:raw_user_meta_data->role')
    .eq('id', userId)
    .single()
  
  // If we can't get the role, try to determine it by checking tables
  let userRole = userData?.role
  
  if (!userRole || userError) {
    // Check if user exists in instructor table
    const { data: instructorCheck } = await supabase
      .from('instructor')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (instructorCheck) {
      userRole = 'instructor'
    } else {
      // Check if user exists in students table
      const { data: studentCheck } = await supabase
        .from('students')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()
      
      if (studentCheck) {
        userRole = 'student'
      }
    }
  }
  
  // Default to instructor if role couldn't be determined
  userRole = userRole || 'instructor'
  
  let query
  
  // Filter sessions based on user role
  if (userRole === 'instructor') {
    // For instructors, get all sessions where they are the instructor
    query = supabase
      .from('sessions')
      .select(`
        id, 
        session_name, 
        date_started, 
        date_completed,
        students!inner(id, full_name),
        templates!inner(id, name)
      `)
      .eq('user_id', userId) // user_id in sessions table is the instructor who created it
      .order('date_started', { ascending: false })
  } else {
    // For students, get all sessions where they are the student
    query = supabase
      .from('sessions')
      .select(`
        id, 
        session_name, 
        date_started, 
        date_completed,
        user_id,
        instructor:users!inner(email, raw_user_meta_data->full_name),
        templates!inner(id, name)
      `)
      .eq('student_id', userId) // student_id in sessions links to the student's user_id
      .order('date_started', { ascending: false })
  }
  
  const { data: sessions, error } = await query
  
  if (error) {
    console.error("Error fetching sessions:", error.message)
    return <EmptySessions message="Error loading sessions. Please try again later." />
  }
  
  // Transform the data for display
  const formattedSessions = sessions.map((session: any) => ({
    id: session.id,
    session_name: session.session_name,
    date_started: session.date_started,
    date_completed: session.date_completed,
    student_name: userRole === 'instructor' ? session.students.full_name : null,
    instructor_name: userRole === 'student' ? (session.instructor.raw_user_meta_data?.full_name || session.instructor.email) : null,
    template_name: session.templates.name
  }))
  
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sessions</h2>
          <p className="text-muted-foreground">
            {userRole === 'instructor' 
              ? "View and manage your flight training sessions" 
              : "View your flight training sessions"}
          </p>
        </div>
        {userRole === 'instructor' && (
          <Link href="/sessions/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Session
            </Button>
          </Link>
        )}
      </div>
      
      {formattedSessions.length === 0 ? (
        <EmptySessions />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {formattedSessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  )
} 