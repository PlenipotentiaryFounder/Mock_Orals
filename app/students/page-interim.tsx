"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle, Trash2, Edit } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// This is a temporary version of the students page
// that works with the current database structure (without a user_id column)

export default function StudentsPageInterim() {
  const router = useRouter()
  const [students, setStudents] = useState<any[]>([])
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
        // Instead of filtering by user_id (which doesn't exist yet),
        // we'll fetch all students for now since there's probably just test data
        const supabase = createClient()
        const { data, error } = await supabase
          .from("students")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          throw new Error(error.message)
        }

        setStudents(data || [])
      } catch (err: any) {
        console.error("Error fetching students:", err)
        setError(err.message || "Failed to load students.")
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
          {!loading && !error && (
            <p className="text-sm text-amber-500 font-medium mt-2">
              Note: Database setup in progress. Missing user_id column in students table. 
              Please apply the SQL fixes from the provided script.
            </p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button disabled> {/* Disabled until user_id column is added */}
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
                  {student.phone && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Phone: {student.phone}
                    </p>
                  )}
                  {!student.user_id && (
                    <p className="text-sm text-amber-500 mt-3">
                      No user_id assigned (database update needed)
                    </p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" disabled>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" disabled>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full p-4 text-center text-muted-foreground">
              No students found. Add your first student after applying database fixes.
            </div>
          )}
        </div>
      )}
    </main>
  )
} 