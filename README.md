# Smart Desk

A cross-platform productivity application with task management, calendar integration, note-taking, and location services.

## 🎯 About

Smart Desk is a personal productivity tool built with modern web technologies. It provides a comprehensive solution for managing tasks, events, notes, and locations across web and mobile platforms.

## 🌟 Key Features

- **📱 Cross-Platform**: Web (Next.js) and iOS (React Native) applications
- **📅 Calendar**: Google Calendar integration with multiple view modes
- **✅ Tasks**: Kanban board and Eisenhower Matrix for task management
- **📊 Export**: CSV export functionality for task data
- **📝 Notes**: Rich text editor with tagging, file management, and full-view mode
- **🗺️ Maps**: Location services with weather integration
- **🔄 Sync**: Real-time synchronization across devices with automatic reconnection

> **⚠️ Note**: The web app is desktop-optimized. Use the iOS app for mobile.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- Supabase account

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/your-username/smart-desk.git
   cd smart-desk
   pnpm install
   ```

2. **Environment setup**

   Create `apps/web/.env.local`:
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
   # Web application
   pnpm dev:web

   # Mobile application (iOS)
   cd apps/native
   pnpm ios
   ```

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React Native, Material-UI v7, React Native Paper
- **State**: Zustand, TanStack Query v5
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Storage**: Cloudinary
- **Tools**: TypeScript, ESLint, Prettier, pnpm, Nx

## 📁 Project Structure

```
smart-desk/
├── apps/
│   ├── web/          # Next.js web app
│   └── native/       # React Native iOS app
├── packages/         # Shared packages
├── supabase/         # Database schema
└── scripts/          # Build scripts
```

## 🔧 Development

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev:web          # Web app
pnpm dev:native       # Mobile app

# Build for production
pnpm build:web
pnpm build:native

# Code quality
pnpm lint
pnpm typecheck
pnpm format
```

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.
