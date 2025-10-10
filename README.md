# Smart Desk

A cross-platform productivity application with task management, calendar integration, note-taking, and location services.

## 🎯 About

Smart Desk is a personal productivity tool built with modern web technologies. It provides a comprehensive solution for managing tasks, events, notes, and locations across web and mobile platforms.

## 🌟 Key Features

- **📱 Cross-Platform**: Web (Next.js) and iOS (React Native) applications (iOS only)
- **🔐 Authentication**: Secure login/logout with Supabase Auth
- **✅ Tasks**: Create, edit, delete, and manage tasks with priority flags
- **📅 Calendar**: Google Calendar and ICS calendar integration with multiple view modes and automatic timezone conversion
- **📊 Export**: CSV export functionality for task data
- **📝 Notes**: Rich text editor with tagging, file management, and full-view mode
- **🗺️ Maps**: Location services with weather integration
- **🔄 Sync**: Real-time synchronization across devices with automatic reconnection
- **🎨 Modern UI**: Material Design with React Native Paper and styled-components

> **⚠️ Note**: The web app is desktop-optimized. Use the iOS app for mobile.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- Supabase account
- **For iOS development**: Xcode and iOS Simulator (macOS only)
- **For testing on device**: Expo Go app from App Store

### Configuration Notes
- **React Version**: Both web and native apps now use React 19 for consistency and latest features
- **Expo SDK**: Updated to version 53.0.22 (latest stable) with all compatible dependencies
- **TypeScript**: Strict TypeScript configuration with React 19 types across all projects
- **ESLint**: Consistent configuration across all projects (React Native ESLint plugin temporarily disabled due to ESLint 9 compatibility)
- **Dependencies**: All libraries updated to latest versions with React 19 and Expo SDK 53 compatibility
- **Status**: ✅ All linting, type checking, formatting, and build processes are working correctly
- **Ready for Development**: Both web and native apps are fully functional and ready for user development

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/your-username/smart-desk.git
   cd smart-desk
   pnpm install
   ```

2. **Environment setup**

   **Web App** - Create `apps/web/.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

   **Mobile App** - Create `apps/native/.env`:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the application**
   ```bash
   # Web application
   pnpm dev:web

   # Mobile application (iOS only)
   cd apps/native
   pnpm install
   pnpm start
   # Then scan QR code with Expo Go app or run pnpm start --ios
   ```

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React Native with Expo SDK 53, Material-UI v7, React Native Paper
- **State**: Zustand, TanStack Query v5
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Storage**: Cloudinary
- **Tools**: TypeScript, ESLint, Prettier, pnpm, Nx

### Calendar & Timezone Handling

The web application supports both Google Calendar and ICS calendar integration. For ICS calendars:

- **Timezone Conversion**: ICS events are parsed in their **original timezone** (as specified in the ICS file), converted to UTC internally, and then automatically displayed in the **user's local browser timezone**
- **No Manual Timezone Selection**: The UI automatically displays all events in your local timezone without requiring any configuration
- **Proper Handling**: Respects all-day events, floating times, and timed events with specific timezones from ICS feeds
- **Implementation**: The API route (`/api/ics-calendar`) uses `ical.js` and `luxon` for accurate timezone conversions

## 📁 Project Structure

```
smart-desk/
├── apps/
│   ├── web/          # Next.js web app
│   └── native/       # React Native iOS app (iOS only)
├── packages/         # Shared packages
├── supabase/         # Database schema
└── scripts/          # Build scripts
```

## 🔧 Development

```bash
# Install dependencies
pnpm install

# Development
pnpm dev:web          # Web app
pnpm dev:native       # Native iOS app

# Build
pnpm build:web        # Web app
pnpm build:native     # Native app

# Code quality
pnpm lint:web         # Lint web app
pnpm lint:native      # Lint native app
pnpm typecheck:web    # Type check web app
pnpm typecheck:native # Type check native app
pnpm format:web       # Format web app
pnpm format:native    # Format native app

# Utilities
pnpm clear:web        # Clear web app cache
pnpm clear:native     # Clear native app cache
pnpm fix:web          # Fix web app issues
pnpm fix:native       # Fix native app issues
pnpm fix:all          # Fix both web and native apps
pnpm graph            # Show dependency graph
pnpm zip              # Create deployment zip

# Native iOS app specific commands
cd apps/native
pnpm start          # Start Expo development server (iOS only)
pnpm build          # Build for production
pnpm lint           # Lint native app code
pnpm typecheck      # Type check native app
pnpm format         # Format native app code
```

## 📱 Native App (iOS)

The native app is built with React Native and Expo, providing a native iOS experience with Material Design components.

### Features
- **Task Management**: Create, edit, and manage tasks with priority levels
- **Authentication**: Secure login with Supabase Auth
- **Profile Management**: User profile and settings
- **Real-time Sync**: Automatic synchronization with web app
- **Native UI**: React Native Paper components with styled-components

### Development
```bash
cd apps/native

# Install dependencies
pnpm install

# Start development server (iOS only)
pnpm start

# Build for production
pnpm build

# Code quality
pnpm lint
pnpm typecheck
pnpm format
```

### Project Structure
```
apps/native/
├── src/
│   ├── features/          # Feature modules (auth, task, profile)
│   ├── shared/           # Shared components and utilities
│   ├── navigation/       # Navigation configuration
│   └── config/          # App configuration (Supabase, etc.)
├── assets/              # App icons and splash screen
├── app.json            # Expo configuration
├── babel.config.js     # Babel configuration
├── metro.config.js     # Metro bundler configuration
└── tsconfig.json       # TypeScript configuration
```

## 📋 Code Standards

### Import Rules
- **Absolute Imports Only**: Both web and native apps are configured to disallow relative imports (e.g., `../`, `./`)
- **Use `src/*` alias**: All internal imports must use the `src/*` alias for better maintainability
- **Same-folder imports allowed**: Imports within the same folder (e.g., `./styles`) are permitted
- **ESLint enforcement**: The `no-restricted-imports` rule automatically catches and prevents relative imports

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
