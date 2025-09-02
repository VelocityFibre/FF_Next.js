# Neon Database Integration

This folder contains all Neon database-related configurations, API server, and utilities for the FibreFlow application.

## 📁 Folder Structure

```
neon/
├── api/              # Local API server for database operations
│   └── server.ts     # Express server handling database requests
├── config/           # Database configuration files
│   ├── database.config.ts  # Main database connection setup
│   └── env.template  # Template for environment variables
├── migrations/       # Database migration files
├── schemas/          # Database schema definitions
├── scripts/          # Utility scripts
│   ├── test-connection.ts  # Test database connectivity
│   └── setup-database.ts   # Create tables and seed data
├── package.json      # Dependencies for Neon API server
└── README.md         # This file
```

## 🚀 Quick Start

### 1. Configure Database Connection

First, add your Neon database credentials to the `.env` file in the project root:

```bash
# Edit the .env file in the project root
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/database?sslmode=require
VITE_NEON_DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/database?sslmode=require
```

### 2. Install Dependencies

```bash
cd neon
npm install
```

### 3. Test Connection

```bash
npm run test
```

### 4. Setup Database (if needed)

This will create necessary tables and add sample data:

```bash
npm run setup
```

### 5. Start the API Server

```bash
npm run dev
```

The API server will run on `http://localhost:3001`

## 📝 Available Scripts

- `npm run dev` - Start the API server in development mode with hot reload
- `npm run start` - Start the API server in production mode
- `npm run test` - Test database connection
- `npm run setup` - Create database tables and seed sample data

## 🔌 API Endpoints

The local API server provides the following endpoints:

### Health Check
- `GET /api/health` - Check if database is connected

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Query Parameters for GET /api/projects
- `status` - Filter by status (comma-separated for multiple)
- `clientId` - Filter by client ID
- `search` - Search in project name or code

## 🔧 Troubleshooting

### Connection Issues

1. **Check your .env file**: Ensure DATABASE_URL is correctly set
2. **Verify Neon service**: Log into Neon console and check if database is active
3. **Test connection**: Run `npm run test` to diagnose issues

### Common Errors

- **"DATABASE_URL is not configured"**: Add your connection string to .env
- **"relation does not exist"**: Run `npm run setup` to create tables
- **Connection timeout**: Check if your Neon database is active and not suspended

## 🔐 Security Notes

- Never commit `.env` files with real credentials
- Use environment variables for all sensitive data
- Enable SSL mode in production (`sslmode=require`)

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Express.js Documentation](https://expressjs.com)

## 🛠️ Development Workflow

1. Make changes to the API server in `api/server.ts`
2. The server will auto-reload if running with `npm run dev`
3. Test your changes using the frontend application
4. Update schemas and migrations as needed

## 📦 Using with the Main Application

The main React application is configured to proxy API calls to this local server during development. Update the Vite config if you need to change the port:

```javascript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true
    }
  }
}
```