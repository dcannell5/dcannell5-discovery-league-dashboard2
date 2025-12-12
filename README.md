# Discovery League Dashboard

A dynamic sports league management dashboard built with React, TypeScript, and Vite. This application provides a comprehensive platform for managing multi-day sports leagues, tracking player statistics, generating matchups, and managing game scores.

## Features

### Core Functionality
- **League Management**: Create and manage multiple leagues with customizable settings
- **Player Tracking**: Track player attendance, statistics, and performance across multiple days
- **Automatic Matchups**: AI-powered matchup generation for balanced and fair games
- **Score Entry**: Real-time score entry and game result tracking
- **Leaderboard**: Dynamic rankings based on wins, losses, ties, and point differentials
- **Multi-Court Support**: Configure multiple courts with custom names
- **Daily Scheduling**: Manage multi-day leagues with day-by-day schedules

### Advanced Features
- **AI Integration**: Powered by Google's Gemini AI for coaching tips and team recommendations
- **Team of the Day**: AI-generated daily team highlights with personalized summaries
- **Role-Based Access**: Super admin dashboard with advanced controls
- **Data Persistence**: Server-side data storage with automatic save/sync
- **Attendance Management**: Track player attendance across multiple days
- **Custom Announcements**: League-wide announcement system
- **Schedule Locking**: Lock specific days to prevent changes

## Technology Stack

- **Frontend**: React 19, TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Express.js server
- **AI Services**: Google Gemini AI (`@google/genai`)
- **Cloud Storage**: Google Cloud Storage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dcannell5/dcannell5-discovery-league-dashboard2.git
cd dcannell5-discovery-league-dashboard2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

This will create optimized production builds for both the client and server:
- Client build: `dist/`
- Server build: `dist-server/`

### Running Production Server

```bash
npm start
```

## Project Structure

```
discovery-league-dashboard/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard view
│   ├── SetupScreen.tsx  # League setup interface
│   ├── Leaderboard.tsx  # Player rankings
│   ├── AdminPanel.tsx   # Admin controls
│   └── ...
├── utils/              # Utility functions
│   ├── leagueLogic.ts  # Matchup generation and league logic
│   ├── statsLogic.ts   # Statistics calculations
│   ├── rankingLogic.ts # Ranking algorithms
│   └── auth.ts         # Authentication helpers
├── services/           # External service integrations
│   └── geminiService.ts # AI service integration
├── data/              # Data models and initial data
│   ├── initialData.ts  # Default league data
│   └── presetSchedule.ts # Preset schedules
├── server/            # Express server
│   └── index.ts       # Server entry point
├── types.ts           # TypeScript type definitions
├── App.tsx            # Main application component
└── index.tsx          # Application entry point
```

## Key Features Explained

### League Setup
- Configure number of players, courts, and days
- Set custom court names
- Define players per team and games per court
- Choose between standard and custom league types

### Matchup Generation
The application uses intelligent algorithms to:
- Ensure balanced team compositions
- Minimize repeated matchups
- Track historical games to avoid duplicates
- Generate fair court assignments

### Statistics Tracking
Automatic calculation of:
- League points (wins/losses/ties)
- Games played
- Points for/against
- Point differential
- Daily performance tracking

### Admin Controls
Super admins can:
- Delete leagues
- Reset all data
- Lock/unlock specific days
- Manage announcements
- Configure league settings

## API Endpoints

The server provides several API endpoints:

- `POST /api/save-data` - Save league data
- `GET /api/get-data` - Retrieve league data
- `POST /api/reset-data` - Reset all data
- `POST /api/generate-coaching-tip` - Generate AI coaching tips
- `POST /api/generate-team-of-the-day` - Generate daily team highlights

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.
