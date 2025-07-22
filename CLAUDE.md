# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MTG-Journal is a Flask-based web application for tracking Magic: The Gathering multiplayer game statistics. Players log their games including commanders used, winners, and game details. The app provides statistics, win rates, player comparisons, and streak tracking.

## Development Commands

### Running the Application
```bash
# Set environment variables (PowerShell example from README)
$env:FLASK_APP = "app.py"
$env:FLASK_ENV = "development" 
flask run

# Alternative (Linux/Mac)
export FLASK_APP=app.py
export FLASK_ENV=development
flask run
```

### Dependencies
- Python with pip
- Flask: `pip install flask`
- SQLite3 (comes with Python)

## Architecture

### Database Schema
- **Games table**: Stores game metadata (GameID, Date, NumPlayers, WinnerPlayerID, Turns, WinCon)
- **Players table**: Stores per-game player data (PlayerID, GameID, PlayerName, CommanderName, TurnOrder, ColorIdentity)
- Foreign key relationships: Games.WinnerPlayerID → Players.PlayerID, Players.GameID → Games.GameID

### Code Structure
- `app.py`: Flask routes and main application logic
- `queries.py`: Database access layer with MTGDatabase class and query functions
- `templates/`: Jinja2 HTML templates
  - `base.html.j2`: Base template with shared layout
  - `_macros.html.j2`: Reusable template components (color distribution charts)
  - Page templates: `index.html.j2`, `add_game.html.j2`, `stats.html.j2`, `player_detail.html.j2`
- `static/`: CSS, JavaScript, and assets
  - `assets/commanders/`: Commander images (kebab-case filenames)
  - `assets/mana-pips/`: Color pip images
  - `js/`: Form logic and modal interactions

### Key Patterns
- Database queries use the centralized `MTGDatabase` class with `execute_query()` and `execute_single()` methods
- Win rate calculations use the `get_win_rate_stats()` generic function with flexible grouping
- Color statistics use `get_color_stats()` with optional filtering
- Commander names are converted to kebab-case for asset URLs using `to_kebab_case()`
- Templates use Jinja2 macros for repeated UI elements

### Route Structure
- `/`: Homepage showing top players and win streaks
- `/add-game-form`: Form to add new games
- `/add-game`: POST endpoint for game submission
- `/stats`: Overall statistics page
- `/player/<player_name>`: Individual player detail pages