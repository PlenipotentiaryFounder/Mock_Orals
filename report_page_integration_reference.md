# Report Page Integration Reference

## 1. Report Page Integration

- **Main Entry Points:**
  - `app/reports/page.tsx`: Placeholder for `/reports`, no data fetching yet.
  - `app/reports/[id]/page.tsx`: Dynamic report page for a specific session/report. Fully implemented for fetching and displaying report data.

- **How the Report Page Works:**
  - Uses React hooks to fetch data on load, based on the session/report ID from the URL.
  - Calls three main data-fetching functions from `lib/supabase/data-fetchers.ts`:
    - `getSessionWithDetails(id)`
    - `getTaskScoresForSession(id)`
    - `getElementScoresWithDetailsForSession(id)`
  - Displays:
    - Session and template info
    - Performance summary (dates, notes, strengths, areas for improvement)
    - Task performance breakdown (with scores, feedback, tags)
    - Element-level details (with scores and descriptions)
    - Print and Download PDF buttons (UI only, not yet implemented)

---

## 2. Supabase Tables and Fields Used

### a. `sessions`
- Used to fetch the main session/report data.
- Fields: `id`, `session_name`, `template_id`, `scenario_id`, `notes`, `date_started`, `date_completed`, `student_id`, `instructor_id`.

### b. `templates`
- Used to fetch the template associated with the session.
- Fields: `id`, `name`, `description`.

### c. `scenarios`
- Optionally fetched if the session has a scenario.
- Fields: `id`, `template_id`, `title`, `aircraft_type`, `departure_airport`, `arrival_airport`, `flight_conditions`, `scenario_text`, `created_by`, `created_at`.

### d. `session_tasks`
- Used to fetch all task scores for the session.
- Fields: `id`, `session_id`, `task_id`, `is_complete`, `task_score_total`, `task_score_earned`, `instructor_feedback`, `feedback_tag`, `created_at`.
- Each task is further enriched with data from the `tasks` and `areas` tables.

### e. `tasks`
- Used to fetch task details for each session task.
- Fields: `id`, `area_id`, `order_letter`, `title`, `objective`, `is_required`, `created_at`.

### f. `areas`
- Used to fetch the area for each task.
- Fields: `id`, `order_number`, `title`, `description`, `template_id`, `created_at`.

### g. `session_elements`
- Used to fetch all element scores for the session.
- Fields: `id`, `session_id`, `element_id`, `score`, `instructor_comment`, `needs_review`, `created_at`, `performance_status`.

### h. `elements`
- Used to fetch element details for each session element.
- Fields: `id`, `task_id`, `code`, `type`, `label`, `description`, `created_at`.

---

## 3. Data Fetching Functions

- **`getSessionWithDetails`**: Fetches the session, its template, and (optionally) scenario.
- **`getTaskScoresForSession`**: Fetches all `session_tasks` for the session, then enriches each with its `task` and `area`.
- **`getElementScoresWithDetailsForSession`**: Fetches all `session_elements` for the session, then enriches each with its `element` and the corresponding `task`.

---

## 4. Current Status

- The report generation and display logic is **fully implemented** for individual reports at `/reports/[id]`.
- The main `/reports` page is a placeholder and does not yet list or link to individual reports.
- All data is fetched live from Supabase using the tables and fields listed above.
- The UI is set up for printing and downloading, but those features are not yet implemented.

---

If you need a deeper dive into any specific part (e.g., how feedback tags are used, or how to extend the report), or want to know about the placeholder `/reports` page, let me know! 