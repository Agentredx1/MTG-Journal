# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MTG-Journal is a full-stack web application for tracking Magic: The Gathering multiplayer game statistics with group-based isolation. The project consists of a Flask backend (`mtg-back/`) and React frontend (`mtg-front/`) that are being decoupled from a monolithic Flask application.

## Development Commands

### Backend (mtg-back/)
```bash
cd mtg-back/
# Install dependencies
pip install flask flask-cors

# Start development server
python run_dev.py
# OR
flask run

# API health check
curl http://localhost:5000/api/v1/health
```

### Frontend (mtg-front/)
```bash
cd mtg-front/
# Install dependencies
npm install

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview
```

### Full Development Setup
1. Start backend: `cd mtg-back && python run_dev.py` (port 5000)
2. Start frontend: `cd mtg-front && npm run dev` (port 5173)
3. Access application at http://localhost:5173

## Architecture Overview

### Current State: Decoupling in Progress
The application is in transition from a Flask monolith to separate frontend/backend. Both applications run in **development mode** with authentication bypassed for easier development.

### Multi-Tenant Group Architecture
- **Group Isolation**: Each group has a unique passkey and sees only their own data
- **Database Schema**: Groups table manages authentication, Games/Players tables include group_id for isolation
- **Session Management**: Group context (group_id, group_name) stored in sessions/tokens

### Backend (Flask API)
- **Dual Interface**: Traditional Flask routes (templates/) + REST API (/api/v1)
- **Development Mode**: Authentication bypassed, permissive CORS, automatic group context
- **Database**: SQLite with group-based filtering throughout all queries
- **File Structure**:
  - `app.py` - Flask routes with session management
  - `api.py` - REST API blueprint with JSON endpoints  
  - `queries.py` - Database layer with group filtering
  - `run_dev.py` - Development server with enhanced configuration

### Frontend (React + TypeScript)
- **Stack**: React 19 + TypeScript + Vite + ESLint
- **Development Mode**: Authentication disabled, uses default group ID (1)
- **State Management**: React Context for group info, local state for navigation
- **Navigation**: Client-side routing via conditional rendering (Dashboard, Stats, Player Detail)
- **API Integration**: Centralized service layer connecting to http://localhost:5001/api/v1

### Key Data Flow
1. **Dashboard**: Current "king" (highest win rate) and "villains" (win streaks)
2. **Stats**: Player statistics, commander stats, color distribution
3. **Player Detail**: Individual player analysis with commanders and color preferences

## Development Mode Features

### Backend Authentication Bypass
- `DEVELOPMENT_MODE = True` in `api.py` automatically sets group context
- No session/cookie requirements for API endpoints
- CORS configured for frontend development on different ports

### Frontend Authentication Bypass  
- Login components commented out in `AuthContext.tsx` and `App.tsx`
- Direct dashboard access without authentication flow
- Uses default group information

### Re-enabling Authentication
**Backend**: Set `DEVELOPMENT_MODE = False` in `api.py`
**Frontend**: Uncomment authentication code in AuthContext and App components

## Database Schema

### Core Tables
- **Groups**: Multi-tenant isolation (id, group_name, passkey)
- **Games**: Game metadata with group association (GameID, Date, NumPlayers, WinnerPlayerID, Turns, WinCon, group_id)
- **Players**: Per-game player data (PlayerID, GameID, PlayerName, CommanderName, TurnOrder, ColorIdentity, group_id)

### Key Relationships
- Group isolation: All data filtered by group_id
- Game-Player relationship: One game has multiple players
- Winner reference: Games.WinnerPlayerID → Players.PlayerID

## API Architecture

### Authentication Endpoints (/api/v1/auth)
- `POST /login` - Group passkey authentication
- `POST /logout` - Session cleanup
- `GET /status` - Authentication status

### Data Endpoints (/api/v1)
- `GET /dashboard` - Top players and win streaks
- `GET /stats` - Comprehensive statistics
- `GET /players/{name}` - Individual player details
- `POST /games` - Game creation
- `GET /commanders/suggestions` - Autocomplete
- `GET /health` - Health check

### Response Format
```json
{
  "success": true,
  "message": "Success message", 
  "data": { /* response data */ }
}
```

## Asset Management
- **Commander Images**: `/static/assets/commanders/` with kebab-case naming
- **Color Pips**: `/static/assets/mana-pips/` for WUBRG representation
- **URL Generation**: `to_kebab_case()` function ensures consistent filenames

## Code Patterns

### Backend
- All route handlers call `get_current_group_id()` and pass to query functions
- Database queries use group filtering by default when `group_id` provided
- Input sanitization via `sanitize_input()` prevents XSS
- Generic functions like `get_win_rate_stats()` reduce code duplication

### Frontend
- TypeScript interfaces in `src/types/index.ts` define all data structures
- Centralized API client in `src/services/api.ts` handles authentication
- Component composition with shared utilities in `src/constants/styles.ts`
- Error boundaries and loading states throughout

## Migration Status

The project is actively transitioning from Flask monolith to decoupled architecture. See `mtg-back/frontend-backend-decoupling-checklist.md` for detailed migration progress and remaining tasks.

### Completed
- Basic React frontend with TypeScript
- REST API endpoints with group isolation
- Development mode for easier development
- Core UI components and routing

### In Progress
- Full feature parity between old and new interfaces
- Production authentication flow
- Comprehensive testing strategy
- Deployment configuration