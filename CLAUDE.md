# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language Requirements

**ВАЖНО**: Все ответы, комментарии, сообщения об ошибках, диалоги и любое другое общение с пользователем должно быть на русском языке. Код и технические термины остаются на английском.

## Common Development Commands

```bash
# Development
npm install           # Install dependencies
npm run dev          # Start dev server
npm run preview      # Preview production build

# Build & Quality
npm run build        # TypeScript check + Vite build (MUST pass before commit)
npm run lint         # ESLint check (MUST pass before commit)
npx tsc --noEmit     # Type checking only (standalone)
```

## Pre-commit Checklist
1. Run `npm run lint` and fix all warnings
2. Run `npm run build` and ensure project builds successfully
3. Follow Conventional Commits format (`feat:`, `fix:`, `chore:`, etc.)

## Architecture Overview

### Tech Stack
- **Frontend**: React 19, TypeScript 5.8 (strict mode), Vite 7.1
- **UI Framework**: Tailwind CSS 4.1+ with component-based design + Ant Design 5.27+ for complex components
- **Backend**: Supabase 2.57+ (PostgreSQL, Auth, Storage, Edge Functions, Realtime WebSocket)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React + Ant Design Icons
- **Routing**: React Router DOM 7.8
- **Development**: ESLint, dotenv for environment management
- **Editor**: WebStorm

### Project Structure
```
src/
├── components/     # Reusable React components (Layout.tsx, AdditionalWorksTable.tsx)
├── pages/         # Route pages and main views (Projects, ProjectDetail, AdditionalWorks, References, Dashboard)
├── hooks/         # Custom React hooks (useAuth, useAdditionalWorks, useUnits)
├── contexts/      # React Context providers (ProjectsContext)
├── lib/           # External library configurations (supabase.ts)
├── types/         # TypeScript type definitions (index.ts with main domain types)
├── utils/         # Utility functions and helpers
└── assets/        # Static assets (images, icons, etc.)
```

### Key Patterns
- **Imports**: Use relative imports for project files
- **State**: React Context for auth state (see `hooks/useAuth.ts`) and projects (ProjectsContext)
- **Error Handling**: All Supabase queries must include error handling with Russian error messages
- **Domain Types**: Core business entities defined in `types/index.ts` (Project, AdditionalWork, Unit, User, etc.)
- **Dynamic Tables**: Custom table schemas per project (additional_works_columns/rows pattern)

## Database Integration

**CRITICAL**: Always reference database schema in `database.sql` for current structure.

### Supabase Configuration
Environment variables required in `.env.local`:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Configuration: `src/lib/supabase.ts`

### Database Rules
- All tables MUST include `created_at` and `updated_at` fields with automatic triggers
  - **EXCEPTION**: Mapping/junction tables (many-to-many relationships) should NOT have `created_at` and `updated_at` fields
- **Primary keys**: All tables should use UUID for primary keys (id field)
- **Mapping table naming**: All mapping/junction tables MUST have `_mapping` suffix
- **NEVER use RLS (Row Level Security)** - handle auth in application layer
- Use optimistic locking via `updated_at` timestamp for concurrent edits
- **Dynamic schemas**: Projects can have custom table structures (additional_works_columns pattern)
- **AUTO-SAVE**: All user input data MUST be automatically saved to database without explicit save buttons
  - Implement debounced auto-save (300-500ms delay) for text inputs
  - Save immediately on dropdown/select changes
  - Use optimistic updates with error rollback on failure
  - Show subtle loading indicators during save operations

### API Pattern
Standard Supabase query pattern:
```typescript
const { data, error } = await supabase
  .from('table')
  .select('*, relation:table(*)')
  .order('created_at', { ascending: false });

if (error) {
  console.error('Operation failed:', error);
  setError('Ошибка при выполнении операции'); // Russian error messages
  throw error;
}
```

## Critical Guidelines

### MUST DO
- Run `npm run lint` before committing
- Handle all TypeScript strict mode requirements
- Include error handling in all Supabase queries
- Write **TypeScript only** with strict typing
- Use functional React components and hooks
- All tables MUST have sorting and filters in column headers

### NEVER DO
- Create files unless absolutely necessary
- Add comments unless explicitly requested
- Commit .env files or secrets
- Use `any` type in TypeScript
- Create documentation files proactively
- Use RLS (Row Level Security)
- Store secrets or generated artifacts in repository

## UI/UX Guidelines
- **Mobile-first** design approach
- **WCAG 2.1 AA** accessibility compliance
- Modern, responsive UI with Tailwind CSS utility classes
- All tables MUST have sorting and filters in column headers
- Control elements in table rows should be icon-only (no text)
- Display page title in header on all new portal pages
- **Multi-language**: UI is in Russian, maintain Russian labels for user-facing elements

## Code Standards
- Component names: `PascalCase`
- Variables and functions: `camelCase`
- Use functional React components with hooks
- Data fetching directly via Supabase client (no TanStack Query currently)
- Auth state via React Context
- Follow existing patterns in codebase

## TypeScript Configuration
- Composite project with separate `tsconfig.app.json` and `tsconfig.node.json`
- Strict mode enabled with all strict checks
- No path aliases currently configured
- Module resolution: bundler mode with ESNext modules

## Performance Requirements
- Responsive design for all screen sizes
- Fast loading and interaction times
- Efficient data fetching with proper caching
- Optimized bundle size through code splitting

## Security Guidelines
- Never store sensitive data in localStorage
- Always validate user input
- Use environment variables for configuration
- Implement proper error boundaries
- Follow OWASP security guidelines

## Application Structure Notes

### Component Organization
- Keep components focused and single-purpose
- Use composition over inheritance
- Implement proper prop types with TypeScript
- Handle loading and error states consistently

### State Management
- Use React Context sparingly for truly global state (auth is implemented)
- Prefer local state for component-specific data
- Implement proper error handling and loading states

## Important Notes
- All user-facing text must be in Russian
- Follow responsive design principles
- Implement proper accessibility features
- Use semantic HTML elements
- Maintain consistent styling with Tailwind CSS
- Test components across different screen sizes

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.