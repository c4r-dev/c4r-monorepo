# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint code linting
- `npm install` - Install dependencies

## Architecture Overview

This is a Next.js 14 application with App Router architecture focused on testing Python functions, specifically the Fibonacci sequence. The app allows users to input test parameters and evaluate function correctness.

### Key Components

- **Next.js App Router** - Modern routing with `app/` directory structure
- **MongoDB Integration** - Data persistence for submissions via Mongoose
- **TypeScript** - Full type safety throughout the application
- **Custom Fonts** - GeneralSans and JetBrains Mono fonts included

### Database Schema

The application uses MongoDB with a `causalExpCorr` collection that stores:
- `explanation` (String, required) - User explanations/submissions
- `timestamp` (Date, default: now) - Submission timestamp

### File Structure

- `app/page.tsx` - Main UI with Fibonacci function display and testing interface
- `app/layout.tsx` - Root layout with header, favicon, and global styles
- `app/api/submissions/route.ts` - API endpoints for saving/retrieving submissions
- `lib/mongodb.ts` - Database connection with cached connection pattern
- `scripts/csv-to-json-converter.js` - Utility for CSV data conversion

### Environment Requirements

- `MONGODB_URI` - MongoDB connection string (required for database functionality)

### Key Features

- **Dynamic Type Detection** - Automatic Python data type inference from user input
- **Fibonacci Testing** - Interactive table for testing Fibonacci function with different parameters
- **Data Persistence** - Submissions are stored in MongoDB
- **Responsive Design** - CSS Grid and Flexbox layouts with inline styling