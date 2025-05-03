'use client'

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, ArrowLeft } from "lucide-react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

// Type for pilot certification options
interface PilotCertOption {
  id: string
  label: string
}

export default function NewStudentPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    pilot_cert_held: "",
    pilot_cert_desired: "",
  })
  const [pilotCerts, setPilotCerts] = useState<PilotCertOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [instructorId, setInstructorId] = useState("")
  const router = useRouter()
  const supabase = useRef(createSupabaseBrowserClient()).current

  // Fetch pilot certifications from Supabase
  useEffect(() => {
    const fetchCerts = async () => {
      const { data, error } = await supabase.from('pilot_certifications').select('id, certificate_level, category, class, code')
      if (error) {
        setError("Failed to load certificate options.")
        return
      }
      setPilotCerts((data || []).map((cert: any) => ({
        id: cert.id,
        label: `${cert.certificate_level} - ${cert.category} ${cert.class} (${cert.code})`
      })))
    }
    fetchCerts()
  }, [supabase])

  // Get current instructor's user id
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        setError("You must be logged in as an instructor to add students.")
        return
      }
      setInstructorId(data.user.id)
    }
    getUser()
  }, [supabase])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    if (!form.full_name || !form.email || !form.password || !form.pilot_cert_held || !form.pilot_cert_desired) {
      setError("All required fields must be filled.")
      setLoading(false)
      return
    }
    if (!instructorId) {
      setError("Instructor not found. Please log in again.")
      setLoading(false)
      return
    }
    try {
      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            role: "student"
          }
        }
      })
      if (authError || !authData?.user) {
        setError(authError?.message || "Failed to create user.")
        setLoading(false)
        return
      }
      // 2. Insert into students table
      const { error: studentError } = await supabase.from('students').insert({
        user_id: authData.user.id,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        pilot_cert_held: form.pilot_cert_held,
        pilot_cert_desired: form.pilot_cert_desired,
        instructor_id: instructorId
      })
      if (studentError) {
        setError(studentError.message || "Failed to create student profile.")
        setLoading(false)
        return
      }
      setSuccess("Student created successfully!")
      setLoading(false)
      setTimeout(() => router.push("/students"), 1500)
    } catch (err) {
      setError("Unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-background py-10 px-4">
      <div className="w-full max-w-xl bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6 gap-3">
          <Link href="/students">
            <Button variant="ghost" size="icon" className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Users className="h-8 w-8 text-blue-700" />
          <h2 className="text-2xl font-bold text-blue-900">Add New Student</h2>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <Input name="full_name" value={form.full_name} onChange={handleChange} required disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <Input name="email" type="email" value={form.email} onChange={handleChange} required disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input name="phone" value={form.phone} onChange={handleChange} disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password *</label>
            <Input name="password" type="password" value={form.password} onChange={handleChange} required disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Current Certificate *</label>
            <select name="pilot_cert_held" value={form.pilot_cert_held} onChange={handleChange} required disabled={loading} className="w-full border rounded px-3 py-2">
              <option value="">Select current certificate</option>
              {pilotCerts.map(cert => (
                <option key={cert.id} value={cert.id}>{cert.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Desired Certificate *</label>
            <select name="pilot_cert_desired" value={form.pilot_cert_desired} onChange={handleChange} required disabled={loading} className="w-full border rounded px-3 py-2">
              <option value="">Select desired certificate</option>
              {pilotCerts.map(cert => (
                <option key={cert.id} value={cert.id}>{cert.label}</option>
              ))}
            </select>
          </div>
          <div className="pt-2">
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Student"}
            </Button>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          {success && <div className="text-green-700 text-sm mt-2">{success}</div>}
        </form>
      </div>
    </div>
  )
} 