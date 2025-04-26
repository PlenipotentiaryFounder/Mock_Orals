"use client"

import Link from "next/link"
import { UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export function EmptyStudents() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
      <UserIcon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No students yet</h3>
      <p className="text-sm text-muted-foreground mb-4">
        You haven't added any students to your database.
        <br />
        Add a student to start managing your sessions.
      </p>
      <Link href="/students/new">
        <Button>
          Add Your First Student
        </Button>
      </Link>
    </div>
  )
} 