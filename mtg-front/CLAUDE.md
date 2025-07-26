# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite and HMR
- `npm run build` - Build for production (runs TypeScript compiler and Vite build)
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

## Project Architecture

This is a React + TypeScript + Vite frontend for an MTG (Magic: The Gathering) journal application that tracks Commander games and statistics.

### Key Architecture Patterns

**Development Mode**: Authentication is disabled for development. The app uses a default group ID (1) and bypasses login flows. Original authentication code remains commented out in `AuthContext.tsx` and `App.tsx`.

**State Management**: Uses React Context (`AuthContext`) for group information and local useState for navigation between pages.

**Navigation**: Client-side routing implemented with conditional rendering in `App.tsx`. Three main pages: Dashboard, Stats, and Player Detail.

**API Integration**: Centralized API service (`src/services/api.ts`) handles all backend communication to `http://localhost:5001/api/v1`.

### Core Data Flow

1. **Dashboard**: Shows current "king" (highest win rate player) and "villains" (players on win streaks)
2. **Stats**: Displays player statistics, commander stats, and color distribution tables
3. **Player Detail**: Detailed view for individual players with their commanders and color preferences

### Key Components

- `Dashboard` - Main landing page with key metrics
- `Stats` - Statistics tables with player click navigation
- `PlayerDetail` - Individual player analysis page
- `Navigation` - Top navigation bar (hidden on player detail page)
- `CommanderModal` - Modal for commander information
- `CommanderTable`/`ColorTable` - Reusable data display components

### Type Safety

Comprehensive TypeScript interfaces in `src/types/index.ts` define all data structures for API responses, component props, and form data. Includes interfaces for commanders, players, games, colors, and statistics.

### Styling

Uses CSS-in-JS with inline styles and CSS modules. Global styles in `App.css` and `index.css`.

## API Backend

Expects a Flask backend running on localhost:5001 with endpoints for:
- `/api/v1/dashboard` - Dashboard data
- `/api/v1/stats` - Statistics data  
- `/api/v1/players/{name}` - Player details
- `/api/v1/games` - Game creation
- `/api/v1/commanders/suggestions` - Commander autocomplete