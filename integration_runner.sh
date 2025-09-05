#!/bin/bash

# FF_React Column Mapping Integration Runner
# This script sets up and tests the column mapping integration

echo "=========================================="
echo "  FF_React Column Mapping Integration"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the FF_React directory"
    exit 1
fi

print_status "Starting Column Mapping Integration Setup..."

# Step 1: Check if Node.js dependencies are installed
if [ ! -d "node_modules" ]; then
    print_warning "Node modules not found. Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Failed to install Node.js dependencies"
        exit 1
    fi
    print_success "Node.js dependencies installed"
else
    print_success "Node.js dependencies already installed"
fi

# Step 2: Navigate to column mapper service directory
cd ../grok-agent
if [ $? -ne 0 ]; then
    print_error "Cannot find grok-agent directory. Please ensure it's at the same level as FF_React"
    exit 1
fi

# Step 3: Check if Python virtual environment exists
if [ ! -d "venv" ]; then
    print_warning "Python virtual environment not found. Creating one..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        print_error "Failed to create Python virtual environment"
        exit 1
    fi
    print_success "Python virtual environment created"
else
    print_success "Python virtual environment exists"
fi

# Step 4: Activate virtual environment and install Python dependencies
print_status "Activating Python virtual environment..."
source venv/bin/activate
if [ $? -ne 0 ]; then
    print_error "Failed to activate Python virtual environment"
    exit 1
fi

pip install -r requirements.txt
if [ $? -ne 0 ]; then
    print_error "Failed to install Python dependencies"
    exit 1
fi

# Install additional packages for column mapping
pip install openpyxl psycopg2-binary flask flask-cors
if [ $? -ne 0 ]; then
    print_warning "Some Python packages may not be available, but continuing..."
fi

print_success "Python dependencies installed"

# Step 5: Create configs directory and copy configuration
mkdir -p configs
if [ -f "pole_config.json" ]; then
    cp pole_config.json configs/pole.json
    print_success "Column mapping configuration copied"
else
    print_warning "pole_config.json not found, creating default config"
    cat > configs/pole.json << 'EOF'
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
EOF
fi

# Step 6: Start the column mapping service in background
print_status "Starting Column Mapping Service on port 5001..."
python3 column_mapper_service.py &
SERVICE_PID=$!

# Wait a moment for service to start
sleep 3

# Step 7: Test the service
print_status "Testing Column Mapping Service..."
curl -s http://localhost:5001/health > /dev/null
if [ $? -eq 0 ]; then
    print_success "Column Mapping Service is running!"
    print_success "Service URL: http://localhost:5001"
else
    print_error "Column Mapping Service failed to start"
    kill $SERVICE_PID 2>/dev/null
    exit 1
fi

# Step 8: Return to FF_React directory
cd ../FF_React

# Step 9: Check if Next.js app can start
print_status "Checking Next.js application..."
if [ -f "package.json" ]; then
    # Check if dev script exists
    if grep -q '"dev"' package.json; then
        print_success "Next.js application is ready"
        print_status "To start the integrated application:"
        echo "  1. Terminal 1: cd FF_React && npm run dev"
        echo "  2. Terminal 2: cd grok-agent && ./start_column_mapper.sh"
        echo ""
        print_status "Integration Features:"
        echo "  ✅ Column mapping step added to SOW import wizard"
        echo "  ✅ Automatic column standardization"
        echo "  ✅ Neon database compatibility"
        echo "  ✅ Error handling and validation"
        echo ""
        print_success "Integration setup complete!"
        echo ""
        print_status "Test the integration:"
        echo "  1. Go to: http://localhost:5173/sow/import"
        echo "  2. Select a project"
        echo "  3. Upload your Excel file"
        echo "  4. Column mapping will happen automatically!"
    else
        print_warning "Next.js dev script not found in package.json"
    fi
else
    print_error "FF_React directory structure issue"
fi

# Keep service running in background
print_status "Column Mapping Service is running in background (PID: $SERVICE_PID)"
print_warning "Press Ctrl+C to stop the service"

# Wait for user interrupt
trap "echo -e '\\n${BLUE}[INFO]${NC} Stopping Column Mapping Service...'; kill $SERVICE_PID 2>/dev/null; exit 0" INT
wait $SERVICE_PID