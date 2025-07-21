### File Structure
```text
MTG-Journal/
│
├─ app.py
├─ queries.py
├─ mtg.db
├─ architecture.md
├─ templates/
│   ├─ index.html
│   ├─ add_game.html
│   ├─ player_detail.html
│   └─ stats.html
└─ static/
    ├─ styles.css
    ├─ assets/
    │  └─ <commander>.jpg
    └─ js/
       ├─ stats.js
       └─ add_game.js
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
| CommanderName   | TEXT    | Name of the commander played by this player (if applicable). |
| TurnOrder       | INTEGER | The player’s turn order in the game (e.g., 1 for first, 2 for second, etc.). |
| ColorIdentity       | TEXT | The player's commander color combination, using WUBRG |


### Relationships  
- **One‑to‑many:** Each game in Games can have multiple related entries in Players (via GameID).  
- **Winner reference:** The WinnerPlayerID in Games references a specific PlayerID in Players to indicate who won.

### Notes  
- Both primary keys (GameID and PlayerID) are INTEGER PRIMARY KEY and automatically increment in SQLite.  
- Foreign key constraints ensure referential integrity:
  - Deleting a Player that is referenced as a WinnerPlayerID will fail unless the winner reference is cleared.
  - Deleting a Game requires first deleting or reassigning its Players due to the foreign key from Players.GameID.
