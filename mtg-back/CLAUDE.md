# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MTG-Journal is a Flask-based web application for tracking Magic: The Gathering multiplayer game statistics with group-based isolation. Multiple groups can use the same application instance, with each group having their own isolated data accessed via unique passkeys.

## Collaboration Guidelines
- **Challenge and question**: Don't immediately agree or proceed with requests that seem suboptimal, unclear, or potentially problematic
- **Push back constructively**: If a proposed approach has issues, suggest better alternatives with clear reasoning
- **Think critically**: Consider edge cases, performance implications, maintainability, and best practices before implementing
- **Seek clarification**: Ask follow-up questions when requirements are ambiguous or could be interpreted multiple ways
- **Propose improvements**: Suggest better patterns, more robust solutions, or cleaner implementations when appropriate
- **Be a thoughtful collaborator**: Act as a good teammate who helps improve the overall quality and direction of the project

## Development Commands

### Running the Application
```bash
# Environment variables are set in .flaskenv
flask run

# Alternative using development runner
python run_dev.py
```

### Testing and Validation
```bash
# Health check - verify API is running
curl http://localhost:5000/api/v1/health

# Test dashboard endpoint
curl http://localhost:5000/api/v1/dashboard

# Test statistics endpoint
curl http://localhost:5000/api/v1/stats
```

### Environment Configuration
- `SECRET_KEY`: Flask session secret (defaults to 'your-secret-key')
- `FLASK_APP`: Set to 'app.py' in `.flaskenv`
- `FLASK_ENV`: Set to 'development' in `.flaskenv`
- Application uses `.flaskenv` for Flask configuration

### Dependencies
- Python with pip
- Flask: `pip install flask`
- Flask-CORS (optional): `pip install flask-cors` - recommended for development
- SQLite3 (comes with Python)

## Architecture

### Group-Based Multi-Tenancy
The application implements group-based data isolation where each group operates as an independent instance:
- Groups authenticate via unique passkeys stored in the `Groups` table
- All game data (Games/Players) is associated with a `group_id`
- Session management stores current group context (`group_id`, `group_name`)
- All queries automatically filter by the logged-in group's ID

### Database Schema
- **Groups table**: Group management (id, group_name, passkey)
- **Games table**: Game metadata with group association (GameID, Date, NumPlayers, WinnerPlayerID, Turns, WinCon, group_id)
- **Players table**: Per-game player data with group association (PlayerID, GameID, PlayerName, CommanderName, TurnOrder, ColorIdentity, group_id)
- Foreign key relationships: Games.WinnerPlayerID → Players.PlayerID, Players.GameID → Games.GameID

### Dual Interface Architecture
The application provides both traditional web interface and REST API:

#### Web Interface (app.py)
- Traditional Flask routes with Jinja2 templates
- Session-based authentication with `@login_required` decorator
- Form-based game entry with CSV upload support
- Server-side rendering with group-filtered data

#### REST API (api.py)
- RESTful endpoints under `/api/v1` prefix
- JSON request/response format with consistent error handling
- Development mode with authentication bypass (`DEVELOPMENT_MODE = True`)
- CORS support for frontend integration

### Authentication & Session Management
- `@login_required` decorator enforces authentication and group context
- `@api_login_required` decorator for API endpoints with development bypass
- `get_current_group_id()` helper retrieves active group from session
- Login system authenticates against Groups table using `get_group_by_passkey()`
- Logout clears all session data (logged_in, group_id, group_name)

### Query Architecture
- `MTGDatabase` class provides centralized database access with `execute_query()` and `execute_single()` methods
- `get_win_rate_stats()` is the core generic function supporting group filtering via optional `group_id` parameter
- All query functions accept `group_id` parameter for data isolation
- `get_group_filtered_base_join()` generates group-aware SQL joins
- Game insertion uses `insert_game_with_group()` and `insert_player_with_game()` to maintain group associations

### Code Structure
- `app.py`: Flask routes with group-aware session management and web interface
- `api.py`: REST API blueprint with JSON endpoints and development mode features
- `run_dev.py`: Development server runner with enhanced configuration
- `queries.py`: Database layer with group filtering support throughout
- `templates/`: Jinja2 templates with group context display
  - `base.html.j2`: Shows current group name in navigation
  - `login.html.j2`: Group passkey authentication
  - Page templates automatically receive group-filtered data
- `static/`: CSS, JavaScript, and assets
  - `assets/commanders/`: Commander images (kebab-case filenames via `to_kebab_case()`)
  - `assets/mana-pips/`: Color identity pip images
  - `js/`: Frontend JavaScript for form interactions and modals

### Development Mode Features
- **API Authentication Bypass**: `DEVELOPMENT_MODE = True` in `api.py` automatically sets group context
- **CORS Configuration**: Permissive CORS settings allow frontend development on different ports
- **Error Handling**: Comprehensive error responses with consistent JSON format and error codes
- **Session Management**: Automatic session setup for development convenience

### Key Patterns
- All route handlers call `get_current_group_id()` and pass to query functions
- Database queries use group filtering by default when `group_id` is provided
- Color statistics and win rate calculations respect group boundaries
- Commander asset URLs use kebab-case conversion for consistent naming
- Templates receive pre-filtered data, no additional group logic needed
- Input sanitization using `sanitize_input()` to prevent XSS and clean data
- Generic query functions like `get_win_rate_stats()` reduce code duplication

### Route Structure

#### Web Routes (app.py)
- `/login`: Group authentication via passkey
- `/logout`: Session cleanup
- `/`: Homepage with group-specific top players and win streaks
- `/add-game-form`: Game entry form
- `/add-game`: POST endpoint with automatic group association
- `/upload-csv`: CSV batch game import with validation
- `/stats`: Group-specific statistics page
- `/player/<player_name>`: Individual player details within group context
- `/api/commander-suggestions`: Autocomplete endpoint for commander names

#### API Routes (api.py)
- `/api/v1/auth/login`: JSON authentication
- `/api/v1/auth/logout`: JSON logout
- `/api/v1/auth/status`: Authentication status check
- `/api/v1/dashboard`: Dashboard data with top players and win streaks
- `/api/v1/stats`: Comprehensive group statistics
- `/api/v1/players/{player_name}`: Individual player details
- `/api/v1/games`: Game creation endpoint
- `/api/v1/commanders/suggestions`: Commander autocomplete
- `/api/v1/health`: Health check endpoint

### Error Handling
- Consistent error response format across API endpoints
- Comprehensive error codes for different failure scenarios
- Input validation with descriptive error messages
- Database transaction safety with proper connection management
- CSV import error collection and reporting

### Asset Management
- Commander images stored in `/static/assets/commanders/` with kebab-case naming
- Color pip images in `/static/assets/mana-pips/` for WUBRG representation
- `to_kebab_case()` function ensures consistent filename generation
- Asset URLs automatically generated in templates and API responses