"use client"

import type React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle, UserPlus, ArrowRight } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getTemplates } from "@/lib/supabase/data-fetchers-fix"
import type { User } from "@supabase/supabase-js"

// Assuming StudentData type is defined elsewhere or define it here if needed
type StudentData = {
  id: string // Primary key of the students table itself
  user_id: string // Student's own user_id from auth.users (FK)
  instructor_id?: string | null // FK to instructor auth.users id
  full_name: string
  email: string | null
  phone?: string | null
  created_at: string
  updated_at?: string | null
  pilot_cert_held?: string | null
  pilot_cert_desired?: string | null
}

type Template = { id: string; name: string }

export default function NewSessionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true) // Start loading initially
  const [formError, setFormError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<Template[]>([])
  const [students, setStudents] = useState<StudentData[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [showAddStudentForm, setShowAddStudentForm] = useState(false)
  const [selectedStudentUserId, setSelectedStudentUserId] = useState<string>("")

  const [formData, setFormData] = useState({
    templateId: "",
    notes: "",
  })

  const [newStudentData, setNewStudentData] = useState({
    full_name: "",
    email: "",
    phone: "",
  })

  const supabase = useRef(createSupabaseBrowserClient()).current

  // Combined useEffect for auth check and data fetching
  useEffect(() => {
    const initializePage = async () => {
      setLoading(true)
      setFormError(null)

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

      // 2. Fetch Initial Data (Templates, Instructor's Students) - Removed Scenarios
      try {
        const [temps, instructorStudents] = await Promise.all([
          getTemplates(), 
          // Fetch students directly linked to this instructor
          supabase.from('students').select('*').eq('instructor_id', instructorId).order('full_name')
        ])

        setTemplates(temps || [])

        if (instructorStudents.error) {
          console.error("Error fetching instructor students:", instructorStudents.error)
          throw new Error(instructorStudents.error.message || "Failed to fetch students for instructor")
        }
        // Ensure students data includes user_id
        const validStudents = instructorStudents.data?.filter(s => s.user_id) || [];
        if (validStudents.length !== instructorStudents.data?.length) {
            console.warn("Some fetched students are missing a user_id and will be excluded.");
            // Optionally notify the user if this is unexpected
        }
        setStudents(validStudents)

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
  }, [router, toast, supabase]) // Dependencies

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

  const handleStudentSelectChange = (userId: string) => {
    setSelectedStudentUserId(userId)
    if (userId) {
      setShowAddStudentForm(false)
      setNewStudentData({ full_name: "", email: "", phone: "" })
    }
  }

  const toggleAddStudentForm = () => {
    const addingNew = !showAddStudentForm
    setShowAddStudentForm(addingNew)
    if (addingNew) {
      setSelectedStudentUserId("")
    } else {
      setNewStudentData({ full_name: "", email: "", phone: "" })
    }
  }
  
  // Memoize selected student and template objects to avoid re-finding them on every render
  const selectedStudent = useMemo(() => {
    return students.find(s => s.user_id === selectedStudentUserId);
  }, [students, selectedStudentUserId]);

  const selectedTemplate = useMemo(() => {
    return templates.find(t => t.id === formData.templateId);
  }, [templates, formData.templateId]);

  const handleProceedToScenario = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setFormError(null)
    let studentUserIdForSession = selectedStudentUserId;

    if (!user?.id) {
      setFormError("Instructor ID not found. Please refresh and try again.");
      setLoading(false);
      return;
    }

    try {
      if (showAddStudentForm) {
        if (!newStudentData.full_name || !newStudentData.email) {
          throw new Error("Please provide the new student's full name and email.");
        }

        const studentToInsert = {
          ...newStudentData,
          instructor_id: user.id,
          user_id: crypto.randomUUID()
        }

        const { data: createdStudent, error: createStudentError } = await supabase
          .from("students")
          .insert(studentToInsert)
          .select()
          .single();

        if (createStudentError || !createdStudent) {
          console.error("Create student error:", createStudentError);
          throw new Error(createStudentError?.message || "Failed to create new student.");
        }

        studentUserIdForSession = createdStudent.user_id;
        setStudents(prev => [...prev, createdStudent]);
        setSelectedStudentUserId(studentUserIdForSession);
        setShowAddStudentForm(false);
        setNewStudentData({ full_name: "", email: "", phone: "" });
      }
      
      if (!studentUserIdForSession) {
        throw new Error("Please select an existing student or add a new one.");
      }

      if (!formData.templateId) {
        throw new Error("Please select an ACS Template.");
      }
      
      const finalSelectedStudent = students.find(s => s.user_id === studentUserIdForSession);
      const finalSelectedTemplate = templates.find(t => t.id === formData.templateId);

      if (!finalSelectedStudent || !finalSelectedTemplate) {
           throw new Error("Selected student or template not found. Please try again.");
      }

      const sessionName = `${finalSelectedTemplate.name} ACS | ${finalSelectedStudent.full_name}`;

      const params = new URLSearchParams({
        templateId: formData.templateId,
        studentId: studentUserIdForSession,
        sessionName: sessionName,
        notes: formData.notes || "",
      });

      console.log("Proceeding to deficiency selection with params:", params.toString());

      router.push(`/sessions/new/select-deficiencies?${params.toString()}`);

    } catch (error: any) {
      console.error("Proceed Error:", error);
      const errorMsg = error.message || "An unexpected error occurred.";
      setFormError(errorMsg);
      toast({ title: "Error", description: errorMsg, variant: "destructive" });
      setLoading(false);
    }
  }

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
          <CardTitle>Create New Mock Oral Session: Step 1</CardTitle>
          <CardDescription>Select the template and student for the session.</CardDescription>
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

        <form onSubmit={handleProceedToScenario}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="templateId">ACS Template *</Label>
              <Select
                  onValueChange={(value) => handleSelectChange("templateId", value)}
                  value={formData.templateId}
                  required
                  disabled={loading || templates.length === 0}
                  name="templateId"
              >
                  <SelectTrigger>
                    <SelectValue placeholder={templates.length === 0 ? "Loading Templates..." : "Select ACS Template"} />
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

            <div className="space-y-2 rounded-md border p-4">
              <Label>Student *</Label>
              {!showAddStudentForm ? (
                <div className="flex items-center gap-2">
                  <Select
                    onValueChange={handleStudentSelectChange}
                    value={selectedStudentUserId}
                    required={!showAddStudentForm}
                    disabled={loading || students.length === 0}
                  >
                    <SelectTrigger className="flex-grow">
                      <SelectValue placeholder={students.length === 0 ? "Loading Students..." : "Select Existing Student"} />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student: StudentData) => (
                        <SelectItem key={student.user_id} value={student.user_id}>
                          {student.full_name} {student.email ? `(${student.email})` : ''}
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
                        required={showAddStudentForm}
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
                        required={showAddStudentForm}
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
                        value={newStudentData.phone || ""}
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
                  Processing...
                </>
              ) : (
                <>
                  Next: Select Scenario <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
