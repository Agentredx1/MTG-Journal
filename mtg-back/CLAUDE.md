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
```

### Environment Configuration
- `SECRET_KEY`: Flask session secret (defaults to 'your-secret-key')
- Application uses `.flaskenv` for Flask configuration

### Dependencies
- Python with pip
- Flask: `pip install flask`
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

### Authentication & Session Management
- `@login_required` decorator enforces authentication and group context
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
- `app.py`: Flask routes with group-aware session management
- `queries.py`: Database layer with group filtering support throughout
- `templates/`: Jinja2 templates with group context display
  - `base.html.j2`: Shows current group name in navigation
  - `login.html.j2`: Group passkey authentication
  - Page templates automatically receive group-filtered data
- `static/`: CSS, JavaScript, and assets
  - `assets/commanders/`: Commander images (kebab-case filenames via `to_kebab_case()`)

### Key Patterns
- All route handlers call `get_current_group_id()` and pass to query functions
- Database queries use group filtering by default when `group_id` is provided
- Color statistics and win rate calculations respect group boundaries
- Commander asset URLs use kebab-case conversion for consistent naming
- Templates receive pre-filtered data, no additional group logic needed

### Route Structure
- `/login`: Group authentication via passkey
- `/logout`: Session cleanup
- `/`: Homepage with group-specific top players and win streaks
- `/add-game-form`: Game entry form
- `/add-game`: POST endpoint with automatic group association
- `/stats`: Group-specific statistics page
- `/player/<player_name>`: Individual player details within group context