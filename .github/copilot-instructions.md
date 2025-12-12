# GitHub Copilot Instructions for Discovery League Dashboard

## Project Overview

This is a **Discovery League Dashboard** - a full-stack web application for managing sports leagues, tracking player statistics, scheduling games, and providing AI-powered coaching assistance. The application features real-time score tracking, automated team generation, player attendance management, and administrative controls.

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling and development server
- **Tailwind CSS** for styling (via inline utility classes)
- Stateful React components with hooks (useState, useCallback, useMemo, useEffect)

### Backend
- **Node.js** with **Express** server
- TypeScript compilation for server code
- API endpoints for data persistence and AI services

### AI/ML Services
- **Google Gemini AI** (`@google/genai`) for:
  - Coaching tips generation
  - AI chat helper
  - Team of the day summaries
  - Content moderation

### Cloud Services
- **Google Cloud Storage** for image uploads
- Vercel-compatible deployment configuration

## Project Structure

```
/
├── .github/              # GitHub configuration (Copilot instructions, workflows)
├── api/                  # API endpoint handlers
│   ├── getData.ts        # Fetch application data
│   ├── saveData.ts       # Persist application data
│   ├── aiHelper.ts       # AI chat functionality
│   ├── generateCoachingTip.ts
│   ├── generateTeamOfTheDay.ts
│   ├── uploadImage.ts    # Image upload to cloud storage
│   ├── moderateImage.ts  # Content moderation
│   └── system-health.ts  # Health check endpoint
├── components/           # React components (40+ components)
│   ├── Dashboard.tsx     # Main dashboard view
│   ├── SuperAdminDashboard.tsx
│   ├── SetupScreen.tsx
│   ├── LeagueHub.tsx
│   ├── Leaderboard.tsx
│   └── ...
├── data/                 # Initial/preset data
├── server/               # Express server setup
│   └── index.ts
├── services/             # Service layer
│   └── geminiService.ts  # Gemini AI integration
├── utils/                # Utility functions
│   ├── auth.ts           # Authentication logic
│   ├── statsLogic.ts     # Player statistics calculations
│   ├── teamGeneration.ts # Automated team creation
│   ├── rankingLogic.ts   # Player ranking algorithms
│   └── leagueLogic.ts    # League management utilities
├── App.tsx               # Main application component
├── types.ts              # TypeScript type definitions
├── index.tsx             # React application entry point
└── package.json
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (Vite dev server on port 5173)
npm run dev

# Build for production (builds both frontend and backend)
npm run build

# Preview production build
npm run preview

# Start production server (Node.js Express server)
npm start
```

## Key TypeScript Types and Interfaces

The application uses a comprehensive type system defined in `types.ts`:

- **`Player`** - Basic player information (id, name, grade)
- **`PlayerWithStats`** - Extended player with statistics (points, wins, losses, etc.)
- **`LeagueConfig`** - League configuration (players, days, courts, settings)
- **`AppData`** - Top-level application data structure supporting multi-league management
- **`GameResult`** - Match result or 'unplayed' status
- **`AllDailyResults`** - Nested record of all game results by day and court
- **`AllDailyMatchups`** - Scheduled matchups by day and court
- **`AllDailyAttendance`** - Player attendance tracking
- **`UserState`** - Authentication/authorization roles (NONE, REFEREE, SUPER_ADMIN)
- **`SaveStatus`** - Data persistence state ('idle', 'saving', 'saved', 'error', etc.)

## Coding Standards and Patterns

### Component Structure
- **Functional components** with TypeScript interfaces for props
- Use **React hooks** for state management (useState, useCallback, useMemo, useEffect)
- Organize complex state with multiple useState hooks rather than single large state objects
- Use **useRef** for DOM references and persisting values across renders

### State Management
- Local component state for UI-specific concerns
- Prop drilling for shared state (no global state management library)
- Callback props for child-to-parent communication
- Memoization with `useMemo` and `useCallback` for performance optimization

### Styling
- **Tailwind CSS utility classes** for all styling
- Responsive design with mobile-first approach
- Dark theme color palette (gray-800, gray-900 backgrounds)
- Consistent spacing and border-radius patterns

### API Pattern
- API handlers in `/api` directory export default async functions
- Request/response pattern with proper error handling
- Data persistence through dedicated save/load endpoints
- Environment variables for API keys (e.g., `GEMINI_API_KEY`)

### TypeScript Best Practices
- **Strict mode enabled** in tsconfig.json
- Always define interfaces for component props
- Use type imports: `import type { TypeName } from './types'`
- Avoid `any` types - use proper type definitions
- Enable `noUnusedLocals` and `noUnusedParameters`

### Naming Conventions
- **PascalCase** for components and type definitions
- **camelCase** for variables, functions, and props
- **SCREAMING_SNAKE_CASE** for constants (e.g., `SUPER_ADMIN_CODE`)
- Descriptive names that clearly indicate purpose

## Important Implementation Details

### Authentication
- Simple code-based authentication system (no OAuth)
- Three roles: NONE, REFEREE, SUPER_ADMIN
- Auth codes defined in `utils/auth.ts`
- UserState determines UI permissions and capabilities

### Data Persistence
- Central data structure: `AppData` interface
- Save/load through `/api/getData` and `/api/saveData`
- SaveStatus indicator shows data sync state
- Support for read-only mode to prevent accidental overwrites

### Multi-League Support
- Application supports multiple leagues simultaneously
- Each league has unique ID as key in data structures
- Active league context tracked in AppData
- Shared project logs and system logs across leagues

### Game Scheduling
- Automated team generation based on league configuration
- Support for custom court names and flexible scheduling
- Daily matchups organized by court
- Attendance tracking affects team generation

### Statistics Calculations
- Real-time stat updates from game results
- League points, win/loss records, point differentials
- Daily point tracking for trend analysis
- Ranking logic in `utils/rankingLogic.ts`

## Testing Approach

- Currently **no automated test suite** in place
- Manual testing through development server
- Test new features by running `npm run dev` and verifying UI behavior
- API endpoints tested through browser/Postman during development

## Common Tasks and Guidance

### Adding a New Component
1. Create component file in `/components` directory with PascalCase name
2. Define TypeScript interface for props if needed
3. Import necessary types from `types.ts`
4. Use functional component pattern with proper typing
5. Apply Tailwind classes for styling
6. Export as default

### Adding API Endpoints
1. Create handler file in `/api` directory
2. Export default async function that handles request/response
3. Use proper TypeScript types for request/response data
4. Add error handling with try/catch blocks
5. Integrate with services layer if calling external APIs

### Working with AI Features
- Gemini AI service wrapper in `services/geminiService.ts`
- Always check for API key availability
- Handle rate limits and errors gracefully
- Provide user feedback during AI operations

### Modifying Types
- All shared types defined in `types.ts`
- Update interface definitions carefully to maintain type safety
- Consider backwards compatibility with existing data
- Run `npm run build` to verify no type errors

## Environment Variables

Required environment variables:
- `GEMINI_API_KEY` - Google Gemini API key for AI features
- Additional cloud storage credentials may be needed for image uploads

## Deployment

- Configured for **Vercel** deployment (see `vercel.json`)
- Build outputs:
  - Frontend: `dist/` directory (Vite build)
  - Backend: `dist-server/` directory (TypeScript compilation)
- Production server runs on Express (see `server/index.ts`)

## Best Practices for Contributors

1. **Preserve existing patterns** - Follow established code style and component structure
2. **Type safety** - Always use proper TypeScript types, avoid `any`
3. **Small, focused changes** - Keep modifications minimal and surgical
4. **Test locally** - Run `npm run dev` to verify changes before committing
5. **No new dependencies** - Use existing libraries unless absolutely necessary
6. **Respect data structures** - AppData and type definitions are core to the application
7. **Error handling** - Always handle potential errors in async operations
8. **Accessibility** - Maintain keyboard navigation and screen reader compatibility where implemented

## Additional Notes

- The application was built with Google AI Studio and leverages Google's Gemini AI extensively
- Images and assets stored in cloud storage, not in repository
- Large image file (`league.png`) is part of branding assets
- Active development primarily in `/components` directory
