# Smart Desk Mobile App

A React Native mobile application built with Expo, TypeScript, and Supabase for task management.

## 🚀 Features

- **Authentication**: Secure login/logout with Supabase Auth
- **Task Management**: Create, edit, delete, and mark tasks as complete
- **Modern UI**: Built with React Native Paper and styled-components
- **Type Safety**: Full TypeScript support with strict typing
- **State Management**: Zustand for global state management
- **Data Fetching**: TanStack Query for efficient data fetching and caching

## 📱 Tech Stack

- **React Native** with Expo SDK 52
- **TypeScript** for type safety
- **React Native Paper** for Material Design components
- **styled-components** for styling
- **Zustand** for state management
- **TanStack Query** for data fetching
- **React Navigation** for navigation
- **Supabase** for backend services

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- pnpm package manager
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Installation

1. **Install dependencies**:

   ```bash
   cd apps/native
   pnpm install
   ```

2. **Configure environment variables**:

   ```bash
   cp env.example .env
   ```

   Edit `.env` and add your Supabase credentials:

   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

3. **Start the development server**:

   ```bash
   pnpm start
   ```

4. **Run on device/simulator**:
   - For iOS: `pnpm ios` or scan QR code with Expo Go app
   - For Android: `pnpm android` or scan QR code with Expo Go app
   - For Web: `pnpm web`

## 🏗️ Project Structure

```
apps/native/
├── src/
│   ├── config/           # Configuration files (Supabase, etc.)
│   ├── features/         # Feature-based modules
│   │   ├── auth/         # Authentication feature
│   │   ├── task/         # Task management feature
│   │   └── profile/      # User profile feature
│   └── navigation/       # Navigation configuration
├── App.tsx              # Main app component
├── app.json             # Expo configuration
├── babel.config.js      # Babel configuration
└── tsconfig.json        # TypeScript configuration
```

## 📦 Shared Packages

The app uses shared packages from the monorepo:

- `@smart-desk/types` - TypeScript type definitions
- `@smart-desk/store` - Zustand store utilities

## 🔧 Development

### Available Scripts

- `pnpm start` - Start Expo development server
- `pnpm ios` - Run on iOS simulator
- `pnpm android` - Run on Android emulator
- `pnpm web` - Run on web browser

### Code Style

- Follow the project's TypeScript standards
- Use named exports only (no default exports)
- Keep files under 300 lines
- Use proper error handling and loading states
- Follow Material Design guidelines for UI components

## 🔐 Authentication

The app uses Supabase Auth for authentication:

- **Login**: Email and password authentication
- **Registration**: New user registration with email verification
- **Session Management**: Automatic session persistence and refresh
- **Logout**: Secure logout with session cleanup

## 📋 Task Management

### Features

- **Create Tasks**: Add new tasks with title, notes, priority, and metadata
- **Edit Tasks**: Modify existing task details
- **Delete Tasks**: Remove tasks permanently
- **Mark Complete**: Toggle task completion status
- **Filtering**: Filter tasks by status, priority, and other criteria

### Task Properties

- Title (required)
- Notes (optional)
- Important flag
- Urgent flag
- Blocked flag
- Estimated time
- Quantity target
- Daily flag
- Due date
- Tags and categories

## 🎨 UI Components

The app includes a comprehensive set of reusable UI components:

- **Button** - Customizable button with variants
- **Input** - Form input with validation
- **TaskList** - Scrollable task list
- **PageContainer** - Page layout wrapper
- **SectionHeader** - Section header component

## 🚀 Deployment

### Building for Production

1. **Configure app.json** with your app details
2. **Build the app**:
   ```bash
   expo build:ios    # For iOS
   expo build:android # For Android
   ```

### App Store Deployment

1. Follow Expo's deployment guide
2. Configure app signing certificates
3. Submit to App Store Connect (iOS) or Google Play Console (Android)

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `expo start -c`
2. **TypeScript errors**: Check import paths and type definitions
3. **Supabase connection**: Verify environment variables and network connectivity
4. **Build failures**: Check Expo CLI version and dependencies

### Getting Help

- Check the [Expo documentation](https://docs.expo.dev/)
- Review [React Native Paper documentation](https://reactnativepaper.com/)
- Consult [Supabase documentation](https://supabase.com/docs)

## 📄 License

This project is part of the Smart Desk monorepo and follows the same license terms.
