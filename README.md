# Interview IQ

An AI-powered interview preparation platform that helps you practice and improve your interview skills with personalized questions, real-time feedback, and progress tracking.

## Features

- **User Authentication** - Secure registration and login with JWT
- **Resume Upload** - Upload PDF/DOCX files with automatic skill extraction
- **Job Description Management** - Add and manage job descriptions
- **Skill Matching** - Compare your resume skills against job requirements
- **AI-Generated Questions** - Personalized interview questions based on resume + JD
- **Adaptive Difficulty** - Questions adjust based on your performance
- **Answer Evaluation** - AI-powered scoring for accuracy, relevance, clarity, and depth
- **Interview Results** - Detailed feedback with strengths, weaknesses, and suggestions
- **Progress Dashboard** - Track your interview history and improvement
- **Practice Weak Areas** - Generate focused practice on topics you struggle with

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Knex.js (migrations + seeds)
- **AI**: OpenAI API for question generation and answer evaluation
- **Authentication**: JWT with bcrypt password hashing

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- OpenAI API key

## Setup Instructions

### 1. Clone the repository

```bash
cd "INTERVIEW IQ"
```

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE interview_iq;
```

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials and OpenAI API key

npm install
npm run migrate
npm run seed
npm run dev
```

The backend will run on http://localhost:5000

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on http://localhost:3000

### 5. Environment Variables

Backend `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=interview_iq
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-your-key-here
CORS_ORIGIN=http://localhost:3000
```

Frontend `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Demo Account

- Email: demo@interviewiq.com
- Password: password123

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile (auth required)
- `PUT /api/auth/profile` - Update profile (auth required)

### Resumes
- `POST /api/resumes` - Upload resume (auth required)
- `GET /api/resumes` - Get all resumes (auth required)
- `GET /api/resumes/:id` - Get resume by ID (auth required)
- `DELETE /api/resumes/:id` - Delete resume (auth required)

### Job Descriptions
- `POST /api/job-descriptions` - Create JD (auth required)
- `GET /api/job-descriptions` - Get all JDs (auth required)
- `GET /api/job-descriptions/:id` - Get JD by ID (auth required)
- `DELETE /api/job-descriptions/:id` - Delete JD (auth required)
- `POST /api/job-descriptions/match` - Match resume with JD (auth required)

### Interviews
- `POST /api/interviews` - Create interview (auth required)
- `GET /api/interviews` - Get all interviews (auth required)
- `GET /api/interviews/:id` - Get interview by ID (auth required)
- `DELETE /api/interviews/:id` - Delete interview (auth required)
- `POST /api/interviews/:id/start` - Start interview (auth required)
- `GET /api/interviews/:id/question` - Get current question (auth required)
- `POST /api/interviews/:id/answer` - Submit answer (auth required)
- `POST /api/interviews/:id/complete` - Complete interview early (auth required)
- `GET /api/interviews/:id/results` - Get interview results (auth required)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard stats (auth required)
- `GET /api/dashboard/weak-areas` - Get weak areas (auth required)
- `POST /api/dashboard/practice` - Create practice interview (auth required)

## Project Structure

```
INTERVIEW IQ/
├── backend/
│   ├── src/
│   │   ├── config/       # Database, environment config
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/    # Auth, validation, error handling
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # AI service, resume processing
│   │   └── index.ts      # Server entry point
│   ├── migrations/       # Database migrations
│   ├── seeds/            # Seed data
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages (App Router)
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React contexts (Auth)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # API client, utilities
│   │   └── types/        # TypeScript types
│   └── package.json
└── README.md
```

## License

MIT
