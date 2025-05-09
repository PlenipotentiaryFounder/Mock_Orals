import { createSupabaseBrowserClient } from "./client"
import { SupabaseClient } from '@supabase/supabase-js'

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
  user_id: string // This is likely the instructor ID
  template_id: string
  scenario_id: string | null
  student_id: string // Add the student ID field
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

// Type for combined element details - Updated definition
export type ElementFullData = ElementData & {
    instructorNotes: InstructorNoteData[];
    sampleQuestions: SampleQuestionData[];
    // Add missing fields based on elements table structure and fetchElementDetails logic
    performance_criteria?: string[]; // Assuming these might be stored as JSON or fetched separately if normalized
    common_errors?: string[]; 
    references?: string[]; 
    // Define the structure for session-specific performance data
    performanceData: { 
        performance_status: 'satisfactory' | 'unsatisfactory' | 'not-observed';
        comment: string; 
    } | null; // Performance data might not exist yet for a session
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

  const supabase = createSupabaseBrowserClient()
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

  const supabase = createSupabaseBrowserClient()
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

  const supabase = createSupabaseBrowserClient()
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

  const supabase = createSupabaseBrowserClient()
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
  const supabase = createSupabaseBrowserClient()
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
  const supabase = createSupabaseBrowserClient()
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
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase.from("sessions").select("*").eq("id", sessionId).single()

  if (error || !data) {
    console.error("Error fetching session:", error)
    return null
  }

  return data
}

// Define a type for the session list item with related names
export type SessionListItem = SessionData & {
  template_name: string | null;
  student_name: string | null;
  instructor_name: string | null;
  scenario_title: string | null;
};

// NEW FUNCTION: Fetch sessions relevant to the current user (instructor or student)
export const getUserSessions = async (
  supabase: SupabaseClient<any, "public", any>,
  userId: string
): Promise<SessionListItem[]> => {
  if (!userId) {
    console.error("getUserSessions called without a userId.");
    return [];
  }

  // Call the database function
  const { data, error } = await supabase
    .rpc('get_user_sessions_list', { user_id_param: userId });

  if (error) {
    // Log the full error if it happens
    console.error("Error fetching user sessions via RPC:", JSON.stringify(error, null, 2)); 
    return [];
  }

  if (!data) {
    console.warn("No session data returned from RPC.");
    return [];
  }

  // The data should already be in the correct format defined by the function's RETURN TABLE
  // We just need to ensure the type matches SessionListItem (instructor_name, scenario_title)
  return data as SessionListItem[]; 
};

// Session with template and potentially scenario data
export const getSessionWithDetails = async (
  sessionId: string,
): Promise<{ 
  session: SessionData; 
  template: TemplateData | null; 
  scenario: ScenarioData | null; 
  student: StudentData | null; // Add student to return type
} | null> => {
  const supabase = createSupabaseBrowserClient()
  try {
    // Fetch session details including student_id
    const { data: sessionData, error: sessionError } = await supabase
      .from("sessions")
      .select("*, student_id") // Ensure student_id is selected
      .eq("id", sessionId)
      .single()

    if (sessionError || !sessionData) {
      console.error("Error fetching session:", sessionError)
      return null
    }

    // Fetch template details
    const template = sessionData.template_id ? await getTemplate(sessionData.template_id) : null

    // Fetch scenario details (if exists)
    const scenario = sessionData.scenario_id ? await getScenario(sessionData.scenario_id) : null // Assuming getScenario exists or needs creation

    // Fetch student details using the student_id from the session
    let student: StudentData | null = null;
    if (sessionData.student_id) {
        console.log(`[getSessionWithDetails] Attempting to fetch student using user_id: ${sessionData.student_id}`); // Log the ID being used
        const { data: studentData, error: studentError } = await supabase
            .from("students") // Assuming the table is named 'students'
            .select("*")
            // Use user_id instead of id for the lookup
            .eq("user_id", sessionData.student_id) 
            .single();
        
        if (studentError) {
            // Enhanced error logging
            console.error("Error fetching student. Raw error:", studentError);
            if (studentError.message) console.error("Supabase Error Message:", studentError.message);
            if (studentError.details) console.error("Supabase Error Details:", studentError.details);
            if (studentError.hint) console.error("Supabase Error Hint:", studentError.hint);
            if (studentError.code) console.error("Supabase Error Code:", studentError.code);
            // Decide if you want to return null session or just null student
            // For now, we'll proceed but log the error
        } else {
            student = studentData;
            console.log(`[getSessionWithDetails] Successfully fetched student: ${studentData?.full_name}`);
        }
    }

    return { session: sessionData, template, scenario, student } // Include student in the returned object
  } catch (error) {
    console.error("Unexpected error in getSessionWithDetails:", error)
    return null
  }
}

// Get completed tasks for a session
export const getCompletedTasksForSession = async (sessionId: string): Promise<string[]> => {
  const supabase = createSupabaseBrowserClient()
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
  const supabase = createSupabaseBrowserClient()

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
  const supabase = createSupabaseBrowserClient()
  
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
  const supabase = createSupabaseBrowserClient()

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
  const supabase = createSupabaseBrowserClient()

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
  const supabase = createSupabaseBrowserClient()

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
  instructor_id: string
  template_id: string
  scenario_id?: string | null
  notes?: string | null
  student_id: string
}): Promise<{ id: string } | null> => {
  const supabase = createSupabaseBrowserClient()

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
  const supabase = createSupabaseBrowserClient()

  const { data, error } = await supabase.from("templates").select("id, name, description").order("name")

  if (error || !data) {
    console.error("Error fetching templates:", error)
    return []
  }

  return data
}

// Get scenarios
export const getScenarios = async (): Promise<any[]> => {
  const supabase = createSupabaseBrowserClient()

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
  const supabase = createSupabaseBrowserClient()
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
  const supabase = createSupabaseBrowserClient()

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
        performance_status,
        a2_deficiency
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


  // 4. Map session_elements data to element status and deficiency
  const elementsWithStatus = elementsData.map((element) => {
    const sessionElement = element.session_elements && Array.isArray(element.session_elements) 
                           ? element.session_elements[0] // Get the first (should be only) entry for this session
                           : element.session_elements; // Handle if Supabase returns object directly (less common now)

    let status: 'completed' | 'in-progress' | 'issue' = 'in-progress'; // Default status
    let a2_deficiency = false;
    let performance_status: 'satisfactory' | 'unsatisfactory' | 'not-observed' = 'not-observed';

    if (sessionElement?.performance_status) {
        performance_status = sessionElement.performance_status;
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
    if (sessionElement?.a2_deficiency === true) {
      a2_deficiency = true;
    }
    // We only need basic element info + status + deficiency for the hierarchy view
    return {
        id: element.id,
        code: element.code,
        description: element.description,
        type: element.type,
        task_id: element.task_id, // Keep task_id for grouping
        status: status,
        a2_deficiency: a2_deficiency,
        performance_status: performance_status,
    } as ElementBasic & { task_id: string; a2_deficiency: boolean; performance_status: 'satisfactory' | 'unsatisfactory' | 'not-observed' };
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

  const supabase = createSupabaseBrowserClient();

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

  const supabase = createSupabaseBrowserClient();

  console.log(`[saveElementEvaluation] Saving: sessionId=${sessionId}, elementId=${elementId}, performance=${performance}, notes=${notes}`);

  const { data, error } = await supabase
    .from('session_elements')
    .upsert(
      {
        session_id: sessionId,
        element_id: elementId,
        performance_status: performance,
        instructor_comment: notes,
        needs_review: performance === 'unsatisfactory',
        score: null, // or keep as is if you want to allow score
      },
      {
        onConflict: 'session_id, element_id', // Specify columns for conflict detection
      }
    )
    .select(); // Select to confirm the operation

  if (error) {
    // Enhanced error logging
    console.error("Error saving element evaluation. Raw error:", error); 
    if (error.message) console.error("Supabase Error Message:", error.message);
    if (error.details) console.error("Supabase Error Details:", error.details);
    if (error.hint) console.error("Supabase Error Hint:", error.hint);
    if (error.code) console.error("Supabase Error Code:", error.code);
    return { success: false, error };
  }

  console.log(`[saveElementEvaluation] Success: sessionId=${sessionId}, elementId=${elementId}, performance=${performance}`);
  return { success: true };
};

// Helper function to get all element IDs for a given template ID
const getElementIdsForTemplate = async (supabase: SupabaseClient, templateId: string): Promise<string[]> => {
  // Step 1: Fetch area IDs for the template
  const { data: areasData, error: areasError } = await supabase
    .from('areas')
    .select('id')
    .eq('template_id', templateId);

  if (areasError) {
    console.error(`Error fetching areas for template ${templateId}:`, areasError, areasError?.message, areasError?.details);
    return [];
  }
  if (!areasData || areasData.length === 0) {
    console.warn(`No areas found for template ${templateId}`);
    return [];
  }
  const areaIds = areasData.map(area => area.id);

  // Step 2: Fetch task IDs for these areas
  const { data: tasksData, error: tasksError } = await supabase
    .from('tasks')
    .select('id')
    .in('area_id', areaIds);

  if (tasksError) {
    console.error(`Error fetching tasks for template ${templateId}:`, tasksError, tasksError?.message, tasksError?.details);
    return [];
  }
  if (!tasksData || tasksData.length === 0) {
    console.warn(`No tasks found for areas in template ${templateId}`);
    return [];
  }
  const taskIds = tasksData.map(task => task.id);

  // Step 3: Fetch element IDs for these tasks
  const { data: elementsData, error: elementsError } = await supabase
    .from('elements')
    .select('id')
    .in('task_id', taskIds);

  if (elementsError) {
    console.error(`Error fetching elements for tasks [${taskIds.join(', ')}]:`, elementsError, elementsError?.message, elementsError?.details);
    return [];
  }

  return elementsData ? elementsData.map(el => el.id) : [];
};

// Pre-populates session_elements with default 'not-observed' status for a new session
export const prepopulateSessionElements = async (
  sessionId: string,
  templateId: string
): Promise<{ success: boolean; error?: any }> => {
  if (!sessionId || !templateId) {
    console.error("Missing required arguments for prepopulateSessionElements");
    return { success: false, error: "Missing session or template ID." };
  }

  const supabase = createSupabaseBrowserClient(); // Use server client potentially

  try {
    const elementIds = await getElementIdsForTemplate(supabase, templateId);

    if (elementIds.length === 0) {
      console.log(`No elements found for template ${templateId}, skipping prepopulation.`);
      return { success: true }; // Not an error if template has no elements
    }

    const defaultElementRecords = elementIds.map(elementId => ({
      session_id: sessionId,
      element_id: elementId,
      performance_status: 'not-observed' as const, // Ensure correct type
      instructor_comment: '', // Default empty comment
      needs_review: false, // Default
      score: null, // Assuming nullable score column
    }));

    // Bulk insert the default records
    const { error: insertError } = await supabase
      .from('session_elements')
      .insert(defaultElementRecords);

    if (insertError) {
      console.error(`Error bulk inserting default session elements for session ${sessionId}:`, insertError);
      return { success: false, error: insertError };
    }

    console.log(`Successfully prepopulated ${defaultElementRecords.length} elements for session ${sessionId}`);
    return { success: true };

  } catch (error) {
    console.error(`Unexpected error during prepopulation for session ${sessionId}:`, error);
    return { success: false, error };
  }
};

// Fetch session notes
export const getSessionNotes = async (sessionId: string): Promise<string | null> => {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("notes")
    .eq("id", sessionId)
    .single();
  if (error) {
    console.error("Error fetching session notes:", error);
    return null;
  }
  return data?.notes || null;
};

// Update session notes
export const updateSessionNotes = async (sessionId: string, notes: string): Promise<boolean> => {
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase
    .from("sessions")
    .update({ notes })
    .eq("id", sessionId);
  if (error) {
    console.error("Error updating session notes:", error);
    return false;
  }
  return true;
};

// Fetch session history (lifecycle + element evaluations)
export const fetchSessionHistory = async (sessionId: string) => {
  const supabase = createSupabaseBrowserClient();
  // 1. Get session lifecycle events
  const { data: sessionData, error: sessionError } = await supabase
    .from("sessions")
    .select("created_at, date_started, date_completed, updated_at, notes")
    .eq("id", sessionId)
    .single();

  // 2. Get all element evaluations for this session, including a2_deficiency, code, description
  const { data: elementData, error: elementError } = await supabase
    .from("session_elements")
    .select("element_id, performance_status, instructor_comment, updated_at, a2_deficiency, elements(code, description)")
    .eq("session_id", sessionId)
    .order("updated_at", { ascending: false });

  // Map code/description to top-level for easier use
  const elementEvaluations = (elementData || []).map(ev => ({
    ...ev,
    code: ev.elements?.code,
    description: ev.elements?.description,
  }));

  return {
    session: sessionData || null,
    elementEvaluations,
    errors: { sessionError, elementError }
  };
};

export async function getScenariosForTemplate(templateId: string) {
  if (!templateId) {
    console.log("getScenariosForTemplate called without a templateId");
    return []; // Return empty if no templateId is provided
  }

  const supabase = createSupabaseBrowserClient(); 

  const { data, error } = await supabase
    .from('scenarios')
    .select('*') // Select all scenario columns, adjust if needed
    .eq('template_id', templateId)
    .order('title'); // Optional: Order scenarios by title

  if (error) {
    console.error('Error fetching scenarios for template:', error);
    return []; 
  }

  return data || [];
}

// Fetch all elements for a given template (across all areas/tasks)
export const getAllElementsForTemplate = async (templateId: string) => {
  const supabase = createSupabaseBrowserClient();

  // 1. Get all area IDs for the template
  const { data: areas, error: areasError } = await supabase
    .from('areas')
    .select('id')
    .eq('template_id', templateId);
  if (areasError || !areas) {
    console.error('Error fetching areas for template:', areasError);
    return [];
  }
  const areaIds = areas.map(a => a.id);
  if (areaIds.length === 0) return [];

  // 2. Get all task IDs for these areas
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('id')
    .in('area_id', areaIds);
  if (tasksError || !tasks) {
    console.error('Error fetching tasks for areas:', tasksError);
    return [];
  }
  const taskIds = tasks.map(t => t.id);
  if (taskIds.length === 0) return [];

  // 3. Get all elements for these tasks
  const { data: elements, error: elementsError } = await supabase
    .from('elements')
    .select('*')
    .in('task_id', taskIds)
    .order('code');
  if (elementsError || !elements) {
    console.error('Error fetching elements for tasks:', elementsError);
    return [];
  }
  return elements;
};

// Set a2_deficiency = true for selected element IDs in a session
export const setA2DeficienciesForSession = async (sessionId: string, elementIds: string[]) => {
  if (!sessionId || !elementIds || elementIds.length === 0) return;
  const supabase = createSupabaseBrowserClient();
  // Supabase upsert/update in bulk
  const { error } = await supabase
    .from('session_elements')
    .update({ a2_deficiency: true })
    .eq('session_id', sessionId)
    .in('element_id', elementIds);
  if (error) {
    console.error('Error updating a2_deficiency for session elements:', error);
  }
};

// Fetch only session elements with a2_deficiency = true for a session
export const fetchSessionDeficiencies = async (sessionId: string) => {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("session_elements")
    .select("element_id, a2_deficiency, performance_status, elements(code, description)")
    .eq("session_id", sessionId)
    .eq("a2_deficiency", true);
  if (error) {
    console.error("Error fetching session deficiencies:", error);
    return [];
  }
  // Map code/description to top-level for easier use
  return (data || []).map(ev => ({
    ...ev,
    code: ev.elements?.code,
    description: ev.elements?.description,
  }));
};

// Function to get a single scenario (if not already existing)
// Add this if it doesn't exist
export const getScenario = async (scenarioId: string): Promise<ScenarioData | null> => {
  const supabase = createSupabaseBrowserClient()
  const { data, error } = await supabase.from("scenarios").select("*").eq("id", scenarioId).single()

  if (error || !data) {
    console.error("Error fetching scenario:", error)
    return null
  }
  return data;
}
