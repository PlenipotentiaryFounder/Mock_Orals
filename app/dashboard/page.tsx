import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { PlusCircle, Clock, CheckCircle2 } from "lucide-react"

export default function DashboardPage() {
  return (
    <>
      <main className="flex w-full flex-col overflow-hidden">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1 p-4">
            <h2 className="text-2xl font-semibold tracking-tight">Recent Sessions</h2>
            <p className="text-sm text-muted-foreground">View and manage your recent mock oral exam sessions</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/sessions/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Session
              </Button>
            </Link>
          </div>
        </div>
        <div className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Commercial ASEL - John Smith</CardTitle>
              <CardDescription>Created on April 24, 2023</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium">In Progress</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Areas Covered:</span>
                  <span className="font-medium">4/11</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Tasks Completed:</span>
                  <span className="font-medium">12/38</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/sessions/123" className="w-full">
                <Button variant="outline" className="w-full">
                  Continue Session
                </Button>
              </Link>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Private Pilot - Sarah Johnson</CardTitle>
              <CardDescription>Created on April 20, 2023</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-medium">Completed</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Areas Covered:</span>
                  <span className="font-medium">11/11</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Tasks Completed:</span>
                  <span className="font-medium">35/35</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/reports/456" className="w-full">
                <Button variant="outline" className="w-full">
                  View Report
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
    </>
  )
}
