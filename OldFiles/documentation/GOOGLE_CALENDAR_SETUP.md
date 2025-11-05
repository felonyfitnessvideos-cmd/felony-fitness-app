# Google Calendar Integration Setup Guide

## Overview
The Felony Fitness app integrates with Google Calendar to sync trainer appointments and enable advanced scheduling features. This guide walks you through setting up the Google Calendar API integration.

## Prerequisites
- Google account
- Google Cloud Console access
- Basic understanding of API keys and OAuth

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Felony Fitness Calendar"
4. Click "Create"

### 2. Enable Google Calendar API

1. In your project dashboard, click "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"
4. Wait for activation (usually takes a few seconds)

### 3. Create API Credentials

#### Create API Key
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy the generated API key
4. Click "Restrict Key" (recommended)
5. Under "API restrictions", select "Google Calendar API"
6. Click "Save"

#### Create OAuth 2.0 Client ID
1. In "Credentials", click "Create Credentials" → "OAuth client ID"
2. If prompted, configure OAuth consent screen:
   - Choose "External" user type
   - Fill in required fields:
     - App name: "Felony Fitness"
     - User support email: your email
     - Developer contact: your email
   - Add scopes: `https://www.googleapis.com/auth/calendar.events`
   - Add test users (your email)
3. Select "Web application" as application type
4. Enter name: "Felony Fitness Web Client"
5. Add authorized origins:
   - `http://localhost:5173` (for development)
   - Your production domain (e.g., `https://your-app.vercel.app`)
6. Click "Create"
7. Copy the Client ID

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```bash
   VITE_GOOGLE_API_KEY=your-actual-api-key-here
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

## Testing the Integration

1. Navigate to the Trainer Dashboard
2. Go to the Calendar section
3. You should see "Connect Google Calendar" button
4. Click it to authenticate with Google
5. Grant permissions for calendar access
6. Test creating an appointment to verify sync

## Features Included

### ✅ Current Features
- **Authentication**: Sign in/out with Google account
- **Calendar Sync**: View Google Calendar events in trainer dashboard
- **Event Creation**: Create appointments directly to Google Calendar
- **Real-time Updates**: Automatic refresh of calendar data
- **Status Indicators**: Visual feedback for connection status
- **Error Handling**: User-friendly error messages

### 🚧 Planned Features
- **Event Editing**: Modify existing calendar events
- **Recurring Appointments**: Support for repeat appointments
- **Multiple Calendars**: Choose which calendar to sync
- **Smart Scheduling**: AI-powered optimal time suggestions
- **Client Invitations**: Automatic email invites to clients
- **Conflict Detection**: Prevent double-booking

## API Usage & Quotas

### Google Calendar API Limits
- **Free Tier**: 1 billion quota units per day
- **Typical Usage**: 
  - List events: 1 quota unit per request
  - Create event: 3 quota units per request
  - Update event: 3 quota units per request

### Best Practices
- Cache calendar data locally when possible
- Use batch requests for multiple operations
- Implement exponential backoff for rate limiting
- Monitor quota usage in Google Cloud Console

## Security Considerations

### Production Setup
1. **Restrict API Key**: Limit to specific domains/IPs
2. **OAuth Consent**: Complete verification process for production
3. **Environment Variables**: Use secure secret management
4. **HTTPS Only**: Ensure all requests use HTTPS
5. **Minimal Scopes**: Only request necessary permissions

### Development Setup
- Use localhost origins for testing
- Keep credentials in `.env.local` (not committed to git)
- Use test calendars, not personal ones

## Troubleshooting

### Common Issues

#### "API Key not valid" Error
- Check if Google Calendar API is enabled
- Verify API key restrictions
- Ensure correct environment variable name

#### "OAuth Error: redirect_uri_mismatch"
- Add your domain to authorized origins
- Check for typos in redirect URIs
- Ensure protocol matches (http vs https)

#### "Access blocked" Error
- Complete OAuth consent screen configuration
- Add your email as test user
- Wait for verification if using external user type

#### Calendar Events Not Showing
- Check if user granted calendar permissions
- Verify date range in API requests
- Ensure user has events in the specified calendar

### Debug Mode

Enable debug logging by adding to `.env.local`:
```bash
VITE_DEBUG_CALENDAR=true
```

This will show detailed logs in browser console.

## Integration Architecture

### Components
- **`googleCalendar.js`**: Core API service
- **`useGoogleCalendar.jsx`**: React hook for calendar operations
- **`TrainerCalendar.jsx`**: UI component with Google Calendar integration

### Data Flow
1. User authenticates with Google
2. App requests calendar permissions
3. Calendar events loaded and cached locally
4. UI updates with real-time calendar data
5. User actions sync back to Google Calendar

## Support

For additional help:
1. Check [Google Calendar API Documentation](https://developers.google.com/calendar/api)
2. Review [Google Cloud Console](https://console.cloud.google.com/) for quota/usage
3. Test API endpoints using [Google API Explorer](https://developers.google.com/calendar/api/v3/reference)

## Next Steps

After basic setup is working:
1. Implement recurring appointments
2. Add multiple calendar support
3. Integrate with Smart Scheduling AI
4. Set up client notification system
5. Add calendar export/import features