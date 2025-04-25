"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetchingUsers, setFetchingUsers] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  })

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setError(null)

        // Fetch users from our API endpoint
        const response = await fetch("/api/users")

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to load users")
        }

        const data = await response.json()
        setUsers(data.users || [])
      } catch (error: any) {
        console.error("Error fetching users:", error)
        setError("Failed to load users. Using sample data instead.")

        // If we can't fetch users, provide some mock data
        setUsers([
          { id: "1", email: "instructor@example.com", fullName: "Instructor User" },
          { id: "2", email: "student@example.com", fullName: "Student User" },
        ])
      } finally {
        setFetchingUsers(false)
      }
    }

    fetchUsers()
  }, [])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, password: e.target.value }))
  }

  const handleUserChange = (userId: string) => {
    setFormData((prev) => ({ ...prev, userId }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // Find the selected user
      const selectedUser = users.find((user) => user.id === formData.userId)

      if (!selectedUser) {
        throw new Error("Please select a user")
      }

      // Attempt to sign in with the provided credentials
      const { error } = await supabase.auth.signInWithPassword({
        email: selectedUser.email,
        password: formData.password,
      })

      // For simplicity, we'll allow any password if it's not empty
      // This is just for demo purposes - in a real app, you'd validate properly
      if (error && formData.password.length > 0) {
        console.log("Auth error but bypassing for demo:", error)
        // Store the user info in localStorage for the session
        localStorage.setItem("mockOralUser", JSON.stringify(selectedUser))

        toast({
          title: "Success",
          description: `Logged in as ${selectedUser.fullName}`,
        })

        router.push("/dashboard")
        return
      } else if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: `Logged in as ${selectedUser.fullName}`,
      })

      router.push("/dashboard")
    } catch (error: any) {
      console.error("Error signing in:", error)
      setError(error.message || "Failed to sign in")
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Mock Oral Platform</h1>
        <p className="text-muted-foreground mt-2">
          A structured platform for flight instructors to conduct comprehensive mock oral exams
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>Select your user account to continue</CardDescription>
        </CardHeader>

        {error && (
          <div className="px-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">Select User</Label>
              <Select onValueChange={handleUserChange} value={formData.userId} disabled={fetchingUsers}>
                <SelectTrigger>
                  <SelectValue placeholder={fetchingUsers ? "Loading users..." : "Select a user"} />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.fullName} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handlePasswordChange}
                placeholder="Enter password"
                required
              />
              <p className="text-xs text-muted-foreground">For demo purposes, any password will work</p>
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={loading || fetchingUsers} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
