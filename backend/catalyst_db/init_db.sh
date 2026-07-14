#!/bin/bash
# Zoho Catalyst Data Store Automated Provisioning Script

echo "=========================================================="
echo " MOSAIC - Zoho Catalyst Database Initialization"
echo "=========================================================="

# Ensure the user is logged in
if ! command -v catalyst &> /dev/null
then
    echo "ERROR: Zoho Catalyst CLI could not be found."
    echo "Please install it using: npm install -g zcatalyst-cli"
    exit 1
fi

echo "Checking Catalyst authentication status..."
catalyst whoami || { echo "ERROR: Please run 'catalyst login' first."; exit 1; }

echo ""
echo "Starting automated schema deployment from datastore/schema.json..."

# Push the schema.json to the active Catalyst Project
# Note: The CLI must be run from the project root where catalyst.json exists.
cd ../../
catalyst datastore:push

if [ $? -eq 0 ]; then
    echo "=========================================================="
    echo " SUCCESS! The Catalyst Data Store has been provisioned."
    echo " All tables, columns, constraints, and foreign keys have been created."
    echo "=========================================================="
else
    echo "=========================================================="
    echo " ERROR: Schema deployment failed. Check catalyst logs."
    echo "=========================================================="
    exit 1
fi

echo ""
echo "Would you like to seed the database with 5000+ realistic records now? (y/n)"
read -r seed_choice
if [ "$seed_choice" = "y" ] || [ "$seed_choice" = "Y" ]; then
    echo "Starting Seed Generation Engine..."
    cd backend/catalyst_db
    source ../venv/bin/activate
    python seed_catalyst.py
fi
