# Local Development Setup

This guide documents how to build and run the FibreFlow Next.js application locally.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- PostgreSQL database (Neon) credentials in `.env.local`

## Quick Start

### Production Mode (Recommended for stability)
```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the production server
npm start
```

The application will be available at http://localhost:3000

### Development Mode
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

**Note:** If you encounter watchpack errors in development mode, use production mode instead.

## Configuration Files

### ES Module Configuration
The project uses ES modules (`.mjs` files) for configuration:

- `next.config.mjs` - Next.js configuration
- `postcss.config.mjs` - PostCSS configuration for TailwindCSS
- `tailwind.config.mjs` - TailwindCSS configuration

### Why ES Modules?
- Modern JavaScript standard
- Better tree-shaking and optimization
- Native support in Next.js 15
- Consistent with current best practices

## Environment Variables

Create a `.env.local` file with:
```env
# Database
DATABASE_URL=your_neon_database_url

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Other required variables (see .env.example)
```

## Common Issues & Solutions

### Issue: Styles not loading
**Solution:** Ensure `postcss.config.mjs` exists with:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Issue: Watchpack error in dev mode
**Error:** "The 'to' argument must be of type string. Received undefined"
**Solution:** Use production build instead:
```bash
npm run build && npm start
```

### Issue: Firebase errors when fetching data
**Solution:** The app uses Neon PostgreSQL, not Firebase. Ensure:
1. Database URL is correctly set in `.env.local`
2. API endpoints are using `/api/` routes
3. Services are fetching from API endpoints, not Firebase

### Issue: Module not found errors
**Solution:** Check that path aliases in `tsconfig.json` are correct:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*", "./src/components/*"]
    }
  }
}
```

## Build Commands

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm start           # Start production server

# Testing & Validation
npm run lint        # Run ESLint
npm run type-check  # TypeScript type checking

# Database
npm run db:migrate  # Run database migrations
npm run db:seed     # Seed database
```

## Tech Stack

- **Framework:** Next.js 15.5.2
- **React:** 18.x
- **Styling:** TailwindCSS with PostCSS
- **Database:** Neon PostgreSQL (serverless)
- **TypeScript:** Strict mode enabled
- **Module System:** ES Modules (.mjs)

## Project Structure

```
FF_React/
├── pages/           # Next.js pages (routes)
├── components/      # Shared UI components
├── src/            # Application source code
│   ├── modules/    # Feature modules
│   ├── services/   # API services
│   └── lib/        # Utilities and helpers
├── public/         # Static assets
├── docs/           # Documentation
└── scripts/        # Build and utility scripts
```

## Performance Tips

1. **Use Production Build:** Development mode has additional overhead
2. **Clear Cache:** If issues persist, clear `.next` folder
3. **Check Dependencies:** Run `npm install` after pulling changes

## Deployment

For production deployment, see `docs/DEPLOYMENT.md`

## Support

- Check `CLAUDE.md` for AI assistant context
- Review `docs/INDEX.md` for complete documentation index
- See `CODEBASE_MAP.md` for project structure overview