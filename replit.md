# Nakama&Partners - Financial Investment Platform

## Overview

Nakama&Partners is a financial investment platform offering a 9% fixed annual return with capital protection through bank contracts. The application is built as a modern full-stack web application targeting conservative investors and financial advisors, emphasizing trust, legal structure, and capital protection.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design system
- **Typography**: Georgia for headings, Cormorant Garamond for branding, Inter for body text
- **Color Scheme**: Navy blue (#001F3F), warm white backgrounds, gold accents (#DAA520)
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful endpoints with JSON communication
- **Development**: Hot reload with Vite middleware integration

### Key Components

#### Database Schema
- **Leads Table**: Stores potential customer information (name, email, phone, type, source)
- **Calculator Results Table**: Stores investment simulation data with relationships to leads
- **Data Validation**: Zod schemas for runtime type checking and validation

#### API Endpoints
- `POST /api/leads` - Lead capture and CRM integration
- `POST /api/calculator-results` - Investment simulation storage
- `POST /api/generate-pdf` - PDF generation for investment reports

#### Frontend Sections
- **Hero Section**: Video background with main value proposition
- **Security Features**: Trust indicators and legal structure details
- **Investment Strategy**: Portfolio composition and methodology
- **Calculator Tool**: Interactive investment simulation
- **Comparison Table**: Competitive analysis against traditional products
- **Process Flow**: Step-by-step onboarding for different user types
- **Downloads**: Document access with lead capture
- **Advisor Portal**: Dedicated section for financial advisors
- **Company Story**: Brand narrative and founder information

## Data Flow

1. **Lead Generation**: Users interact with forms across multiple sections
2. **Data Validation**: Client and server-side validation using Zod schemas
3. **Storage**: Lead and calculator data stored in PostgreSQL via Drizzle ORM
4. **PDF Generation**: Investment simulations converted to downloadable reports
5. **CRM Integration**: Lead data flows to external CRM systems

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (serverless PostgreSQL)
- **UI Components**: Radix UI primitives
- **Form Handling**: React Hook Form with Hookform Resolvers
- **Date Manipulation**: date-fns library
- **Styling**: Tailwind CSS with class-variance-authority

### Planned Integrations
- **Calendar Booking**: Calendly integration for appointment scheduling
- **Document Signing**: DocuSign for legal document execution
- **CRM System**: Customer relationship management integration
- **Email Service**: Automated document delivery

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot reload
- **Database**: Environment variable configuration for DATABASE_URL
- **Build Process**: TypeScript compilation with esbuild for server bundle

### Production Deployment
- **Frontend**: Static assets built and served from `/dist/public`
- **Backend**: Node.js server bundle in `/dist/index.js`
- **Database Migrations**: Drizzle Kit for schema management
- **Environment**: Production configuration via NODE_ENV

### Build Commands
- `npm run dev` - Development server with hot reload
- `npm run build` - Production build (frontend + backend)
- `npm run start` - Production server
- `npm run db:push` - Database schema deployment

## User Preferences

Preferred communication style: Simple, everyday language.

## Authentication System

The platform now uses email/password authentication instead of the previous Replit Auth system:

### Database Schema
- **Users Table**: Stores user accounts with email, hashed password, name, and role (client/partner)
- **Authentication**: JWT tokens with 7-day expiration stored in localStorage
- **Password Security**: bcrypt hashing with salt rounds of 12

### API Endpoints
- `POST /api/register` - User registration with email, password, name, and role
- `POST /api/login` - User authentication returning JWT token
- `GET /api/me` - Protected route to get current user info

### Frontend Authentication
- `useAuth` hook provides login, register, logout functions and user state
- `AuthProvider` context wrapper for authentication state management
- Login page supports both login and registration with role selection (client/partner)

### Demo Accounts for Testing
**Client Account:**
- Email: `cliente@nakama.com`
- Password: `demo2025`
- Role: Client
- Name: Juan Cliente

**Partner Account:**
- Email: `partner@nakama.com`
- Password: `demo2025`
- Role: Partner
- Name: Maria Partner

**Admin Account:**
- Email: `admin@nakama.com`
- Password: `demo2025`
- Role: Admin
- Name: Administrador

To test the authentication system:
1. Visit `/login` in your browser
2. Use the credentials above to log in
3. Test both login and registration functionality
4. After login, users are redirected to `/dashboard`

## Changelog

Changelog:
- August 28, 2025. Changed typography system: Replaced Playfair Display with Georgia for all headings and titles throughout the platform
- July 16, 2025. Changed navigation button text from "Asesores" to "Partners" for brand consistency
- July 15, 2025. Implemented automatic scroll to top when navigating between sections via menu
- July 15, 2025. Updated comparison table to show "Nakama&Partners" instead of "FundedXam Capital"
- July 15, 2025. Updated PDF generator to use "Nakama&Partners" branding instead of "FUNDEDXAM CAPITAL"
- July 15, 2025. Enhanced opacity across platform: upgraded bg-black/30 elements to bg-black/70 for improved visibility
- July 14, 2025. Implemented video background across all public pages (excludes advisor/login pages)
- July 14, 2025. Updated logo to new "NP" PNG version with transparent background
- July 14, 2025. Created VideoBackground component for consistent video display
- July 14, 2025. Made video static (no loop) as requested by user
- July 14, 2025. Optimized PDF generation with improved spacing and logo integration
- July 09, 2025. Added comprehensive "Asesor Financiero" value proposition section to advisor dashboard
- July 09, 2025. Updated advisor portal design with gradient backgrounds and #040505 colored boxes
- July 14, 2025. Changed branding from "FundedXam Capital" to "Nakama&Partners" with Cormorant Garamond typography
- July 09, 2025. Reorganized content structure for better user experience navigation
- July 09, 2025. Successfully migrated from Replit Agent to standard Replit environment
- July 09, 2025. Updated header with translucent background and SVG logo per user request
- July 05, 2025. Initial setup