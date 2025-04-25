"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getStudentsByUserId, type StudentData } from "@/lib/supabase/data-fetchers"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export default function StudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState<StudentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true)
      setError(null)

      // Get user ID from localStorage
      const storedUser = localStorage.getItem("mockOralUser")
      if (!storedUser) {
        router.push("/") // Redirect to login if not logged in
        return
      }

      try {
        const user = JSON.parse(storedUser)
        if (!user || !user.id) {
          throw new Error("User ID not found in local storage.")
        }

        const fetchedStudents = await getStudentsByUserId(user.id)
        setStudents(fetchedStudents)
      } catch (err: any) {
        console.error("Error fetching students or parsing user data:", err)
        setError(err.message || "Failed to load students.")
        // Optionally redirect on error or show message
        // router.push('/');
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [router])

  return (
    <main className="flex w-full flex-col overflow-hidden">
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1 p-4">
          <h2 className="text-2xl font-semibold tracking-tight">Manage Students</h2>
          <p className="text-sm text-muted-foreground">View and manage your student records.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Link to a future 'add student' page/modal */}
          <Button disabled> {/* Disabled for now */}
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {loading && <div className="p-4 text-center">Loading students...</div>}
      {error && <div className="p-4 text-center text-red-600">Error: {error}</div>}

      {!loading && !error && (
        <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
          {students.length > 0 ? (
            students.map((student) => (
              <Card key={student.id}>
                <CardHeader>
                  <CardTitle>{student.full_name}</CardTitle>
                  {student.email && <CardDescription>{student.email}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Added on: {new Date(student.created_at).toLocaleDateString()}
                  </p>
                  {/* Add more student details or actions here */}
                </CardContent>
                {/* Optional CardFooter for actions like 'View Sessions' or 'Edit' */}
              </Card>
            ))
          ) : (
            <div className="col-span-full p-4 text-center text-muted-foreground">
              No students found. Add your first student to get started.
            </div>
          )}
        </div>
      )}
    </main>
  )
} 