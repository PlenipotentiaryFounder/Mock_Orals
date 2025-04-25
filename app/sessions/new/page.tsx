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
import type { Session } from "@supabase/supabase-js"

type Student = {
  id: string
  name: string
  email: string
  phone?: string | null
}

export default function NewSessionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [templates, setTemplates] = useState<any[]>([])
  const [scenarios, setScenarios] = useState<any[]>([])
  const [existingStudents, setExistingStudents] = useState<Student[]>([])
  const [user, setUser] = useState<any>(null)
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
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("mockOralUser")
    if (!storedUser) {
      router.push("/")
      return
    }
    try {
      setUser(JSON.parse(storedUser))
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setFormError(null)
      try {
        const [temps, scenes, studentRes] = await Promise.all([
          getTemplates(),
          getScenarios(),
          fetch("/api/students")
        ])

        setTemplates(temps || [])
        setScenarios(scenes || [])

        if (!studentRes.ok) {
          const errData = await studentRes.json()
          throw new Error(errData.error || "Failed to fetch students")
        }
        const studentData = await studentRes.json()
        setExistingStudents(studentData.students || [])

      } catch (error: any) {
        console.error("Error fetching initial data:", error)
        const errorMsg = error.message || "Failed to load initial data"
        setFormError(errorMsg)
        toast({ title: "Error loading data", description: errorMsg, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

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
    let studentIdForSession = ""

    try {
      if (showAddStudentForm) {
        if (!newStudentData.full_name || !newStudentData.email) {
          throw new Error("Please provide the new student's full name and email.")
        }
        
        const createStudentRes = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newStudentData),
        })

        const createStudentBody = await createStudentRes.json()

        if (!createStudentRes.ok) {
            throw new Error(createStudentBody.error || "Failed to create new student.")
        }
        
        studentIdForSession = createStudentBody.student.id
        setExistingStudents(prev => [...prev, createStudentBody.student])
        setSelectedStudentId(studentIdForSession)
        setShowAddStudentForm(false)

      } else {
        if (!selectedStudentId) {
          throw new Error("Please select an existing student or add a new one.")
        }
        studentIdForSession = selectedStudentId
      }

      if (!formData.sessionName || !formData.templateId || !user?.id || !studentIdForSession) {
        throw new Error("Missing required fields: Session Name, Template, Student, or User ID.")
      }

      const sessionPayload = {
        session_name: formData.sessionName,
        user_id: user.id,
        template_id: formData.templateId,
        scenario_id: formData.scenarioId === "none" ? null : formData.scenarioId || null,
        notes: formData.notes,
        student_id: studentIdForSession,
      }

      const newSession = await createNewSession(sessionPayload)
      if (!newSession) {
        throw new Error("Failed to save session data. Check server logs.")
      }

      toast({ title: "Success", description: "Session created successfully" })
      router.push(`/sessions/${newSession.id}`)

    } catch (error: any) {
      console.error("Submit Error:", error)
      const errorMsg = error.message || "An unexpected error occurred."
      setFormError(errorMsg)
      toast({ title: "Error", description: errorMsg, variant: "destructive" })
    } finally {
      setLoading(false)
    }
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
            <div className="space-y-4">
                <div className="space-y-2">
                <Label htmlFor="sessionName">Session Name *</Label>
                <Input
                    id="sessionName"
                    name="sessionName"
                    placeholder="e.g., CPL Oral Prep - J. Doe"
                    value={formData.sessionName}
                    onChange={handleChange}
                    required
                />
                </div>

                <div className="space-y-2">
                <Label htmlFor="templateId">ACS Template *</Label>
                <Select
                    onValueChange={(value) => handleSelectChange("templateId", value)}
                    value={formData.templateId}
                    required
                >
                    <SelectTrigger>
                    <SelectValue placeholder="Select ACS Template" />
                    </SelectTrigger>
                    <SelectContent>
                    {templates.length > 0 ? (
                        templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                            {template.name}
                        </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="loading" disabled>
                        {loading ? "Loading templates..." : "No templates available"}
                        </SelectItem>
                    )}
                    </SelectContent>
                </Select>
                {!formData.templateId && <p className="text-xs text-red-500">Template is required</p>}
                </div>
            </div>

            <div className="border-t pt-6 mt-6">
              <h3 className="text-lg font-medium mb-4">Student Information *</h3>

                <div className="space-y-2 mb-4">
                    <Label htmlFor="existingStudent">Select Existing Student</Label>
                    <Select
                        onValueChange={handleStudentSelectChange}
                        value={selectedStudentId}
                        disabled={showAddStudentForm}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a student..." />
                        </SelectTrigger>
                        <SelectContent>
                            {existingStudents.length > 0 ? (
                            existingStudents.map((student) => (
                                <SelectItem key={student.id} value={student.id}>
                                {student.name} ({student.email})
                                </SelectItem>
                            ))
                            ) : (
                            <SelectItem value="loading" disabled>
                                {loading ? "Loading students..." : "No previous students found"}
                            </SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="text-center my-4">
                    <span className="text-sm text-muted-foreground">OR</span>
                </div>

                <Button
                    type="button"
                    variant="outline"
                    className="w-full mb-4"
                    onClick={toggleAddStudentForm}
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {showAddStudentForm ? "Cancel Adding New Student" : "Add New Student"}
                </Button>

              {showAddStudentForm && (
                <div className="border p-4 rounded-md space-y-4 bg-muted/40">
                    <h4 className="text-md font-medium mb-2">New Student Details</h4>
                    <div className="space-y-2">
                    <Label htmlFor="newStudentName">Full Name *</Label>
                    <Input
                        id="newStudentName"
                        name="full_name"
                        placeholder="e.g., Jane Doe"
                        value={newStudentData.full_name}
                        onChange={handleNewStudentChange}
                        required={showAddStudentForm}
                    />
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="newStudentEmail">Email *</Label>
                    <Input
                        id="newStudentEmail"
                        name="email"
                        type="email"
                        placeholder="e.g., jane.doe@example.com"
                        value={newStudentData.email}
                        onChange={handleNewStudentChange}
                        required={showAddStudentForm}
                    />
                    </div>

                    <div className="space-y-2">
                    <Label htmlFor="newStudentPhone">Phone Number (Optional)</Label>
                    <Input
                        id="newStudentPhone"
                        name="phone"
                        placeholder="e.g., (555) 987-6543"
                        value={newStudentData.phone || ""}
                        onChange={handleNewStudentChange}
                    />
                    </div>
                </div>
              )}
            </div>

            <div className="border-t pt-6 mt-6 space-y-4">
                 <h3 className="text-lg font-medium mb-4">Scenario & Notes</h3>
                <div className="space-y-2">
                <Label htmlFor="scenarioId">Scenario (Optional)</Label>
                <Select onValueChange={(value) => handleSelectChange("scenarioId", value)} value={formData.scenarioId}>
                    <SelectTrigger>
                    <SelectValue placeholder="Select Scenario (Optional)" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {scenarios.length > 0 ? (
                        scenarios.map((scenario) => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                            {scenario.title}
                        </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="loading" disabled>
                         {loading ? "Loading scenarios..." : "No scenarios available"}
                        </SelectItem>
                    )}
                    </SelectContent>
                </Select>
                </div>

                <div className="space-y-2">
                <Label htmlFor="notes">Session Notes (Optional)</Label>
                <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Add any initial notes for this session..."
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                />
                </div>
            </div>
          </CardContent>

          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Session"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
