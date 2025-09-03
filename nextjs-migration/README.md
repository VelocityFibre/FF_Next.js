# FibreFlow Next.js Migration

Enterprise SPA for fiber network project management, migrated from React + Vite to Next.js for improved DX and simplified architecture.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Neon database account or local PostgreSQL
- Clerk account for authentication

### Installation

1. Clone and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

3. Set up database:
```bash
# Generate Drizzle migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Or push schema directly (development)
npm run db:push
```

4. Run development server:
```bash
npm run dev
# Open http://localhost:3000
```

## 🔧 Configuration

### Clerk Authentication Setup

1. Create a Clerk application at [clerk.com](https://clerk.com)
2. Copy your publishable and secret keys to `.env.local`
3. Configure redirect URLs in Clerk dashboard:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dashboard`
   - After sign-up URL: `/dashboard`

### Neon Database Setup

1. Create a Neon project at [neon.tech](https://neon.tech)
2. Copy the connection string to `DATABASE_URL` in `.env.local`
3. Ensure connection string includes `?sslmode=require`

### Local Development with Docker PostgreSQL

For local database testing:

```bash
# Start PostgreSQL container
docker run --name fibreflow-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=fibreflow \
  -p 5432:5432 \
  -d postgres:15

# Update .env.local
DATABASE_URL=postgresql://postgres:password@localhost:5432/fibreflow
```

## 📁 Project Structure

```
nextjs-migration/
├── pages/
│   ├── api/
│   │   ├── projects.ts    # Projects CRUD API
│   │   └── sow.ts         # SOW import API
│   ├── _app.tsx           # App wrapper with providers
│   └── projects.tsx       # Projects page
├── lib/
│   └── db.ts             # Drizzle ORM setup & schemas
├── store/
│   └── useStore.ts       # Zustand global state
├── hooks/
│   └── useProjects.ts    # React Query hooks
├── middleware.ts         # Clerk auth middleware
└── next.config.js        # Next.js configuration
```

## 🔄 Migration from Vercel Functions

### Old Structure (Vercel Functions):
```javascript
// api/projects.js
export default async function handler(req, res) {
  // Function logic
}
```

### New Structure (Next.js API Routes):
```typescript
// pages/api/projects.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Same logic, TypeScript types added
}
```

Key changes:
- Move from `/api/*.js` to `/pages/api/*.ts`
- Add TypeScript types
- Use Clerk's `getAuth()` instead of Firebase
- No need for separate Express server

## 📊 SOW Import Flow

1. **Upload**: POST JSON data to `/api/sow`
2. **Validate**: Server validates required fields
3. **Store**: Data saved to Neon using Drizzle ORM
4. **Query**: Fetch with React Query in components

Example SOW import:
```typescript
// POST /api/sow
{
  "type": "poles",        // or "drops", "fibre"
  "projectId": 123,
  "fileName": "poles_data.json",
  "data": [
    {
      "poleId": "P001",
      "latitude": -26.2041,
      "longitude": 28.0473,
      "status": "installed"
    }
  ]
}
```

## 🚢 Deployment to Vercel

1. **Push to GitHub**:
```bash
git add .
git commit -m "Initial Next.js migration"
git push origin main
```

2. **Connect to Vercel**:
   - Import repository at [vercel.com/new](https://vercel.com/new)
   - Framework preset: Next.js (auto-detected)
   - Add environment variables from `.env.local`

3. **Deploy**:
   - Vercel auto-deploys on push to main
   - Preview deployments for PRs

## 🧪 Testing

### API Routes
```bash
# Test projects endpoint
curl http://localhost:3000/api/projects \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"

# Test SOW import
curl -X POST http://localhost:3000/api/sow \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{"type":"poles","projectId":1,"data":[...]}'
```

### Database
```bash
# Open Drizzle Studio
npm run db:studio
# Visit https://local.drizzle.studio
```

## 🔍 Debugging

### Common Issues

1. **Database connection fails**:
   - Check `DATABASE_URL` format
   - Ensure `?sslmode=require` for Neon
   - Verify network access to Neon

2. **Clerk authentication issues**:
   - Verify keys in `.env.local`
   - Check middleware.ts publicRoutes
   - Ensure cookies are enabled

3. **TypeScript errors**:
   ```bash
   npm run type-check
   ```

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## 📦 Key Dependencies

- **Next.js 14**: React framework
- **Clerk**: Authentication
- **@neondatabase/serverless**: Neon PostgreSQL client
- **Drizzle ORM**: TypeScript ORM
- **@tanstack/react-query**: Data fetching
- **Zustand**: State management
- **React Hook Form**: Form handling
- **Recharts**: Data visualization
- **Tailwind CSS**: Styling

## 🔐 Security Notes

- All API routes protected by Clerk middleware
- Database queries use parameterized statements
- Environment variables never exposed to client
- CORS headers configured in next.config.js

## 📈 Performance Optimizations

- API routes use edge runtime where possible
- React Query caching reduces database calls
- Zustand persists UI state locally
- Next.js automatic code splitting

## 🤝 Contributing

1. Create feature branch
2. Make changes
3. Run tests and type-check
4. Submit PR with description

## 📄 License

Private - FibreFlow Enterprise