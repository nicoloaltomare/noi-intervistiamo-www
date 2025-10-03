# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Noi Intervistiamo** is an Angular 19 interview management portal with role-based access control (RBAC). The application supports four distinct user roles (Admin, HR, Interviewer, Candidate), each with their own dashboard and permissions. The project uses a mock Express server for development and includes a comprehensive toolkit of reusable UI components.

## Development Commands

### Starting the Application
```bash
npm start
```
This concurrently starts both the Angular dev server (port 4200) and the mock API server (port 8081) with proxy configuration. This is the primary command for development.

### Alternative Development Commands
```bash
npm run dev          # Angular dev server without noi-intervistiamo configuration
npm run proxystart   # Angular server only (assumes mock-server is already running)
npm run mock-server  # Mock server only
```

### Building
```bash
npm run build        # Production build (outputs to dist/)
npm run watch        # Watch mode for development
```

### Testing
```bash
npm test            # Run unit tests with Karma
```

### Mock Server (from mock-server/ directory)
```bash
npm run dev         # Development mode with ts-node
npm run build       # Compile TypeScript
npm start           # Run compiled server
npm run watch       # Watch mode with nodemon
```

## Architecture

### Application Structure

The application follows Angular's standalone component architecture (no NgModules):

**Core Directory** (`src/app/core/`)
- `guards/` - Route guards (authGuard, roleGuard)
- `services/` - Global services (ApiService, LoadingService, BreadcrumbService)
- `toolkit/` - Reusable UI components library

**Layouts** (`src/app/layouts/`)
- `admin-layout/` - Admin dashboard shell
- `hr-layout/` - HR dashboard shell
- `interviewer-layout/` - Interviewer dashboard shell
- `candidate-layout/` - Candidate dashboard shell

Each layout includes a sidebar, header-bar, breadcrumb, and role-specific navigation.

**Pages** (`src/app/pages/`)
- `public/home/` - Landing page with login modal
- `private/*/` - Role-specific dashboards and features

### Role-Based Access Control (RBAC)

The application implements RBAC at multiple levels:

1. **Route Level**: Routes use `authGuard` and `roleGuard` with `data: { role: 'ADMIN' }` to protect access
2. **User Model**: Users have access area flags (`hasHRAccess`, `hasTechnicalAccess`, `hasAdminAccess`, `hasCandidateAccess`)
3. **Role Model**: Roles define permissions via access area booleans and can be system roles (non-editable) or custom roles

**Role Hierarchy**:
- **ADMIN** - Full system access, user/role/department management
- **HR** - Candidate and interview management
- **INTERVIEWER** - Conduct interviews and evaluations
- **CANDIDATE** - Limited access to own profile and interviews

### API Service Architecture

**ApiService** (`src/app/core/services/api.service.ts`)
- Centralized HTTP client wrapper
- Base URL: `/noi-intervistiamo/api`
- Automatic auth token injection (from localStorage: `auth_token`)
- Integrated with LoadingService for global loading states
- Methods: `get()`, `post()`, `put()`, `patch()`, `delete()`
- RequestOptions: `skipAuth`, `skipLoading`, `headers`, `params`

**Proxy Configuration**:
All `/noi-intervistiamo/api/**` requests are proxied to `http://localhost:8081` (defined in `proxy.conf.json`)

### Mock Server Architecture

**Technology**: Express + TypeScript on port 8081

**Route Structure**:
```
/noi-intervistiamo/api/
  ├── auth/          - Authentication endpoints
  ├── users/         - User CRUD + search with pagination
  ├── roles/         - Role management
  ├── departments/   - Department management
  ├── datalist/      - Dropdown/select options (roles, departments, user-statuses, user-access-areas, color-palettes)
  ├── interviews/    - Interview management
  ├── candidates/    - Candidate management
  ├── notifications/ - Notification system
  ├── files/         - File uploads
  ├── dashboard/     - Dashboard statistics
  └── health/        - Health check endpoint
```

**Key Features**:
- In-memory data storage (arrays in route files)
- Soft delete support (deletedAt field)
- Pagination support (POST /search endpoints)
- CORS enabled for localhost:4200
- Rate limiting: 1000 req/15min
- Request timeout: 30s

**Important Data Files**:
- `mock-server/src/routes/configuration.data.ts` - Contains `accessAreas`, `userStatuses`, `colorPalettes` configurations with colors and icons
- Colors from configuration.data.ts must be used throughout the UI to maintain consistency

### Reusable Toolkit Components

Located in `src/app/core/toolkit/`:

**DataTableComponent** - Advanced table with:
- Custom column templates (via `@ViewChild` TemplateRef)
- Pagination, sorting, filtering
- Action buttons per row (edit, delete, toggle, etc.)
- Responsive card view on mobile
- Column configuration: `id`, `label`, `width`, `type`, `align`, `sortable`, `customTemplate`

**SearchComponent** - Dynamic filter form:
- FiltroItem types: `text`, `select`, `checkbox`, `date`, `number`
- Emits `filtroChange` and `clearFiltri` events
- Supports colSize for responsive grid layout

**CustomSelectComponent** - Dropdown with:
- Options with `value`, `label`, `icon`, `color`
- ControlValueAccessor implementation
- Error state detection via ngDoCheck
- Blur handling to close dropdown
- Icon and color badge support

**BaseModalComponent** - Modal wrapper:
- Configurable size: `sm`, `md`, `lg`, `xl`
- Named slots: default, header, footer
- Backdrop click handling

**BreadcrumbComponent** - Dynamic breadcrumbs via BreadcrumbService

**Other Components**: `SidebarComponent`, `HeaderBarComponent`, `FooterComponent`, `LoaderComponent`, `AvatarSelectionModalComponent`

### Theming System

**Configuration**: `public/assets/config/theme-colors.config.json`

**Current Theme**: `modern-green` (primary: #0a8228)

**Available Themes**:
- `corporate-blue` - Professional blue theme
- `modern-green` - Green sustainability theme (current)
- `dark-professional` - Dark mode
- `elegant-green` - Natural green tones

**CSS Variables**: Themes are loaded into CSS custom properties (`--portal-primary`, `--portal-text-primary`, etc.)

### Form Modal Pattern

All CRUD operations follow this pattern:

1. **List Component** (e.g., `users-list.component.ts`):
   - DataTable with actions
   - Modal visibility signals
   - CRUD methods calling service layer
   - Resolver for preloading dropdown data

2. **Form Modal Component** (e.g., `user-form-modal.component.ts`):
   - `@Input() isVisible`, `@Input() user` (for edit), `@Input() preloadedData`
   - `@Output() closeModal`, `@Output() saveUser`
   - Reactive forms with validation
   - Real-time validation with green checkmarks
   - Max-length hints: `font-size: 10px; color: #b0b0b0; font-style: italic`
   - Error styling: red border + error message

3. **Service Layer** (e.g., `user.service.ts`):
   - Uses ApiService
   - Methods: `getPaginatedUsers()`, `getUserById()`, `createUser()`, `updateUser()`, `deleteUser()`, `toggleUserStatus()`

4. **Resolver** (optional):
   - Preloads dropdown data (roles, departments, statuses)
   - Attached to route definition

### Data Models

**Key Interfaces** (`src/app/shared/models/`):

```typescript
interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roleName?: string;
  roleColor?: string;
  status: string;
  isActive: boolean;
  avatarId?: string;
  lastLogin?: Date;
  hasHRAccess?: boolean;
  hasTechnicalAccess?: boolean;
  hasAdminAccess?: boolean;
  hasCandidateAccess?: boolean;
  accessAreaColors?: Record<string, string>;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface Role {
  id: string;
  name: string;
  code: string;
  description?: string;
  color: string;
  permissions: string[];
  isActive: boolean;
  isSystem: boolean; // Cannot be edited or deleted
  hasHRAccess?: boolean;
  hasTechnicalAccess?: boolean;
  hasAdminAccess?: boolean;
  hasCandidateAccess?: boolean;
  userCount?: number;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface Department {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
  userCount?: number;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
```

### Important UI/UX Conventions

1. **Access Area Badges**: Always use colors from `mock-server/src/routes/configuration.data.ts` accessAreas
   - Display format: icon + label (e.g., "Area HR")
   - Style: `padding: 6px 12px; border-radius: 16px; font-size: 12px; font-weight: 600; color: white`

2. **Status Badges**: Use icons and colors from userStatuses configuration
   - Style: `padding: 4px 10px; border-radius: 12px; font-size: 11px; text-transform: uppercase`

3. **Custom Select**: When field is required, it should:
   - Show red border on error (`.error` class detected via ngDoCheck)
   - NOT show green checkmark validation icon
   - Close dropdown on blur/focusout

4. **Form Validation**:
   - Required fields: red border + error message below
   - Valid fields: green checkmark icon on the right
   - Max-length hints: smaller, grayer, italic text next to label

5. **Table Design**:
   - Use custom templates for complex cells
   - Role colors from mock-server data
   - Access areas with text labels (not icon-only)
   - Date format: `dd/MM/yyyy` for dates, `HH:mm` for times

6. **Modal Behavior**:
   - Load fresh data from server when editing (call service.getById())
   - Use signals for state management
   - Confirm modals for destructive actions

## Configuration Files

- **angular.json** - Build configurations (production, development, noi-intervistiamo)
- **proxy.conf.json** - API proxy to mock-server
- **tsconfig.json** - TypeScript compiler options
- **public/assets/config/theme-colors.config.json** - Theme definitions
- **public/assets/config/admin-dashboard.config.json** - Dashboard configuration (if exists)

## Base Href Configuration

The application uses base href `/noi-intervistiamo/` in production and noi-intervistiamo configurations. All API endpoints are prefixed with this path.

## Angular Signals

The codebase extensively uses Angular Signals for reactive state management:
- `signal()` for writable signals
- `computed()` for derived state
- `effect()` for side effects
- Prefer signals over RxJS Observables for component state

## Important Notes

1. **No NgModules**: Application uses standalone components exclusively
2. **SCSS Only**: Component styles use SCSS (configured in angular.json)
3. **Bootstrap 5**: UI framework for grid and utilities
4. **Font Awesome**: Icon library (free version 7.0.1)
5. **localStorage**: Auth token stored as `auth_token`
6. **Soft Deletes**: Most entities support soft delete via `deletedAt` field
7. **System Roles**: Roles with `isSystem: true` cannot be modified or deleted
8. **Color Consistency**: Always use colors from mock-server configuration.data.ts for access areas, statuses, and roles
