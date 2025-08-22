# Project Module - Unified Field Structure

## Core Fields (Required in ALL views: Create, View, Edit)

### Basic Information
1. **Project Name** (required)
   - Field: `name`
   - Type: string
   - Validation: Required, min 3 chars

2. **Description**
   - Field: `description`
   - Type: text/textarea
   - Validation: Optional

3. **Client** (required)
   - Field: `client_id` / `clientId`
   - Type: dropdown/select
   - Display: Client name in view mode

### Location Information
4. **GPS Coordinates** (required)
   - Field: `gps_latitude`, `gps_longitude`
   - Type: number
   - Features: Parse from various formats, use current location

5. **City/Town** (required)
   - Field: `city`
   - Type: string
   - Auto-populated from GPS

6. **Municipal District** (required)
   - Field: `municipal_district`
   - Type: string
   - Auto-populated from GPS

7. **Province** (required)
   - Field: `state` / `province`
   - Type: dropdown
   - Options: South African provinces

### Time & Schedule
8. **Start Date** (required)
   - Field: `start_date`
   - Type: date
   - Format: YYYY-MM-DD

9. **Duration (Months)** (required)
   - Field: `durationMonths`
   - Type: number
   - Used to calculate end date

10. **End Date** (calculated)
    - Field: `end_date`
    - Type: date
    - Auto-calculated from start date + duration

### Project Management
11. **Project Manager** (required)
    - Field: `project_manager_id`
    - Type: dropdown/select
    - Display: Manager name in view mode

12. **Priority** (required)
    - Field: `priority`
    - Type: dropdown
    - Options: LOW, MEDIUM, HIGH, CRITICAL

13. **Status**
    - Field: `status`
    - Type: dropdown (edit/view only)
    - Options: PLANNING, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED
    - Default: PLANNING (on creation)

### Financial
14. **Budget**
    - Field: `budget_allocated`
    - Type: number
    - Format: Currency (ZAR)

15. **Team Members**
    - Field: `teamMembers`
    - Type: array/list
    - Note: Can be added after creation

16. **Notes**
    - Field: `notes`
    - Type: textarea
    - Additional requirements or comments

## Display Consistency Rules

### Create Mode
- All fields editable
- Status defaults to "PLANNING"
- End date auto-calculated
- Location auto-populated from GPS

### View Mode
- All fields read-only
- Show formatted values (dates, currency)
- Display names instead of IDs (client, manager)
- Show calculated values (progress, days remaining)

### Edit Mode
- All fields editable except:
  - Project ID
  - Created date
  - Created by
- End date recalculated on duration change
- Location fields update on GPS change

## Data Format Mapping

### Database (Neon) to UI
```javascript
{
  // Database fields -> UI fields
  name: project.name,
  description: project.description,
  client_id: project.client_id,
  project_manager_id: project.project_manager_id,
  status: project.status,
  priority: project.priority,
  start_date: project.start_date,
  end_date: project.end_date,
  budget_allocated: project.budget_allocated,
  city: project.city,
  municipal_district: project.municipal_district,
  state: project.state,
  gps_latitude: project.gps_latitude,
  gps_longitude: project.gps_longitude,
  
  // Display fields (for view mode)
  client_name: project.client_name,
  manager_name: project.manager_name
}
```

### UI to Database
```javascript
{
  name: formData.name,
  description: formData.description,
  client_id: formData.clientId,
  project_manager_id: formData.projectManagerId,
  status: formData.status || 'PLANNING',
  priority: formData.priority,
  start_date: formData.startDate,
  end_date: formData.endDate,
  budget_allocated: formData.budget,
  city: formData.location.city,
  municipal_district: formData.location.municipalDistrict,
  state: formData.location.province,
  gps_latitude: formData.location.gpsLatitude,
  gps_longitude: formData.location.gpsLongitude
}
```

## Component Implementation Checklist

- [ ] ProjectCreationWizard - Uses all fields
- [ ] ProjectForm (Edit) - Uses all fields, populates from existing
- [ ] ProjectDetail (View) - Displays all fields read-only
- [ ] ProjectTable (List) - Shows key fields in table format
- [ ] ProjectOverview - Shows all fields in structured layout

## Validation Rules

1. **Required Fields**: name, client, GPS coordinates, city, district, province, start date, duration, project manager, priority
2. **GPS Validation**: Must be within South African boundaries
3. **Date Validation**: End date must be after start date
4. **Budget Validation**: Must be positive number
5. **Duration Validation**: Must be between 1-120 months