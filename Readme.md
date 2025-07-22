### Requirements

sqlite3 - https://www.sqlite.org/download.html  
python & pip  
flask - pip install flask

### To run:
Navigate to repo in CLI, I'm using powershell. Setup Gulp maybe?

```PS
$env:FLASK_APP = "app.py"
$env:FLASK_ENV = "development"
flask run
```
### File Structure
```text
MTG-Journal/
│
├─ app.py                     - routes
├─ queries.py                 - all sql queries
├─ mtg.db
├─ architecture.md
├─ templates/
│   ├─ index.html.j2          - idk a home page maybe? Show whos on a win streak? Currently blank
│   ├─ add_game.html.j2       - form to add game data. Definitely need to sanitize this and setup approval process before going live
│   ├─ base.html.j2           - jinja2 template used by everything else
│   ├─ _macro.html.j2         - macros for reusable sections, currently just the color distribution chart
│   ├─ player_detail.html.j2  - dynamic page that loads info for selected player linked in stats.html.j2
│   └─ stats.html.j2          - overview, could also be home page. the most exciting page imo
└─ static/
    ├─ styles.css             - a mess
    ├─ assets/                
    │  ├─ commanders/
    │  │  └─ <commander>.jpg  - names follow lord-of-the-undead, this format plays well when linking to external sites.
    │  └─ mana-pips/
    │     └─ pip-<wubrg>.jpg  - only used by the color_table macro currently
    └─ js/
       ├─ stats.js            - event listeners for the 'modal' or card display when looking at commanders
       └─ add_game.js         - form logic, adding the "Player info" elements,
```

## Database Schema

### Games Table  
Stores one row per completed game.

| Column          | Type    | Description                                                                 |
|-----------------|---------|-----------------------------------------------------------------------------|
| GameID          | INTEGER PRIMARY KEY | Unique identifier for each game (auto‑incremented). |
| Date            | TEXT    | Date the game was played (ISO string, e.g. YYYY‑MM‑DD). |
| NumPlayers      | INTEGER | Total number of players in the game. |
| WinnerPlayerID  | INTEGER | Foreign key referencing Players.PlayerID of the winner. Can be NULL if not set. |
| Turns           | INTEGER | Total number of turns played. |
| WinCon          | TEXT    | A short description of how the win was achieved. |

### Players Table  
Stores one row per player participating in a game.

| Column          | Type    | Description                                                                 |
|-----------------|---------|-----------------------------------------------------------------------------|
| PlayerID        | INTEGER PRIMARY KEY | Unique identifier for each player entry (auto‑incremented). |
| GameID          | INTEGER | Foreign key referencing Games.GameID to link this player to a specific game. |
| PlayerName      | TEXT    | Name of the player. |
| CommanderName   | TEXT    | Name of the commander played by this player |
| TurnOrder       | INTEGER | The player's turn order in the game (e.g., 1 for first, 2 for second, etc.). |
| ColorIdentity       | TEXT | The player's commander color combination, using WUBRG |


### Relationships  
- **One‑to‑many:** Each game in Games can have multiple related entries in Players (via GameID).  
- **Winner reference:** The WinnerPlayerID in Games references a specific PlayerID in Players to indicate who won.

### Notes  
- Both primary keys (GameID and PlayerID) are INTEGER PRIMARY KEY and automatically increment in SQLite.  
- Foreign key constraints ensure referential integrity:
  - Deleting a Player that is referenced as a WinnerPlayerID will fail unless the winner reference is cleared.
  - Deleting a Game requires first deleting or reassigning its Players due to the foreign key from Players.GameID.
