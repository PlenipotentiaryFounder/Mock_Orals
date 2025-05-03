# Supabase Public Schema Reference

This document provides a comprehensive reference for all tables, fields, types, and relationships in the `public` schema of your Supabase project.

---

## Table of Contents
- [areas](#areas)
- [elements](#elements)
- [instructor](#instructor)
- [instructor_notes](#instructor_notes)
- [pilot_certifications](#pilot_certifications)
- [sample_questions](#sample_questions)
- [scenarios](#scenarios)
- [session_elements](#session_elements)
- [session_tasks](#session_tasks)
- [sessions](#sessions)
- [students](#students)
- [tasks](#tasks)
- [templates](#templates)

---

## areas
| Field         | Type    | Nullable | Description |
|---------------|---------|----------|-------------|
| id            | uuid    | No       | Primary key |
| template_id   | uuid    | No       | FK to templates.id |
| order_number  | int     | No       |             |
| title         | text    | No       |             |
| description   | text    | Yes      |             |
| created_at    | timestamptz | Yes   |             |

**Relationships:**
- `template_id` → `templates.id`

---

## elements
| Field         | Type    | Nullable | Description |
|---------------|---------|----------|-------------|
| id            | uuid    | No       | Primary key |
| task_id       | uuid    | No       | FK to tasks.id |
| code          | text    | No       | Unique      |
| type          | text    | No       | Enum: 'knowledge', 'risk', 'skill' |
| label         | text    | Yes      |             |
| description   | text    | No       |             |
| created_at    | timestamptz | Yes   |             |

**Relationships:**
- `task_id` → `tasks.id`

---

## instructor
| Field           | Type    | Nullable | Description |
|-----------------|---------|----------|-------------|
| id              | uuid    | No       | Primary key |
| user_id         | uuid    | No       | FK to users.id (auth schema) |
| full_name       | text    | No       |             |
| phone_number    | text    | Yes      |             |
| cfi_certified   | boolean | Yes      |             |
| cfii_certified  | boolean | Yes      |             |
| created_at      | timestamptz | Yes   |             |
| pilot_cert_held | uuid    | Yes      | FK to pilot_certifications.id |

**Relationships:**
- `pilot_cert_held` → `pilot_certifications.id`

---

## instructor_notes
| Field               | Type    | Nullable | Description |
|---------------------|---------|----------|-------------|
| id                  | uuid    | No       | Primary key |
| element_id          | uuid    | No       | FK to elements.id |
| note_text           | text    | No       |             |
| source_title        | text    | Yes      |             |
| source_url          | text    | Yes      |             |
| page_reference      | text    | Yes      |             |
| order_number        | int     | Yes      |             |
| instructor_mentioned| boolean | Yes      |             |
| student_mentioned   | boolean | Yes      |             |
| created_at          | timestamptz | Yes   |             |

**Relationships:**
- `element_id` → `elements.id`

---

## pilot_certifications
| Field            | Type    | Nullable | Description |
|------------------|---------|----------|-------------|
| id               | uuid    | No       | Primary key |
| certificate_level| text    | No       | Enum: 'Student', 'Private', 'Commercial', 'ATP', 'CFI', 'CFII' |
| category         | text    | No       | Enum: 'Airplane' |
| class            | text    | No       | Enum: 'Single-Engine Land', 'Multi-Engine Land', 'Single-Engine Sea', 'Multi-Engine Sea' |
| type_rating      | text    | Yes      |             |
| code             | text    | No       | Unique      |
| created_at       | timestamptz | Yes   |             |

---

## sample_questions
| Field         | Type    | Nullable | Description |
|---------------|---------|----------|-------------|
| id            | uuid    | No       | Primary key |
| element_id    | uuid    | No       | FK to elements.id |
| question_text | text    | No       |             |
| order_number  | int     | Yes      |             |
| created_at    | timestamptz | Yes   |             |

**Relationships:**
- `element_id` → `elements.id`

---

## scenarios
| Field            | Type    | Nullable | Description |
|------------------|---------|----------|-------------|
| id               | uuid    | No       | Primary key |
| template_id      | uuid    | No       | FK to templates.id |
| title            | text    | No       |             |
| aircraft_type    | text    | Yes      |             |
| departure_airport| text    | Yes      |             |
| arrival_airport  | text    | Yes      |             |
| flight_conditions| text    | Yes      |             |
| scenario_text    | text    | No       |             |
| created_by       | uuid    | Yes      | FK to users.id (auth schema) |
| created_at       | timestamptz | Yes   |             |

**Relationships:**
- `template_id` → `templates.id`

---

## session_elements
| Field             | Type    | Nullable | Description |
|-------------------|---------|----------|-------------|
| id                | uuid    | No       | Primary key |
| session_id        | uuid    | No       | FK to sessions.id |
| element_id        | uuid    | No       | FK to elements.id |
| score             | int     | Yes      | 1-4         |
| instructor_comment| text    | Yes      |             |
| needs_review      | boolean | Yes      |             |
| created_at        | timestamptz | Yes   |             |
| performance_status| text    | Yes      | Enum: 'satisfactory', 'unsatisfactory', 'not-observed' |
| a2_deficiency     | boolean | Yes      | Written test deficiency flag (A2) |

**Relationships:**
- `session_id` → `sessions.id`
- `element_id` → `elements.id`

---

## session_tasks
| Field             | Type    | Nullable | Description |
|-------------------|---------|----------|-------------|
| id                | uuid    | No       | Primary key |
| session_id        | uuid    | No       | FK to sessions.id |
| task_id           | uuid    | No       | FK to tasks.id |
| is_complete       | boolean | Yes      |             |
| task_score_total  | int     | Yes      |             |
| task_score_earned | int     | Yes      |             |
| instructor_feedback| text   | Yes      |             |
| feedback_tag      | text    | Yes      | Enum: 'ready_for_checkride', 'excellent', 'proficient', 'needs_review', 'weak', 'oral_only', 'did_not_cover' |
| created_at        | timestamptz | Yes   |             |

**Relationships:**
- `session_id` → `sessions.id`
- `task_id` → `tasks.id`

---

## sessions
| Field         | Type    | Nullable | Description |
|---------------|---------|----------|-------------|
| id            | uuid    | No       | Primary key |
| instructor_id | uuid    | No       | FK to users.id (auth schema) |
| template_id   | uuid    | No       | FK to templates.id |
| scenario_id   | uuid    | Yes      | FK to scenarios.id |
| session_name  | text    | Yes      |             |
| notes         | text    | Yes      |             |
| date_started  | timestamp | Yes    |             |
| date_completed| timestamp | Yes    |             |
| created_at    | timestamptz | Yes   |             |
| student_id    | uuid    | Yes      | FK to users.id (auth schema) |

**Relationships:**
- `template_id` → `templates.id`
- `scenario_id` → `scenarios.id`

---

## students
| Field             | Type    | Nullable | Description |
|-------------------|---------|----------|-------------|
| user_id           | uuid    | No       | Primary key, FK to users.id (auth schema) |
| full_name         | text    | No       |             |
| email             | text    | No       | Unique      |
| phone             | text    | Yes      |             |
| created_at        | timestamptz | Yes   |             |
| updated_at        | timestamptz | Yes   |             |
| pilot_cert_held   | uuid    | Yes      | FK to pilot_certifications.id |
| pilot_cert_desired| uuid    | Yes      | FK to pilot_certifications.id |
| instructor_id     | uuid    | Yes      | FK to users.id (auth schema) |

**Relationships:**
- `pilot_cert_held` → `pilot_certifications.id`
- `pilot_cert_desired` → `pilot_certifications.id`

---

## tasks
| Field         | Type    | Nullable | Description |
|---------------|---------|----------|-------------|
| id            | uuid    | No       | Primary key |
| area_id       | uuid    | No       | FK to areas.id |
| order_letter  | text    | No       |             |
| title         | text    | No       |             |
| objective     | text    | Yes      |             |
| is_required   | boolean | Yes      |             |
| created_at    | timestamptz | Yes   |             |

**Relationships:**
- `area_id` → `areas.id`

---

## templates
| Field         | Type    | Nullable | Description |
|---------------|---------|----------|-------------|
| id            | uuid    | No       | Primary key |
| name          | text    | No       |             |
| description   | text    | Yes      |             |
| created_at    | timestamptz | Yes   |             |
| acs           | text    | Yes      | ACS code    |

--- 