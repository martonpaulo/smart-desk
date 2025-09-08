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

## 📝 Notes Full View

Smart Desk includes a powerful full-view mode for notes with comprehensive inline editing capabilities:

### Full View Features
- **Dedicated Routes**: Each note has its own URL at `/notes/[id]`
- **Inline Editing**: Edit title, color, and content directly without modals or navigation
- **Real-time Preview**: Live markdown preview while editing content
- **Color Management**: Visual color picker with live preview
- **Date Tracking**: Clear display of both creation and last modified dates
- **Rich Markdown Support**: Full markdown rendering with proper formatting
- **Auto-save**: Changes are automatically saved to the database
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Usage
1. **From Notes Page**: Click the "Open" button on any note card
2. **Direct Access**: Navigate directly to `/notes/[note-id]` in your browser
3. **Edit Mode**: Click the edit icon to enable inline editing
4. **Save Changes**: Use the save button to persist changes (only enabled when changes are made)
5. **Cancel Changes**: Use the cancel button to discard unsaved changes

### Features
- **Markdown Rendering**: Full support for headers, lists, links, and formatting
- **Color Coding**: Visual color indicators for note organization with live preview
- **Metadata Display**: Clear creation and update timestamps with visual separation
- **Navigation**: Easy back navigation and breadcrumb support
- **Accessibility**: WCAG 2.1 compliant with proper keyboard navigation
- **Live Preview**: Real-time markdown preview while editing content

## 📊 Data Export

Smart Desk includes comprehensive CSV export functionality for task data:

### Export Features
- **One-Click Export**: Export button located in the side drawer
- **Complete Data**: Includes all task fields (title, notes, status, dates, etc.)
- **Filtered Export**: Excludes trashed tasks by default for clean data
- **Formatted Dates**: Human-readable date and time formatting
- **CSV Compliance**: Proper escaping of special characters and quotes

### Export Data Fields
The CSV export includes the following task information:
- Basic Info: Title, Notes, Position
- Status Flags: Important, Urgent, Blocked, Daily, Trashed
- Progress: Quantity Done, Quantity Target
- Time Management: Estimated Time, Planned Date, Classified Date
- Metadata: Created At, Updated At, Column ID, Tag ID, Event ID

### Usage
1. Click the "Export Tasks" button below the hidden columns section on the main dashboard
2. The CSV file will automatically download with a timestamped filename
3. Open the file in Excel, Google Sheets, or any CSV-compatible application
4. Receive real-time notifications about the export status

## 🔄 Automatic Sync & Reconnection

Smart Desk includes intelligent sync capabilities that ensure your data is always up-to-date:

### Offline-First Design
- **Local Storage**: All changes are saved locally first, even when offline
- **Pending Changes**: System tracks all unsynced changes while offline
- **Automatic Detection**: Pending changes are automatically detected and queued

### Reconnection Behavior
- **Auto-Sync**: When connection is restored, pending changes are automatically synced
- **Smart Notifications**: Real-time feedback about sync status and pending changes
- **Conflict Resolution**: Server changes are merged with local changes intelligently

### Sync Features
- **Background Sync**: Periodic synchronization in the background
- **Visibility Sync**: Sync when app becomes visible again
- **Manual Sync**: Manual sync button for immediate synchronization
- **Error Handling**: Graceful error handling with retry mechanisms

### User Experience
- **Visual Indicators**: Clear status indicators show sync state
- **Progress Notifications**: Real-time notifications about sync progress
- **Offline Support**: Full functionality even when disconnected
- **Seamless Recovery**: Automatic recovery when connection is restored

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

## 🚨 Troubleshooting

### Common Issues

**Sync Status Icon Not Updating**
- Check network connection and authentication
- Clear browser cache
- Check console for errors

**Session Expiration**
- Verify Google OAuth tokens are valid
- Check environment variables
- Try signing out and back in

**Data Not Syncing**
- Check sync status icon
- Verify Supabase connection
- Try manual sync

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Material-UI, Next.js, Expo, and Supabase teams
- Open source community
