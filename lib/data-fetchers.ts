export async function getSessionWithDetails(sessionId: string): Promise<any> {
  // Mock implementation - replace with actual Supabase fetch
  await new Promise((resolve) => setTimeout(resolve, 300))

  const mockSession = {
    session: {
      id: sessionId,
      session_name: "Mock Session " + sessionId,
      status: "In Progress",
      created_at: new Date().toISOString(),
      start_time: new Date().toISOString(),
      end_time: null,
      evaluator: "John Doe",
    },
    template: {
      id: "template123",
      name: "Standard Template",
      category: "Flight Training",
      version: "1.2",
      created_at: new Date().toISOString(),
    },
    scenario: {
      id: "scenario456",
      title: "Cross Country Flight",
      aircraft_type: "Cessna 172",
      departure_airport: "KLAX",
      arrival_airport: "KSFO",
      flight_conditions: "VMC",
      scenario_text: "A cross-country flight from Los Angeles to San Francisco. Expect moderate turbulence.",
    },
  }

  return mockSession
}

export async function getFullHierarchy(templateId: string): Promise<any[]> {
  // Mock implementation - replace with actual Supabase fetch
  await new Promise((resolve) => setTimeout(resolve, 500))

  const mockData = [
    {
      id: "area1",
      order_number: 1,
      title: "Area 1",
      tasks: [
        {
          id: "task1",
          order_letter: "A",
          title: "Task 1",
          elements: [
            { id: "element1", code: "EL1", description: "Element 1", status: "completed" },
            { id: "element2", code: "EL2", description: "Element 2", status: "in-progress" },
          ],
        },
        {
          id: "task2",
          order_letter: "B",
          title: "Task 2",
          elements: [
            { id: "element3", code: "EL3", description: "Element 3", status: "issue" },
            { id: "element4", code: "EL4", description: "Element 4", status: "completed" },
          ],
        },
      ],
    },
    {
      id: "area2",
      order_number: 2,
      title: "Area 2",
      tasks: [
        {
          id: "task3",
          order_letter: "A",
          title: "Task 3",
          elements: [
            { id: "element5", code: "EL5", description: "Element 5", status: "completed" },
            { id: "element6", code: "EL6", description: "Element 6", status: "in-progress" },
          ],
        },
      ],
    },
  ]
  return mockData
}
