"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/lib/supabase/client"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { ArrowLeft, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

// Define the common form schema
const commonSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().min(7, {
    message: "Please enter a valid phone number.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

// Additional schema for student users
const studentSchema = commonSchema.extend({
  certHeld: z.string({
    required_error: "Please select your current certificate.",
  }),
  certDesired: z.string({
    required_error: "Please select your desired certificate.",
  }),
});

// Additional schema for instructor users
const instructorSchema = commonSchema.extend({
  certHeld: z.string({
    required_error: "Please select your certificate.",
  }),
  isCFI: z.boolean().default(false),
  isCFII: z.boolean().default(false),
});

type Certification = {
  id: string;
  code: string;
  certificate_level: string;
  category: string;
  class: string;
  type_rating: string | null;
};

// Create a direct client for dev mode (bypass RLS)
function createDevClient() {
  // This is for development only - NEVER use in production
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    // Using the anon key since we don't have service role key in the browser
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    { 
      db: { 
        schema: 'public' 
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

export default function RegisterPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<"student" | "instructor">("student")
  const [certifications, setCertifications] = useState<Certification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [devMode, setDevMode] = useState(false)

  // Initialize student form
  const studentForm = useForm<z.infer<typeof studentSchema>>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      certHeld: "",
      certDesired: "",
    },
  });

  // Initialize instructor form
  const instructorForm = useForm<z.infer<typeof instructorSchema>>({
    resolver: zodResolver(instructorSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      certHeld: "",
      isCFI: false,
      isCFII: false,
    },
  });

  useEffect(() => {
    // Fetch certification options immediately
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pilot_certifications")
        .select("*")
        .order("certificate_level", { ascending: true })
        .order("category", { ascending: true })
        .order("class", { ascending: true });

      if (error) {
        console.error("Error fetching certifications:", error);
        return;
      }

      setCertifications(data);
    } catch (err) {
      console.error("Failed to fetch certifications:", err);
    }
  };

  const onStudentSubmit = async (data: z.infer<typeof studentSchema>) => {
    await handleSubmit(data, "student");
  };

  const onInstructorSubmit = async (data: z.infer<typeof instructorSchema>) => {
    await handleSubmit(data, "instructor");
  };

  const handleSubmit = async (
    data: z.infer<typeof commonSchema> & {
      certHeld: string;
      certDesired?: string;
      isCFI?: boolean;
      isCFII?: boolean;
    },
    role: "student" | "instructor"
  ) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // In dev mode, use a different approach - create server API
      if (devMode) {
        // For dev mode, use direct API calls instead to bypass RLS
        const userId = crypto.randomUUID();
        console.log("DEV MODE: Using fake user ID:", userId);
        
        const payload = {
          role,
          userId,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          certHeld: data.certHeld,
          ...(role === "student" ? { certDesired: data.certDesired } : {}),
          ...(role === "instructor" ? { isCFI: data.isCFI, isCFII: data.isCFII } : {})
        };
        
        console.log("DEV MODE: Sending payload to API:", payload);
        
        try {
          // Create a temporary endpoint to handle this
          const response = await fetch('/api/dev/create-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          
          const responseData = await response.json();
          
          if (!response.ok) {
            console.error("DEV MODE API Error:", responseData);
            throw new Error(responseData.error || 'Failed to create test user');
          }
          
          console.log("DEV MODE: API Response:", responseData);
          setSuccess("Test account created successfully!");
          setTimeout(() => {
            router.push("/dashboard");
          }, 1500);
          
        } catch (apiError: any) {
          console.error("DEV MODE: API call failed:", apiError);
          throw new Error(`API Error: ${apiError.message}`);
        }
        
        return;
      }
      
      // Regular auth flow (non-dev mode)
      const supabase = createClient();
      
      // 1. Create user in auth.users
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role,
            full_name: data.fullName,
          },
        },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      const user = authData.user;
      if (!user) {
        throw new Error("Failed to create user account");
      }
      
      const userId = user.id;

      // 2. Create profile in the appropriate table based on role
      if (role === "student") {
        const { error: profileError } = await supabase.from("students").insert({
          user_id: userId, 
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          pilot_cert_held: data.certHeld,
          pilot_cert_desired: data.certDesired,
        });

        if (profileError) {
          throw new Error(`Failed to create student profile: ${profileError.message}`);
        }
      } else if (role === "instructor") {
        const { error: profileError } = await supabase.from("instructor").insert({
          id: userId,
          user_id: userId,
          full_name: data.fullName,
          email: data.email,
          phone_number: data.phone,
          pilot_cert_held: data.certHeld,
          cfi_certified: data.isCFI,
          cfii_certified: data.isCFII,
        });

        if (profileError) {
          throw new Error(`Failed to create instructor profile: ${profileError.message}`);
        }
      }

      setSuccess("Account created successfully!");
      
      if (!devMode) {
        // Only attempt to sign in if not in dev mode
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (signInError) {
          console.error("Automatic sign-in failed:", signInError);
        } 
      }
      
      // Always redirect after successful creation
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
      
    } catch (err: any) {
      console.error("Error during registration:", err);
      setError(err.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to format certification for display
  const formatCertification = (cert: Certification) => {
    return `${cert.certificate_level} ${cert.category} ${cert.class}${cert.type_rating ? ` - ${cert.type_rating}` : ''}`;
  };

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">Create Your Account</h1>
        <div className="flex items-center">
          <label className="flex items-center cursor-pointer">
            <span className="mr-2 text-sm">Dev Mode</span>
            <input
              type="checkbox"
              checked={devMode}
              onChange={(e) => setDevMode(e.target.checked)}
              className="h-4 w-4"
            />
          </label>
        </div>
      </div>

      <Tabs 
        defaultValue="student" 
        className="w-full" 
        onValueChange={(value) => setUserRole(value as "student" | "instructor")}
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="student" disabled={isLoading}>Student Pilot</TabsTrigger>
          <TabsTrigger value="instructor" disabled={isLoading}>Instructor</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {userRole === "student" 
                ? "Register as a Student Pilot" 
                : "Register as an Instructor"}
            </CardTitle>
            <CardDescription>
              {userRole === "student"
                ? "Create an account to prepare for your checkride with expert guidance"
                : "Create an account to conduct and track mock oral exams with your students"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                <Check className="h-4 w-4 text-green-800" />
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="student" className="mt-0">
              <Form {...studentForm}>
                <form onSubmit={studentForm.handleSubmit(onStudentSubmit)} className="space-y-4">
                  <div className="space-y-4">
                    <FormField
                      control={studentForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={studentForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={studentForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="(123) 456-7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <FormField
                        control={studentForm.control}
                        name="certHeld"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Certificate Held</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select certificate" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {certifications.map((cert) => (
                                  <SelectItem key={cert.id} value={cert.id}>
                                    {formatCertification(cert)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={studentForm.control}
                        name="certDesired"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Certificate Desired</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select certificate" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {certifications.map((cert) => (
                                  <SelectItem key={cert.id} value={cert.id}>
                                    {formatCertification(cert)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={studentForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Student Account"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="instructor" className="mt-0">
              <Form {...instructorForm}>
                <form onSubmit={instructorForm.handleSubmit(onInstructorSubmit)} className="space-y-4">
                  <div className="space-y-4">
                    <FormField
                      control={instructorForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={instructorForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={instructorForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="(123) 456-7890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={instructorForm.control}
                      name="certHeld"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certificate Held</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select certificate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {certifications.map((cert) => (
                                <SelectItem key={cert.id} value={cert.id}>
                                  {formatCertification(cert)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-2 border-2 border-dashed border-gray-200 rounded-md p-4 bg-gray-50">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Instructor Certifications</h3>
                      
                      <FormField
                        control={instructorForm.control}
                        name="isCFI"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">
                              Certified Flight Instructor (CFI)
                            </FormLabel>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={instructorForm.control}
                        name="isCFII"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal text-sm">
                              Certified Flight Instructor - Instrument (CFII)
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={instructorForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Instructor Account"
                    )}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
      
      {/* Add link to Login page */}
      <div className="mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign In
        </Link>
      </div>
      
    </div>
  )
} 