"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plane, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function GetStartedPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleRoleSelect = (role: "student" | "instructor") => {
    setLoading(role)
    // Redirect to the register page (no need for localStorage)
    router.push(`/register`)
  }

  return (
    <div className="container max-w-5xl mx-auto py-16 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to Mock Orals</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The platform for pilots and instructors to conduct and track mock oral exams and training sessions
          based on FAA ACS standards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="bg-blue-50">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mx-auto mb-4">
              <Plane className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle className="text-center">I'm a Student Pilot</CardTitle>
            <CardDescription className="text-center">
              Prepare for your checkride with expert guidance
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Track your progress through ACS standards</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Practice with realistic mock oral scenarios</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Get personalized feedback from instructors</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={() => handleRoleSelect("student")}
              disabled={loading !== null}
            >
              {loading === "student" ? "Please wait..." : "Continue as Student"}
            </Button>
          </CardFooter>
        </Card>

        <Card className="overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="bg-indigo-50">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mx-auto mb-4">
              <Headphones className="h-8 w-8 text-indigo-600" />
            </div>
            <CardTitle className="text-center">I'm an Instructor</CardTitle>
            <CardDescription className="text-center">
              Conduct effective mock orals with your students
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Manage multiple students and their progress</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Use pre-built templates or create your own</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Generate detailed student performance reports</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => handleRoleSelect("instructor")}
              disabled={loading !== null}
            >
              {loading === "instructor" ? "Please wait..." : "Continue as Instructor"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 