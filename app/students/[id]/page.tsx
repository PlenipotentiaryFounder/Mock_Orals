import { cookies } from "next/headers"
import Link from "next/link"
import { createClient } from "@/lib/supabase/utils"
import { Button } from "@/components/ui/button"

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const studentId = params.id

  // Fetch student details
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("*, instructor:instructor_id(full_name, email), pilot_cert_held:pilot_cert_held(*), pilot_cert_desired:pilot_cert_desired(*)")
    .eq("user_id", studentId)
    .single()

  // Fetch scenarios for this student (if any)
  const { data: scenarios, error: scenarioError } = await supabase
    .from("scenarios")
    .select("id, title, created_at")
    .eq("created_by", studentId)
    .order("created_at", { ascending: false })

  if (studentError) {
    return <div className="p-8 text-red-600">Error loading student: {studentError.message}</div>
  }

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-blue-900">{student.full_name}</h1>
        <Link href={`/students/${studentId}/scenarios/new`}>
          <Button size="lg" className="shadow-md">
            + New Scenario
          </Button>
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="mb-2"><span className="font-semibold">Email:</span> {student.email}</div>
        <div className="mb-2"><span className="font-semibold">Phone:</span> {student.phone || <span className="text-muted-foreground">N/A</span>}</div>
        <div className="mb-2"><span className="font-semibold">Current Certificate:</span> {student.pilot_cert_held?.certificate_level} - {student.pilot_cert_held?.category} {student.pilot_cert_held?.class}</div>
        <div className="mb-2"><span className="font-semibold">Desired Certificate:</span> {student.pilot_cert_desired?.certificate_level} - {student.pilot_cert_desired?.category} {student.pilot_cert_desired?.class}</div>
        <div className="mb-2"><span className="font-semibold">Instructor:</span> {student.instructor?.full_name || <span className="text-muted-foreground">N/A</span>}</div>
        <div className="mb-2"><span className="font-semibold">Created At:</span> {new Date(student.created_at).toLocaleString()}</div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Scenarios</h2>
        {scenarioError && <div className="text-red-600 mb-2">Error loading scenarios: {scenarioError.message}</div>}
        {scenarios && scenarios.length > 0 ? (
          <ul className="space-y-3">
            {scenarios.map((sc: any) => (
              <li key={sc.id} className="bg-muted/40 rounded p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-lg">{sc.title}</div>
                  <div className="text-sm text-muted-foreground">Created: {new Date(sc.created_at).toLocaleString()}</div>
                </div>
                <Link href={`/scenarios/${sc.id}`} className="text-blue-700 hover:underline">View</Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-muted-foreground">No scenarios found for this student.</div>
        )}
      </div>
    </div>
  )
} 