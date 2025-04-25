import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Fetch students from the public.students table
    const { data, error } = await supabase
      .from("students") // Query the students table
      .select("id, full_name, email") // Select needed columns
      .order("full_name") // Order by name

    if (error) {
      console.error("API Error fetching students:", error)
      return NextResponse.json({ error: "Failed to fetch student list" }, { status: 500 })
    }

    // Map to expected format (name instead of full_name for consistency with client type)
    const students = data.map(student => ({
      id: student.id,
      name: student.full_name, // Map full_name to name
      email: student.email,
    }))

    return NextResponse.json({ students })

  } catch (error: any) {
    console.error("API Server error fetching students:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST handler to create a new student
export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const studentData = await request.json()

    // Basic validation
    if (!studentData.full_name || !studentData.email) {
      return NextResponse.json({ error: "Missing required fields: full_name and email" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("students")
      .insert({
        full_name: studentData.full_name,
        email: studentData.email,
        phone: studentData.phone || null,
      })
      .select("id, full_name, email") // Return the created student's essential info
      .single()

    if (error) {
      console.error("API Error creating student:", error)
      // Handle potential unique constraint violation (e.g., duplicate email)
      if (error.code === '23505') { // PostgreSQL unique violation code
           return NextResponse.json({ error: "Student with this email already exists." }, { status: 409 }) // Conflict
      }
      return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
    }
    
    // Map full_name to name for consistency
    const newStudent = {
        id: data.id,
        name: data.full_name,
        email: data.email
    }

    return NextResponse.json({ student: newStudent }, { status: 201 }) // 201 Created

  } catch (error: any) {
    console.error("API Server error creating student:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST handler will be added later if needed for creating students 