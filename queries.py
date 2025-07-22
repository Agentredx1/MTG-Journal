import sqlite3
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