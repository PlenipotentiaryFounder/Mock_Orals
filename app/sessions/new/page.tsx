"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle, UserPlus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createNewSession, getTemplates, getScenarios } from "@/lib/supabase/data-fetchers"
import type { User } from "@supabase/supabase-js"

// Assuming StudentData type is defined elsewhere or define it here if needed
// We might need to adjust this based on the actual structure from getStudentsForInstructor
type StudentData = {
  id: string
  user_id: string // Student's own user_id from auth.users
  instructor_id?: string | null // FK to instructor
  full_name: string
  email: string | null
  phone?: string | null
  created_at: string
  updated_at?: string | null
  pilot_cert_held?: string | null
  pilot_cert_desired?: string | null
}

type Template = { id: string; name: string }

type Scenario = { id: string; name: string }

export default function NewSessionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true) // Start loading initially
  const [formError, setFormError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [students, setStudents] = useState<StudentData[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [showAddStudentForm, setShowAddStudentForm] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string>("")

  const [formData, setFormData] = useState({
    sessionName: "",
    templateId: "",
    scenarioId: "",
    notes: "",
  })

  const [newStudentData, setNewStudentData] = useState({
    full_name: "",
    email: "",
    phone: "",
    // Need instructor_id here when creating a new student
  })

  // Combined useEffect for auth check and data fetching
  useEffect(() => {
    const initializePage = async () => {
      setLoading(true)
      setFormError(null)
      const supabase = createClient()

      // 1. Check Session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("Auth Error:", sessionError)
        toast({ title: "Authentication Error", description: "Please log in.", variant: "destructive" })
        router.replace("/login")
        return
      }
      setUser(session.user) // Set the user state
      const instructorId = session.user.id

      // 2. Fetch Initial Data (Templates, Scenarios, Instructor's Students)
      try {
        const [temps, scenes, instructorStudents] = await Promise.all([
          getTemplates(),
          getScenarios(),
          // Fetch students directly linked to this instructor
          supabase.from('students').select('*').eq('instructor_id', instructorId).order('full_name')
        ])

        setTemplates(temps || [])
        setScenarios(scenes || [])
        
        if (instructorStudents.error) {
          console.error("Error fetching instructor students:", instructorStudents.error)
          throw new Error(instructorStudents.error.message || "Failed to fetch students for instructor")
        }
        setStudents(instructorStudents.data || [])

      } catch (error: any) {
        console.error("Error fetching initial data:", error)
        const errorMsg = error.message || "Failed to load initial data"
        setFormError(errorMsg)
        toast({ title: "Error loading data", description: errorMsg, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [router, toast]) // Dependencies

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNewStudentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewStudentData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStudentSelectChange = (id: string) => {
    setSelectedStudentId(id)
    if (id) {
      setShowAddStudentForm(false)
      setNewStudentData({ full_name: "", email: "", phone: "" })
    }
  }

  const toggleAddStudentForm = () => {
    const addingNew = !showAddStudentForm
    setShowAddStudentForm(addingNew)
    if (addingNew) {
      setSelectedStudentId("")
    } else {
      setNewStudentData({ full_name: "", email: "", phone: "" })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormError(null)
    let studentIdForSession = selectedStudentId
    const supabase = createClient(); // Use client for mutation
    const currentInstructorId = user?.id; // Get instructor ID from state

    if (!currentInstructorId) {
      setFormError("Instructor ID not found. Please refresh and try again.");
      setLoading(false);
      return;
    }

    try {
      // Handle adding a new student if the form is shown
      if (showAddStudentForm) {
        if (!newStudentData.full_name || !newStudentData.email) {
          throw new Error("Please provide the new student's full name and email.");
        }
        
        const studentToInsert = {
          ...newStudentData,
          instructor_id: currentInstructorId, // Assign current instructor
          // Potentially create a dummy auth user for the student here if needed,
          // similar to the dev mode logic, or handle that separately.
          // For now, just creating the profile record.
          user_id: crypto.randomUUID() // Assign a temporary UUID if student doesn't have own account yet
        }

        const { data: createdStudent, error: createStudentError } = await supabase
          .from("students")
          .insert(studentToInsert)
          .select()
          .single();

        if (createStudentError || !createdStudent) {
            throw new Error(createStudentError?.message || "Failed to create new student.");
        }
        
        studentIdForSession = createdStudent.id; // Use the ID of the newly created student
        setStudents(prev => [...prev, createdStudent]); // Add to dropdown list
        setSelectedStudentId(studentIdForSession); // Select the new student
        setShowAddStudentForm(false); // Hide the add form
        setNewStudentData({ full_name: "", email: "", phone: "" }); // Reset form
      }
      
      // Ensure a student is selected or was just created
      if (!studentIdForSession) {
        throw new Error("Please select an existing student or add a new one.");
      }

      // Ensure other required fields are present
      if (!formData.sessionName || !formData.templateId) {
        throw new Error("Missing required fields: Session Name or Template.");
      }

      // Prepare payload for creating the session
      const sessionPayload = {
        session_name: formData.sessionName,
        user_id: currentInstructorId, // This is the instructor creating the session
        instructor_id: currentInstructorId, // Redundant? Check if sessions table needs this
        template_id: formData.templateId,
        scenario_id: formData.scenarioId === "none" ? null : formData.scenarioId || null,
        notes: formData.notes,
        student_id: studentIdForSession, // The ID of the student participating
      }

      console.log("Creating session with payload:", sessionPayload);

      // Call function to create the session (adjust based on actual implementation)
      // Assuming createNewSession handles the DB insert for 'sessions' table
      const newSession = await createNewSession(sessionPayload);
      if (!newSession) {
        throw new Error("Failed to save session data. Check server logs or createNewSession function.");
      }

      toast({ title: "Success", description: "Session created successfully" });
      router.push(`/sessions/${newSession.id}`); // Navigate to the new session page

    } catch (error: any) {
      console.error("Submit Error:", error);
      const errorMsg = error.message || "An unexpected error occurred.";
      setFormError(errorMsg);
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  // Render Loading state
  if (loading && !templates.length && !students.length) {
     return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Mock Oral Session</CardTitle>
          <CardDescription>Set up a new mock oral exam session for a student</CardDescription>
        </CardHeader>

        {formError && (
          <div className="px-6 pb-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sessionName">Session Name *</Label>
              <Input
                  id="sessionName"
                  name="sessionName"
                  placeholder="e.g., CPL Oral Prep - J. Doe"
                  value={formData.sessionName}
                  onChange={handleChange}
                  required
                  disabled={loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="templateId">ACS Template *</Label>
                <Select
                    onValueChange={(value) => handleSelectChange("templateId", value)}
                    value={formData.templateId}
                    required
                    disabled={loading || templates.length === 0}
                >
                    <SelectTrigger>
                      <SelectValue placeholder={templates.length === 0 ? "Loading..." : "Select ACS Template"} />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                            {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scenarioId">Scenario (Optional)</Label>
                 <Select
                    onValueChange={(value) => handleSelectChange("scenarioId", value)}
                    value={formData.scenarioId}
                    disabled={loading || scenarios.length === 0}
                >
                    <SelectTrigger>
                      <SelectValue placeholder={scenarios.length === 0 ? "Loading..." : "Select Scenario"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {scenarios.map((scenario) => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                            {scenario.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Student Selection Section */}
            <div className="space-y-2 rounded-md border p-4">
              <Label>Student *</Label>
              {!showAddStudentForm ? (
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={handleStudentSelectChange}
                    value={selectedStudentId}
                    required={!showAddStudentForm}
                    disabled={loading || students.length === 0}
                  >
                    <SelectTrigger className="flex-grow">
                      <SelectValue placeholder={students.length === 0 ? "No students found" : "Select Existing Student"} />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student: StudentData) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} ({student.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" onClick={toggleAddStudentForm} disabled={loading}>
                    <UserPlus className="mr-2 h-4 w-4"/> New
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 border-t pt-4 mt-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Add New Student Details</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newStudentName">Full Name *</Label>
                      <Input 
                        id="newStudentName"
                        name="full_name"
                        value={newStudentData.full_name}
                        onChange={handleNewStudentChange}
                        placeholder="Student Full Name"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newStudentEmail">Email Address *</Label>
                      <Input 
                        id="newStudentEmail"
                        name="email"
                        type="email"
                        value={newStudentData.email}
                        onChange={handleNewStudentChange}
                        placeholder="student@example.com"
                        required
                        disabled={loading}
                      />
                    </div>
                   </div>
                   <div className="space-y-2">
                      <Label htmlFor="newStudentPhone">Phone (Optional)</Label>
                      <Input 
                        id="newStudentPhone"
                        name="phone"
                        type="tel"
                        value={newStudentData.phone}
                        onChange={handleNewStudentChange}
                        placeholder="(123) 456-7890"
                        disabled={loading}
                      />
                    </div>
                  <Button type="button" variant="outline" size="sm" onClick={toggleAddStudentForm} disabled={loading}>
                    Cancel Adding Student
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Session Notes (Optional)</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any initial notes about the session or student..."
                value={formData.notes}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Session...
                </>
              ) : (
                "Create Session"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
