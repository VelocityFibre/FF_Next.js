# SOW API Documentation

This directory contains the API endpoints for Statement of Work (SOW) operations in the FF React Neon application.

## Available Endpoints

### 1. Initialize SOW Tables
**POST** `/api/sow/initialize`

Initialize SOW database tables for a project.

Request body:
```json
{
  "projectId": "uuid-string"
}
```

Response:
```json
{
  "success": true,
  "message": "SOW tables initialized successfully",
  "tables": ["sow_poles", "sow_drops", "sow_fibre", "sow_project_summary"],
  "projectId": "uuid-string"
}
```

### 2. Poles Operations

#### Upload/Update Poles
**POST** `/api/sow/poles`

Request body:
```json
{
  "projectId": "uuid-string",
  "poles": [
    {
      "pole_number": "P001",
      "latitude": 12.345678,
      "longitude": -98.765432,
      "status": "pending",
      "pole_type": "Type A",
      "pole_spec": "Spec 1",
      "height": "30ft",
      "diameter": "12in",
      "owner": "Company A",
      "pon_no": 1,
      "zone_no": 1,
      "address": "123 Main St",
      "municipality": "City",
      "created_date": "2024-01-01T00:00:00Z",
      "created_by": "user@example.com",
      "comments": "Notes here"
    }
  ]
}
```

#### Get Poles
**GET** `/api/sow/poles?projectId={uuid}`

#### Update Single Pole
**PUT** `/api/sow/poles?id={poleId}`

#### Delete Poles
**DELETE** `/api/sow/poles?id={poleId}`
**DELETE** `/api/sow/poles?projectId={uuid}&poleNumbers={pole1,pole2}`

### 3. Drops Operations

#### Upload/Update Drops
**POST** `/api/sow/drops`

Request body:
```json
{
  "projectId": "uuid-string",
  "drops": [
    {
      "drop_number": "D001",
      "pole_number": "P001",
      "cable_type": "Fiber",
      "cable_spec": "12-strand",
      "cable_length": "100m",
      "cable_capacity": "12",
      "start_point": "P001",
      "end_point": "House 1",
      "latitude": 12.345678,
      "longitude": -98.765432,
      "address": "123 Main St",
      "pon_no": 1,
      "zone_no": 1,
      "municipality": "City",
      "status": "planned",
      "created_date": "2024-01-01T00:00:00Z",
      "created_by": "user@example.com"
    }
  ]
}
```

#### Get Drops
**GET** `/api/sow/drops?projectId={uuid}`
**GET** `/api/sow/drops?projectId={uuid}&poleNumber={poleNumber}`

#### Update Single Drop
**PUT** `/api/sow/drops?id={dropId}`

#### Delete Drops
**DELETE** `/api/sow/drops?id={dropId}`
**DELETE** `/api/sow/drops?projectId={uuid}&dropNumbers={drop1,drop2}`

### 4. Fibre Operations

#### Upload/Update Fibre
**POST** `/api/sow/fibre`

Request body:
```json
{
  "projectId": "uuid-string",
  "fibre": [
    {
      "segment_id": "F001",
      "cable_size": "48",
      "layer": "Layer 1",
      "distance": 500.5,
      "pon_no": 1,
      "zone_no": 1,
      "string_completed": 250.0,
      "date_completed": "2024-01-15",
      "contractor": "Contractor A",
      "status": "planned",
      "is_complete": false
    }
  ]
}
```

#### Get Fibre Segments
**GET** `/api/sow/fibre?projectId={uuid}`
**GET** `/api/sow/fibre?projectId={uuid}&contractor={name}`
**GET** `/api/sow/fibre?projectId={uuid}&status={status}`

#### Update Single Fibre Segment
**PUT** `/api/sow/fibre?id={fibreId}`

#### Delete Fibre Segments
**DELETE** `/api/sow/fibre?id={fibreId}`
**DELETE** `/api/sow/fibre?projectId={uuid}&segmentIds={seg1,seg2}`

### 5. Project SOW Data
**GET** `/api/sow/project?projectId={uuid}`

Get all SOW data for a project including poles, drops, fibre, and analytics.

Response includes:
- All poles with drop counts
- All drops
- All fibre segments
- Project summary
- Detailed statistics and analytics

### 6. SOW Summary
**GET** `/api/sow/summary?projectId={uuid}` - Get summary for specific project
**GET** `/api/sow/summary` - Get summary for all projects with SOW data

### 7. Health Check
**GET** `/api/sow/health`

Check the health status of SOW database tables and connections.

## Database Schema

### sow_poles
- id (SERIAL PRIMARY KEY)
- project_id (UUID)
- pole_number (VARCHAR)
- latitude/longitude (DECIMAL)
- status (VARCHAR)
- pole_type, pole_spec, height, diameter (VARCHAR)
- owner (VARCHAR)
- pon_no, zone_no (INTEGER)
- address, municipality (TEXT/VARCHAR)
- created_date, created_by (TIMESTAMP/VARCHAR)
- comments (TEXT)
- raw_data (JSONB)
- created_at, updated_at (TIMESTAMP)

### sow_drops
- id (SERIAL PRIMARY KEY)
- project_id (UUID)
- drop_number (VARCHAR)
- pole_number (VARCHAR)
- cable_type, cable_spec, cable_length, cable_capacity (VARCHAR)
- start_point, end_point (VARCHAR)
- latitude/longitude (DECIMAL)
- address (TEXT)
- pon_no, zone_no (INTEGER)
- municipality (VARCHAR)
- status (VARCHAR)
- created_date, created_by (TIMESTAMP/VARCHAR)
- raw_data (JSONB)
- created_at, updated_at (TIMESTAMP)

### sow_fibre
- id (SERIAL PRIMARY KEY)
- project_id (UUID)
- segment_id (VARCHAR)
- cable_size (VARCHAR)
- layer (VARCHAR)
- distance (DECIMAL)
- pon_no, zone_no (INTEGER)
- string_completed (DECIMAL)
- date_completed (DATE)
- contractor (VARCHAR)
- status (VARCHAR)
- is_complete (BOOLEAN)
- raw_data (JSONB)
- created_at, updated_at (TIMESTAMP)

### sow_project_summary
- id (SERIAL PRIMARY KEY)
- project_id (UUID UNIQUE)
- project_name (VARCHAR)
- total_poles, total_drops, total_fibre_segments (INTEGER)
- total_fibre_length (DECIMAL)
- last_updated (TIMESTAMP)

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```

## CORS

All endpoints have CORS enabled to allow cross-origin requests from the frontend application.