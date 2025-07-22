# Smart Desk

A comprehensive productivity dashboard and task management application built with Next.js, featuring an advanced calendar system, task management, weather integration, and real-time synchronization capabilities.

## 🌟 Features

### 📅 Advanced Calendar System

- **Multiple Views**: Day, Week, Month, Year, and Schedule views
- **Smart Navigation**: URL-based routing with date-specific paths
- **Event Management**: Integration with Google Calendar and ICS feeds
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Live event synchronization and notifications

### ✅ Task Management

- **Kanban Board**: Drag-and-drop task organization
- **Eisenhower Matrix**: Priority-based task categorization
- **Custom Columns**: Configurable workflow stages
- **Task Progress**: Visual progress tracking and analytics
- **Undo/Redo**: Comprehensive action history

### 🌤️ Weather Integration

- **Location-based Weather**: Automatic location detection
- **Detailed Forecasts**: Current conditions and extended forecasts
- **Weather Alerts**: Severe weather notifications

### 🔊 Smart Notifications

- **Event Alerts**: Customizable event reminders
- **Time Announcements**: Periodic time notifications
- **Sound Management**: Configurable alert sounds and volumes

### 🎨 Modern UI/UX

- **Material UI**: Consistent design system
- **Dark/Light Themes**: Automatic theme switching
- **Responsive Layout**: Mobile-first design approach
- **Accessibility**: WCAG compliant interface

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for data synchronization)
- Google Cloud Console project (for calendar integration)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/smart-desk.git
   cd smart-desk
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env.local` file in the root directory using the provided `.env.example` as a template.

4. **Database Setup**

   Run the SQL scripts in the project root to set up your Supabase database:

   ```bash
   create_tasks_table.sql
   create_columns_table.sql
   create_ics_calendars_table.sql

   etc.
   ```

   Ensure you have the necessary tables and relationships set up in your Supabase project.

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **UI Library**: Material-UI (MUI) v5
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth.js
- **Styling**: Emotion (CSS-in-JS)
- **Date Handling**: Native JavaScript Date API
- **HTTP Client**: React Query (TanStack Query)

### Project Structure

```
smart-desk/
├── app/ # Next.js App Router pages
│ ├── calendar/[[...date]]/ # Dynamic calendar routes
│ ├── tasks/ # Task management page
│ ├── ...
│ └── api/ # API routes
├── components/ # Reusable UI components
│ ├── calendar/ # Calendar-specific components
│ │ ├── views/ # Calendar view components
│ └── ...
├── hooks/ # Custom React hooks
│ ├── useEvents.ts
│ ├── useTasks.ts
│ ├── useWeather.ts
│ └── ...
├── providers/ # Context providers
│ ├── AppThemeProvider.tsx
│ ├── LocationProvider.tsx
│ └── ...
├── services/ # External service integrations
│ ├── supabase/ # Supabase service layer
│ ├── googleEventsService.ts
│ └── weatherService.ts
├── store/ # Zustand state stores
│ ├── board/ # Task board state
│ ├── settings/ # Application settings
│ └── ...
├── styles/ # Theme and styling
├── types/ # TypeScript type definitions
├── utils/ # Utility functions
└── ...
```

## 🗓️ Calendar Routes

The calendar system supports comprehensive URL-based navigation:

### Route Structure

- `/calendar` - Default view (current month)
- `/calendar/2025` - Year view for 2025
- `/calendar/2025/08` - Month view for August 2025
- `/calendar/2025/08/21` - Day view for August 21, 2025
- `/calendar/2025/08/21/week` - Week view containing August 21, 2025
- `/calendar/schedule` - Schedule list view

### Calendar Views

#### Day View

- Hourly timeline (24-hour format)
- All-day events section
- Current time indicator
- Event details on hover/click

#### Week View

- 7-day grid layout
- Responsive mobile/desktop layouts
- All-day events row
- Time slot grid with events

#### Month View

- Traditional calendar grid
- Event indicators
- Today highlighting
- Click navigation to day view

#### Year View

- 12-month overview
- Mini calendar for each month
- Current month highlighting
- Click navigation to month view

#### Schedule View

- List-based event display
- Filtering options (today, week, month, upcoming)
- Event grouping by date
- Detailed event information

## 🎨 Design System

### Material UI Integration

The application uses Material-UI with a custom theme that includes:

- **Typography**: Poppins font family with custom weight scales
- **Color Palette**: Carefully selected primary, secondary, and accent colors
- **Breakpoints**: Custom responsive breakpoints for optimal mobile experience
- **Shadows**: Custom shadow system for depth and hierarchy
- **Transitions**: Smooth animations with consistent timing

### Responsive Design

- **Mobile-first approach**: Optimized for touch interfaces
- **Adaptive layouts**: Components adjust based on screen size
- **Touch-friendly**: Appropriate touch targets and gestures
- **Performance optimized**: Efficient rendering on mobile devices

## 🔧 Configuration

### Environment Variables

| Variable                        | Description                | Required |
| ------------------------------- | -------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL       | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key     | Yes      |
| `GOOGLE_CLIENT_ID`              | Google OAuth client ID     | Optional |
| `GOOGLE_CLIENT_SECRET`          | Google OAuth client secret | Optional |
| `NEXTAUTH_SECRET`               | NextAuth.js secret key     | Yes      |
| `NEXTAUTH_URL`                  | Application base URL       | Yes      |

### Customization

#### Theme Customization

Edit `styles/theme.ts` to customize the Material-UI theme:

```typescript
export const theme = createTheme({
  palette: {
    primary: {
      main: '#your-primary-color',
    },
    // ... other theme options
  },
});
```

#### Adding New Calendar Views

1. Create a new view component in `components/calendar/views/`
2. Add the view type to the `CalendarView` union type
3. Update the `CalendarViewContainer` to handle the new view
4. Add navigation logic in `CalendarNavigation`

## 🤝 Contributing

We welcome contributions to Smart Desk! Please follow these guidelines:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Write tests** (if applicable)
5. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Coding Standards

- **TypeScript**: Use strict TypeScript with proper type definitions
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Commit Messages**: Follow conventional commit format
- **Component Structure**: Use functional components with hooks
- **File Naming**: Use kebab-case for files, PascalCase for components

### Code Review Process

1. All PRs require at least one review
2. Ensure all tests pass
3. Maintain test coverage above 80%
4. Update documentation for new features
5. Follow accessibility guidelines (WCAG 2.1)

## 📦 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Configure environment variables** in the Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy your application

### Manual Deployment

```bash

# Build the application

npm run build

# Start the production server

npm run start
```

## 🔮 Future Enhancements

### Planned Features

- **🔄 Offline Support**: PWA capabilities with offline task management
- **🤖 AI Integration**: Smart task suggestions and calendar optimization
- **📊 Advanced Analytics**: Detailed productivity insights and reports
- **🔗 Third-party Integrations**: Slack, Microsoft Teams, Notion integration
- **📱 Mobile App**: React Native mobile application
- **🎯 Goal Tracking**: Long-term goal setting and progress tracking
- **👥 Team Collaboration**: Shared workspaces and team features
- **🔐 Enhanced Security**: Two-factor authentication and encryption

### Technical Improvements

- **Performance**: Bundle optimization and lazy loading
- **Accessibility**: Enhanced screen reader support
- **Internationalization**: Multi-language support
- **Testing**: Comprehensive test coverage
- **Documentation**: Interactive API documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Material-UI Team** for the excellent component library
- **Next.js Team** for the powerful React framework
- **Supabase Team** for the backend-as-a-service platform
- **Open Source Community** for the various libraries and tools used

## 📞 Support

- **Documentation**: [Project Wiki](https://github.com/your-username/smart-desk/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/smart-desk/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/smart-desk/discussions)

---

**Smart Desk** - Transforming productivity, one task at a time. 🚀
