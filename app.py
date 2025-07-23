from flask import Flask, render_template, request, redirect
from queries import get_player_win_rates, get_player_win_rates_filtered, get_commander_stats, get_commander_stats_filtered, get_player_detail_stats, get_player_commanders, get_player_color_stats, get_overall_color_stats, get_longest_win_streak, get_top_win_rate, get_recent_commanders, to_kebab_case
import sqlite3

app = Flask(__name__)

# Home page
@app.route("/")
def index():
    king = get_top_win_rate()
    king_imgs = get_recent_commanders(king["player_name"]) if king else []
    villains_raw = get_longest_win_streak()
    villains = []
    for v in villains_raw:
        commanders = []
        for c in v["commanders"][:3]:  # limit to 3
            if c:  # skip empty
                commanders.append({
                    "name": c["name"],  # Extract the name from the commander object
                    "img": f"/static/assets/commanders/{to_kebab_case(c['name'])}.jpg"
                })
        villains.append({
            "player_name": v["player_name"],
            "streak_count": v["streak_count"],
            "commanders": commanders
        })
    return render_template(
        "index.html.j2",
        king=king,
        king_imgs=king_imgs,
        villains=villains
    )

# Add Game Form
@app.route("/add-game-form")
def add_game_form():
    return render_template("/add_game.html.j2")

# Add Game to SQL DB, form submit
@app.route("/add-game", methods=["POST"])
def add_game():
    date = request.form["date"]
    num_players = int(request.form["numPlayers"])
    turns = request.form.get("turns")
    win_con = request.form.get("winCon")
    winner_name = request.form.get("winnerName")

    player_names = request.form.getlist("playerName[]")
    commander_names = request.form.getlist("commanderName[]")
    turn_orders = request.form.getlist("turnOrder[]")

    conn = sqlite3.connect("mtg.db")
    c = conn.cursor()

    # Insert Game (GameID auto-increments)
    c.execute("INSERT INTO Games (Date, NumPlayers, Turns, WinCon) VALUES (?, ?, ?, ?)",
              (date, num_players, turns, win_con))
    game_id = c.lastrowid

    winner_id = None
    for i, name in enumerate(player_names):
        c.execute("INSERT INTO Players (GameID, PlayerName, CommanderName, TurnOrder) VALUES (?, ?, ?, ?)",
                  (game_id, name, commander_names[i], turn_orders[i] if turn_orders[i] else None))
        pid = c.lastrowid
        if name == winner_name:
            winner_id = pid

    if winner_id:
        c.execute("UPDATE Games SET WinnerPlayerID = ? WHERE GameID = ?", (winner_id, game_id))

    conn.commit()
    conn.close()

    return redirect("/add-game-form")

@app.route("/stats")
def stats():
    # PLAYER WIN RATE FILTER TOGGLE:
    # - Use get_player_win_rates_filtered() to show only players with wins > 0 (less clutter)
    # - Use get_player_win_rates() to show all players including those with 0 wins (complete data)
    # Change the function call below to toggle between filtered/unfiltered results
    player_stats = get_player_win_rates_filtered()  # FILTERED: Only players with wins
    # player_stats = get_player_win_rates()         # UNFILTERED: All players
    
    #commander_stats = get_commander_stats()
    commander_stats = get_commander_stats_filtered()
    color_stats = get_overall_color_stats()
    return render_template("stats.html.j2",
                           player_stats=player_stats,
                           commander_stats=commander_stats,
                           color_stats=color_stats)

@app.route('/player/<player_name>')
def player_detail(player_name):
    stats = get_player_detail_stats(player_name)
    commanders = get_player_commanders(player_name)
    color_stats = get_player_color_stats(player_name)
    if stats is None:
        # handle case where player not found
        return f"No stats found for {player_name}", 404
    return render_template(
        'player_detail.html.j2',
        player_name=player_name,
        stats=stats,
        commanders=commanders,
        color_stats=color_stats
    )
