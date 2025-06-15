# The Klatsch - Article Sharing Platform

## Overview

The Klatsch is a React-based web application for sharing and managing articles. It's built with modern web technologies including Vite, TypeScript, Tailwind CSS, and shadcn/ui components. The application uses Supabase for backend services including authentication, database, and storage.

## System Architecture

The application follows a typical frontend-backend architecture:

- **Frontend**: React with TypeScript, using Vite as the build tool
- **Backend**: Supabase (PostgreSQL database, authentication, real-time subscriptions, storage)
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Context for authentication, TanStack Query for server state
- **Routing**: React Router for client-side navigation

## Key Components

### Frontend Architecture
- **Components**: Organized into feature-specific folders (article/, navbar/, comments/, etc.)
- **Pages**: Route-based page components (Index, ArticleView, CreateArticle, etc.)
- **Hooks**: Custom hooks for data fetching and state management
- **Contexts**: AuthContext for user authentication state
- **Utils**: Helper functions and utilities

### Authentication System
- Supabase Auth with email/password authentication
- PKCE flow for enhanced security
- Profile management with display names and usernames
- Protected routes for authenticated-only features

### Article Management
- CRUD operations for articles (create, read, update, delete)
- Issue-based organization (articles grouped by month/year)
- Display position management for article ordering
- Keyword-based tagging and filtering
- Draft saving functionality
- Markdown support for article content

### Data Storage
- **Database**: PostgreSQL via Supabase
  - Articles table with metadata and content
  - User profiles and authentication
  - Issue management (current/display issues)
  - Comments system
  - Read tracking for users
  - Variable storage for configuration
- **File Storage**: Supabase Storage for images and logos

## Data Flow

1. **Authentication**: Users sign in through Supabase Auth
2. **Article Loading**: Articles are fetched based on current issue filter
3. **Real-time Updates**: Supabase subscriptions provide live updates
4. **State Management**: TanStack Query manages server state with caching
5. **Local Storage**: User preferences and read states are cached locally

## External Dependencies

### Core Framework
- React 18 with TypeScript
- Vite for development and building
- React Router for navigation

### UI and Styling
- Tailwind CSS for styling
- shadcn/ui component library
- Radix UI primitives
- Lucide icons

### Backend Services
- Supabase for authentication, database, and storage
- TanStack Query for data fetching and caching

### Content Processing
- React Markdown for rendering markdown content
- Date-fns for date manipulation
- Various form handling libraries (react-hook-form, zod)

## Deployment Strategy

The application is configured for deployment on Replit with:
- **Development**: `npm run dev` (port 8080)
- **Production Build**: `npm run build`
- **Preview**: `npm run start` (port 5000)
- **Auto-scaling**: Configured for Replit's autoscale deployment

The `.replit` configuration includes:
- Node.js 20 runtime
- PostgreSQL 16 module
- Proper port forwarding setup
- Build and run commands

## Changelog

- June 15, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.