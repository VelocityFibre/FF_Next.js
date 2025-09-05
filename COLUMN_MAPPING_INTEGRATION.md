# Column Mapping Integration for FF_React

## Overview

This integration adds **automatic column mapping** to your FF_React SOW import workflow. It ensures that Excel files uploaded to your Neon database have standardized column names, eliminating "Missing required columns" errors.

## Architecture

```
┌─────────────────┐    ┌──────────────────────┐    ┌─────────────────┐
│   FF_React      │───▶│  Column Mapper API   │───▶│   Neon DB       │
│ (localhost:5173)│    │  (localhost:5001)    │    │                 │
└─────────────────┘    └──────────────────────┘    └─────────────────┘
```

## What's New

### ✅ **Automatic Column Mapping**
- **Step 1** in SOW import wizard now automatically maps columns
- No more manual column renaming required
- Handles common variations (pon_no → pole_number, lat → latitude, etc.)

### ✅ **Seamless Integration**
- Integrated into existing SOW import workflow
- No changes needed to existing user interface
- Works with all existing file upload functionality

### ✅ **Error Prevention**
- Validates column mappings before database insertion
- Provides clear error messages if mapping fails
- Ensures data integrity

## Quick Start

### 1. Setup Integration
```bash
# From FF_React directory
./integration_runner.sh
```

This will:
- ✅ Install all required dependencies
- ✅ Start the column mapping service
- ✅ Verify the integration works

### 2. Test the Integration
1. **Open your browser** → `http://localhost:5173/sow/import`
2. **Select a project** from the dropdown
3. **Upload your Excel file** (e.g., `Lawley Poles.xlsx`)
4. **Watch the magic** ✨ - Column mapping happens automatically!

## Detailed Setup

### Prerequisites
- Node.js and npm (for FF_React)
- Python 3.8+ (for column mapping service)
- PostgreSQL/Neon database connection

### Manual Setup

#### 1. Start Column Mapping Service
```bash
# Terminal 1: Start column mapping service
cd grok-agent
./start_column_mapper.sh
# Service runs on http://localhost:5001
```

#### 2. Start FF_React Application
```bash
# Terminal 2: Start your React app
cd FF_React
npm run dev
# App runs on http://localhost:5173
```

#### 3. Test Integration
1. Navigate to `http://localhost:5173/sow/import`
2. Select a project
3. Upload an Excel file
4. The first step will now automatically map columns!

## Configuration

### Column Mappings
Column mappings are defined in JSON files in the `grok-agent/configs/` directory.

**Default Pole Configuration** (`configs/pole.json`):
```json
{
  "pon_no": "pole_number",
  "lat": "latitude",
  "lon": "longitude",
  "cblcpty1": "cable_capacity_1",
  "conntr1": "conductor_1",
  "cmpownr": "company_owner",
  "datecrtd": "date_created",
  "crtdby": "created_by",
  "date_edt": "date_edited",
  "editby": "edited_by"
}
```

### Creating New Configurations
```bash
# Create config for different data types
cd grok-agent
python3 column_mapper.py --create-config cable_config.json
# Edit cable_config.json with your mappings
```

## API Endpoints

### Column Mapping Service (localhost:5001)

#### GET `/health`
Check if service is running
```bash
curl http://localhost:5001/health
```

#### GET `/configs`
List available configurations
```bash
curl http://localhost:5001/configs
```

#### POST `/map-columns`
Map columns in uploaded file
```bash
curl -X POST http://localhost:5001/map-columns \
  -F "file=@your_file.xlsx" \
  -F "config_name=pole"
```

#### POST `/preview-columns`
Preview column mappings without processing
```bash
curl -X POST http://localhost:5001/preview-columns \
  -F "file=@your_file.xlsx" \
  -F "config_name=pole"
```

#### POST `/validate-file`
Validate required columns exist
```bash
curl -X POST http://localhost:5001/validate-file \
  -F "file=@your_file.xlsx" \
  -F "config_name=pole" \
  -F "required_columns=pole_number" \
  -F "required_columns=latitude" \
  -F "required_columns=longitude"
```

## Workflow Integration

### Before Integration
```
User Uploads → Manual Column Check → Error → Manual Fix → Retry
```

### After Integration
```
User Uploads → Automatic Mapping → Success → Continue Import
```

### Step-by-Step Process

1. **User selects project** at `/sow/import`
2. **Wizard opens** with 4 steps:
   - ✅ **Step 1: Column Mapping** (NEW - Automatic)
   - 📊 Step 2: Upload Poles
   - 🔌 Step 3: Upload Fibers
   - 📡 Step 4: Upload Drops
3. **User uploads file** in Step 1
4. **Column mapping service** automatically:
   - Reads the Excel file
   - Maps columns (e.g., `pon_no` → `pole_number`)
   - Returns standardized file
5. **User proceeds** to Step 2 with mapped file
6. **Import completes** successfully! 🎉

## Troubleshooting

### Service Won't Start
```bash
# Check if port 5001 is available
lsof -i :5001

# Kill any existing process
kill -9 $(lsof -ti :5001)

# Restart service
cd grok-agent && ./start_column_mapper.sh
```

### Column Mapping Fails
```bash
# Check service logs
tail -f grok-agent/column_mapper.log

# Test service manually
curl http://localhost:5001/health

# Verify configuration
cat grok-agent/configs/pole.json
```

### Import Still Fails
```bash
# Check if mapped columns exist
curl -X POST http://localhost:5001/validate-file \
  -F "file=@your_file.xlsx" \
  -F "config_name=pole" \
  -F "required_columns=pole_number" \
  -F "required_columns=latitude" \
  -F "required_columns=longitude"
```

## Testing

### Automated Test
```bash
# Run the integration test
./integration_runner.sh
```

### Manual Test
1. Start services (see Quick Start)
2. Open browser to `http://localhost:5173/sow/import`
3. Upload test file with various column names
4. Verify mappings work correctly

### Sample Test Data
Create an Excel file with these columns to test:
- `pon_no` (will map to `pole_number`)
- `lat` (will map to `latitude`)
- `lon` (will map to `longitude`)
- `cblcpty1` (will map to `cable_capacity_1`)

## Production Deployment

### Environment Setup
```bash
# Set environment variables
export NODE_ENV=production
export DATABASE_URL=your_neon_connection_string
export COLUMN_MAPPER_URL=http://localhost:5001
```

### Docker Deployment
```dockerfile
# Dockerfile for column mapping service
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5001
CMD ["python", "column_mapper_service.py"]
```

### Systemd Service
```ini
# /etc/systemd/system/column-mapper.service
[Unit]
Description=Column Mapping Service
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/grok-agent
ExecStart=/path/to/grok-agent/venv/bin/python column_mapper_service.py
Restart=always

[Install]
WantedBy=multi-user.target
```

## Support

### Common Issues

**Q: Service won't start**
A: Check if port 5001 is available and Python virtual environment is activated

**Q: Columns not mapping correctly**
A: Verify the configuration file has the correct mappings

**Q: Import still fails after mapping**
A: Check that the mapped file has the required columns for your database schema

### Logs
```bash
# Service logs
tail -f grok-agent/column_mapper.log

# Next.js logs
tail -f FF_React/.next/server.log
```

### Getting Help
1. Check the service health: `curl http://localhost:5001/health`
2. Verify configurations in `grok-agent/configs/`
3. Test with the web interface at `http://localhost:5001/test.html`

## Changelog

### v1.0.0 - Initial Integration
- ✅ Automatic column mapping in SOW import wizard
- ✅ REST API for column mapping operations
- ✅ Support for Excel and CSV files
- ✅ Configuration-based mapping rules
- ✅ Integration with existing FF_React workflow
- ✅ Error handling and validation
- ✅ Production deployment support

---

**🎉 Your FF_React application now has automatic column mapping!**

The "Missing required columns" error is now a thing of the past. Users can upload files with any reasonable column names, and the system will automatically standardize them for your Neon database. 🚀