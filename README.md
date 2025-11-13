# Smart Desk

A desktop-optimized productivity application with task management, calendar integration, note-taking, and location services.

## 🎯 About

Smart Desk is a personal productivity tool built with modern web technologies. It provides a comprehensive solution for managing tasks, events, notes, and locations on the web.

## 🌟 Key Features

- **📱 Web**: Next.js web application (desktop-optimized)
- **🔐 Authentication**: Secure login/logout with Supabase Auth
- **✅ Tasks**: Create, edit, delete, and manage tasks with priority flags
- **📅 Calendar**: Google Calendar and ICS calendar integration with multiple view modes and automatic timezone conversion
- **📊 Export**: CSV export functionality for task data
- **📝 Notes**: Rich text editor with tagging, file management, and full-view mode
- **🗺️ Maps**: Location services with weather integration
- **🔄 Sync**: Real-time synchronization across devices with automatic reconnection
- **🎨 Modern UI**: Material Design components

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm
- Supabase account

### Configuration Notes
- **React Version**: Web app uses React 19 for consistency and latest features
- **TypeScript**: Strict TypeScript configuration with React 19 types
- **ESLint**: Consistent configuration across the project
- **Dependencies**: All libraries updated to compatible versions with React 19
- **Status**: ✅ All linting, type checking, formatting, and build processes are working correctly
- **Ready for Development**: Web app is fully functional and ready for user development

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/your-username/smart-desk.git
   cd smart-desk
   npm install
   ```

2. **Environment setup**

   **Web App** - Create `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

3. **Run the application**
   ```bash
   npm run dev
   ```

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, Material-UI v7
- **State**: Zustand, TanStack Query v5
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Storage**: Cloudinary
- **Tools**: TypeScript, ESLint, Prettier, npm, Nx

### Calendar & Timezone Handling

The web application supports both Google Calendar and ICS calendar integration. For ICS calendars:

- **Timezone Conversion**: ICS events are parsed in their **original timezone** (as specified in the ICS file), converted to UTC internally, and then automatically displayed in the **user's local browser timezone**
- **No Manual Timezone Selection**: The UI automatically displays all events in your local timezone without requiring any configuration
- **Proper Handling**: Respects all-day events, floating times, and timed events with specific timezones from ICS feeds
- **Implementation**: The API route (`/api/ics-calendar`) uses `ical.js` and `luxon` for accurate timezone conversions

## 📋 Code Standards

### Import Rules
- **Absolute Imports Only**: The web app is configured to disallow relative imports (e.g., `../`, `./`)
- **Use `src/*` alias**: All internal imports must use the `src/*` alias for better maintainability
- **Same-folder imports allowed**: Imports within the same folder (e.g., `./styles`) are permitted
- **ESLint enforcement**: The `no-restricted-imports` rule automatically catches and prevents relative imports

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
