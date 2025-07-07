# Smart Desk

Smart Desk is a small dashboard built with Next.js and Material UI. It aggregates events from Google Calendar and custom ICS feeds and also lets you manage local tasks and reminders.

## Features

- Google authentication in a dedicated tab
- Merge Google and ICS calendar events
- Manage personal tasks with drag and drop columns
- Add, edit and remove local events
- Trash bin for tasks, columns and local events with restore option
- Optional audio alerts and time announcements

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

Local settings are persisted using `localStorage`. To reset all data simply clear the browser storage.

## Tests

No automated tests are provided. Run `npm run lint` to check the code style.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
