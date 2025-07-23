import sqlite3
import re
from collections import Counter
from typing import List, Dict, Optional, Tuple, Any

DB_PATH = "mtg.db"

class MTGDatabase:
    """Centralized database access with reusable query patterns"""
    
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
    
    def execute_query(self, sql: str, params: tuple = ()) -> List[Tuple]:
        """Execute a query and return all results"""
        with sqlite3.connect(self.db_path) as conn:
            cur = conn.cursor()
            cur.execute(sql, params)
            return cur.fetchall()
    
    def execute_single(self, sql: str, params: tuple = ()) -> Optional[Tuple]:
        """Execute a query and return single result"""
        results = self.execute_query(sql, params)
        return results[0] if results else None

# Global database instance
db = MTGDatabase()

# Base SQL patterns for reuse
WIN_RATE_SELECT = """
    COUNT(*) AS GamesPlayed,
    SUM(CASE WHEN g.WinnerPlayerID = p.PlayerID THEN 1 ELSE 0 END) AS Wins,
    ROUND(
        100.0 * SUM(CASE WHEN g.WinnerPlayerID = p.PlayerID THEN 1 ELSE 0 END) / COUNT(*),
        2
    ) AS WinRatePercent
"""

BASE_JOIN = """
FROM Players p
JOIN Games g ON p.GameID = g.GameID
"""

def get_win_rate_stats(group_by: str, where_clause: str = "", params: tuple = (), order_by: str = "WinRatePercent DESC") -> List[Dict[str, Any]]:
    """
    Generic function to get win rate statistics grouped by any field
    
    Args:
        group_by: SQL field to group by (e.g., 'p.PlayerName', 'p.CommanderName')
        where_clause: Optional WHERE clause (e.g., "WHERE p.PlayerName = ?")
        params: Parameters for the WHERE clause
        order_by: ORDER BY clause
    """
    sql = f"""
    SELECT 
        {group_by} AS GroupField,
        {WIN_RATE_SELECT}
    {BASE_JOIN}
    {where_clause}
    GROUP BY {group_by}
    ORDER BY {order_by}
    """
    
    results = db.execute_query(sql, params)
    return [
        {
            "name": row[0],
            "games_played": row[1], 
            "wins": row[2],
            "win_rate": row[3]
        }
        for row in results
    ]

def get_player_win_rates() -> List[Tuple]:
    """
    Get win rates for all players in legacy tuple format.
    
    Returns:
        List[Tuple]: List of tuples containing (player_name, games_played, wins, win_rate)
    """
    results = get_win_rate_stats("p.PlayerName")
    return [(r["name"], r["games_played"], r["wins"], r["win_rate"]) for r in results]

def get_player_win_rates_filtered() -> List[Tuple]:
    """
    Get win rates for players with at least 1 win (non-zero win rate).
    
    TEMPORARY FUNCTION: This filters out players with 0 wins to reduce clutter
    when there's limited data. Once more games are played, switch back to 
    get_player_win_rates() for complete player statistics.
    
    TO ENABLE: Change stats route in app.py to use this function
    TO DISABLE: Change stats route back to get_player_win_rates()
    
    Returns:
        List[Tuple]: List of tuples containing (player_name, games_played, wins, win_rate)
                    for players with wins > 0
    """
    results = get_win_rate_stats("p.PlayerName")
    return [
        (r["name"], r["games_played"], r["wins"], r["win_rate"])
        for r in results
        if r["win_rate"] != 0
    ]

def get_commander_stats() -> List[Dict[str, Any]]:
    """
    Get win rates for all commanders in dictionary format.
    
    Returns:
        List[Dict[str, Any]]: List of dictionaries containing commander stats
    """
    return get_win_rate_stats("p.CommanderName")

def get_commander_stats_filtered() -> List[Dict[str, Any]]:
    """
    Get win rates for all commanders in dictionary format. Filtered as to not return any with win rate = 0
    
    Returns:
        List[Dict[str, Any]]: List of dictionaries containing commander stats, no win rate of 0
    """
    results = get_win_rate_stats("p.CommanderName")
    return [
        r
        for r in results
        if r["win_rate"] != 0
    ]

def get_player_detail_stats(player_name: str) -> Optional[Dict[str, Any]]:
    """
    Get overall statistics for a specific player.
    
    Args:
        player_name: Name of the player to get stats for
        
    Returns:
        Optional[Dict[str, Any]]: Dictionary containing player stats or None if player not found
    """
    results = get_win_rate_stats("p.PlayerName", "WHERE p.PlayerName = ?", (player_name,))
    return results[0] if results else None

def get_player_commanders(player_name: str) -> List[Dict[str, Any]]:
    """
    Get commander statistics for a specific player.
    
    Args:
        player_name: Name of the player to get commander stats for
        
    Returns:
        List[Dict[str, Any]]: List of dictionaries containing commander stats
    """
    return get_win_rate_stats(
        "p.CommanderName", 
        "WHERE p.PlayerName = ?", 
        (player_name,),
        "GamesPlayed DESC"
    )

def get_color_stats(where_clause: str = "", params: tuple = ()) -> List[Tuple[str, float]]:
    """
    Generic function to get color identity statistics
    
    Args:
        where_clause: Optional WHERE clause to filter results
        params: Parameters for the WHERE clause
    """
    sql = f"""
        SELECT ColorIdentity
        FROM Players
        {where_clause}
    """
    
    rows = db.execute_query(sql, params)
    total_games = len(rows)
    
    if total_games == 0:
        return [
            {
                "color_name": color,
                "count": 0,
                "percentage": 0.0,
                "pip_url": f"/static/assets/mana-pips/pip-{color.lower()}.webp",
            }
            for color in ['W', 'U', 'B', 'R', 'G']
        ]

    color_counter = Counter()
    for (identity,) in rows:
        if identity:
            for letter in identity:
                color_counter[letter] += 1

    wubrg_order = ['W', 'U', 'B', 'R', 'G']
    return [
        {
            "color_name": color,
            "count": color_counter.get(color, 0),
            "percentage": round((color_counter.get(color, 0) / total_games) * 100, 2),
            "pip_url": f"/static/assets/mana-pips/pip-{color.lower()}.webp",
        }
        for color in wubrg_order
    ]

def get_overall_color_stats() -> List[Tuple[str, float]]:
    """
    Get color identity distribution across all games.
    
    Returns:
        List[Dict[str, Any]]: List of color statistics with counts and percentages
    """
    return get_color_stats()

def get_player_color_stats(player_name: str) -> List[Tuple[str, float]]:
    """
    Get color identity distribution for a specific player.
    
    Args:
        player_name: Name of the player to get color stats for
        
    Returns:
        List[Dict[str, Any]]: List of color statistics with counts and percentages
    """
    return get_color_stats("WHERE PlayerName = ?", (player_name,))

def get_game_history(where_clause: str = "", params: tuple = (), limit: int = None) -> List[Dict[str, Any]]:
    """
    Generic function to get game history with optional filtering
    
    Args:
        where_clause: Optional WHERE clause
        params: Parameters for the WHERE clause  
        limit: Optional limit on results
    """
    limit_clause = f"LIMIT {limit}" if limit else ""
    
    sql = f"""
        SELECT g.GameID, g.Date, g.WinnerPlayerID, p.PlayerName, p.CommanderName
        FROM Games g
        JOIN Players p ON p.PlayerID = g.WinnerPlayerID
        {where_clause}
        ORDER BY g.Date ASC, g.GameID ASC
        {limit_clause}
    """
    
    results = db.execute_query(sql, params)
    return [
        {
            "game_id": row[0],
            "date": row[1], 
            "winner_id": row[2],
            "winner_name": row[3],
            "commander_name": row[4]
        }
        for row in results
    ]

def calculate_win_streaks(games: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """
    Calculate win streaks from a chronologically ordered list of games.
    
    Args:
        games: List of game dictionaries with winner_name and commander_name keys
        
    Returns:
        Dict[str, Dict[str, Any]]: Dictionary mapping player names to their streak info
    """
    streaks = {}
    current_player = None
    current_streak = 0
    current_commanders = []
    
    for game in games:
        winner_name = game["winner_name"]
        commander_name = game["commander_name"]
        
        if winner_name == current_player:
            current_streak += 1
            current_commanders.append(commander_name)
        else:
            current_player = winner_name
            current_streak = 1
            current_commanders = [commander_name]
        
        # Update or create streak record
        if winner_name not in streaks or current_streak > streaks[winner_name]["streak_count"]:
            streaks[winner_name] = {
                "streak_count": current_streak,
                "commanders": list(dict.fromkeys(current_commanders))  # dedupe
            }
    
    return streaks

def get_longest_win_streak() -> List[Dict[str, Any]]:
    """
    Get all players who are tied for the longest win streak.
    
    Returns:
        List[Dict[str, Any]]: List of players with their streak count and commanders used
    """
    games = get_game_history()
    streaks = calculate_win_streaks(games)
    
    if not streaks:
        return []
    
    max_streak = max(s["streak_count"] for s in streaks.values())
    
    return [
        {
            "player_name": player,
            "streak_count": data["streak_count"],
            "commanders": [
                {
                    "name": cmd,
                    "img": f"/static/assets/commanders/{to_kebab_case(cmd)}.jpg"
                }
                for cmd in data["commanders"]
            ]
        }
        for player, data in streaks.items()
        if data["streak_count"] == max_streak
    ]

def get_top_win_rate(min_games: int = 5) -> Optional[Dict[str, Any]]:
    """
    Get the player with the highest win rate (legacy function).
    
    Args:
        min_games: Minimum number of games played to qualify
        
    Returns:
        Optional[Dict[str, Any]]: Player with highest win rate or None if no players qualify
    """
    results = get_top_performers("win_rate", min_games, 1)
    return results[0] if results else None

def to_kebab_case(input_data) -> str:
    """
    Convert a string or dict with 'name' key to kebab-case format.
    Used for generating consistent filenames from commander names.
    
    Args:
        input_data: String or dictionary with 'name' key
        
    Returns:
        str: Kebab-case formatted string
        
    Raises:
        ValueError: If input is not a string or dict with 'name' key
    """
    # Handle different input types
    if isinstance(input_data, str):
        name = input_data
    elif isinstance(input_data, dict) and 'name' in input_data:
        name = input_data['name']
    else:
        raise ValueError(f"Invalid input type. Expected str or dict with 'name' key, got {type(input_data)}")
    
    # Convert to kebab-case
    name = name.lower()
    name = re.sub(r'[^a-z0-9\s-]', '', name)
    name = name.strip()
    name = re.sub(r'\s+', '-', name)
    return name

def get_recent_commanders(player_name: str, limit: int = 3) -> List[Dict[str, str]]:
    """
    Get the most recently used unique commanders for a player.
    
    Args:
        player_name: Name of the player
        limit: Maximum number of commanders to return
        
    Returns:
        List[Dict[str, str]]: List of commander dictionaries with name and img keys
    """
    sql = """
        SELECT DISTINCT p.CommanderName
        FROM Players p
        JOIN Games g ON p.GameID = g.GameID
        WHERE p.PlayerName = ?
        ORDER BY g.Date DESC, g.GameID DESC
        LIMIT ?
    """
    
    results = db.execute_query(sql, (player_name, limit * 2))
    
    commanders = []
    seen = set()
    
    for (commander_name,) in results:
        if commander_name and commander_name not in seen:
            seen.add(commander_name)
            commanders.append({
                "name": commander_name,
                "img": f"/static/assets/commanders/{to_kebab_case(commander_name)}.jpg"
            })
            if len(commanders) == limit:
                break
    
    return commanders

# Advanced query functions, currently unused/untested lol
def get_commander_meta_analysis() -> Dict[str, Any]:
    """
    Get comprehensive meta-analysis of commander usage and performance.
    
    Returns:
        Dict[str, Any]: Dictionary containing total commanders, most played, highest winrate, and full list
    """
    commander_stats = get_win_rate_stats("p.CommanderName")
    
    return {
        "total_commanders": len(commander_stats),
        "most_played": max(commander_stats, key=lambda x: x["games_played"]) if commander_stats else None,
        "highest_winrate": max(commander_stats, key=lambda x: x["win_rate"]) if commander_stats else None,
        "commanders": commander_stats
    }

def get_player_head_to_head(player1: str, player2: str) -> Dict[str, Any]:
    """
    Get head-to-head statistics between two specific players.
    
    Args:
        player1: Name of the first player
        player2: Name of the second player
        
    Returns:
        Dict[str, Any]: Dictionary containing games played, wins for each player, and game details
    """
    sql = """
        SELECT 
            g.GameID,
            g.WinnerPlayerID,
            p1.PlayerName as Player1Name,
            p2.PlayerName as Player2Name,
            p1.CommanderName as Player1Commander,
            p2.CommanderName as Player2Commander
        FROM Games g
        JOIN Players p1 ON p1.GameID = g.GameID AND p1.PlayerName = ?
        JOIN Players p2 ON p2.GameID = g.GameID AND p2.PlayerName = ?
        ORDER BY g.Date DESC
    """
    
    results = db.execute_query(sql, (player1, player2))
    
    if not results:
        return {"games_played": 0, "player1_wins": 0, "player2_wins": 0}
    
    player1_wins = sum(1 for r in results if r[1] and any(
        p[0] == player1 for p in db.execute_query(
            "SELECT PlayerName FROM Players WHERE PlayerID = ?", (r[1],)
        )
    ))
    
    return {
        "games_played": len(results),
        "player1_wins": player1_wins,
        "player2_wins": len(results) - player1_wins,
        "games": results
    }

def get_top_performers(metric: str = "win_rate", min_games: int = 5, limit: int = 1) -> List[Dict[str, Any]]:
    """
    Get top performing players by various metrics
    
    Args:
        metric: 'win_rate', 'games_played', or 'wins'
        min_games: Minimum games played to qualify
        limit: Number of results to return
    """
    results = get_win_rate_stats("p.PlayerName")
    filtered = [r for r in results if r["games_played"] >= min_games]
    
    if not filtered:
        return []
    
    # Sort by the specified metric
    sort_key = {
        "win_rate": lambda x: x["win_rate"],
        "games_played": lambda x: x["games_played"], 
        "wins": lambda x: x["wins"]
    }.get(metric, lambda x: x["win_rate"])
    
    sorted_results = sorted(filtered, key=sort_key, reverse=True)
    return sorted_results[:limit]