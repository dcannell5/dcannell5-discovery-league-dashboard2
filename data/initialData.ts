

import type { AppData } from '../types';

// A minimal, empty structure to initialize the database on first load.
// This prevents overwriting user data with a hardcoded state.
export const initialAppData: AppData = {
  leagues: {},
  dailyResults: {},
  allDailyMatchups: {},
  allDailyAttendance: {},
  allRefereeNotes: {},
  allAdminFeedback: {},
  projectLogs: [],
  systemLogs: [],
  teamOfTheDay: {},
  activeLeagueId: null,
  upcomingEvent: {
    title: 'Discovery League Summer Camp',
    description: 'Join us for our annual Summer Camp! Sessions are available from July 2nd to July 11th. Focus on skill development, teamwork, and fun in a positive learning environment.',
    buttonText: 'Learn More & Register',
    buttonUrl: 'https://canadianeliteacademy.corsizio.com/',
  },
};