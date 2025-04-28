import Link from "next/link"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/utils"
import { getUserSessions, SessionListItem } from "@/lib/supabase/data-fetchers"
import { PlusCircle, User, GraduationCap, BookOpen, CalendarDays, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

// Helper component for displaying empty state
const EmptySessions = ({ message = "No sessions found", showCreateButton = true }: { message?: string, showCreateButton?: boolean }) => (
  <div className="flex flex-col items-center justify-center p-16 text-center border rounded-lg min-h-[40vh] bg-muted/40">
    <CardTitle className="text-xl font-semibold mb-2">No Sessions Yet</CardTitle>
    <p className="mb-6 text-sm text-muted-foreground max-w-xs">{message}</p>
    {showCreateButton && (
      <Link href="/sessions/new">
        <Button size="lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Create New Session
        </Button>
      </Link>
    )}
  </div>
)

// Enhanced Session card component
function SessionCard({ session }: { session: SessionListItem }) {
  const isCompleted = !!session.date_completed;

  return (
    <Card className="flex flex-col h-full shadow-md rounded-xl hover:shadow-xl hover:ring-2 hover:ring-blue-400 hover:ring-offset-2 transition-all duration-300 ease-in-out">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center mb-2">
          <Badge variant={isCompleted ? "outline" : "secondary"} className="text-xs">
            {isCompleted ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
            {isCompleted ? "Completed" : "In Progress"}
          </Badge>
          {/* Optional: Add more badges or info here */}
        </div>
        <CardTitle className="text-lg font-semibold line-clamp-2">
          {session.session_name || "Unnamed Session"}
        </CardTitle>
        <CardDescription className="flex items-center text-xs text-muted-foreground">
          <CalendarDays className="mr-1 h-3 w-3" />
          Started: {formatDate(session.date_started)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow space-y-3 text-sm">
        {session.template_name && (
          <div className="flex items-center text-muted-foreground">
            <BookOpen className="mr-2 h-4 w-4 flex-shrink-0" /> 
            <span>Template: {session.template_name}</span>
          </div>
        )}
        {session.scenario_title && (
           <div className="flex items-center text-muted-foreground">
             <GraduationCap className="mr-2 h-4 w-4 flex-shrink-0" /> {/* Re-using icon, change if needed */}
             <span>Scenario: {session.scenario_title}</span>
           </div>
        )}
        <Separator />
        {session.student_name && (
          <div className="flex items-center">
             <GraduationCap className="mr-2 h-4 w-4 flex-shrink-0" /> 
             <span>Student: {session.student_name}</span>
           </div>
        )}
        {session.instructor_name && (
          <div className="flex items-center">
             <User className="mr-2 h-4 w-4 flex-shrink-0" /> 
             <span>Instructor: {session.instructor_name}</span>
           </div>
        )}
      </CardContent>

      <CardFooter className="pt-4 border-t">
        <Link href={`/sessions/${session.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default async function SessionsPage() {
  // Get the cookie store
  const cookieStore = cookies()
  // Create client using the updated util, passing the cookieStore
  const supabase = createClient(cookieStore)

  // Use getUser() for security
  const {
    data: { user }, // Get the user object directly
    error: authError,
  } = await supabase.auth.getUser()

  // If auth error or no user, show appropriate message
  if (authError || !user) {
     console.error("Authentication Error:", authError);
     // Redirect to login or show specific error message?
     // For now, show generic empty state
     return <EmptySessions message="Please log in to view your sessions." showCreateButton={false} />
  }

  const userId = user.id

  // Fetch sessions using the updated function, passing the authenticated client
  const sessions = await getUserSessions(supabase, userId)

  // Determine user role (optional, for UI customization)
  // This logic remains largely the same, but uses `user` object if needed
  let userRole = 'unknown';
  if (sessions.length > 0) {
    const isInstructor = sessions.some(s => s.instructor_id === userId);
    const isStudent = sessions.some(s => s.student_id === userId);
    if (isInstructor) userRole = 'instructor';
    else if (isStudent) userRole = 'student';
  } else {
    // Fallback: Check user metadata first (more efficient)
    userRole = user.user_metadata?.role || 'unknown';

    // If role still unknown, check DB tables as final fallback
    if (userRole === 'unknown') {
        const { data: instructorCheck } = await supabase.from('instructor').select('user_id', { count: 'exact', head: true }).eq('user_id', userId);
        if (instructorCheck?.count && instructorCheck.count > 0) userRole = 'instructor';
        else {
            const { data: studentCheck } = await supabase.from('students').select('user_id', { count: 'exact', head: true }).eq('user_id', userId);
            if (studentCheck?.count && studentCheck.count > 0) userRole = 'student';
        }
    }
  }

  // Determine if the create button should be shown (only for instructors)
  const showCreateButton = userRole === 'instructor';

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 md:mb-10">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
          <p className="mt-1 text-muted-foreground">
            {userRole === 'instructor'
              ? "View and manage your flight training sessions"
              : "View your flight training sessions"}
          </p>
        </div>
        {showCreateButton && (
          <Link href="/sessions/new">
            <Button size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              New Session
            </Button>
          </Link>
        )}
      </div>

      {sessions.length === 0 ? (
        <EmptySessions 
           message={userRole === 'instructor' ? "Create your first session to get started." : "Your instructor hasn't created any sessions for you yet."}
           showCreateButton={showCreateButton}
         />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  )
} 