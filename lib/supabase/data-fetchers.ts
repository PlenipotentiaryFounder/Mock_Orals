import { createClient } from "./client"

// Type definitions for better type safety
export type TemplateData = {
  id: string
  name: string
  description: string | null
}

export type AreaData = {
  id: string
  order_number: number
  title: string
  description: string | null
}

export type TaskData = {
  id: string
  area_id: string
  order_letter: string
  title: string
  objective: string | null
  is_required: boolean
}

export type ElementData = {
  id: string
  task_id: string
  code: string
  type: "knowledge" | "risk" | "skill"
  label: string | null
  description: string
}

export type InstructorNoteData = {
  id: string
  element_id: string
  note_text: string
  source_title: string | null
  source_url: string | null
  page_reference: string | null
}

export type SampleQuestionData = {
  id: string
  element_id: string
  question_text: string
}

export type SessionData = {
  id: string
  user_id: string
  template_id: string
  scenario_id: string | null
  session_name: string
  notes: string | null
  date_started: string
  date_completed: string | null
}

// Add StudentData type definition
export type StudentData = {
  id: string // Assuming UUID primary key for student
  user_id: string // Foreign key referencing auth.users.id
  full_name: string
  email: string | null
  created_at: string
}

// Add ScenarioData type definition
export type ScenarioData = {
  id: string;
  template_id: string;
  title: string;
  aircraft_type: string | null;
  departure_airport: string | null;
  arrival_airport: string | null;
  flight_conditions: string | null;
  scenario_text: string;
  created_by: string | null;
  created_at: string | null;
};

// Type for the nested structure
export type ElementBasic = { 
  id: string; 
  code: string; 
  description: string; 
  type: string;
  status: 'completed' | 'in-progress' | 'issue'; // Add status field
};
export type TaskWithElements = TaskData & { elements: ElementBasic[] };
export type AreaWithTasksAndElements = AreaData & { tasks: TaskWithElements[] };

// Type for combined element details
export type ElementFullData = ElementData & {
    instructorNotes: InstructorNoteData[];
    sampleQuestions: SampleQuestionData[];
    scoreData: { 
        score: number | null; // Allow null for score
        comment: string; 
        instructor_mentioned: boolean; 
        student_mentioned: boolean; 
    } | null; // Score data might not exist yet
};

// Cache for frequently accessed data
const cache = {
  templates: new Map<string, TemplateData>(),
  areas: new Map<string, AreaData>(),
  tasks: new Map<string, TaskData>(),
  elements: new Map<string, ElementData>(),
  areasByTemplate: new Map<string, AreaData[]>(),
  tasksByArea: new Map<string, TaskData[]>(),
  elementsByTask: new Map<string, ElementData[]>(),
}

// Clear cache (useful when data might have changed)
export const clearCache = () => {
  cache.templates.clear()
  cache.areas.clear()
  cache.tasks.clear()
  cache.elements.clear()
  cache.areasByTemplate.clear()
  cache.tasksByArea.clear()
  cache.elementsByTask.clear()
}

// Template fetchers
export const getTemplate = async (templateId: string): Promise<TemplateData | null> => {
  // Check cache first
  if (cache.templates.has(templateId)) {
    return cache.templates.get(templateId) || null
  }

  const supabase = createClient()
  const { data, error } = await supabase.from("templates").select("*").eq("id", templateId).single()

  if (error || !data) {
    console.error("Error fetching template:", error)
    return null
  }

  // Cache the result
  cache.templates.set(templateId, data)
  return data
}

// Area fetchers
export const getAreasByTemplate = async (templateId: string): Promise<AreaData[]> => {
  // Check cache first
  if (cache.areasByTemplate.has(templateId)) {
    return cache.areasByTemplate.get(templateId) || []
  }

  const supabase = createClient()
  const { data, error } = await supabase.from("areas").select("*").eq("template_id", templateId).order("order_number")

  if (error || !data) {
    console.error("Error fetching areas:", error)
    return []
  }

  // Cache the results
  cache.areasByTemplate.set(templateId, data)
  data.forEach((area) => cache.areas.set(area.id, area))
  return data
}

// Task fetchers
export const getTasksByArea = async (areaId: string): Promise<TaskData[]> => {
  // Check cache first
  if (cache.tasksByArea.has(areaId)) {
    return cache.tasksByArea.get(areaId) || []
  }

  const supabase = createClient()
  const { data, error } = await supabase.from("tasks").select("*").eq("area_id", areaId).order("order_letter")

  if (error || !data) {
    console.error("Error fetching tasks:", error)
    return []
  }

  // Cache the results
  cache.tasksByArea.set(areaId, data)
  data.forEach((task) => cache.tasks.set(task.id, task))
  return data
}

// Element fetchers
export const getElementsByTask = async (
  taskId: string,
  elementType?: "knowledge" | "risk" | "skill",
): Promise<ElementData[]> => {
  const cacheKey = `${taskId}${elementType ? `-${elementType}` : ""}`

  // Check cache first
  if (cache.elementsByTask.has(cacheKey)) {
    return cache.elementsByTask.get(cacheKey) || []
  }

  const supabase = createClient()
  let query = supabase.from("elements").select("*").eq("task_id", taskId).order("code")

  if (elementType) {
    query = query.eq("type", elementType)
  }

  const { data, error } = await query

  if (error || !data) {
    console.error("Error fetching elements:", error)
    return []
  }

  // Cache the results
  cache.elementsByTask.set(cacheKey, data)
  data.forEach((element) => cache.elements.set(element.id, element))
  return data
}

// Instructor notes fetchers
export const getInstructorNotesByElement = async (elementId: string): Promise<InstructorNoteData[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("instructor_notes")
    .select("*")
    .eq("element_id", elementId)
    .order("created_at")

  if (error || !data) {
    console.error("Error fetching instructor notes:", error)
    return []
  }

  return data
}

// Sample questions fetchers
export const getSampleQuestionsByElement = async (elementId: string): Promise<SampleQuestionData[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("sample_questions")
    .select("*")
    .eq("element_id", elementId)
    .order("created_at")

  if (error || !data) {
    console.error("Error fetching sample questions:", error)
    return []
  }

  return data
}

// Session fetchers
export const getSession = async (sessionId: string): Promise<SessionData | null> => {
  const supabase = createClient()
  const { data, error } = await supabase.from("sessions").select("*").eq("id", sessionId).single()

  if (error || !data) {
    console.error("Error fetching session:", error)
    return null
  }

  return data
}

// Session with template and potentially scenario data
export const getSessionWithDetails = async (
  sessionId: string,
): Promise<{ 
  session: SessionData; 
  template: TemplateData | null; 
  scenario: ScenarioData | null; 
} | null> => {
  const session = await getSession(sessionId);
  if (!session) return null;

  // Fetch template
  const template = session.template_id 
    ? await getTemplate(session.template_id) 
    : null;

  // Fetch scenario if scenario_id exists
  let scenario: ScenarioData | null = null;
  if (session.scenario_id) {
    const supabase = createClient();
    const { data: scenarioData, error: scenarioError } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', session.scenario_id)
      .single();
      
    if (scenarioError) {
      console.error("Error fetching scenario for session:", scenarioError);
      // Don't fail the whole fetch if scenario lookup fails, just return null scenario
    } else {
      scenario = scenarioData;
    }
  }

  return { session, template, scenario };
}

// Get completed tasks for a session
export const getCompletedTasksForSession = async (sessionId: string): Promise<string[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("session_tasks")
    .select("task_id")
    .eq("session_id", sessionId)
    .eq("is_complete", true)

  if (error || !data) {
    console.error("Error fetching completed tasks:", error)
    return []
  }

  return data.map((item) => item.task_id)
}

// Get element scores for a session
export const getElementScoresForSession = async (
  sessionId: string,
  elementIds?: string[],
): Promise<Record<string, { score: number; comment: string; instructor_mentioned: boolean; student_mentioned: boolean }>> => {
  const supabase = createClient()

  let query = supabase
    .from("session_elements")
    .select("element_id, score, instructor_comment, instructor_mentioned, student_mentioned")
    .eq("session_id", sessionId)

  if (elementIds && elementIds.length > 0) {
    query = query.in("element_id", elementIds)
  }

  const { data, error } = await query

  // Only log an error if the Supabase client actually returned an error object
  if (error) {
    console.error("Error fetching element scores:", error) 
    return {}
  }
  
  // If data is null/undefined or empty, it means no scores found, which is not an error itself.
  // Return empty object in this case too.
  if (!data) {
      return {}
  }

  const scores: Record<string, { score: number; comment: string; instructor_mentioned: boolean; student_mentioned: boolean }> = {}
  data.forEach((item) => {
    scores[item.element_id] = {
      score: item.score,
      comment: item.instructor_comment || "",
      instructor_mentioned: item.instructor_mentioned || false,
      student_mentioned: item.student_mentioned || false,
    }
  })

  return scores
}

// Save element score and comment
export const saveElementScore = async (
  sessionId: string,
  elementId: string,
  score: number | null,
  comment = "",
  instructorMentioned = false,
  studentMentioned = false
): Promise<boolean> => {
  const supabase = createClient()
  
  // Prepare upsert data, ensuring score is included only if not null,
  // or explicitly setting it to null if that's desired behaviour for the DB.
  // Assuming the DB column `score` is nullable.
  const upsertData: any = {
      session_id: sessionId,
      element_id: elementId,
      score: score, // Directly pass the value (number or null)
      instructor_comment: comment,
      instructor_mentioned: instructorMentioned,
      student_mentioned: studentMentioned,
  };

  // Optional: Clean up null values if your DB handles default values better
  // Object.keys(upsertData).forEach(key => upsertData[key] === null && delete upsertData[key]);

  const { error } = await supabase
    .from("session_elements")
    .upsert(upsertData);

  if (error) {
    // Log the data that caused the error for easier debugging
    console.error("Error saving element score:", error, "Payload:", upsertData);
    return false
  }

  return true
}

// Get all data needed for ACS sidebar
export const getAcsSidebarData = async (
  sessionId: string,
): Promise<{
  areas: AreaData[]
  tasksByArea: Record<string, TaskData[]>
  completedTasks: string[]
} | null> => {
  try {
    // Get session to find template_id
    const session = await getSession(sessionId)
    if (!session) return null

    // Get areas for this template
    const areas = await getAreasByTemplate(session.template_id)

    // Get tasks for each area
    const tasksByArea: Record<string, TaskData[]> = {}
    for (const area of areas) {
      tasksByArea[area.id] = await getTasksByArea(area.id)
    }

    // Get completed tasks
    const completedTasks = await getCompletedTasksForSession(sessionId)

    return { areas, tasksByArea, completedTasks }
  } catch (error) {
    console.error("Error fetching ACS sidebar data:", error)
    return null
  }
}

// Get all data needed for element view
export const getElementViewData = async (
  taskId: string,
  sessionId: string,
  elementType: "knowledge" | "risk" | "skill",
): Promise<{
  elements: ElementData[]
  instructorNotes: Record<string, InstructorNoteData[]>
  sampleQuestions: Record<string, SampleQuestionData[]>
  scores: Record<string, { 
    score: number; 
    comment: string;
    instructor_mentioned: boolean;
    student_mentioned: boolean;
  }>
} | null> => {
  try {
    // Get elements for this task and type
    const elements = await getElementsByTask(taskId, elementType)

    // Get instructor notes and sample questions for each element
    const instructorNotes: Record<string, InstructorNoteData[]> = {}
    const sampleQuestions: Record<string, SampleQuestionData[]> = {}

    for (const element of elements) {
      instructorNotes[element.id] = await getInstructorNotesByElement(element.id)
      sampleQuestions[element.id] = await getSampleQuestionsByElement(element.id)
    }

    // Get scores for these elements
    const scores = await getElementScoresForSession(
      sessionId,
      elements.map((e) => e.id),
    )

    return { elements, instructorNotes, sampleQuestions, scores }
  } catch (error) {
    console.error("Error fetching element view data:", error)
    return null
  }
}

// Get task data with area
export const getTaskWithArea = async (taskId: string): Promise<{ task: TaskData; area: AreaData } | null> => {
  const supabase = createClient()

  // Get task data
  const { data: taskData, error: taskError } = await supabase.from("tasks").select("*").eq("id", taskId).single()

  if (taskError || !taskData) {
    console.error("Error fetching task:", taskError)
    return null
  }

  // Get area data
  const { data: areaData, error: areaError } = await supabase
    .from("areas")
    .select("*")
    .eq("id", taskData.area_id)
    .single()

  if (areaError || !areaData) {
    console.error("Error fetching area:", areaError)
    return null
  }

  return { task: taskData, area: areaData }
}

// Get task scores for a session
export const getTaskScoresForSession = async (sessionId: string): Promise<any[]> => {
  const supabase = createClient()

  // Get task scores
  const { data: taskScores, error: taskScoresError } = await supabase
    .from("session_tasks")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at")

  if (taskScoresError || !taskScores) {
    console.error("Error fetching task scores:", taskScoresError)
    return []
  }

  // Enhance task scores with task and area data
  const enhancedTaskScores = await Promise.all(
    taskScores.map(async (taskScore) => {
      const taskWithArea = await getTaskWithArea(taskScore.task_id)

      if (!taskWithArea) {
        return { ...taskScore, task: { title: "Unknown", order_letter: "" } }
      }

      return {
        ...taskScore,
        task: {
          ...taskWithArea.task,
          area: taskWithArea.area,
        },
      }
    }),
  )

  return enhancedTaskScores
}

// Get element scores with details for a session
export const getElementScoresWithDetailsForSession = async (sessionId: string): Promise<any[]> => {
  const supabase = createClient()

  // Get element scores
  const { data: elementScores, error: elementScoresError } = await supabase
    .from("session_elements")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at")

  if (elementScoresError || !elementScores) {
    console.error("Error fetching element scores:", elementScoresError)
    return []
  }

  // Enhance element scores with element and task data
  const enhancedElementScores = await Promise.all(
    elementScores.map(async (elementScore) => {
      // Get element data
      const { data: elementData, error: elementError } = await supabase
        .from("elements")
        .select("*")
        .eq("id", elementScore.element_id)
        .single()

      if (elementError || !elementData) {
        return {
          ...elementScore,
          element: {
            code: "Unknown",
            description: "Unknown element",
            task: null,
          },
        }
      }

      // Get task data
      const { data: taskData, error: taskError } = await supabase
        .from("tasks")
        .select("title, order_letter")
        .eq("id", elementData.task_id)
        .single()

      const task = taskError || !taskData ? { title: "Unknown", order_letter: "" } : taskData

      return {
        ...elementScore,
        element: {
          ...elementData,
          task,
        },
      }
    }),
  )

  return enhancedElementScores
}

// Create a new session
export const createNewSession = async (sessionData: {
  session_name: string
  user_id: string
  template_id: string
  scenario_id?: string | null
  notes?: string | null
  student_id: string
}): Promise<{ id: string } | null> => {
  const supabase = createClient()

  const insertData: any = {
    ...sessionData,
    date_started: new Date().toISOString(),
    student_id: sessionData.student_id
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert(insertData)
    .select("id")
    .single()

  if (error || !data) {
    console.error("Error creating session in DB:", error, "Data passed:", insertData)
    return null
  }

  return { id: data.id }
}

// Get templates
export const getTemplates = async (): Promise<TemplateData[]> => {
  const supabase = createClient()

  const { data, error } = await supabase.from("templates").select("id, name, description").order("name")

  if (error || !data) {
    console.error("Error fetching templates:", error)
    return []
  }

  return data
}

// Get scenarios
export const getScenarios = async (): Promise<any[]> => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("scenarios")
    .select("id, title, aircraft_type, departure_airport, arrival_airport")
    .order("title")

  if (error || !data) {
    console.error("Error fetching scenarios:", error)
    return []
  }

  return data
}

// Add function to get students by user ID
export const getStudentsByUserId = async (userId: string): Promise<StudentData[]> => {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("students") // Query the public.students table
    .select("*")
    .eq("user_id", userId) // Filter by the user_id column
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching students:", error)
    return []
  }

  return data || []
}

// Fetch full Area -> Task -> Element hierarchy for a template
export const getFullHierarchy = async (
  templateId: string,
  sessionId: string // Add sessionId argument
): Promise<AreaWithTasksAndElements[]> => {
  const supabase = createClient()

  // 1. Fetch all areas for the template
  const { data: areasData, error: areasError } = await supabase
    .from("areas")
    .select("*")
    .eq("template_id", templateId)
    .order("order_number")

  if (areasError) {
    console.error("Error fetching areas:", areasError)
    return []
  }
  if (!areasData) {
    return []
  }

  const areaIds = areasData.map((area) => area.id)

  // 2. Fetch all tasks for these areas
  const { data: tasksData, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .in("area_id", areaIds)
    .order("order_letter")

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError)
    return []
  }
  if (!tasksData) {
    // If there are no tasks, return areas with empty tasks arrays
    return areasData.map(area => ({ ...area, tasks: [] }));
  }


  const taskIds = tasksData.map((task) => task.id)

  // 3. Fetch all elements for these tasks AND their session status
  const { data: elementsData, error: elementsError } = await supabase
    .from("elements")
    .select(`
      *,
      session_elements (
        performance_status
      )
    `)
    .in("task_id", taskIds)
    .eq("session_elements.session_id", sessionId) // Filter session_elements by sessionId
    .order("code")
  
  if (elementsError) {
    console.error("Error fetching elements with session status:", elementsError)
    // Decide how to handle partial errors, maybe return hierarchy with empty elements?
    return [] 
  }
  if (!elementsData) {
    // If there are no elements, return areas and tasks with empty elements arrays
     const tasksByArea = tasksData.reduce((acc, task) => {
        if (!acc[task.area_id]) acc[task.area_id] = [];
        acc[task.area_id].push({ ...task, elements: [] });
        return acc;
    }, {} as Record<string, TaskWithElements[]>);

    return areasData.map(area => ({
        ...area,
        tasks: tasksByArea[area.id] || [],
    }));
  }


  // 4. Map session_elements data to element status
  const elementsWithStatus = elementsData.map((element) => {
    const sessionElement = element.session_elements && Array.isArray(element.session_elements) 
                           ? element.session_elements[0] // Get the first (should be only) entry for this session
                           : element.session_elements; // Handle if Supabase returns object directly (less common now)

    let status: 'completed' | 'in-progress' | 'issue' = 'in-progress'; // Default status

    if (sessionElement?.performance_status) {
        switch (sessionElement.performance_status) {
            case 'satisfactory':
                status = 'completed';
                break;
            case 'unsatisfactory':
                status = 'issue';
                break;
            case 'not-observed':
                // Falls through to default 'in-progress' which is correct
                break; 
        }
    }
    
    // We only need basic element info + status for the hierarchy view
    return {
        id: element.id,
        code: element.code,
        description: element.description,
        type: element.type,
        task_id: element.task_id, // Keep task_id for grouping
        status: status,
    } as ElementBasic & { task_id: string }; // Include task_id temporarily
  });


  // 5. Group elements by task
  const elementsByTask = elementsWithStatus.reduce((acc, element) => {
    if (!acc[element.task_id]) {
      acc[element.task_id] = []
    }
    // Remove temporary task_id before pushing
    const { task_id, ...elementBasic } = element; 
    acc[element.task_id].push(elementBasic);
    return acc
  }, {} as Record<string, ElementBasic[]>)

  // 6. Group tasks by area and add elements
  const tasksByArea = tasksData.reduce((acc, task) => {
    if (!acc[task.area_id]) {
      acc[task.area_id] = []
    }
    acc[task.area_id].push({
      ...task,
      elements: elementsByTask[task.id] || [],
    })
    return acc
  }, {} as Record<string, TaskWithElements[]>)

  // 7. Combine areas with their tasks
  const finalHierarchy = areasData.map((area) => ({
    ...area,
    tasks: tasksByArea[area.id] || [],
  }))

  return finalHierarchy
}

// Fetch detailed data for a single element within a session context
export const fetchElementDetails = async (
  elementId: string,
  sessionId: string,
): Promise<ElementFullData | null> => {
  if (!elementId || !sessionId) return null;

  const supabase = createClient();

  // 1. Fetch base element data
  const { data: elementData, error: elementError } = await supabase
    .from('elements')
    .select('*')
    .eq('id', elementId)
    .single();

  if (elementError || !elementData) {
    console.error(`Error fetching element ${elementId}:`, elementError);
    return null;
  }

  // 2. Fetch associated instructor notes
  const { data: instructorNotes, error: notesError } = await supabase
    .from('instructor_notes')
    .select('*')
    .eq('element_id', elementId)
    .order('order_number');

  if (notesError) {
    console.warn(`Error fetching instructor notes for element ${elementId}:`, notesError);
    // Continue even if notes fail
  }

  // 3. Fetch associated sample questions
  const { data: sampleQuestions, error: questionsError } = await supabase
    .from('sample_questions')
    .select('*')
    .eq('element_id', elementId)
    .order('order_number');
  
  if (questionsError) {
    console.warn(`Error fetching sample questions for element ${elementId}:`, questionsError);
    // Continue even if questions fail
  }

  // 4. Fetch session-specific performance data for this element
  const { data: sessionElementData, error: sessionElementError } = await supabase
    .from('session_elements')
    .select('performance_status, instructor_comment') // Fetch the relevant fields
    .eq('session_id', sessionId)
    .eq('element_id', elementId)
    .maybeSingle(); // Use maybeSingle as the record might not exist yet
  
  if (sessionElementError) {
    console.error(`Error fetching session element data for element ${elementId} in session ${sessionId}:`, sessionElementError);
    // Decide if this error is critical. For now, let's return null if we can't get session data.
    return null; 
  }

  // 5. Combine the data
  const combinedData: ElementFullData = {
    ...elementData,
    // Ensure arrays are not null even if fetch failed or returned null
    instructorNotes: instructorNotes || [], 
    sampleQuestions: sampleQuestions || [],
    // Map session data to the expected structure
    performanceData: sessionElementData ? {
      performance_status: sessionElementData.performance_status as ('satisfactory' | 'unsatisfactory' | 'not-observed'),
      comment: sessionElementData.instructor_comment || ''
    } : null,
  };

  return combinedData;
};

// Saves the performance evaluation for a specific element in a session
export const saveElementEvaluation = async (
  sessionId: string,
  elementId: string,
  performance: 'satisfactory' | 'unsatisfactory' | 'not-observed',
  notes: string
): Promise<{ success: boolean; error?: any }> => {
  if (!sessionId || !elementId || !performance) {
    console.error("Missing required arguments for saveElementEvaluation");
    return { success: false, error: "Missing required arguments." };
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from('session_elements')
    .upsert(
      {
        session_id: sessionId,
        element_id: elementId,
        performance_status: performance,
        instructor_comment: notes,
        // Optionally set needs_review based on performance
        needs_review: performance === 'unsatisfactory',
      },
      {
        onConflict: 'session_id, element_id', // Specify columns for conflict detection
      }
    )
    .select(); // Select to confirm the operation

  if (error) {
    console.error("Error saving element evaluation:", error);
    return { success: false, error };
  }

  console.log("Saved evaluation for element:", elementId, "in session:", sessionId, data);
  return { success: true };
};
