# FibreFlow Next.js Application

A modern Next.js application for fiber network project management.

## 🚀 Quick Start

### Local Development (Production Mode - Recommended)

Use production mode for local development as it provides the full Next.js experience without authentication barriers:

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start the production server (default port 3000)
npm start

# Or specify a custom port
PORT=3005 npm start
```

Access the application at: **http://localhost:3000** (or your chosen port)

**Note**: The development server (`npm run dev`) has known issues and should not be used. Always use production mode for local development.

## 📦 Available Scripts

```bash
npm run build        # Build for production
npm start            # Start production server
npm run dev          # ⚠️ Development server (has known issues)
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm test             # Run tests
```

## 🗄️ Database

The application uses Neon PostgreSQL. Database operations:

```bash
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database
npm run db:validate  # Validate database schema
```

## ⚠️ Known Issues

### Development Server Watchpack Bug
The development server (`npm run dev`) has a known issue with Next.js's Watchpack module due to nested package.json files in the project structure. This affects both Next.js 14 and 15.

**Workaround**: Use production mode for local development as shown above.

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2.18
- **Frontend**: React 18, TypeScript, TailwindCSS
- **Authentication**: Clerk
- **Database**: Neon PostgreSQL
- **Testing**: Vitest, Playwright

## 📚 Documentation

- `CLAUDE.md` - AI assistant context and detailed project information
- `docs/` - Additional documentation

## 🚀 Deployment

For production deployment:

```bash
# Build the application
npm run build

# The output will be in .next/ directory
# Deploy to your hosting platform (Vercel, etc.)
```

## 📝 License

Proprietary - VelocityFibre