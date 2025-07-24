## MTG-Journal

A Flask-based web application for tracking Magic: The Gathering multiplayer game statistics with group-based isolation. Multiple groups can use the same application instance, with each group having their own isolated data accessed via unique passkeys.

### Requirements

- Python 3.x with pip
- Flask: `pip install flask`
- SQLite3 (included with Python)

### Setup & Running

1. **Environment Setup**: The application uses `.flaskenv` for configuration
2. **Run the application**:
   ```bash
   flask run
   ```

### Group Management

The application supports multiple isolated groups:
- Each group has a unique passkey for access
- Groups see only their own game data and statistics
- Group information is displayed in the navigation when logged in
### Application Features

- **Group Authentication**: Login with group-specific passkeys
- **Game Tracking**: Record MTG games with players, commanders, and outcomes
- **Statistics**: Win rates, player comparisons, and commander performance
- **Win Streak Tracking**: Identify players on winning streaks
- **Color Analysis**: Commander color identity distribution
- **Player Profiles**: Individual player statistics and commander history

### File Structure
```text
MTG-Journal/
│
├─ app.py                     - Flask routes and group-aware session management
├─ queries.py                 - Database layer with group filtering support
├─ mtg.db                     - SQLite database
├─ .flaskenv                  - Flask environment configuration
├─ templates/
│   ├─ base.html.j2           - Base template with group context display
│   ├─ login.html.j2          - Group passkey authentication
│   ├─ index.html.j2          - Homepage with top players and win streaks
│   ├─ add_game.html.j2       - Game entry form
│   ├─ stats.html.j2          - Group-specific statistics page
│   ├─ player_detail.html.j2  - Individual player details
│   └─ _macros.html.j2        - Reusable template components
└─ static/
    ├─ styles.css             - Application styling
    ├─ assets/                
    │  ├─ commanders/          - Commander images (kebab-case filenames)
    │  └─ mana-pips/          - Color pip images
    └─ js/
       ├─ stats.js            - Modal interactions for commander display
       └─ add_game.js         - Dynamic form logic
```

## Database Schema

The application uses a group-based multi-tenant architecture where all game data is isolated by group.

### Groups Table
Manages group authentication and isolation.

| Column     | Type                | Description                                                      |
|------------|---------------------|------------------------------------------------------------------|
| id         | INTEGER PRIMARY KEY | Unique identifier for each group (auto-incremented)             |
| group_name | TEXT                | Descriptive name for the group (e.g., "Wednesday Night Pod")    |
| passkey    | TEXT                | Passkey used to authenticate and access this group's data       |

### Games Table  
Stores game metadata with group association.

| Column          | Type                | Description                                                      |
|-----------------|---------------------|------------------------------------------------------------------|
| GameID          | INTEGER PRIMARY KEY | Unique identifier for each game (auto-incremented)              |
| Date            | TEXT                | Date the game was played (ISO string, e.g. YYYY-MM-DD)         |
| NumPlayers      | INTEGER             | Total number of players in the game                             |
| WinnerPlayerID  | INTEGER             | Foreign key referencing Players.PlayerID of the winner         |
| Turns           | INTEGER             | Total number of turns played                                    |
| WinCon          | TEXT                | Description of how the win was achieved                         |
| group_id        | INTEGER             | Foreign key referencing Groups.id for data isolation           |

### Players Table  
Stores per-game player data with group association.

| Column          | Type                | Description                                                      |
|-----------------|---------------------|------------------------------------------------------------------|
| PlayerID        | INTEGER PRIMARY KEY | Unique identifier for each player entry (auto-incremented)      |
| GameID          | INTEGER             | Foreign key referencing Games.GameID                            |
| PlayerName      | TEXT                | Name of the player                                              |
| CommanderName   | TEXT                | Name of the commander played by this player                     |
| TurnOrder       | INTEGER             | Player's turn order in the game (1 for first, 2 for second, etc.) |
| ColorIdentity   | TEXT                | Commander color combination using WUBRG notation                |
| group_id        | INTEGER             | Foreign key referencing Groups.id for data isolation           |


### Relationships  
- **Group isolation:** All Games and Players belong to a specific Group via group_id
- **One-to-many:** Each Game can have multiple Players (via GameID)  
- **Winner reference:** WinnerPlayerID in Games references a specific PlayerID to indicate who won
- **Data isolation:** All queries automatically filter by the logged-in group's ID

### Group Management
- Each group operates as an independent instance with isolated data
- Groups authenticate using unique passkeys stored in the Groups table
- All game data (Games/Players) is associated with the group that created it
- Users can only see and interact with data from their authenticated group
