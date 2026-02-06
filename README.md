# Listener App Backend

A backend service for a listener application built with Express.js, TypeScript, and Prisma ORM with PostgreSQL database.

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v20 or v22 recommended)
- **npm** (comes with Node.js)

## 🚀 Getting Started

Follow these steps to set up and run the application:

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The `.env` file should already exist in the project root. Verify it contains the following variables:

```env
DATABASE_URL="prisma+postgres://localhost:51213/?api_key=..."
PORT=3000
JWT_SECRET=super-secret-key-change-me
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

> **Note**: The `DATABASE_URL` uses Prisma's local development database. You'll start this in the next step.

### 3. Start the Prisma Development Database

Prisma provides a local PostgreSQL database for development. Start it with:

```bash
npx prisma dev
```

This will:
- Start a local PostgreSQL server on ports 51213-51215
- Keep running in the background (you can press `h` for help or `q` to quit)

> **Important**: Keep this terminal window open or run it in the background. The database must be running for the application to work.

### 4. Run Database Migrations

In a **new terminal window**, run the migrations to set up your database schema:

```bash
npm run db:sync
```

This command will:
- Apply all pending migrations
- Create the necessary tables in your database
- Prompt you to name the migration if there are schema changes

### 5. Generate Prisma Client

Generate the Prisma Client (this is usually done automatically, but run it to be sure):

```bash
npx prisma generate
```

### 6. Start the Development Server

Now you can start the application:

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in your `.env` file).

## 📝 Available Scripts

- **`npm run dev`** - Start the development server with hot reload (using tsx watch)
- **`npm start`** - Start the production server
- **`npm run db:sync`** - Run Prisma migrations to sync your database schema
- **`npx prisma dev`** - Start the local Prisma PostgreSQL development database
- **`npx prisma generate`** - Generate Prisma Client from your schema

## 🗄️ Database Schema

The application uses the following main models:

- **User** - User accounts with authentication (email/password or Google OAuth)
- **ListenerProfile** - Extended profile for users who are listeners
- **Topic** - Topics that listeners can specialize in
- **Session** - Chat sessions between clients and listeners

See `prisma/schema.prisma` for the complete schema definition.

## 🔧 Troubleshooting

### Error: "Can't reach database server"

**Solution**: Make sure the Prisma dev database is running:
```bash
npx prisma dev
```

### Error: "The provided database string is invalid"

**Solution**: This usually means there's a mismatch between your schema provider and DATABASE_URL. Ensure:
- `prisma/schema.prisma` has `provider = "postgresql"`
- `.env` has a valid PostgreSQL connection string

### Error: "Prisma Client did not initialize yet"

**Solution**: Generate the Prisma Client:
```bash
npx prisma generate
```

### Port Already in Use

**Solution**: Either:
1. Stop the process using port 3000, or
2. Change the `PORT` in your `.env` file

## 📂 Project Structure

```
listener-app-backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── routes/          # API route definitions
│   ├── middleware/      # Express middleware
│   ├── lib/             # Utility functions and configurations
│   └── index.ts         # Application entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Database migration files
├── generated/           # Generated Prisma Client
├── .env                 # Environment variables
├── package.json         # Project dependencies
└── tsconfig.json        # TypeScript configuration
```

## 🔐 Authentication

The application supports two authentication methods:
1. **Email/Password** - Traditional authentication with bcrypt password hashing
2. **Google OAuth** - Sign in with Google

JWT tokens are used for session management.

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Implemented Endpoints

#### 1. Authentication & User Management

**POST** `/api/v1/auth/signup` - User registration  
**POST** `/api/v1/auth/login` - User login  
**POST** `/api/v1/auth/refresh` - Refresh access token  
**GET** `/api/v1/users/me` - Get current user profile (requires auth)  
**PATCH** `/api/v1/users/me` - Update user profile (requires auth)

#### 2. Listener Management

**GET** `/api/v1/listeners` - Browse all listeners (public)  
**GET** `/api/v1/listeners/:listenerId` - Get listener details (public)  
**GET** `/api/v1/listeners/:listenerId/reviews` - Get listener reviews (public)  
**POST** `/api/v1/listeners/onboard` - Become a listener (requires auth)  
**PATCH** `/api/v1/listeners/me` - Update listener profile (requires listener role)

For detailed API specifications, see `API_SPECS.md`

## 🤝 Contributing

(Add contribution guidelines if this is a team project)

## 📄 License

ISC
