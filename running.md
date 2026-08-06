# Running Guide

This guide provides step-by-step instructions to configure, initialize, and run the BORROW-HUB project locally in your terminal.

---

## Prerequisites

Before getting started, make sure you have the following installed:
- **Node.js** (version 18.x or later)
- **npm** (included with Node.js)
- **PostgreSQL Database** (e.g., a local PG instance, Supabase, Neon, or another cloud PG database provider)
- **Prisma CLI** (typically run via `npx`)

---

## 1. Setup Dependencies

Clone the repository, navigate to the project directory, and install all required node modules:

```bash
# Install dependencies
npm install
```

---

## 2. Environment Variables

Create a file named `.env` in the root of the project. You can copy the following template and fill in your actual values:

```env
# ------------------------------------------------------------------------------
# Database Configurations (PostgreSQL)
# ------------------------------------------------------------------------------
DATABASE_URL="postgresql://postgres:password@localhost:5432/borrowhub?schema=public"
DIRECT_URL="postgresql://postgres:password@localhost:5432/borrowhub?schema=public"

# ------------------------------------------------------------------------------
# NextAuth Configuration
# ------------------------------------------------------------------------------
NEXTAUTH_SECRET="your-32-character-random-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"

# ------------------------------------------------------------------------------
# OpenAI API Configuration (Optional: Used for AI Vision item recognition)
# ------------------------------------------------------------------------------
OPENAI_API_KEY="sk-proj-yourOpenAiKey..."

# ------------------------------------------------------------------------------
# Cloudinary Configurations (Optional: Used for item and avatar image uploads)
# ------------------------------------------------------------------------------
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_UPLOAD_PRESET="borrow_hub_preset"

# ------------------------------------------------------------------------------
# Razorpay Credentials (Optional: Used for booking checkout payments)
# ------------------------------------------------------------------------------
RAZORPAY_KEY_ID="rzp_test_yourKeyId"
RAZORPAY_KEY_SECRET="yourRazorpayKeySecret"
```

---

## 3. Database Initialization

With your PostgreSQL server running and the `DATABASE_URL` set, initialize your database schema, apply existing migrations, and seed mock data:

```bash
# Generate the Prisma Client
npx prisma generate

# Apply migrations to update/create tables in PostgreSQL database
npx prisma migrate dev --name init

# Seed the database with default mock users, items, reviews, activity, and eco-impact data
npx prisma db seed
```

---

## 4. Run the Development Server

Start the local Next.js development server:

```bash
# Run Next.js in development mode
npm run dev
```

Once running, open your web browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 5. Running Tests

The project includes two primary test suites to verify backend functionality, schema design, database cascade rules, authorization policies, and API endpoints.

### A. Full Backend Integration Test Suite
Tests cascade deletions, credential authentication, signup duplicate checks, item radius distance sorting, self-borrowing rules, and custom error shapes. Run this command directly in your terminal (requires a configured database):

```bash
# Run backend business logic & schema validation tests
node test-backend-full.js
```

### B. Live Endpoint Integration Test Suite
Tests API route integrity and isolation protocols (NEIGHBOUR vs. ONLINE stores).
*Note: This suite makes actual HTTP calls and requires the development server to be running in another terminal window first.*

```bash
# Terminal 1:
npm run dev

# Terminal 2:
node test-backend.js
```
