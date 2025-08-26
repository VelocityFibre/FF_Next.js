#!/bin/bash

# FibreFlow React Route Verification Script
# Tests all major application routes for basic accessibility

BASE_URL="http://localhost:5173"
RESULTS_FILE="route-test-results.txt"

echo "🚀 FibreFlow Route Verification Test" > $RESULTS_FILE
echo "Date: $(date)" >> $RESULTS_FILE
echo "Base URL: $BASE_URL" >> $RESULTS_FILE
echo "============================================" >> $RESULTS_FILE

# Function to test a route
test_route() {
    local route=$1
    local name=$2
    
    echo "Testing $name..."
    
    local response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL$route")
    
    if [ "$response" = "200" ]; then
        echo "✅ $name - PASS (200)" >> $RESULTS_FILE
        echo "✅ $name - PASS"
    else
        echo "❌ $name - FAIL ($response)" >> $RESULTS_FILE
        echo "❌ $name - FAIL ($response)"
    fi
}

echo "Starting route verification..."

# Core Routes
test_route "/" "Homepage (Redirect)"
test_route "/login" "Login Page"
test_route "/app/dashboard" "Dashboard"

# Project Management
test_route "/app/projects" "Projects List"
test_route "/app/projects/create" "Project Create"

# Staff Management (Neon PostgreSQL)
test_route "/app/staff" "Staff List"
test_route "/app/staff/new" "Staff Create"
test_route "/app/staff/import" "Staff Import"

# Client Management
test_route "/app/clients" "Clients List"
test_route "/app/clients/new" "Client Create"

# Contractor Management
test_route "/app/contractors" "Contractors Dashboard"
test_route "/app/contractors/new" "Contractor Create"

# Procurement System (Flagship)
test_route "/app/procurement" "Procurement Dashboard"
test_route "/app/procurement/boq" "BOQ Management"
test_route "/app/procurement/rfq" "RFQ Management" 
test_route "/app/procurement/stock" "Stock Management"
test_route "/app/procurement/suppliers" "Supplier Management"
test_route "/app/procurement/reports" "Procurement Reports"

# SOW Management
test_route "/app/sow" "SOW Dashboard"
test_route "/app/sow/list" "SOW List"

# Analytics & Reporting
test_route "/app/analytics" "Analytics Dashboard"
test_route "/app/reports" "Reports Dashboard"
test_route "/app/kpi-dashboard" "KPI Dashboard"

# Field Operations
test_route "/app/field" "Field App Portal"

# Other Modules
test_route "/app/communications" "Communications"
test_route "/app/meetings" "Meetings"
test_route "/app/tasks" "Tasks"
test_route "/app/settings" "Settings"
test_route "/app/suppliers" "Suppliers Portal"

echo "" >> $RESULTS_FILE
echo "Route verification completed!" >> $RESULTS_FILE
echo "Check $RESULTS_FILE for detailed results"