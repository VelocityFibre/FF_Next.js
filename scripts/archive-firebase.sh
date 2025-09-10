#!/bin/bash

# Archive Firebase files that have been replaced by Neon

echo "Archiving Firebase legacy files..."

# Archive auth services
echo "Archiving auth services..."
mv src/services/auth/userService.ts archived/firebase-legacy/auth/ 2>/dev/null
mv src/services/auth/authHelpers.ts archived/firebase-legacy/auth/ 2>/dev/null
mv src/services/auth/authentication/types.ts archived/firebase-legacy/auth/ 2>/dev/null

# Archive project phase services
echo "Archiving project phase services..."
mv src/services/projects/phases/*.ts archived/firebase-legacy/projects/ 2>/dev/null

# Archive core services
echo "Archiving core services..."
mv src/services/core/BaseService.ts archived/firebase-legacy/core/ 2>/dev/null
mv src/services/core/ApiClient.ts archived/firebase-legacy/core/ 2>/dev/null

# Archive procurement services
echo "Archiving procurement services..."
mv src/services/procurement/rfq/notifications/deadlineAlerts.ts archived/firebase-legacy/procurement/ 2>/dev/null
mv src/services/procurement/rfq/notifications/subscription/*.ts archived/firebase-legacy/procurement/ 2>/dev/null
mv src/services/procurement/boq/crud/*.ts archived/firebase-legacy/procurement/ 2>/dev/null
mv src/services/procurement/boqService.ts archived/firebase-legacy/procurement/ 2>/dev/null

# Archive supplier services
echo "Archiving supplier services..."
mv src/services/suppliers/subscriptions/*.ts archived/firebase-legacy/suppliers/ 2>/dev/null
mv src/services/suppliers/status/*.ts archived/firebase-legacy/suppliers/ 2>/dev/null
mv src/services/suppliers/search/*.ts archived/firebase-legacy/suppliers/ 2>/dev/null
mv src/services/suppliers/rating/*.ts archived/firebase-legacy/suppliers/ 2>/dev/null
mv src/services/suppliers/crud/*.ts archived/firebase-legacy/suppliers/ 2>/dev/null
mv src/services/suppliers/compliance/*.ts archived/firebase-legacy/suppliers/ 2>/dev/null

# Archive contractor services
echo "Archiving contractor services..."
mv src/services/contractor/crud/*.ts archived/firebase-legacy/contractor/ 2>/dev/null

# Archive client services
echo "Archiving client services..."
mv src/services/client/*.ts archived/firebase-legacy/client/ 2>/dev/null

# Archive staff services
echo "Archiving staff services..."
mv src/services/staff/*.ts archived/firebase-legacy/staff/ 2>/dev/null

# Archive sync services
echo "Archiving sync services..."
mv src/services/sync/*.ts archived/firebase-legacy/sync/ 2>/dev/null
mv src/services/sync/core/*.ts archived/firebase-legacy/sync/ 2>/dev/null
mv src/services/sync/client/*.ts archived/firebase-legacy/sync/ 2>/dev/null

# Archive products services
echo "Archiving products services..."
mv src/services/products/*.ts archived/firebase-legacy/products/ 2>/dev/null

# Archive hybrid services
echo "Archiving hybrid services..."
mv src/services/hybrid/*.ts archived/firebase-legacy/hybrid/ 2>/dev/null

# Archive middleware
echo "Archiving middleware..."
mv src/services/middleware/projectAccess/*.ts archived/firebase-legacy/middleware/ 2>/dev/null

# Archive utils
echo "Archiving utils..."
mv src/utils/firebase-test.ts archived/firebase-legacy/ 2>/dev/null

# Archive config (but keep it for pole tracker reference)
echo "Copying Firebase config for reference..."
cp src/config/firebase.ts archived/firebase-legacy/ 2>/dev/null

# Archive old scripts
echo "Archiving old scripts..."
mkdir -p archived/firebase-legacy/scripts
mv scripts/createFirestoreIndex.js archived/firebase-legacy/scripts/ 2>/dev/null
mv scripts/createTestUser.js archived/firebase-legacy/scripts/ 2>/dev/null
mv scripts/createTestContractor.js archived/firebase-legacy/scripts/ 2>/dev/null
mv scripts/testContractorTeams.js archived/firebase-legacy/scripts/ 2>/dev/null
mv scripts/testEnhancedOnboarding.js archived/firebase-legacy/scripts/ 2>/dev/null
mv scripts/simple-db-test.ts archived/firebase-legacy/scripts/ 2>/dev/null
mv scripts/database-testing-suite.ts archived/firebase-legacy/scripts/ 2>/dev/null

echo "Done archiving Firebase files!"
echo ""
echo "Files archived to: archived/firebase-legacy/"
echo "Pole tracker files preserved in: src/modules/projects/pole-tracker/"
echo ""
echo "Next steps:"
echo "1. Update package.json to remove unused Firebase dependencies"
echo "2. Test pole tracker functionality"
echo "3. Update documentation"