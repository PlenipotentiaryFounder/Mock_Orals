import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Fetch users using the admin API
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Format the users
    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email || "no-email@example.com", // Provide a fallback email if null
      // Use user_metadata.full_name if available, otherwise fallback to email
      fullName: user.user_metadata?.full_name || user.email || "Unnamed User",
    }))

    return NextResponse.json({ users: formattedUsers })
  } catch (error: any) {
    console.error("Server error fetching users:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
