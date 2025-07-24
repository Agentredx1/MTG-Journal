from flask import Flask, render_template, request, redirect, session, url_for
from queries import get_player_win_rates, get_player_win_rates_filtered, get_commander_stats, get_commander_stats_filtered, get_player_detail_stats, get_player_commanders, get_player_color_stats, get_overall_color_stats, get_longest_win_streak, get_top_win_rate, get_recent_commanders, to_kebab_case, get_group_by_passkey, insert_game_with_group, insert_player_with_game, update_game_winner
from functools import wraps
import sqlite3
import os

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key') # This signs the sessions but really doesn't matter atm

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session or 'group_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def get_current_group_id():
    """Helper function to get the current user's group ID from session"""
    return session.get('group_id')

# Login routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        passkey = request.form['passkey']
        group = get_group_by_passkey(passkey)
        
        if group:
            session['logged_in'] = True
            session['group_id'] = group['id']
            session['group_name'] = group['group_name']
            return redirect(url_for('index'))
        else:
            return render_template('login.html.j2', error='Invalid passkey')
    return render_template('login.html.j2')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    session.pop('group_id', None)
    session.pop('group_name', None)
    return redirect(url_for('login'))

# Home page
@app.route("/")
@login_required
def index():
    group_id = get_current_group_id()
    king = get_top_win_rate(group_id=group_id)
    king_imgs = get_recent_commanders(king["player_name"], group_id=group_id) if king else []
    villains_raw = get_longest_win_streak(group_id=group_id)
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
@login_required
def add_game_form():
    return render_template("/add_game.html.j2")

# Add Game to SQL DB, form submit
@app.route("/add-game", methods=["POST"])
@login_required
def add_game():
    group_id = get_current_group_id()
    date = request.form["date"]
    num_players = int(request.form["numPlayers"])
    turns = request.form.get("turns")
    win_con = request.form.get("winCon")
    winner_name = request.form.get("winnerName")

    player_names = request.form.getlist("playerName[]")
    commander_names = request.form.getlist("commanderName[]")
    turn_orders = request.form.getlist("turnOrder[]")

    # Insert Game with group association
    game_id = insert_game_with_group(date, num_players, turns, win_con, group_id)

    winner_id = None
    for i, name in enumerate(player_names):
        pid = insert_player_with_game(game_id, name, commander_names[i], group_id,
                                      turn_orders[i] if turn_orders[i] else None)
        if name == winner_name:
            winner_id = pid

    if winner_id:
        update_game_winner(game_id, winner_id)

    return redirect("/add-game-form")

@app.route("/stats")
@login_required
def stats():
    group_id = get_current_group_id()
    # PLAYER WIN RATE FILTER TOGGLE:
    # - Use get_player_win_rates_filtered() to show only players with wins > 0 (less clutter)
    # - Use get_player_win_rates() to show all players including those with 0 wins (complete data)
    # Change the function call below to toggle between filtered/unfiltered results
    player_stats = get_player_win_rates_filtered(group_id=group_id)  # FILTERED: Only players with wins
    # player_stats = get_player_win_rates(group_id=group_id)         # UNFILTERED: All players
    
    #commander_stats = get_commander_stats(group_id=group_id)
    commander_stats = get_commander_stats_filtered(group_id=group_id)
    color_stats = get_overall_color_stats(group_id=group_id)
    return render_template("stats.html.j2",
                           player_stats=player_stats,
                           commander_stats=commander_stats,
                           color_stats=color_stats)

@app.route('/player/<player_name>')
@login_required
def player_detail(player_name):
    group_id = get_current_group_id()
    stats = get_player_detail_stats(player_name, group_id=group_id)
    commanders = get_player_commanders(player_name, group_id=group_id)
    color_stats = get_player_color_stats(player_name, group_id=group_id)
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
