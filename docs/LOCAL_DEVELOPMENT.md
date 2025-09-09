# Local Development Guide

## Current Setup (as of 2025-09-09)

### ⚠️ Important: Development Server Issue

There is a known bug with the Next.js development server (`npm run dev`) that affects both Next.js 14 and 15. The issue is caused by the Watchpack module's inability to handle multiple package.json files in the project structure.

**Error Details:**
```
TypeError: The "to" argument must be of type string. Received undefined
    at Object.relative (node:path:1270:5)
    at Watchpack.<anonymous> (setup-dev-bundler.js)
```

### Root Cause

The project structure contains multiple package.json files:
- `/home/louisdup/VF/Apps/FF_React/package.json` (main project)
- `/home/louisdup/VF/Apps/FF_React/neon/package.json` (Neon API server)

This confuses Next.js's workspace root detection in the Watchpack file watcher.

## Recommended Development Workflow

### Use Production Mode for Local Development

```bash
# 1. Install dependencies
npm install

# 2. Build the application
npm run build

# 3. Start the production server
PORT=3005 npm start
```

Access the application at: **http://localhost:3005**

### Benefits of Production Mode
- ✅ Stable and reliable
- ✅ No Watchpack errors
- ✅ Fast startup time
- ✅ Closer to production environment

### Limitations
- ❌ No hot module replacement (HMR)
- ❌ Need to rebuild for changes: `npm run build`

## Development Commands

```bash
# Build and start production server
npm run build && PORT=3005 npm start

# Run linting
npm run lint

# Type checking
npm run type-check

# Run tests
npm test

# Database operations
npm run db:migrate    # Run migrations
npm run db:seed       # Seed database
npm run db:validate   # Validate schema
```

## Environment Variables

Create a `.env.local` file with:
```env
# Database
DATABASE_URL=your_neon_database_url

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Other environment variables as needed
```

## Troubleshooting

### Port Already in Use
If you get "Error: listen EADDRINUSE", try a different port:
```bash
PORT=3006 npm start
PORT=3007 npm start
# etc.
```

### Clear Build Cache
If you encounter build issues:
```bash
rm -rf .next
npm run build
```

### Restore Files (if needed)
If you need to restore the backup files:
```bash
# Restore parent package.json (if needed)
mv /home/louisdup/VF/Apps/package.json.backup /home/louisdup/VF/Apps/package.json

# Restore neon package.json (if needed)
mv neon/package.json.backup neon/package.json
```

## Future Fix

To permanently fix the dev server issue, options include:
1. Restructure the project to remove nested package.json files
2. Move the `neon/` directory outside the main project
3. Wait for Next.js to fix the Watchpack bug
4. Use a different bundler configuration

## Tech Stack Details

- **Next.js**: 14.2.18 (stable LTS)
- **React**: 18.x
- **Node.js**: 20.18.1
- **Package Manager**: npm
- **Database**: Neon PostgreSQL
- **Authentication**: Clerk

## Deployment

For production deployment:
```bash
# Build for production
npm run build

# Output is in .next/ directory
# Deploy to Vercel, Netlify, or your preferred platform
```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Neon Documentation](https://neon.tech/docs)

## Contact

For issues or questions, contact the development team.