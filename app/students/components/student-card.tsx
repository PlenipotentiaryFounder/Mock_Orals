"use client"

import { StudentData } from "@/lib/supabase/data-fetchers-fix"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatDate } from "@/lib/utils"
import { Eye, Phone, Mail } from "lucide-react"

interface StudentCardProps {
  student: StudentData
}

export function StudentCard({ student }: StudentCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{student.full_name}</CardTitle>
        {student.email && (
          <CardDescription className="flex items-center gap-1">
            <Mail className="h-3.5 w-3.5" />
            {student.email}
          </CardDescription>
        )}
        {student.phone && (
          <CardDescription className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5" />
            {student.phone}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground pb-2">
        <p>Added: {formatDate(student.created_at)}</p>
        {student.updated_at && student.updated_at !== student.created_at && (
          <p>Last updated: {formatDate(student.updated_at)}</p>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Link href={`/students/${student.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
} 