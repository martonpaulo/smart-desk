# Smart Desk

A comprehensive cross-platform productivity application built with a modern monorepo architecture. Smart Desk provides task management, calendar integration, note-taking, and location services across web and mobile platforms.

## 🎯 About This Project

Smart Desk was born out of personal necessity. As a developer, I found that existing productivity tools weren't meeting my specific requirements and workflow needs. Rather than settling for suboptimal solutions, I decided to create my own comprehensive productivity application that would perfectly align with my personal demands and preferences.

This project represents a unique learning journey where I'm combining my existing knowledge with the power of Artificial Intelligence to build something truly tailored to my needs. I'm primarily leveraging:

- **MCPs (Model Context Protocols)**: For enhanced AI integration and context management
- **OpenAI Codex**: For intelligent code generation and assistance
- **Cursor IDE**: As my primary development environment with AI-powered features

The goal is not just to build a productivity tool, but to learn and master these cutting-edge AI development tools while creating something genuinely useful. This project serves as both a practical solution and a hands-on learning experience in modern AI-assisted development.

## 🌟 Features

### 📱 Cross-Platform Support
- **Web Application**: Next.js with Material-UI v7 *(Desktop-optimized, not mobile-optimized)*
- **iOS Application**: React Native with Expo and React Native Paper *(Recommended for mobile users)*
- **Shared Codebase**: Common packages and utilities across platforms

> **⚠️ Important**: The web application is **not optimized for mobile devices**. For the best mobile experience, please use the dedicated iOS application available on the App Store.

### 📅 Advanced Calendar System
- **Multiple Views**: Day, Week, Month, Year, and Schedule views
- **Smart Navigation**: URL-based routing with date-specific paths
- **Event Management**: Integration with Google Calendar and ICS feeds
- **Real-time Updates**: Live event synchronization and notifications

### ✅ Task Management
- **Kanban Board**: Drag-and-drop task organization
- **Eisenhower Matrix**: Priority-based task categorization
- **Custom Columns**: Configurable workflow stages
- **Task Progress**: Visual progress tracking and analytics

### 📝 Note-Taking & Organization
- **Rich Text Editor**: Advanced note creation and editing
- **Tag System**: Flexible categorization and filtering
- **File Management**: Upload and organize documents and media
- **Search & Discovery**: Powerful search across all content

### 🗺️ Location & Maps
- **Interactive Maps**: Location-based features and visualization
- **Weather Integration**: Location-based weather information
- **Smart Notifications**: Context-aware alerts and reminders

### 🔊 Smart Notifications
- **Event Alerts**: Customizable event reminders
- **Sound Management**: Configurable alert sounds and volumes
- **Cross-Platform Sync**: Notifications work across all devices

## 🏗️ Architecture

### Monorepo Structure

This project uses a modern monorepo architecture with the following structure:

```
smart-desk/
├── apps/
│   ├── web/                    # Next.js web application
│   └── native/                 # React Native iOS application
├── packages/
│   ├── data-access/           # Data layer and API clients
│   ├── design-system/         # Shared design tokens and components
│   ├── hooks/                 # Shared React hooks
│   ├── icons/                 # Icon library
│   ├── store/                 # State management (Zustand)
│   ├── types/                 # TypeScript type definitions
│   ├── ui-native/             # React Native UI components
│   ├── ui-web/                # Web UI components
│   └── utils/                 # Shared utilities
├── supabase/                  # Database schema and functions
└── scripts/                   # Build and deployment scripts
```

### Technology Stack

#### Web Application
- **Framework**: Next.js 15 with App Router
- **UI Library**: Material-UI (MUI) v7
- **State Management**: Zustand
- **Data Fetching**: TanStack Query v5
- **Styling**: Emotion (CSS-in-JS)
- **Authentication**: NextAuth.js
- **Target Platform**: Desktop browsers only (not mobile-optimized)

#### Mobile Application
- **Framework**: React Native with Expo
- **UI Library**: React Native Paper
- **State Management**: Zustand
- **Styling**: Styled Components

#### Backend & Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Cloudinary
- **Real-time**: Supabase Realtime

#### Development Tools
- **Package Manager**: pnpm
- **Monorepo Management**: Nx
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint with custom configuration
- **Formatting**: Prettier
- **Code Quality**: Pre-commit hooks

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended package manager)
- Supabase account
- iOS development environment (for mobile app)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/smart-desk.git
   cd smart-desk
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**

   Create environment files for each application:

   **Web App** (`apps/web/.env.local`):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

   **Mobile App** (`apps/native/.env`):
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**

   Set up your Supabase database by running the SQL scripts in the `supabase/` directory:
   ```bash
   # Run the base table creation scripts
   # These will be executed in your Supabase dashboard
   ```

5. **Start Development Servers**

   **Web Application:**
   ```bash
   pnpm dev:web
   # or
   nx run web:dev
   ```

   **Mobile Application:**
   ```bash
   cd apps/native
   npx expo start
   ```

## 📦 Available Scripts

### Root Level Scripts
- `pnpm dev:web` - Start web development server
- `pnpm build:web` - Build web application for production
- `pnpm graph` - Visualize project dependency graph
- `pnpm fix:web` - Fix common web application issues
- `pnpm clear:web` - Clean all dependencies and build artifacts

### Web Application Scripts
- `pnpm dev` - Start Next.js development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm typecheck` - Run TypeScript type checking

## 🎨 Design System

### Web (Material-UI v7)
- **Typography**: Custom font scales and weights
- **Color Palette**: Carefully selected primary, secondary, and accent colors
- **Components**: Consistent component library across the application
- **Responsive Design**: Desktop-first approach (not optimized for mobile)
- **Target Platform**: Desktop browsers only - use mobile app for mobile devices

### Mobile (React Native Paper)
- **Material Design**: Following Google's Material Design guidelines
- **Theming**: Custom theme configuration for brand consistency
- **Accessibility**: Built-in accessibility features and screen reader support

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Platform |
|----------|-------------|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | Web |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | Web |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | Mobile |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | Mobile |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional | Web |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Optional | Web |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | Yes | Web |
| `NEXTAUTH_URL` | Application base URL | Yes | Web |

### Database Schema

The application uses Supabase with the following main tables:
- `tasks` - Task management
- `events` - Calendar events
- `notes` - Note-taking
- `files` - File storage
- `locations` - Location data
- `maps` - Map configurations
- `tags` - Tagging system
- `columns` - Kanban board columns

## 🏛️ Code Standards

### TypeScript Guidelines
- **Strict Mode**: Always use strict TypeScript configuration
- **Named Exports**: Use named exports exclusively (no default exports)
- **Absolute Imports**: Use `src/*` alias instead of relative paths
- **Type Safety**: Avoid `any` types; always provide proper typing

### React Guidelines
- **Function Components**: Use function syntax for components
- **Hooks**: Prefer custom hooks for reusable logic
- **State Management**: Use Zustand for global state, local state for component-specific data
- **Performance**: Implement proper memoization and optimization

### Code Quality
- **ESLint**: Follow project ESLint configuration
- **Prettier**: Use Prettier for consistent code formatting
- **Conventional Commits**: Follow conventional commit message format
- **Testing**: Write tests for critical functionality

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run quality checks**
   ```bash
   pnpm lint
   pnpm typecheck
   ```
5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
6. **Push and create a Pull Request**

### Code Review Process

- All PRs require at least one review
- Ensure all linting and type checking passes
- Update documentation for new features
- Follow accessibility guidelines (WCAG 2.1)
- Test on both web and mobile platforms

## 📦 Deployment

### Web Application (Vercel)

#### Automatic Configuration
This project includes a `vercel.json` configuration file that automatically configures Vercel for the monorepo setup. No manual configuration is required!

#### Vercel Configuration Details
The `vercel.json` file configures the following settings:

| Setting | Value | Description |
|---------|-------|-------------|
| **Framework Preset** | `Next.js` | Next.js framework |
| **Build Command** | `npx nx run web:build` | Uses Nx directly to build the web app from monorepo root |
| **Output Directory** | `apps/web/.next` | Next.js build output directory |
| **Install Command** | `pnpm install` | Installs all workspace dependencies |
| **Functions Runtime** | `nodejs18.x` | Node.js runtime for API routes |

#### Deployment Steps
1. **Connect Repository**: Connect your GitHub repository to Vercel
2. **Automatic Detection**: Vercel will automatically detect the `vercel.json` configuration
3. **Environment Variables**: Set up the following environment variables in Vercel:

   **Required Environment Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
   - `GOOGLE_CLIENT_ID` - Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
   - `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Cloudinary API secret

   **Optional Environment Variables:**
   - `NEXT_PUBLIC_APP_URL` - Application base URL (defaults to 'https://www.martonpaulo.com')
   - `NEXT_PUBLIC_STORAGE_PREFIX` - Storage namespace prefix (defaults to empty string)
   - `NEXT_PUBLIC_STORAGE_VERSION` - Storage version (defaults to 'v1')

4. **Deploy**: Vercel will automatically deploy on push to your main branch

#### Important Notes
- The web application uses `output: 'standalone'` in Next.js config for optimal Vercel deployment
- All workspace packages are properly transpiled for production using Nx
- The build process runs from the monorepo root using `npx nx run web:build` (Nx command)
- The `vercel.json` configuration handles the monorepo structure automatically
- No manual Vercel configuration is needed - everything is handled automatically!

### Mobile Application (Expo)
1. Build for iOS using Expo Application Services (EAS)
2. Submit to App Store through Expo dashboard
3. Configure app store metadata and screenshots

## 🔮 Future Enhancements

### Planned Features
- **🔄 Offline Support**: PWA capabilities with offline task management
- **🤖 AI Integration**: Smart task suggestions and calendar optimization
- **📊 Advanced Analytics**: Detailed productivity insights and reports
- **🔗 Third-party Integrations**: Slack, Microsoft Teams, Notion integration
- **🎯 Goal Tracking**: Long-term goal setting and progress tracking
- **👥 Team Collaboration**: Shared workspaces and team features

### Technical Improvements
- **Performance**: Bundle optimization and lazy loading
- **Accessibility**: Enhanced screen reader support
- **Internationalization**: Multi-language support
- **Testing**: Comprehensive test coverage with Jest and React Testing Library

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Material-UI Team** for the excellent component library
- **Next.js Team** for the powerful React framework
- **Expo Team** for the React Native development platform
- **Supabase Team** for the backend-as-a-service platform
- **Open Source Community** for the various libraries and tools used

## 📞 Support

- **Documentation**: [Project Wiki](https://github.com/your-username/smart-desk/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/smart-desk/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/smart-desk/discussions)

---

**Smart Desk** - Transforming productivity across all your devices. 🚀
