import sqlite3
import re
from collections import Counter

DB_PATH = "mtg.db"

def get_player_win_rates():
    sql = """
    SELECT 
        p.PlayerName,
        COUNT(*) AS GamesPlayed,
        SUM(CASE WHEN g.WinnerPlayerID = p.PlayerID THEN 1 ELSE 0 END) AS Wins,
        ROUND(
            100.0 * SUM(CASE WHEN g.WinnerPlayerID = p.PlayerID THEN 1 ELSE 0 END) / COUNT(*),
            2
        ) AS WinRatePercent
    FROM Players p
    JOIN Games g ON p.GameID = g.GameID
    GROUP BY p.PlayerName
    ORDER BY WinRatePercent DESC;
    """
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.cursor()
        cur.execute(sql)
        return cur.fetchall()

def get_commander_stats():
    sql = """
    SELECT 
        CommanderName,
        COUNT(*) as GamesPlayed,
        SUM(CASE WHEN g.WinnerPlayerID = p.PlayerID THEN 1 ELSE 0 END) AS Wins,
        ROUND(
            100.0 * SUM(CASE WHEN g.WinnerPlayerID = p.PlayerID THEN 1 ELSE 0 END) / COUNT(*),
            2
        ) AS WinRatePercent
    FROM Players p
    JOIN Games g ON p.GameID = g.GameID
    GROUP BY CommanderName
    ORDER BY WinRatePercent DESC;
    """
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.cursor()
        cur.execute(sql)
        return cur.fetchall()

def get_player_detail_stats(player_name):
    """
    Returns (GamesPlayed, Wins, WinRatePercent) for a given player.
    """
    sql = """
    SELECT
        COUNT(*) AS GamesPlayed,
        SUM(CASE WHEN g.WinnerPlayerID = p.PlayerID THEN 1 ELSE 0 END) AS Wins,
        ROUND(
            100.0 * SUM(CASE WHEN g.WinnerPlayerID = p.PlayerID THEN 1 ELSE 0 END) / COUNT(*),
            2
        ) AS WinRatePercent
    FROM Players p
    JOIN Games g ON p.GameID = g.GameID
    WHERE p.PlayerName = ?;
    """
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.cursor()
        cur.execute(sql, (player_name,))
        row = cur.fetchone()
        if row:
            return {
                "games_played": row[0],
                "wins": row[1],
                "win_rate": row[2]
            }
        return None

def get_player_commanders(player_name):
    """
    Returns a list of (CommanderName, GamesPlayed, Wins, WinRatePercent) for a given player.
    """
    sql = """
    SELECT
        p.CommanderName,
        COUNT(*) AS GamesPlayed,
        SUM(CASE WHEN g.WinnerPlayerID = p.PlayerID THEN 1 ELSE 0 END) AS Wins,
        ROUND(
            100.0 * SUM(CASE WHEN g.WinnerPlayerID = p.PlayerID THEN 1 ELSE 0 END) / COUNT(*),
            2
        ) AS WinRatePercent
    FROM Players p
    JOIN Games g ON p.GameID = g.GameID
    WHERE p.PlayerName = ?
    GROUP BY p.CommanderName
    ORDER BY GamesPlayed DESC;
    """
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.cursor()
        cur.execute(sql, (player_name,))
        rows = cur.fetchall()
        # Return a list of dictionaries for easy Jinja templating
        return [
            {
                "commander_name": r[0],
                "games_played": r[1],
                "wins": r[2],
                "win_rate": r[3]
            }
            for r in rows
        ]

def get_overall_color_stats():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT ColorIdentity
        FROM Players
    """)
    rows = c.fetchall()
    conn.close()

    total_games = len(rows)
    if total_games == 0:
        return []

    color_counter = Counter()

    for (identity,) in rows:
        if identity:
            for letter in identity:
                color_counter[letter] += 1

    # Convert to percentage
    color_percentages = {
        color: round((count / total_games) * 100, 2)
        for color, count in color_counter.items()
    }

    # Define fixed WUBRG order
    wubrg_order = ['W', 'U', 'B', 'R', 'G']

    # Build sorted list in WUBRG order, even if some are missing
    sorted_stats = [(color, color_percentages.get(color, 0.0)) for color in wubrg_order]

    return sorted_stats

def get_player_color_stats(player_name):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("""
        SELECT ColorIdentity
        FROM Players
        WHERE PlayerName = ?
    """, (player_name,))
    rows = c.fetchall()
    conn.close()

    total_games = len(rows)
    if total_games == 0:
        return []  # avoid division by zero

    # rows is a list of tuples like [('WU',), ('B',), ('BR',)]
    color_counter = Counter()

    for (identity,) in rows:
        if identity:  # skip nulls
            for letter in identity:
                color_counter[letter] += 1

    # Convert to percentage
    color_percentages = {
        color: round((count / total_games) * 100, 2)
        for color, count in color_counter.items()
    }

    wubrg_order = ['W', 'U', 'B', 'R', 'G']
    # Build sorted list in WUBRG order, even if some are missing
    sorted_stats = [(color, color_percentages.get(color, 0.0)) for color in wubrg_order]
    return sorted_stats

def get_longest_win_streak():
    """
    Returns a list of dicts:
    [
      {
        "player_name": "Alice",
        "streak_count": 4,
        "commanders": ["Atraxa, Praetors' Voice", "Chulane, Teller of Tales", ...]
      },
      ...
    ]
    for all players who share the longest all-time win streak.
    """
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.cursor()
        cur.execute("""
            SELECT g.GameID, g.Date, g.WinnerPlayerID, p.PlayerName, p.CommanderName
            FROM Games g
            JOIN Players p ON p.PlayerID = g.WinnerPlayerID
            ORDER BY g.Date ASC, g.GameID ASC
        """)
        rows = cur.fetchall()

    longest_streak = 0
    streaks = []  # final list
    current_player = None
    current_streak = 0
    current_commanders = []

    # temporary store to map each max player to their commander list
    temp_map = {}

    for (_, _, winner_id, winner_name, commander_name) in rows:
        if winner_name == current_player:
            current_streak += 1
            current_commanders.append(commander_name)
        else:
            current_player = winner_name
            current_streak = 1
            current_commanders = [commander_name]

        if current_streak > longest_streak:
            longest_streak = current_streak
            temp_map = {winner_name: list(current_commanders)}  # reset
        elif current_streak == longest_streak:
            temp_map[winner_name] = list(current_commanders)

    # build streaks list from temp_map
    streaks = [
        {
            "player_name": name,
            "streak_count": longest_streak,
            "commanders": list(dict.fromkeys(cmds))  # dedupe while preserving order
        }
        for name, cmds in temp_map.items()
    ]

    return streaks



def get_top_win_rate(min_games=5):
    """
    Returns (PlayerName, WinRatePercent, GamesPlayed) for the highest win rate player
    with at least `min_games` played.
    """
    rows = get_player_win_rates()
    # rows = [(PlayerName, GamesPlayed, Wins, WinRatePercent), ...]
    filtered = [r for r in rows if r[1] >= min_games]
    if not filtered:
        return None
    # Already sorted by WinRatePercent DESC in query
    top = filtered[0]
    return {
        "player_name": top[0],
        "win_rate": top[3],
        "games_played": top[1]
    }

def to_kebab_case(name: str) -> str:
    # mirror your JS logic in Python
    name = name.lower()
    name = re.sub(r'[^a-z0-9\s]', '', name)  # remove commas, apostrophes, etc.
    name = name.strip()
    name = re.sub(r'\s+', '-', name)  # replace spaces with hyphens
    return name

def get_recent_commanders(player_name, limit=3):
    """
    Returns a list of up to `limit` commander image URLs for the given player,
    based on their most recent games.
    """
    with sqlite3.connect(DB_PATH) as conn:
        cur = conn.cursor()
        # Get recent games for this player
        cur.execute("""
            SELECT p.CommanderName
            FROM Players p
            JOIN Games g ON p.GameID = g.GameID
            WHERE p.PlayerName = ?
            ORDER BY g.Date DESC, g.GameID DESC
            LIMIT 20;  -- grab some recent games
        """, (player_name,))
        rows = cur.fetchall()

    commanders = []
    seen = set()
    for (commander_name,) in rows:
        if commander_name and commander_name not in seen:
            seen.add(commander_name)
            commanders.append(f"/static/assets/commanders/{to_kebab_case(commander_name)}.jpg")
            if len(commanders) == limit:
                break

    return commanders
